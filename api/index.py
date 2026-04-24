"""Vercel Serverless / 本地 uvicorn 共用入口。

本地开发：
    uvicorn api.index:app --host 127.0.0.1 --port 8000 --reload

Vercel：部署时由 @vercel/python 自动识别；vercel.json 把 /api/* 路由到本文件。
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.config import CORS_ORIGINS
from api.routers import bazi, chat

app = FastAPI(title="KeyMind 知命 · Bazi API", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 所有路由带 /api 前缀，和 Vercel Functions URL 一致
app.include_router(bazi.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.get("/api")
def root():
    return {"service": "keymind-bazi", "status": "ok"}


@app.get("/api/health")
def health():
    return {"ok": True}
