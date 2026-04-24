"""个性化人生走势 K 线。

给定一张命盘（core.calculate 的输出），把 8 步大运生成 8 根"蜡烛"，用来画
用户独有的人生走势图。每根蜡烛包含：
- 本段大运的干支 / 十神 / 年龄段
- 基于旺衰 + 十神 + 用忌神 + 合冲的漂移 drift
- 确定性噪声（按 chartId + index）
- open / close / high / low / score / up
- 2~3 条人类可读的 drivers 解释为什么这段偏好或偏凶

state 字段用当前年与大运年份对比：past / current / future。
"""
from __future__ import annotations

import hashlib
from datetime import datetime
from typing import Any

from .core import TG_WX, DZ_WX


# ---------------- 合冲规则 ----------------
# 天干五合（甲己合、乙庚合 …）
TG_HE: dict[str, str] = {
    "甲": "己", "己": "甲",
    "乙": "庚", "庚": "乙",
    "丙": "辛", "辛": "丙",
    "丁": "壬", "壬": "丁",
    "戊": "癸", "癸": "戊",
}

# 天干七冲（甲庚、乙辛、丙壬、丁癸）——阳冲阳、阴冲阴且五行相克
TG_CHONG: dict[str, str] = {
    "甲": "庚", "庚": "甲",
    "乙": "辛", "辛": "乙",
    "丙": "壬", "壬": "丙",
    "丁": "癸", "癸": "丁",
}

# 地支六冲
DZ_CHONG: dict[str, str] = {
    "子": "午", "午": "子",
    "丑": "未", "未": "丑",
    "寅": "申", "申": "寅",
    "卯": "酉", "酉": "卯",
    "辰": "戌", "戌": "辰",
    "巳": "亥", "亥": "巳",
}

# 地支三合局：每组三个地支
DZ_SANHE: list[set[str]] = [
    {"申", "子", "辰"},  # 水局
    {"亥", "卯", "未"},  # 木局
    {"寅", "午", "戌"},  # 火局
    {"巳", "酉", "丑"},  # 金局
]

# 地支相刑（简化）
DZ_XING: set[frozenset] = {
    frozenset({"寅", "巳"}),
    frozenset({"子", "卯"}),
    frozenset({"丑", "戌"}),
    frozenset({"未", "戌"}),
    frozenset({"辰"}),  # 辰辰自刑
}

# 用神 / 忌神 字符串 → 可能的十神集合
SHEN_TO_TENGOD: dict[str, tuple[str, ...]] = {
    "印星": ("正印", "偏印"),
    "比劫": ("比肩", "劫财"),
    "食伤": ("食神", "伤官"),
    "财星": ("正财", "偏财"),
    "官杀": ("正官", "七杀"),
}


def _clip(v: int | float, lo: int, hi: int) -> int:
    v = int(round(v))
    if v < lo:
        return lo
    if v > hi:
        return hi
    return v


def _shen_hits(tenGod: str, shen_list: list[str]) -> bool:
    """判断某十神是否命中用神 / 忌神列表。

    用神 / 忌神可能是 "印星" 这种十神类别，也可能是 "平衡五行" / "过旺之行"
    这类兜底标签。后者无法直接匹配十神，默认不命中。
    """
    for s in shen_list or []:
        mapped = SHEN_TO_TENGOD.get(s)
        if mapped and tenGod in mapped:
            return True
    return False


def _sanhe_with_day(branch: str, day_branch: str) -> bool:
    """大运地支是否与日支构成三合（任一对命中即算）。"""
    for combo in DZ_SANHE:
        if day_branch in combo and branch in combo and branch != day_branch:
            return True
    return False


def _is_xing(a: str, b: str) -> bool:
    if a == b == "辰":
        return True
    return frozenset({a, b}) in DZ_XING


def _deterministic_noise(chart_id: str, i: int) -> int:
    """按 (chartId, i) 生成 [-3, 3] 的确定性噪声。"""
    digest = hashlib.md5(f"{chart_id}{i}".encode()).digest()
    return digest[0] % 7 - 3


def compute_life_curve(chart: dict[str, Any]) -> list[dict[str, Any]]:
    """把 8 步大运渲染为 8 根蜡烛。"""
    dayun: list[dict[str, Any]] = chart.get("dayun") or []
    if not dayun:
        return []

    day_stem: str = chart["dayMaster"]["stem"]
    level: str = chart["wangshuai"]["level"]
    yongshen: list[str] = chart.get("yongshen") or []
    jishen: list[str] = chart.get("jishen") or []
    day_branch: str = chart["pillars"]["day"]["branch"]
    chart_id: str = chart["chartId"]

    weak = level in ("极弱", "偏弱", "中和")
    weak_tbl = {
        "正财": -2, "偏财": -2,
        "正官": -4, "七杀": -4,
        "正印": +5, "偏印": +5,
        "比肩": +3, "劫财": +3,
        "食神": -2, "伤官": -2,
        "日元": 0,
    }
    strong_tbl = {
        "正财": +3, "偏财": +3,
        "正官": +2, "七杀": +2,
        "正印": -2, "偏印": -2,
        "比肩": -3, "劫财": -3,
        "食神": +4, "伤官": +4,
        "日元": 0,
    }

    now_year = datetime.now().year

    out: list[dict[str, Any]] = []
    prev_close: int = 50

    for i, dy in enumerate(dayun):
        ten_god: str = dy["tenGod"]
        gz: str = dy["ganzhi"]
        gan = gz[0]
        zhi = gz[1]

        # 1) 十神基础分
        base = (weak_tbl if weak else strong_tbl).get(ten_god, 0)

        # 2) 用神 / 忌神
        ys_bonus = 0
        yong_hit = _shen_hits(ten_god, yongshen)
        ji_hit = _shen_hits(ten_god, jishen)
        if yong_hit:
            ys_bonus += 5
        if ji_hit:
            ys_bonus -= 5

        # 3) 合冲
        hc = 0
        hc_drivers: list[str] = []
        # 天干与日主合
        if TG_HE.get(day_stem) == gan:
            hc += 2
            hc_drivers.append("天干合日主 +2")
        # 天干与日主冲
        if TG_CHONG.get(day_stem) == gan:
            hc -= 3
            hc_drivers.append("天干冲日主 -3")
        # 地支与日支三合
        if _sanhe_with_day(zhi, day_branch):
            hc += 3
            hc_drivers.append("地支合日支 +3")
        # 地支与日支冲
        if DZ_CHONG.get(day_branch) == zhi:
            hc -= 3
            hc_drivers.append("地支冲日支 -3")
        # 地支相刑
        if _is_xing(zhi, day_branch):
            hc -= 2
            hc_drivers.append("地支刑日支 -2")

        drift = base + ys_bonus + hc

        # 4) 蜡烛
        open_v = prev_close
        noise = _deterministic_noise(chart_id, i)
        close_v = _clip(open_v + drift + noise, 12, 92)
        vol = abs(drift) + 6
        high_v = _clip(max(open_v, close_v) + vol, 0, 100)
        low_v = _clip(min(open_v, close_v) - vol, 0, 100)

        # 5) state
        start_year = dy.get("startYear")
        end_year = dy.get("endYear")
        if end_year is not None and now_year > end_year:
            state = "past"
        elif start_year is not None and now_year < start_year:
            state = "future"
        else:
            state = "current"

        # 6) drivers
        drivers: list[str] = []
        base_str = f"{ten_god}·+{base}" if base > 0 else f"{ten_god}·{base}"
        drivers.append(base_str)
        if yong_hit:
            drivers.append("助用神 +5")
        if ji_hit:
            drivers.append("犯忌神 -5")
        # 合冲 drivers 加进来，最多凑到 3 条
        for d in hc_drivers:
            if len(drivers) >= 3:
                break
            drivers.append(d)

        out.append({
            "ganzhi": gz,
            "startYear": start_year,
            "endYear": end_year,
            "startAge": dy.get("startAge"),
            "tenGod": ten_god,
            "state": state,
            "open": int(open_v),
            "close": int(close_v),
            "high": int(high_v),
            "low": int(low_v),
            "up": close_v >= open_v,
            "score": int(close_v),
            "drivers": drivers,
        })

        prev_close = close_v

    return out
