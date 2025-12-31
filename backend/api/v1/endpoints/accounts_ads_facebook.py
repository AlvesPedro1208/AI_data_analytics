from fastapi import APIRouter, HTTPException
from schemas.accounts_ads_facebook import AccountAdsFacebookCreate, AccountAdsFacebook, AccountAdsFacebookUpdate
from services import accounts_ads_facebook as account_service
from typing import List

router = APIRouter()

@router.post("/", response_model=AccountAdsFacebook)
def criar_account(account: AccountAdsFacebookCreate):
    result = account_service.criar_account(account)
    if not result:
        raise HTTPException(status_code=400, detail="Erro ao criar conta de anúncio")
    return result

@router.get("/", response_model=List[AccountAdsFacebook])
def listar_accounts():
    return account_service.listar_accounts()

@router.get("/by_facebook_id/{facebook_id}", response_model=List[AccountAdsFacebook])
def listar_accounts_por_facebook_id(facebook_id: str):
    return account_service.listar_accounts_por_facebook_id(facebook_id)

@router.put("/{account_id}", response_model=AccountAdsFacebook)
def atualizar_status(account_id: int, update: AccountAdsFacebookUpdate):
    result = account_service.atualizar_status_account(account_id, update.ativo)
    if not result:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    return result

@router.delete("/{account_id}")
def deletar_account(account_id: int):
    result = account_service.deletar_account(account_id)
    if not result:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    return {"message": "Conta deletada com sucesso"}
