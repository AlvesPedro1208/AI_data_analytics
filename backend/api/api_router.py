from fastapi import APIRouter
from api.v1.endpoints import chat, charts, preview

router = APIRouter()
router.include_router(chat.router, tags=["IA"])
router.include_router(charts.router, tags=["Gráficos"])
router.include_router(preview.router, tags=["Preview"])
