from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, HTTPException
from services.ia import gerar_configuracao_grafico
from utils.planilhas import ler_planilha
from backend.api.v1.endpoints.chat import user_dataframes  # importa o contexto em memória

class RequisicaoGrafico(BaseModel):
    pedido: str
    facebook_id: str
    account_id: Optional[str] = None

router = APIRouter()

@router.post("/gerar-grafico", tags=["Gráficos"])
async def gerar_grafico(req: RequisicaoGrafico):
    try:
        from backend.services.user_facebook import buscar_user_id_por_facebook_id
        from backend.services.meta_extractor import carregar_account_ads_facebook_dataframe
        user_id = buscar_user_id_por_facebook_id(req.facebook_id)
        if not user_id:
            raise HTTPException(status_code=400, detail="Usuário do Facebook não encontrado.")
        df = carregar_account_ads_facebook_dataframe(user_id=user_id)
        if df is None or df.empty:
            raise HTTPException(status_code=400, detail="Não há dados suficientes no banco para gerar o gráfico.")
        return gerar_configuracao_grafico(df, req.pedido)
    except Exception as e:
        import traceback
        print("\n🔴 ERRO NA ROTA /gerar-grafico:")
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Erro ao gerar gráfico: {str(e)}")