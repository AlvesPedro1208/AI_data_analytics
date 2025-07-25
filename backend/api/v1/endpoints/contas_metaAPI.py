# Arquivo desativado: endpoints antigos de contas_conectadas
# from fastapi import APIRouter, HTTPException
# from backend.schemas.conta_metaAPI import ContaConectada, AtualizaStatusConta, ContaConectadaCreate
# from backend.services import contas_metaAPI as contas
# from datetime import datetime
# import requests
#
# router = APIRouter()
#
# @router.get("/", response_model=list[ContaConectada])
# def get_contas():
#     return contas.listar_contas()
#
# @router.post("/", include_in_schema=True)
# def post_conta(conta: ContaConectadaCreate):
#     contas.criar_conta(conta)
#     return {"status": "criado"}
#
# @router.delete("/{id}")
# def deletar_conta(id: int):
#     return contas.deletar_conta(id)
#
# @router.put("/{id}")
# def atualizar_status_conta(id: int, body: AtualizaStatusConta):
#     from backend.services import contas_metaAPI as contas
#     return contas.atualizar_status(id, body.ativo)
#
# @router.get("/{account_id}/status_facebook")
# def status_facebook(account_id: str):
#     conta = next((c for c in contas.listar_contas() if str(c.identificador_conta) == str(account_id)), None)
#     if not conta:
#         raise HTTPException(status_code=404, detail="Conta não encontrada")
#     token = conta.token
#     url = f"https://graph.facebook.com/v18.0/act_{account_id}?fields=account_status&access_token={token}"
#     resp = requests.get(url)
#     if resp.status_code != 200:
#         return {"status": "indisponível"}
#     data = resp.json()
#     return {"status": data.get("account_status", "indisponível")}
