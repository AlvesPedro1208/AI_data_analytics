from fastapi import APIRouter, HTTPException, Request
from backend.schemas.accounts_ads_facebook import AccountAdsFacebookCreate
from backend.services import accounts_ads_facebook as accounts_service
from datetime import datetime

router = APIRouter()

@router.post("/oauth/facebook/import")
async def import_facebook_accounts(request: Request):
    try:
        data = await request.json()
        print("Dados recebidos:", data)
        access_token = data.get("access_token")
        accounts = data.get("accounts", [])

        if not access_token or not accounts:
            raise HTTPException(status_code=400, detail="Token ou contas não fornecidos.")

        importadas = 0
        for acc in accounts:
            try:
                conta = AccountAdsFacebookCreate(
                    plataforma=acc.get("plataforma", "Facebook Ads"),
                    tipo=acc.get("tipo", "facebook"),
                    token=access_token,
                    identificador_conta=acc["identificador_conta"],
                    nome_conta=acc["nome_conta"],
                    data_conexao=datetime.utcnow(),
                    ativo=acc.get("ativo", True)
                )
                accounts_service.criar_account(conta)
                importadas += 1
            except Exception as e:
                print("Erro ao salvar conta:", e)
                raise HTTPException(status_code=500, detail=f"Erro ao salvar conta: {str(e)}")

        return {"status": "ok", "importadas": importadas}
    except Exception as e:
        print("ERRO GERAL NO ENDPOINT /oauth/facebook/import:", e)
        raise HTTPException(status_code=500, detail=f"Erro geral: {str(e)}")
