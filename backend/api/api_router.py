from fastapi import APIRouter
from api.v1.endpoints import chat, charts, preview, meta, contas_metaAPI as contas

router = APIRouter()
router.include_router(chat.router, tags=["IA"])
router.include_router(charts.router, tags=["Gráficos"])
router.include_router(preview.router, tags=["Preview"])
router.include_router(meta.router, prefix="/api/v1", tags=["Meta"])
router.include_router(contas.router, prefix="/contas", tags=["Contas Meta"])
