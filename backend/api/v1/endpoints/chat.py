from fastapi import APIRouter, Form, File, UploadFile, HTTPException
from services.ia import gerar_insight_ia_together, gerar_configuracao_grafico
from utils.planilhas import ler_planilha
from typing import Optional
import json

router = APIRouter()

@router.post("/perguntar", tags=["IA"])
async def responder(
    pergunta: str = Form(...),
    google_sheets_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    try:
        if not google_sheets_url and not file:
            raise HTTPException(status_code=400, detail="Você deve fornecer um arquivo ou uma URL do Google Sheets.")

        df = ler_planilha(uploaded_file=file, google_sheets_url=google_sheets_url)

        if df.empty:
            raise HTTPException(status_code=400, detail="A planilha está vazia ou não foi possível carregar os dados.")

        # Detecta se o usuário quer um gráfico
        pedido = pergunta.lower()
        termos_grafico = ["gráfico", "visualização", "barras", "pizza", "linha", "mostrar gráfico", "plotar"]
        if any(t in pedido for t in termos_grafico):
            configuracao = gerar_configuracao_grafico(df, pergunta)
            comando_chart = f"[CHART:{json.dumps(configuracao)}]"
            return {"resposta": comando_chart}

        # Caso contrário, responde normalmente
        resposta = gerar_insight_ia_together(df, pergunta)
        return {"resposta": resposta}

    except HTTPException as http_error:
        raise http_error

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
