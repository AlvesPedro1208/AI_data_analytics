import os
import requests
import pandas as pd
from dotenv import load_dotenv
import json
import re
from langdetect import detect

# Carrega o .env com caminho absoluto
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

# Lê a chave da IA
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
if not TOGETHER_API_KEY:
    raise EnvironmentError("Variável TOGETHER_API_KEY não foi carregada. Verifique o arquivo .env")

# Constantes da API
TOGETHER_URL = "https://api.together.xyz/v1/chat/completions"
TOGETHER_MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"

def gerar_insight_ia_together(df: pd.DataFrame, pergunta: str) -> str:
    try:
        idioma = detect(pergunta)
    except Exception:
        idioma = "pt"  # fallback se falhar

    linguagem_prompt = {
        "pt": "Responda de forma analítica, clara e orientada a negócios. Responda em português.",
        "en": "Respond in an analytical, clear, and business-oriented manner. Answer in Portuguese - Brazil."
    }.get(idioma, "Respond in the same language as the question.")

    prompt = f"""
    Abaixo estão os dados de uma planilha:

    {df.head(20).to_markdown(index=False)}
    Você é um assistente de análise de dados que responde de forma direta, curta e objetiva.
    Responda sempre em português do Brasil. Não adicione explicações desnecessárias.
    Foque apenas no que foi perguntado.
    Com base nesses dados, responda à seguinte pergunta: \"{pergunta}\"

    {linguagem_prompt}
    """

    body = {
        "model": TOGETHER_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 700
    }

    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(TOGETHER_URL, headers=headers, json=body)

    try:
        response.raise_for_status()
        resposta = response.json()

        if "choices" in resposta and resposta["choices"]:
            return resposta["choices"][0]["message"]["content"]
        else:
            return f"Erro: resposta inesperada da IA → {resposta}"
    except requests.exceptions.RequestException as e:
        return f"Erro de conexão com a IA: {str(e)}"
    except Exception as e:
        return f"Erro ao processar resposta da IA: {str(e)}"

def gerar_configuracao_grafico(df: pd.DataFrame, pedido_usuario: str) -> dict:
    prompt = f"""
Você é um assistente de análise de dados e especialista em storytelling com dados. Abaixo está uma amostra da planilha carregada:

{df.head(10).to_markdown(index=False)}

O usuário fez a seguinte solicitação de visualização: "{pedido_usuario}"

Sua tarefa:
1. Analise o pedido e os dados fornecidos.
2. Escolha o **tipo ideal de gráfico** com base nas boas práticas de visualização (barras, linha ou pizza).
3. Retorne **apenas um JSON** no formato abaixo, que será utilizado para renderizar o gráfico:

{{
  "type": "bar",         # ou "line", ou "pie"
  "title": "Título do gráfico",
  "data": [...],         # lista de dicionários com os dados (máximo 50)
  "config": {{
    "xKey": "nome_coluna_x",      # se aplicável
    "yKey": "nome_coluna_y",      # se aplicável
    "dataKey": "nome_coluna_valor"  # para gráfico de pizza
  }}
}}

Responda apenas com o JSON válido.
"""


    body = {
        "model": TOGETHER_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 800
    }

    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(TOGETHER_URL, headers=headers, json=body)
        response.raise_for_status()
        raw = response.json().get("choices", [{}])[0].get("message", {}).get("content", "")

        match = re.search(r"{.*}", raw, re.DOTALL)
        if match:
            return json.loads(match.group())
        else:
            return {"erro": f"Resposta inesperada da IA: {raw}"}
    except Exception as e:
        return {"erro": f"Erro ao requisitar IA: {str(e)}"}
