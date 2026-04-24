import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from .. import store
from ..bazi.schemas import ChatRequest
from ..llm import client, prompts

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
    chart = store.get(req.chartId)
    if not chart:
        raise HTTPException(status_code=404, detail="命盘不存在或已过期，请重新排盘")

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
