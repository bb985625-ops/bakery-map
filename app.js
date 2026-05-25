/**
 * ========================================
 * Bakery Map 核心逻辑（上海版 + 用户上传功能）
 * ========================================
 */

let map = null;
let markers = [];
let currentShop = null;
let routeLine = null;
let isPickingLocation = false;  // 是否正在从地图选点

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    loadUserShops();      // ← 先加载用户添加的店铺
    initMap();
    renderShopList();
    bindEvents();
    bindAddShopEvents();  // ← 绑定新增店铺事件
});

/**
 * 🗄️ 从 localStorage 加载用户添加的店铺
 */
function loadUserShops() {
    try {
        const saved = localStorage.getItem('bakeryMap_userShops');
        if (saved) {
            const userShops = JSON.parse(saved);
            userShops.forEach(shop => {
                // 避免重复添加
                if (!bakeryShops.find(s => s.id === shop.id)) {
                    bakeryShops.push(shop);
                }
            });
            console.log(`✅ 已加载 ${userShops.length} 家用户添加的店铺`);
        }
    } catch (e) {
        console.error('加载用户店铺失败', e);
    }
}

/**
 * 💾 保存用户店铺到 localStorage
 */
function saveUserShops() {
    const userShops = bakeryShops.filter(s => s.id >= 1000);  // ID >= 1000 认为是用户添加的
    localStorage.setItem('bakeryMap_userShops', JSON.stringify(userShops));
}

/**
 * 🗺️ 初始化地图
 */
function initMap() {
    map = new AMap.Map('mapContainer', {
        zoom: 13,
        center: [121.4737, 31.2304], // 上海人民广场
        viewMode: '2D',
        mapStyle: 'amap://styles/normal'
    });
    
    map.addControl(new AMap.Scale());
    map.addControl(new AMap.ToolBar({ position: 'RB' }));
    
    // ← 新增：地图点击事件（用于选点）
    map.on('click', function(e) {
        if (isPickingLocation) {
            const lng = e.lnglat.getLng().toFixed(6);
            const lat = e.lnglat.getLat().toFixed(6);
            document.getElementById('shopLng').value = lng;
            document.getElementById('shopLat').value = lat;
            
            isPickingLocation = false;
            document.getElementById('pickMapBtn').textContent = '📍 点击这里，然后在地图上点选位置';
            document.getElementById('pickMapBtn').style.background = '#fff3e6';
            document.getElementById('pickMapBtn').style.color = '#ff8c42';
            document.body.classList.remove('picking-location');
            
            // 临时标记
            const tempMarker = new AMap.Marker({
                position: [parseFloat(lng), parseFloat(lat)],
                content: '<div style="width:20px;height:20px;background:#ff6b6b;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
                offset: new AMap.Pixel(-10, -10)
            });
            map.add(tempMarker);
            setTimeout(() => map.remove(tempMarker), 3000);
            
            alert(`✅ 坐标已获取！\n经度：${lng}\n纬度：${lat}`);
        }
    });
    
    addMarkers();
}

/**
 * 📍 添加商家标记
 */
function addMarkers() {
    markers.forEach(m => map.remove(m));
    markers = [];
    
    bakeryShops.forEach(shop => {
        const marker = new AMap.Marker({
            position: shop.position,
            title: shop.name,
            offset: new AMap.Pixel(-20, -48),
            content: `<div class="custom-marker"><div class="marker-pin"><span>🍞</span></div><div class="marker-pulse"></div></div>`
        });
        
        marker.on('click', () => {
            showShopDetail(shop);
            highlightShopCard(shop.id);
        });
        
        marker.shopId = shop.id;
        map.add(marker);
        markers.push(marker);
    });
}

/**
 * 📋 渲染左侧列表
 */
function renderShopList(shops = bakeryShops) {
    const listEl = document.getElementById('shopList');
    listEl.innerHTML = '';
    
    shops.forEach(shop => {
        const card = document.createElement('div');
        card.className = 'shop-card';
        card.dataset.shopId = shop.id;
        
        // 用户添加的店铺加个标识
        const userBadge = shop.id >= 1000 ? '<span style="background:#667eea;color:white;padding:2px 8px;border-radius:8px;font-size:11px;margin-left:8px;">我添加的</span>' : '';
        
        card.innerHTML = `
            <div class="shop-card-header">
                <span class="shop-name">${shop.name}${userBadge}</span>
                <span class="shop-rating">⭐ ${shop.rating}</span>
            </div>
            <div class="shop-tags">
                ${shop.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="shop-info">
                📍 ${shop.address}<br>
                💰 ${shop.priceRange} · 🕐 ${shop.hours}
            </div>
            <div class="shop-signature">
                <div class="shop-signature-title">🏆 招牌推荐</div>
                ${shop.signature.slice(0, 2).map(item => `<div class="shop-signature-item">${item}</div>`).join('')}
            </div>
        `;
        
        card.addEventListener('click', () => {
            showShopDetail(shop);
            highlightShopCard(shop.id);
            map.setZoomAndCenter(16, shop.position);
        });
        
        listEl.appendChild(card);
    });
}

/**
 * 🏪 显示商家详情
 */
function showShopDetail(shop) {
    currentShop = shop;
    const modal = document.getElementById('shopModal');
    const body = document.getElementById('modalBody');
    
    const userDeleteBtn = shop.id >= 1000 ? 
        `<button onclick="deleteUserShop(${shop.id})" style="width: 100%; margin-top: 10px; padding: 12px; background: #ff4444; color: white; border: none; border-radius: 12px; font-size: 14px; cursor: pointer;">🗑️ 删除这家店铺</button>` : '';
    
    body.innerHTML = `
        <div style="padding: 20px;">
            <div style="height: 180px; background: linear-gradient(135deg, #ff9a56, #ff6b6b); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 80px;">🍞</span>
            </div>
            <h2 style="font-size: 24px; margin-bottom: 10px;">${shop.name}</h2>
            <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
                <span style="background: #ff6b6b; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px;">⭐ ${shop.rating}</span>
                ${shop.tags.map(tag => `<span style="background: #fff3e6; color: #ff8c42; padding: 4px 12px; border-radius: 12px; font-size: 14px;">${tag}</span>`).join('')}
            </div>
            <div style="color: #666; line-height: 2; margin-bottom: 20px;">
                📍 ${shop.address}<br>
                💰 ${shop.priceRange}<br>
                🕐 ${shop.hours}<br>
                📞 ${shop.phone}
            </div>
            <div style="background: #fff8f0; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                <h3 style="color: #ff8c42; margin-bottom: 10px; font-size: 16px;">🏆 招牌推荐</h3>
                ${shop.signature.map(item => `<div style="padding: 8px 0; border-bottom: 1px dashed #ffd8b8; font-size: 14px; color: #555;">${item}</div>`).join('')}
            </div>
            <div>
                <h3 style="margin-bottom: 10px; font-size: 16px;">💬 用户评价</h3>
                ${shop.reviews.map(review => `
                    <div style="padding: 12px; background: #f8f8f8; border-radius: 8px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-weight: bold; font-size: 14px;">${review.user}</span>
                            <span style="color: #ff9a56;">${'⭐'.repeat(review.rating)}</span>
                        </div>
                        <p style="font-size: 13px; color: #666; line-height: 1.6;">${review.text}</p>
                    </div>
                `).join('')}
            </div>
            <button onclick="navigateToShop(${shop.id})" style="width: 100%; margin-top: 20px; padding: 14px; background: linear-gradient(135deg, #ff9a56, #ff6b6b); color: white; border: none; border-radius: 12px; font-size: 16px; cursor: pointer;">
                🧭 导航去这里
            </button>
            ${userDeleteBtn}
        </div>
    `;
    
    modal.classList.add('show');
}

/**
 * 🗑️ 删除用户添加的店铺
 */
function deleteUserShop(shopId) {
    if (!confirm('确定要删除这家店铺吗？')) return;
    
    // 从数组中移除
    const index = bakeryShops.findIndex(s => s.id === shopId);
    if (index > -1) {
        bakeryShops.splice(index, 1);
    }
    
    // 从 localStorage 移除
    saveUserShops();
    
    // 刷新界面
    renderShopList();
    addMarkers();
    document.getElementById('shopModal').classList.remove('show');
    
    alert('✅ 已删除！');
}

/**
 * 🧭 导航
 */
function navigateToShop(shopId) {
    const shop = bakeryShops.find(s => s.id === shopId);
    if (!shop) return;
    window.open(`https://uri.amap.com/navigation?to=${shop.position[0]},${shop.position[1]},${encodeURIComponent(shop.name)}&mode=car&policy=1`, '_blank');
}

/**
 * ✨ 高亮卡片
 */
function highlightShopCard(shopId) {
    document.querySelectorAll('.shop-card').forEach(card => {
        card.classList.toggle('active', parseInt(card.dataset.shopId) === shopId);
    });
}

/**
 * 🔍 搜索
 */
function searchShops(keyword) {
    if (!keyword.trim()) {
        renderShopList();
        addMarkers();
        return;
    }
    
    const filtered = bakeryShops.filter(shop => {
        const text = `${shop.name} ${shop.address} ${shop.tags.join(' ')} ${shop.signature.join(' ')}`;
        return text.toLowerCase().includes(keyword.toLowerCase());
    });
    
    renderShopList(filtered);
    markers.forEach(marker => {
        marker.setVisible(filtered.some(s => s.id === marker.shopId));
    });
    
    if (filtered.length === 1) {
        map.setZoomAndCenter(16, filtered[0].position);
    }
}

/**
 * 🗺️ 绘制路线
 */
function drawRoute(positions, color = '#667eea') {
    if (routeLine) map.remove(routeLine);
    routeLine = new AMap.Polyline({
        path: positions,
        strokeColor: color,
        strokeWeight: 6,
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
        lineJoin: 'round',
        showDir: true
    });
    map.add(routeLine);
    map.setFitView([routeLine, ...markers]);
}

/**
 * 🔗 绑定基础事件
 */
function bindEvents() {
    document.getElementById('searchBtn').addEventListener('click', () => {
        searchShops(document.getElementById('searchInput').value);
    });
    
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchShops(e.target.value);
    });
    
    document.getElementById('toggleSidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });
    
    document.getElementById('aiRouteBtn').addEventListener('click', () => {
        document.getElementById('aiPanel').classList.toggle('show');
    });
    
    document.getElementById('closeAiPanel').addEventListener('click', () => {
        document.getElementById('aiPanel').classList.remove('show');
    });
    
    document.getElementById('generateRoute').addEventListener('click', generateRoute);
    
    document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('shopModal').classList.remove('show');
    });
    
    document.getElementById('shopModal').addEventListener('click', (e) => {
        if (e.target.id === 'shopModal') {
            document.getElementById('shopModal').classList.remove('show');
        }
    });
}

/**
 * ➕ 绑定「添加店铺」相关事件
 */
function bindAddShopEvents() {
    // 打开弹窗
    document.getElementById('addShopBtn').addEventListener('click', () => {
        document.getElementById('addShopModal').classList.add('show');
    });
    
    // 关闭弹窗
    document.getElementById('addShopModalClose').addEventListener('click', closeAddModal);
    document.getElementById('addShopModal').addEventListener('click', (e) => {
        if (e.target.id === 'addShopModal') closeAddModal();
    });
    
    // 从地图选点
    document.getElementById('pickMapBtn').addEventListener('click', () => {
        isPickingLocation = !isPickingLocation;
        const btn = document.getElementById('pickMapBtn');
        
        if (isPickingLocation) {
            btn.textContent = '✋ 点击地图任意位置获取坐标（点击这里取消）';
            btn.style.background = '#ff6b6b';
            btn.style.color = 'white';
            document.body.classList.add('picking-location');
            document.getElementById('addShopModal').classList.remove('show'); // 临时关闭弹窗，方便看地图
            alert('现在点击地图任意位置，即可自动填入经纬度');
        } else {
            btn.textContent = '📍 点击这里，然后在地图上点选位置';
            btn.style.background = '#fff3e6';
            btn.style.color = '#ff8c42';
            document.body.classList.remove('picking-location');
        }
    });
    
    // 地址解析（输入地址 → 自动获取坐标）
    document.getElementById('geocodeBtn').addEventListener('click', () => {
        const address = document.getElementById('shopAddress').value.trim();
        if (!address) {
            alert('请先输入地址');
            return;
        }
        
        const geocoder = new AMap.Geocoder();
        geocoder.getLocation(address, function(status, result) {
            if (status === 'complete' && result.geocodes && result.geocodes.length) {
                const loc = result.geocodes[0].location;
                document.getElementById('shopLng').value = loc.lng.toFixed(6);
                document.getElementById('shopLat').value = loc.lat.toFixed(6);
                alert(`✅ 解析成功！\n经度：${loc.lng.toFixed(6)}\n纬度：${loc.lat.toFixed(6)}`);
            } else {
                alert('❌ 地址解析失败，请手动输入坐标，或点击「从地图选点」');
            }
        });
    });
    
    // 表单提交
    document.getElementById('addShopForm').addEventListener('submit', (e) => {
        e.preventDefault();
        submitNewShop();
    });
    
    // 导出数据
    document.getElementById('exportBtn').addEventListener('click', exportData);
    
    // 导入数据
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', (e) => {
        if (e.target.files.length) importData(e.target.files[0]);
    });
}

function closeAddModal() {
    document.getElementById('addShopModal').classList.remove('show');
    isPickingLocation = false;
    document.getElementById('pickMapBtn').textContent = '📍 点击这里，然后在地图上点选位置';
    document.getElementById('pickMapBtn').style.background = '#fff3e6';
    document.getElementById('pickMapBtn').style.color = '#ff8c42';
    document.body.classList.remove('picking-location');
}

/**
 * ✅ 提交新店铺
 */
function submitNewShop() {
    // 收集表单数据
    const name = document.getElementById('shopName').value.trim();
    const address = document.getElementById('shopAddress').value.trim();
    const lng = parseFloat(document.getElementById('shopLng').value);
    const lat = parseFloat(document.getElementById('shopLat').value);
    const rating = parseFloat(document.getElementById('shopRating').value);
    const priceRange = document.getElementById('shopPrice').value.trim() || '人均 ¥35';
    const hours = document.getElementById('shopHours').value.trim() || '08:00 - 22:00';
    const phone = document.getElementById('shopPhone').value.trim() || '-';
    const tags = document.getElementById('shopTags').value.split(/[,，]/).map(t => t.trim()).filter(t => t);
    
    const signature = [];
    const sig1 = document.getElementById('shopSig1').value.trim();
    const sig2 = document.getElementById('shopSig2').value.trim();
    const sig3 = document.getElementById('shopSig3').value.trim();
    if (sig1) signature.push(sig1);
    if (sig2) signature.push(sig2);
    if (sig3) signature.push(sig3);
    if (signature.length === 0) signature.push('🍞 招牌面包');
    
    const reviews = [];
    const reviewUser = document.getElementById('reviewUser').value.trim() || '匿名用户';
    const reviewRating = parseInt(document.getElementById('reviewRating').value) || 5;
    const reviewText = document.getElementById('reviewText').value.trim() || '味道不错，推荐！';
    if (reviewText) {
        reviews.push({ user: reviewUser, rating: reviewRating, text: reviewText });
    }
    
    // 验证
    if (!name || !address || !lng || !lat) {
        alert('请填写完整信息（名称、地址、坐标）');
        return;
    }
    
    // 创建店铺对象（ID 用时间戳，确保唯一且 >= 1000）
    const newShop = {
        id: 1000 + Date.now(),  // 确保和默认数据不冲突
        name,
        position: [lng, lat],
        address,
        rating,
        tags: tags.length ? tags : ['面包店'],
        priceRange,
        hours,
        phone,
        signature,
        reviews
    };
    
    // 添加到数据
    bakeryShops.push(newShop);
    
    // 保存到本地
    saveUserShops();
    
    // 刷新界面
    renderShopList();
    addMarkers();
    
    // 关闭弹窗 & 重置表单
    closeAddModal();
    document.getElementById('addShopForm').reset();
    
    // 地图移动到新店铺
    map.setZoomAndCenter(16, [lng, lat]);
    
    alert(`✅ 「${name}」添加成功！`);
}

/**
 * 💾 导出数据为 JSON 文件
 */
function exportData() {
    const userShops = bakeryShops.filter(s => s.id >= 1000);
    const data = {
        appName: 'Bakery Map',
        version: '1.0',
        exportTime: new Date().toLocaleString('zh-CN'),
        city: '上海',
        totalShops: bakeryShops.length,
        userShops: userShops
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bakery-map-shanghai-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`✅ 已导出 ${userShops.length} 家用户添加的店铺！`);
}

/**
 * 📁 导入 JSON 数据
 */
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.userShops || !Array.isArray(data.userShops)) {
                alert('❌ 文件格式不正确，请导入 Bakery Map 导出的 JSON 文件');
                return;
            }
            
            // 合并导入的店铺（避免重复）
            let added = 0;
            data.userShops.forEach(shop => {
                if (!bakeryShops.find(s => s.id === shop.id)) {
                    bakeryShops.push(shop);
                    added++;
                }
            });
            
            // 保存
            saveUserShops();
            
            // 刷新
            renderShopList();
            addMarkers();
            
            alert(`✅ 导入成功！新增 ${added} 家店铺，刷新页面后生效`);
            
        } catch (err) {
            alert('❌ 文件解析失败：' + err.message);
        }
    };
    reader.readAsText(file);
}
