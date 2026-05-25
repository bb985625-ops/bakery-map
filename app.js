let map = null, markers = [], currentShop = null, routeLine = null;

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    renderShopList();
    bindEvents();
});

function initMap() {
    map = new AMap.Map('mapContainer', {
        zoom: 13,                    // ← 改这里：上海范围小一点，用13
        center: [121.4737, 31.2304], // ← 改这里：上海人民广场
        viewMode: '2D',
        mapStyle: 'amap://styles/normal'
    });
    map.addControl(new AMap.Scale());
    map.addControl(new AMap.ToolBar({ position: 'RB' }));
    addMarkers();
}

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
        marker.on('click', () => { showShopDetail(shop); highlightShopCard(shop.id); });
        marker.shopId = shop.id;
        map.add(marker);
        markers.push(marker);
    });
}

function renderShopList(shops = bakeryShops) {
    const listEl = document.getElementById('shopList');
    listEl.innerHTML = '';
    shops.forEach(shop => {
        const card = document.createElement('div');
        card.className = 'shop-card';
        card.dataset.shopId = shop.id;
        card.innerHTML = `
            <div class="shop-card-header">
                <span class="shop-name">${shop.name}</span>
                <span class="shop-rating">⭐ ${shop.rating}</span>
            </div>
            <div class="shop-tags">${shop.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
            <div class="shop-info">📍 ${shop.address}<br>💰 ${shop.priceRange} · 🕐 ${shop.hours}</div>
            <div class="shop-signature">
                <div class="shop-signature-title">🏆 招牌推荐</div>
                ${shop.signature.slice(0, 2).map(item => `<div class="shop-signature-item">${item}</div>`).join('')}
            </div>`;
        card.addEventListener('click', () => { showShopDetail(shop); highlightShopCard(shop.id); map.setZoomAndCenter(16, shop.position); });
        listEl.appendChild(card);
    });
}

function showShopDetail(shop) {
    currentShop = shop;
    const body = document.getElementById('modalBody');
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
                📍 ${shop.address}<br>💰 ${shop.priceRange}<br>🕐 ${shop.hours}<br>📞 ${shop.phone}
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
                    </div>`).join('')}
            </div>
            <button onclick="navigateToShop(${shop.id})" style="width: 100%; margin-top: 20px; padding: 14px; background: linear-gradient(135deg, #ff9a56, #ff6b6b); color: white; border: none; border-radius: 12px; font-size: 16px; cursor: pointer;">🧭 导航去这里</button>
        </div>`;
    document.getElementById('shopModal').classList.add('show');
}

function navigateToShop(shopId) {
    const shop = bakeryShops.find(s => s.id === shopId);
    if (!shop) return;
    window.open(`https://uri.amap.com/navigation?to=${shop.position[0]},${shop.position[1]},${encodeURIComponent(shop.name)}&mode=car&policy=1`, '_blank');
}

function highlightShopCard(shopId) {
    document.querySelectorAll('.shop-card').forEach(card => {
        card.classList.toggle('active', parseInt(card.dataset.shopId) === shopId);
    });
}

function searchShops(keyword) {
    if (!keyword.trim()) { renderShopList(); addMarkers(); return; }
    const filtered = bakeryShops.filter(shop => {
        const text = `${shop.name} ${shop.address} ${shop.tags.join(' ')} ${shop.signature.join(' ')}`;
        return text.toLowerCase().includes(keyword.toLowerCase());
    });
    renderShopList(filtered);
    markers.forEach(marker => { marker.setVisible(filtered.some(s => s.id === marker.shopId)); });
    if (filtered.length === 1) map.setZoomAndCenter(16, filtered[0].position);
}

function drawRoute(positions, color = '#667eea') {
    if (routeLine) map.remove(routeLine);
    routeLine = new AMap.Polyline({ path: positions, strokeColor: color, strokeWeight: 6, strokeOpacity: 0.8, strokeStyle: 'solid', lineJoin: 'round', showDir: true });
    map.add(routeLine);
    map.setFitView([routeLine, ...markers]);
}

function bindEvents() {
    document.getElementById('searchBtn').addEventListener('click', () => searchShops(document.getElementById('searchInput').value));
    document.getElementById('searchInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') searchShops(e.target.value); });
    document.getElementById('toggleSidebar').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('collapsed'));
    document.getElementById('aiRouteBtn').addEventListener('click', () => document.getElementById('aiPanel').classList.toggle('show'));
    document.getElementById('closeAiPanel').addEventListener('click', () => document.getElementById('aiPanel').classList.remove('show'));
    document.getElementById('generateRoute').addEventListener('click', generateRoute);
    document.getElementById('modalClose').addEventListener('click', () => document.getElementById('shopModal').classList.remove('show'));
    document.getElementById('shopModal').addEventListener('click', (e) => { if (e.target.id === 'shopModal') document.getElementById('shopModal').classList.remove('show'); });
}