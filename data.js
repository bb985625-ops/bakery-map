const bakeryShops = [
    {
        id: 1,
        name: "DRUNK BAKER",
        position: [121.445, 31.225],
        address: "上海市静安区富民路291号",
        rating: 4.7,
        tags: ["网红烘焙", "创意面包", "早午餐"],
        priceRange: "人均 ¥35",
        hours: "08:00 - 22:00",
        phone: "021-6248-1234",
        signature: [
            "🍌 酸奶香蕉磅蛋糕 — 镇店之宝，湿润绵密",
            "🥐 抹茶芝士司康 — 抹茶控必点，芝士浓郁",
            "🍞 罗勒番茄恰巴塔 — 意式风味，外脆内软"
        ],
        reviews: [
            { user: "面包脑袋小王", rating: 5, text: "富民路这家是总店，香蕉磅蛋糕真的绝了，每次路过必买" },
            { user: "早八打工人", rating: 4, text: "早上8点开门，买面包当早餐很方便，恰巴塔很香" },
            { user: "探店博主", rating: 5, text: "上海最火的面包店之一，性价比超高，拍照也好看" }
        ]
    },
    {
        id: 2,
        name: "Sunflour 阳光粮品",
        position: [121.435, 31.215],
        address: "上海市徐汇区安福路308号104室",
        rating: 4.6,
        tags: ["法式面包", "安福路", "老网红"],
        priceRange: "人均 ¥50",
        hours: "08:00 - 21:00",
        phone: "021-6473-7757",
        signature: [
            "🌻 小太阳 — 招牌必买，奶酥+橙皮+核桃",
            "🥖 全麦法棍 — 麦香浓郁，越嚼越香",
            "🍞 酸种面包 — 天然发酵，健康低油"
        ],
        reviews: [
            { user: "安福路常客", rating: 5, text: "小太阳是永远的经典！每次来安福路都要带一个走" },
            { user: "健身达人", rating: 4, text: "酸种面包很正宗，健身人士友好，就是有点贵" },
            { user: "游客Alice", rating: 5, text: "安福路打卡第一站，店里氛围很法式，面包种类超多" }
        ]
    },
    {
        id: 3,
        name: "TRIFLE 揣福",
        position: [121.430, 31.210],
        address: "上海市徐汇区泰安路27弄5号",
        rating: 4.8,
        tags: ["肉桂卷", "手作", "社区小店"],
        priceRange: "人均 ¥40",
        hours: "09:00 - 20:00",
        phone: "021-5403-5678",
        signature: [
            "🌀 肉桂卷 — 上海肉桂卷天花板，香气浓郁",
            "🥖 杏子芝士能量棒 — 酸甜杏子+咸香芝士",
            "🍞 酸种吐司 — 气孔完美，口感弹韧"
        ],
        reviews: [
            { user: "肉桂控", rating: 5, text: "全上海最好吃的肉桂卷！不甜腻，肉桂味很正" },
            { user: " neighborhood居民", rating: 5, text: "藏在泰安路弄堂里的宝藏，周末早上来买刚出炉的" },
            { user: "面包猎人", rating: 4, text: "店面很小但很有温度，能量棒很适合当下午茶" }
        ]
    },
    {
        id: 4,
        name: "gluglu",
        position: [121.470, 31.220],
        address: "上海市黄浦区思南路30号",
        rating: 4.5,
        tags: ["蛋挞", "甜品", "思南路"],
        priceRange: "人均 ¥30",
        hours: "10:00 - 21:00",
        phone: "021-6333-8888",
        signature: [
            "🥧 提拉米苏蛋挞 — 网红爆款，层次丰富",
            "🍮 焦糖蛋挞 — 焦糖微苦，蛋奶香浓",
            "🌀 肉桂丹麦扭 — 酥脆掉渣，肉桂香甜"
        ],
        reviews: [
            { user: "蛋挞爱好者", rating: 5, text: "提拉米苏蛋挞真的惊艳！思南路逛街必买" },
            { user: "甜品女孩", rating: 4, text: "店面很温馨，蛋挞趁热吃最好，周末要排队" },
            { user: "上海土著", rating: 5, text: "思南路上新开的宝藏，价格不贵，味道很正" }
        ]
    },
    {
        id: 5,
        name: "mbd",
        position: [121.420, 31.205],
        address: "上海市长宁区华山路785号",
        rating: 4.9,
        tags: ["法棍", "匠人精神", "排队王"],
        priceRange: "人均 ¥45",
        hours: "09:00 - 19:00",
        phone: "021-6212-9999",
        signature: [
            "🥖 法棍 — 上海法棍第一名，外脆内韧",
            "🍞 花椒巧克力 — 创意融合，麻香+巧克力",
            "🥐 可颂 — 手工开酥，黄油香气十足"
        ],
        reviews: [
            { user: "法棍发烧友", rating: 5, text: "上海最好的法棍，没有之一！每天限量，要早点去排队" },
            { user: "老外厨师", rating: 5, text: "As a chef, I can say this is authentic French quality" },
            { user: "排队专业户", rating: 4, text: "确实好吃，但排队太久了，建议工作日去" }
        ]
    }
];
