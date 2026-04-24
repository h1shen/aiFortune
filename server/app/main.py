from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS
from .routers import bazi, chat

app = FastAPI(title="KeyMind 知命 · 八字 API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bazi.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"service": "keymind-bazi", "status": "ok"}


@app.get("/health")
def health():
    return {"ok": True}
