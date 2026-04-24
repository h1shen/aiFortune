from typing import Literal, Optional
from pydantic import BaseModel, Field


class Location(BaseModel):
    province: Optional[str] = ""
    city: Optional[str] = ""
    longitude: Optional[float] = None


class CalculateRequest(BaseModel):
    name: Optional[str] = ""
    gender: Literal["male", "female"]
    calendarType: Literal["solar", "lunar"] = "solar"
    birthDate: str = Field(description="YYYY-MM-DD")
    birthHour: int = Field(ge=0, le=23, description="0-23 (北京时间)")
    birthMinute: int = Field(default=0, ge=0, le=59)
    isLeapMonth: bool = False
    location: Location = Location()


class Pillar(BaseModel):
    stem: str
    branch: str
    ganzhi: str
    tenGod: str
    hiddenStems: list[str]
    element: str
    branchElement: str


class DayMaster(BaseModel):
    stem: str
    element: str
    yinyang: str


class WangShuai(BaseModel):
    level: str
    score: int


class DaYun(BaseModel):
    ganzhi: str
    startAge: int
    startYear: int
    endYear: int
    tenGod: str
    fortuneScore: int = 0  # -5 ~ +5
    fortuneLabel: str = "平"  # 顺 / 平 / 阻


class LiunianScore(BaseModel):
    year: int
    ganzhi: str
    tenGod: str
    score: float


class CalculateResponse(BaseModel):
    chartId: str
    name: str
    gender: str
    inputDate: str
    inputHour: int
    calendarType: str
    solarDate: str
    lunarDate: str
    trueSolarTime: str
    locationLongitude: Optional[float]

    pillars: dict[str, Pillar]  # keys: year, month, day, hour
    dayMaster: DayMaster
    wangshuai: WangShuai
    geju: str
    yongshen: list[str]
    jishen: list[str]
    fiveElements: dict[str, int]  # 金木水火土 -> percent (0-100)
    dayun: list[DaYun]
    liunianScores: list[LiunianScore] = []
    currentDayun: Optional[DaYun]
    currentYear: int
    currentLiunian: str


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    chartId: str
    mode: Literal["reading", "laiyi", "qa"] = "qa"
    messages: list[ChatMessage] = []
