from fastapi import APIRouter, HTTPException
from backend.schemas.user_accounts import UserAccountCreate, UserAccount
from backend.services import user_accounts as user_accounts_service
from typing import List

router = APIRouter()

@router.post("/", response_model=UserAccount)
def associar_usuario_conta(user_account: UserAccountCreate):
    result = user_accounts_service.associar_usuario_conta(user_account)
    if not result:
        raise HTTPException(status_code=400, detail="Erro ao associar conta ao usuário")
    return result

@router.get("/usuario/{user_id}")
def listar_contas_por_usuario(user_id: int):
    return user_accounts_service.listar_contas_por_usuario(user_id)

@router.delete("/", response_model=dict)
def desassociar_usuario_conta(user_id: int, account_id: int):
    return user_accounts_service.desassociar_usuario_conta(user_id, account_id) 