from fastapi import APIRouter, Form, File, UploadFile, HTTPException
from services.ia import gerar_insight_ia_together
from utils.planilhas import ler_planilha
from typing import Optional

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

        resposta = gerar_insight_ia_together(df, pergunta)

        return {"resposta": resposta}

    except HTTPException as http_error:
        raise http_error

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
