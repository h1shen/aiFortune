import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from api.bazi.schemas import ChatRequest
from api.llm import client, prompts

router = APIRouter(prefix="/chat", tags=["chat"])


def _sse_stream(messages: list[dict]):
    """把 LLM 流式输出包成 Server-Sent Events。"""
    try:
        for piece in client.chat_stream(messages):
            yield f"data: {json.dumps({'delta': piece}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"


@router.post("/stream")
def chat_stream(req: ChatRequest):
    # 无状态：前端把 localStorage 里完整命盘随 body 传上来
    chart = req.chart
    if not chart or not isinstance(chart, dict) or "pillars" not in chart:
        raise HTTPException(status_code=400, detail="chart 缺失或不完整，请重新排盘")

    if req.mode == "reading":
        messages = prompts.reading_messages(chart)
    elif req.mode == "laiyi":
        messages = prompts.laiyi_messages(chart)
    elif req.mode == "reading_section":
        if not req.section:
            raise HTTPException(status_code=400, detail="reading_section 必须提供 section")
        messages = prompts.reading_section_messages(chart, req.section)
    else:  # qa
        history = [m.model_dump() for m in req.messages]
        messages = prompts.qa_messages(chart, history)

    return StreamingResponse(
        _sse_stream(messages),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
