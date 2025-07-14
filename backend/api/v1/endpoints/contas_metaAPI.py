from fastapi import APIRouter, HTTPException
from backend.schemas.conta_metaAPI import ContaConectada, AtualizaStatusConta, ContaConectadaCreate
from backend.services import contas_metaAPI as contas

router = APIRouter()

@router.get("/", response_model=list[ContaConectada])
def get_contas():
    return contas.listar_contas()

@router.post("/", include_in_schema=True)
def post_conta(conta: ContaConectadaCreate):
    contas.criar_conta(conta)
    return {"status": "criado"}

@router.delete("/{id}")
def deletar_conta(id: int):
    return contas.deletar_conta(id)

@router.put("/{id}")
def atualizar_status_conta(id: int, body: AtualizaStatusConta):
    # Atualiza só o campo "ativo" no banco
    from backend.services import contas_metaAPI as contas
    return contas.atualizar_status(id, body.ativo)
