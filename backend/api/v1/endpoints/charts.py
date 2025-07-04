from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, HTTPException
from services.ia import gerar_configuracao_grafico
from utils.planilhas import ler_planilha

class RequisicaoGrafico(BaseModel):
    pedido: str
    google_sheets_url: Optional[str] = None

router = APIRouter()

@router.post("/gerar-grafico", tags=["Gráficos"])
async def gerar_grafico(req: RequisicaoGrafico):
    try:
        df = ler_planilha(uploaded_file=None, google_sheets_url=req.google_sheets_url)
        return gerar_configuracao_grafico(df, req.pedido)
    except Exception as e:
        import traceback
        print("\n🔴 ERRO NA ROTA /gerar-grafico:")
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Erro ao gerar gráfico: {str(e)}")