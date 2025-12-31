from fastapi import APIRouter
from api.v1.endpoints import chat, charts, preview, meta, oauth, settings
from api.v1.endpoints import user_facebook, accounts_ads_facebook, user_accounts, connectors

router = APIRouter()
router.include_router(chat.router, tags=["IA"])
router.include_router(charts.router, tags=["Gráficos"])
router.include_router(preview.router, tags=["Preview"])
router.include_router(meta.router, prefix="/api/v1", tags=["Meta"])
router.include_router(oauth.router, tags=["OAuth"])
router.include_router(settings.router, prefix="/settings", tags=["Configurações"])

# Novos endpoints
router.include_router(user_facebook.router, prefix="/user_facebook", tags=["Usuários Facebook"])
router.include_router(accounts_ads_facebook.router, prefix="/accounts_ads_facebook", tags=["Contas Ads Facebook"])
router.include_router(user_accounts.router, prefix="/user_accounts", tags=["Associação Usuário-Conta"])
router.include_router(connectors.router, prefix="/connectors", tags=["Conectores"])
