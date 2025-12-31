from fastapi import APIRouter, Form, File, UploadFile, HTTPException, Request, Body
from services.ia import gerar_insight_ia, gerar_configuracao_grafico
from utils.planilhas import ler_planilha
from typing import Optional
import json
import pandas as pd
import traceback

# Armazenamento em memória (pode ser substituído por Redis/banco depois)
user_dataframes = {}

router = APIRouter()

@router.post("/perguntar", tags=["IA"])
async def responder(
    request: Request,
    pergunta: str = Form(...),
    facebook_id: str = Form(None),
    account_id: Optional[str] = Form(None)
):
    try:
        from services.user_facebook import buscar_user_id_por_facebook_id
        from services.meta_extractor import carregar_account_ads_facebook_dataframe, buscar_id_conta_por_identificador
        
        # Tenta buscar dados se houver facebook_id
        df = None
        user_id = None
        
        if facebook_id and facebook_id != 'default':
            user_id = buscar_user_id_por_facebook_id(facebook_id)
            if user_id:
                # Se account_id for passado (como string "undefined" ou valor real), trate-o
                acc_id = account_id if account_id and account_id != "undefined" else None
                
                # Tenta resolver ID da plataforma para ID interno
                if acc_id and isinstance(acc_id, str):
                    resolved_id = buscar_id_conta_por_identificador(acc_id)
                    if resolved_id:
                        acc_id = resolved_id
                        
                df = carregar_account_ads_facebook_dataframe(account_id=acc_id, user_id=user_id)
        
        # Se não achou usuário ou dados, cria um DataFrame vazio ou tenta responder sem dados
        if df is None or df.empty:
            # Em vez de erro, vamos tentar responder genericamente usando a IA
            # Criamos um DF dummy apenas para não quebrar a função, ou adaptamos a função de IA
            # Mas a função gerar_insight_ia espera um DF.
            # Vamos criar um DF com uma linha de aviso.
            # Verificar se há dados na tabela global sem filtro de conta
            if user_id:
                 df_check = carregar_account_ads_facebook_dataframe(user_id=user_id, limit=5)
                 if not df_check.empty:
                     df = df_check # Usa qualquer dado do usuário se o filtro de conta falhar
            
            if df is None or df.empty:
                 df = pd.DataFrame([{"Aviso": "Nenhum dado de conta conectado ou selecionado. Responda com base no conhecimento geral."}])
        
        pedido = pergunta.lower()
        termos_grafico = ["gráfico", "visualização", "barras", "pizza", "linha", "mostrar gráfico", "plotar"]
        
        if any(t in pedido for t in termos_grafico):
             # Se pediu gráfico sem dados, aí sim pode ser problema, mas vamos deixar a IA tentar ou avisar
             if df.shape[0] <= 1 and "Aviso" in df.columns:
                  return {"resposta": "Para gerar gráficos, por favor selecione uma conta de anúncios com dados nas configurações ou na barra lateral."}
                  
             configuracao = gerar_configuracao_grafico(df, pergunta)
             comando_chart = f"[CHART:{json.dumps(configuracao)}]"
             return {"resposta": comando_chart}
             
        resposta_ia = gerar_insight_ia(df, pergunta)
        return {"resposta": resposta_ia}

    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        print("ERRO DETALHADO:")
        traceback.print_exc()
        # Não retornar 500 para o frontend não mostrar erro genérico, tentar mensagem amigável
        return {"resposta": f"Desculpe, tive um problema técnico: {str(e)}"}

@router.post("/gerar-grafico", tags=["IA"])
async def gerar_grafico_endpoint(
    request: Request,
    pedido: str = Body(...),
    facebook_id: str = Body('default'),
    account_id: Optional[str] = Body(None)
):
    try:
        from services.user_facebook import buscar_user_id_por_facebook_id
        from services.meta_extractor import carregar_account_ads_facebook_dataframe, buscar_id_conta_por_identificador

        # Tenta buscar dados se houver facebook_id
        df = None
        user_id = None
        
        if facebook_id and facebook_id != 'default':
            user_id = buscar_user_id_por_facebook_id(facebook_id)
            if user_id:
                # Se account_id for passado (como string "undefined" ou valor real), trate-o
                acc_id = account_id if account_id and account_id != "undefined" else None
                
                # Tenta resolver ID da plataforma para ID interno
                if acc_id and isinstance(acc_id, str):
                    resolved_id = buscar_id_conta_por_identificador(acc_id)
                    if resolved_id:
                        acc_id = resolved_id

                df = carregar_account_ads_facebook_dataframe(account_id=acc_id, user_id=user_id)
        
        if df is None or df.empty:
            # Tenta verificar se há contexto de planilha carregado em memória
            if facebook_id == 'default' or not facebook_id:
                 # fallback para user_dataframes se implementado sessão via cookie/token
                 pass
            
            # Se ainda assim não tiver dados, erro
            raise HTTPException(status_code=400, detail="Nenhum dado disponível para gerar gráfico. Conecte uma conta ou carregue uma planilha.")

        configuracao = gerar_configuracao_grafico(df, pedido)
        return configuracao

    except Exception as e:
        print(f"Erro ao gerar gráfico: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

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
