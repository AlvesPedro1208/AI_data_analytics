from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import pandas as pd
import requests
import io
import re

router = APIRouter()

def extrair_sheet_id(url: str) -> Optional[str]:
    """Extrai o ID da planilha do Google Sheets a partir da URL"""
    match = re.search(r"/d/([a-zA-Z0-9-_]+)", url)
    return match.group(1) if match else None

def carregar_planilha_local(file: UploadFile) -> pd.DataFrame:
    """Lê a planilha local (CSV ou Excel)"""
    try:
        if file.filename.endswith(".csv"):
            return pd.read_csv(file.file)
        else:
            return pd.read_excel(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao ler o arquivo: {str(e)}")

def carregar_planilha_google_sheets(url: str) -> pd.DataFrame:
    """Lê a planilha do Google Sheets via link público"""
    if "docs.google.com" not in url:
        raise HTTPException(status_code=400, detail="URL inválida do Google Sheets.")

    sheet_id = extrair_sheet_id(url)
    if not sheet_id:
        raise HTTPException(status_code=400, detail="Não foi possível extrair o ID da planilha.")

    export_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"

    try:
        response = requests.get(export_url)
        response.raise_for_status()
        return pd.read_csv(io.StringIO(response.text))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao acessar ou ler a planilha: {str(e)}")

@router.post("/preview")
async def preview_planilha(
    file: Optional[UploadFile] = File(None),
    google_sheets_url: Optional[str] = Form(None)
):
    try:
        if file:
            df = carregar_planilha_local(file)
        elif google_sheets_url:
            df = carregar_planilha_google_sheets(google_sheets_url)
        else:
            raise HTTPException(status_code=422, detail="Nenhum arquivo ou URL fornecido.")

        preview = df.head(5).to_dict(orient="records")
        columns = list(df.columns)

        return {"columns": columns, "data": preview}
    
    except HTTPException:
        raise  # Repassa erros HTTP definidos acima
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro inesperado ao processar a planilha: {str(e)}")
