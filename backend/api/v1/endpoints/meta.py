from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional
from services.meta_extractor import buscar_dados_meta

router = APIRouter()

class RequisicaoMeta(BaseModel):
    account_id: str
    user_facebook_id: str
    data_inicial: Optional[str] = None
    data_final: Optional[str] = None
    fields: Optional[str] = None

@router.post("/meta/dados")
def carregar_dados_meta(req: RequisicaoMeta):
    return buscar_dados_meta(req.account_id, req.user_facebook_id, req.data_inicial, req.data_final, req.fields)