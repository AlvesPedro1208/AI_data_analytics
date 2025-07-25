from fastapi import APIRouter, HTTPException
from backend.schemas.user_facebook import UserFacebookCreate, UserFacebook
from backend.services import user_facebook as user_service
from typing import List

router = APIRouter()

@router.post("/", response_model=UserFacebook)
def criar_usuario(user: UserFacebookCreate):
    result = user_service.criar_usuario(user)
    if not result:
        raise HTTPException(status_code=409, detail="Usuário já existe ou erro ao criar usuário")
    return result

@router.get("/", response_model=List[UserFacebook])
def listar_usuarios():
    return user_service.listar_usuarios()

@router.get("/by_facebook_id/{facebook_id}", response_model=UserFacebook)
def buscar_usuario_por_facebook_id(facebook_id: str):
    user = user_service.buscar_usuario_por_facebook_id(facebook_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user 