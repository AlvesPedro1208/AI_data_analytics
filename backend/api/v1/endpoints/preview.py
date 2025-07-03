from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import pandas as pd
import requests
import io

router = APIRouter()

@router.post("/preview")
async def preview_planilha(
    file: Optional[UploadFile] = File(None),
    google_sheets_url: Optional[str] = Form(None)
):
    try:
        if file:
            df = pd.read_csv(file.file) if file.filename.endswith(".csv") else pd.read_excel(file.file)
        elif google_sheets_url:
            if "docs.google.com" not in google_sheets_url:
                raise HTTPException(status_code=400, detail="URL inválida do Google Sheets.")

            parts = google_sheets_url.split("/")
            if len(parts) < 6:
                raise HTTPException(status_code=400, detail="Não foi possível extrair o ID da planilha.")

            sheet_id = parts[5]
            export_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"

            response = requests.get(export_url)
            response.raise_for_status()

            df = pd.read_csv(io.StringIO(response.text))
        else:
            raise HTTPException(status_code=422, detail="Nenhum arquivo ou URL fornecido.")

        preview = df.head(5).to_dict(orient="records")
        columns = list(df.columns)
        return {"columns": columns, "data": preview}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar planilha: {str(e)}")
