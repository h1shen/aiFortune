"""真太阳时校正 + 地点 → 经度。

真太阳时公式（近似）：
    真太阳时 = 北京时间 + (本地经度 - 120°) × 4 分钟
忽略均时差（|ΔEoT| ≤ 16 分钟），MVP 精度足够。
"""
from __future__ import annotations

from datetime import datetime, timedelta

# 省会/主要城市经度表（东经，MVP 范围够用；遇到找不到的就当 120°）
CITY_LONGITUDE: dict[str, float] = {
    "北京": 116.40,
    "上海": 121.47,
    "天津": 117.20,
    "重庆": 106.55,
    "哈尔滨": 126.63, "长春": 125.32, "沈阳": 123.43,
    "呼和浩特": 111.65, "石家庄": 114.48, "太原": 112.55,
    "济南": 117.00, "郑州": 113.62, "南京": 118.78,
    "合肥": 117.25, "杭州": 120.17, "南昌": 115.89,
    "福州": 119.30, "台北": 121.50, "广州": 113.27,
    "海口": 110.32, "南宁": 108.37, "长沙": 112.94,
    "武汉": 114.31, "成都": 104.07, "贵阳": 106.63,
    "昆明": 102.72, "拉萨": 91.14, "西安": 108.95,
    "兰州": 103.82, "银川": 106.23, "西宁": 101.78,
    "乌鲁木齐": 87.62, "香港": 114.17, "澳门": 113.55,
    # 常见非省会
    "深圳": 114.06, "苏州": 120.62, "宁波": 121.55, "厦门": 118.08,
    "青岛": 120.38, "大连": 121.62, "佛山": 113.12, "东莞": 113.75,
    "无锡": 120.30, "温州": 120.70,
}

PROVINCE_CAPITAL: dict[str, str] = {
    "北京": "北京", "上海": "上海", "天津": "天津", "重庆": "重庆",
    "黑龙江": "哈尔滨", "吉林": "长春", "辽宁": "沈阳",
    "内蒙古": "呼和浩特", "河北": "石家庄", "山西": "太原",
    "山东": "济南", "河南": "郑州", "江苏": "南京",
    "安徽": "合肥", "浙江": "杭州", "江西": "南昌",
    "福建": "福州", "台湾": "台北", "广东": "广州",
    "海南": "海口", "广西": "南宁", "湖南": "长沙",
    "湖北": "武汉", "四川": "成都", "贵州": "贵阳",
    "云南": "昆明", "西藏": "拉萨", "陕西": "西安",
    "甘肃": "兰州", "宁夏": "银川", "青海": "西宁",
    "新疆": "乌鲁木齐", "香港": "香港", "澳门": "澳门",
}


def resolve_longitude(province: str | None, city: str | None) -> float:
    """Free-form 省/市 输入 → 经度。找不到默认 120°（等于没校正）。"""
    for key in (city or "", province or ""):
        if not key:
            continue
        key = key.strip().rstrip("省市区县")
        if key in CITY_LONGITUDE:
            return CITY_LONGITUDE[key]
        # 省名 → 省会
        if key in PROVINCE_CAPITAL and PROVINCE_CAPITAL[key] in CITY_LONGITUDE:
            return CITY_LONGITUDE[PROVINCE_CAPITAL[key]]
        # 模糊匹配：输入前缀命中
        for name, lon in CITY_LONGITUDE.items():
            if key and (key.startswith(name) or name.startswith(key)):
                return lon
    return 120.0


def true_solar_time(dt: datetime, longitude: float) -> datetime:
    """北京时间 → 真太阳时（忽略均时差）。"""
    minutes_offset = (longitude - 120.0) * 4.0
    return dt + timedelta(minutes=minutes_offset)
