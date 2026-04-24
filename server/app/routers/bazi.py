from fastapi import APIRouter, HTTPException

from ..bazi import core
from ..bazi.schemas import CalculateRequest, CalculateResponse
from .. import store

router = APIRouter(prefix="/bazi", tags=["bazi"])


@router.post("/calculate", response_model=CalculateResponse)
def calculate(req: CalculateRequest) -> dict:
    try:
        chart = core.calculate(
            name=req.name or "",
            gender=req.gender,
            calendar_type=req.calendarType,
            birth_date=req.birthDate,
            birth_hour=req.birthHour,
            birth_minute=req.birthMinute,
            is_leap_month=req.isLeapMonth,
            province=(req.location.province if req.location else "") or "",
            city=(req.location.city if req.location else "") or "",
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"排盘失败：{e}")
    store.put(chart["chartId"], chart)
    return chart


@router.get("/chart/{chart_id}", response_model=CalculateResponse)
def get_chart(chart_id: str) -> dict:
    chart = store.get(chart_id)
    if not chart:
        raise HTTPException(status_code=404, detail="命盘不存在或已过期，请重新排盘")
    return chart
