"""八字核心计算。

策略：
- 借助 `lunar-python` 完成 [节气 / 立春 / 农历 ↔ 公历 / 子时跨日 / 起大运] 这些
  容易出错的日历细节；节气边界、闰月、真太阳时都由它处理。
- 藏干 / 十神 / 旺衰 / 格局 / 用神 复用 yhzp.py（tmp/yhzp.py）的逻辑
  （渊海子平体系）。
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta

from lunar_python import Lunar, Solar

from .calendar import resolve_longitude, true_solar_time


# ---------------- 基础常量（来自 tmp/yhzp.py）----------------
TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

TG_WX = {
    "甲": "木", "乙": "木", "丙": "火", "丁": "火",
    "戊": "土", "己": "土", "庚": "金", "辛": "金",
    "壬": "水", "癸": "水",
}
DZ_WX = {
    "子": "水", "丑": "土", "寅": "木", "卯": "木",
    "辰": "土", "巳": "火", "午": "火", "未": "土",
    "申": "金", "酉": "金", "戌": "土", "亥": "水",
}
HIDETG = {
    "子": ["癸"],
    "丑": ["己", "辛", "癸"],
    "寅": ["甲", "丙", "戊"],
    "卯": ["乙"],
    "辰": ["戊", "乙", "癸"],
    "巳": ["丙", "庚", "戊"],
    "午": ["丁", "己"],
    "未": ["己", "乙", "丁"],
    "申": ["庚", "壬", "戊"],
    "酉": ["辛"],
    "戌": ["戊", "辛", "丁"],
    "亥": ["壬", "甲"],
}
SHISHEN_DEF = {
    "生我同阴": "偏印", "生我异阴": "正印",
    "我生同阴": "食神", "我生异阴": "伤官",
    "克我同阴": "七杀", "克我异阴": "正官",
    "我克同阴": "偏财", "我克异阴": "正财",
    "同我同阴": "比肩", "同我异阴": "劫财",
}
WX_COLOR = {"金": "#c9a678", "木": "#4a7c59", "水": "#3e5a7a", "火": "#b84545", "土": "#a88658"}


def _yinyang(gan: str) -> str:
    return "阳" if TIANGAN.index(gan) % 2 == 0 else "阴"


def _shengke(a: str, b: str) -> str:
    ke = {"木": "土", "土": "水", "水": "火", "火": "金", "金": "木"}
    sheng = {"木": "火", "火": "土", "土": "金", "金": "水", "水": "木"}
    if sheng[b] == a: return "生我"
    if sheng[a] == b: return "我生"
    if ke[b] == a: return "克我"
    if ke[a] == b: return "我克"
    return "同我"


def calc_shishen(rigan: str, target_gan: str) -> str:
    rel = _shengke(TG_WX[rigan], TG_WX[target_gan])
    same_yin = _yinyang(rigan) == _yinyang(target_gan)
    return SHISHEN_DEF[f"{rel}{'同阴' if same_yin else '异阴'}"]


# ---------------- 公历日期构造 ----------------
def _to_solar(date_str: str, hour: int, minute: int, calendar_type: str, is_leap: bool) -> Solar:
    y, m, d = map(int, date_str.split("-"))
    if calendar_type == "solar":
        return Solar.fromYmdHms(y, m, d, hour, minute, 0)
    # 农历 → 公历
    lunar = Lunar.fromYmd(y, -m if is_leap else m, d)
    solar = lunar.getSolar()
    return Solar.fromYmdHms(solar.getYear(), solar.getMonth(), solar.getDay(), hour, minute, 0)


# ---------------- 五行百分比 ----------------
def _five_elements_percent(pillars_stems: list[str], pillars_branches: list[str]) -> dict[str, int]:
    """天干每个权重 2；地支本气权重 3；藏干非本气权重 1。"""
    weights = {"金": 0, "木": 0, "水": 0, "火": 0, "土": 0}
    for g in pillars_stems:
        weights[TG_WX[g]] += 2
    for b in pillars_branches:
        main = HIDETG[b][0]
        weights[TG_WX[main]] += 3
        for other in HIDETG[b][1:]:
            weights[TG_WX[other]] += 1
    total = sum(weights.values()) or 1
    pct = {k: round(v * 100 / total) for k, v in weights.items()}
    diff = 100 - sum(pct.values())
    if diff != 0:
        # 把舍入误差分配到最大/最小项
        top = max(pct, key=pct.get)
        pct[top] += diff
    return pct


# ---------------- 旺衰 / 格局 / 用神（来自 yhzp.py）----------------
def _wangshuai(rg: str, stems: list[str], branches: list[str]) -> tuple[str, int]:
    rg_wx = TG_WX[rg]
    score = 0
    # 得令：月支五行 = 日主五行
    if DZ_WX[branches[1]] == rg_wx:
        score += 5
    # 得地：四支本气同五行
    for b in branches:
        if DZ_WX[b] == rg_wx:
            score += 1
    # 得势：其他天干为比劫/印
    for i, g in enumerate(stems):
        if i == 2:
            continue  # 日干自身不算
        s = calc_shishen(rg, g)
        if s in ("比肩", "劫财", "正印", "偏印"):
            score += 1
    if score >= 7: return "极旺", score
    if score >= 5: return "偏旺", score
    if score >= 3: return "中和", score
    if score >= 1: return "偏弱", score
    return "极弱", score


def _geju(rg: str, month_gan: str) -> str:
    ss = calc_shishen(rg, month_gan)
    mapping = {
        "正官": "正官格", "七杀": "七杀格", "正财": "正财格", "偏财": "偏财格",
        "正印": "正印格", "偏印": "偏印格", "食神": "食神格", "伤官": "伤官格",
    }
    return mapping.get(ss, "普通格局")


def _yongshen_jishen(level: str) -> tuple[list[str], list[str]]:
    if level in ("极旺", "偏旺"):
        return ["官杀", "食伤", "财星"], ["印星", "比劫"]
    if level == "中和":
        return ["平衡五行"], ["过旺之行"]
    return ["印星", "比劫"], ["官杀", "食伤", "财星"]


# ---------------- 主计算 ----------------
def calculate(
    *, name: str, gender: str, calendar_type: str, birth_date: str,
    birth_hour: int, birth_minute: int, is_leap_month: bool,
    province: str, city: str,
) -> dict:
    # 1. 公历实体
    solar = _to_solar(birth_date, birth_hour, birth_minute, calendar_type, is_leap_month)

    # 2. 真太阳时
    longitude = resolve_longitude(province, city)
    raw_dt = datetime(solar.getYear(), solar.getMonth(), solar.getDay(), birth_hour, birth_minute)
    tst = true_solar_time(raw_dt, longitude)
    # 用真太阳时重新构造 Solar，让 lunar-python 以校正后的时间计算时柱
    solar = Solar.fromYmdHms(tst.year, tst.month, tst.day, tst.hour, tst.minute, 0)

    # 3. 四柱（lunar-python 处理节气/立春/子时）
    lunar = solar.getLunar()
    ec = lunar.getEightChar()
    year_gz, month_gz, day_gz, hour_gz = ec.getYear(), ec.getMonth(), ec.getDay(), ec.getTime()
    stems = [year_gz[0], month_gz[0], day_gz[0], hour_gz[0]]
    branches = [year_gz[1], month_gz[1], day_gz[1], hour_gz[1]]
    rg = stems[2]  # 日主

    def pillar_dict(idx: int) -> dict:
        g, z = stems[idx], branches[idx]
        ten = "日元" if idx == 2 else calc_shishen(rg, g)
        return {
            "stem": g, "branch": z, "ganzhi": g + z,
            "tenGod": ten,
            "hiddenStems": HIDETG[z],
            "element": TG_WX[g],
            "branchElement": DZ_WX[z],
        }

    pillars = {
        "year": pillar_dict(0),
        "month": pillar_dict(1),
        "day": pillar_dict(2),
        "hour": pillar_dict(3),
    }

    # 4. 旺衰 / 格局 / 用神
    ws_level, ws_score = _wangshuai(rg, stems, branches)
    geju = _geju(rg, stems[1])
    yongshen, jishen = _yongshen_jishen(ws_level)

    # 5. 五行百分比
    five = _five_elements_percent(stems, branches)

    # 6. 大运（lunar-python 自带，阳男阴女顺排，阴男阳女逆排）
    yun = ec.getYun(1 if gender == "male" else 0)
    dayun_raw = yun.getDaYun()  # 含胎元 + 10 运
    dayun = []
    for dy in dayun_raw[1:9]:  # 跳过首个（胎/起运前）
        gz = dy.getGanZhi() or ""
        if not gz:
            continue
        dayun.append({
            "ganzhi": gz,
            "startAge": dy.getStartAge(),
            "startYear": dy.getStartYear(),
            "endYear": dy.getEndYear(),
            "tenGod": calc_shishen(rg, gz[0]),
        })

    # 当前大运 & 流年
    now_year = datetime.now().year
    current_dayun = None
    for dy in dayun:
        if dy["startYear"] <= now_year <= dy["endYear"]:
            current_dayun = dy
            break
    cur_liunian = Solar.fromYmdHms(now_year, 6, 1, 0, 0, 0).getLunar().getYearInGanZhi()

    chart_id = uuid.uuid4().hex[:16]

    chart_dict = {
        "chartId": chart_id,
        "name": name or "",
        "gender": gender,
        "inputDate": birth_date,
        "inputHour": birth_hour,
        "calendarType": calendar_type,
        "solarDate": f"{solar.getYear():04d}-{solar.getMonth():02d}-{solar.getDay():02d}",
        "lunarDate": f"{lunar.getYear()}年{lunar.getMonthInChinese()}月{lunar.getDayInChinese()}",
        "trueSolarTime": tst.strftime("%H:%M"),
        "locationLongitude": longitude,
        "pillars": pillars,
        "dayMaster": {"stem": rg, "element": TG_WX[rg], "yinyang": _yinyang(rg)},
        "wangshuai": {"level": ws_level, "score": ws_score},
        "geju": geju,
        "yongshen": yongshen,
        "jishen": jishen,
        "fiveElements": five,
        "dayun": dayun,
        "currentDayun": current_dayun,
        "currentYear": now_year,
        "currentLiunian": cur_liunian,
    }

    # 个性化人生走势 K 线（依赖上面生成的 chart_dict）
    from . import fortune as _fortune
    chart_dict["lifeCurve"] = _fortune.compute_life_curve(chart_dict)

    return chart_dict
