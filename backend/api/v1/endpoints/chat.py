from fastapi import APIRouter, Form, File, UploadFile, HTTPException, Request
from services.ia import gerar_insight_ia_together, gerar_configuracao_grafico
from utils.planilhas import ler_planilha
from typing import Optional
import json
import pandas as pd
from googletrans import Translator
import traceback

# Armazenamento em memória (pode ser substituído por Redis/banco depois)
user_dataframes = {}

# Carregar pipeline de tradução (cache global)
translator = Translator()

router = APIRouter()

@router.post("/perguntar", tags=["IA"])
async def responder(
    request: Request,
    pergunta: str = Form(...),
    facebook_id: str = Form(...),
    account_id: Optional[str] = Form(None)
):
    try:
        from backend.services.user_facebook import buscar_user_id_por_facebook_id
        from backend.services.meta_extractor import carregar_account_ads_facebook_dataframe
        user_id = buscar_user_id_por_facebook_id(facebook_id)
        if not user_id:
            raise HTTPException(status_code=400, detail="Usuário do Facebook não encontrado.")
        df = carregar_account_ads_facebook_dataframe(account_id=account_id, user_id=user_id)
        if df is None or df.empty:
            raise HTTPException(status_code=400, detail="Não há dados suficientes no banco para responder.")
        pedido = pergunta.lower()
        termos_grafico = ["gráfico", "visualização", "barras", "pizza", "linha", "mostrar gráfico", "plotar"]
        if any(t in pedido for t in termos_grafico):
            configuracao = gerar_configuracao_grafico(df, pergunta)
            comando_chart = f"[CHART:{json.dumps(configuracao)}]"
            return {"resposta": comando_chart}
        resposta_ia = gerar_insight_ia_together(df, pergunta)
        try:
            resposta_ia = translator.translate(resposta_ia, dest='pt').text
        except Exception as e:
            print('Erro ao traduzir:', e)
        return {"resposta": resposta_ia}
    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        print("ERRO DETALHADO:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.post("/contexto", tags=["IA"])
async def set_ia_contexto(request: Request):
    body = await request.json()
    user_id = body.get('user_id', 'default')  # Troque por autenticação real depois
    dados = body['dados']
    df = pd.DataFrame(dados)
    user_dataframes[user_id] = df
    return {"ok": True, "columns": df.columns.tolist(), "rows": len(df)}

@router.get("/contexto", tags=["IA"])
async def get_ia_contexto(user_id: str = 'default'):
    df = user_dataframes.get(user_id)
    if df is not None:
        return df.to_dict(orient='records')
    return {"erro": "Nenhum contexto carregado"}
