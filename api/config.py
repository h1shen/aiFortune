import os
from pathlib import Path
from dotenv import load_dotenv

# 本地开发：从 api/.env 读；Vercel 运行时：直接由平台注入环境变量，.env 不存在也无妨
_env_path = Path(__file__).resolve().parent / ".env"
if _env_path.exists():
    load_dotenv(_env_path)

ARK_API_KEY = os.getenv("ARK_API_KEY", "")
ARK_BASE_URL = os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
ARK_MODEL = os.getenv("ARK_MODEL", "doubao-seed-2-0-pro-260215")
CORS_ORIGINS = [o.strip() for o in os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
