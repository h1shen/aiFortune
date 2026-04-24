from fastapi import APIRouter, HTTPException

from api.bazi import core
from api.bazi.schemas import CalculateRequest, CalculateResponse

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
    # MVP：不做服务端缓存。前端把命盘存 localStorage，chat 请求时随 body 带回。
    return chart
