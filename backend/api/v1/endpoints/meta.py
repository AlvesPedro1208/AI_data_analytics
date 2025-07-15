from fastapi import APIRouter, Request
from pydantic import BaseModel
from backend.services.meta_extractor import buscar_dados_meta

router = APIRouter()

class RequisicaoMeta(BaseModel):
    account_id: str
    data_inicial: str  # formato: "YYYY-MM-DD"
    data_final: str    # formato: "YYYY-MM-DD"

@router.post("/meta/dados")
def carregar_dados_meta(req: RequisicaoMeta):
    return buscar_dados_meta(req.account_id, req.data_inicial, req.data_final)