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

# TOGETHER_URL = "https://api.openai.com/v1/chat/completions"
# TOGETHER_MODEL = "gpt-4"
KEY_RESPONSE = TOGETHER_API_KEY

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
        "Authorization": f"Bearer {KEY_RESPONSE}",
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
    # Reduz o dataframe e limita as colunas apenas ao necessário
    df_preview = df.copy()
    if df.shape[0] > 10:
        df_preview = df.head(10)

    markdown_dados = df_preview.to_markdown(index=False)

    prompt = f"""
    Você é um assistente de análise de dados e especialista em visualizações. Com base na seguinte planilha:

    {markdown_dados}

    Crie uma visualização com base no pedido do usuário: "{pedido_usuario}"
    
    ➡️ Interprete o tipo de gráfico mais adequado (barra, linha, pizza, etc) e gere um JSON estruturado para essa visualização.
    Responda apenas com um JSON puro no seguinte formato:

    {{
    "type": "bar",              // Tipo do gráfico: "bar", "line", "pie"
    "title": "Título do gráfico",
    "data": [
        {{ "Categoria": "Exemplo 1", "Valor": 123 }},
        {{ "Categoria": "Exemplo 2", "Valor": 456 }}
    ],
    "config": {{
        "xKey": "Categoria",
        "yKey": "Valor"
    }}
    }}
    A resposta deve conter somente esse JSON. Não adicione nenhuma explicação.
    """

    body = {
        "model": TOGETHER_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 1500
    }

    headers = {
        "Authorization": f"Bearer {KEY_RESPONSE}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(TOGETHER_URL, headers=headers, json=body)
        print("🔵 STATUS:", response.status_code)
        print("🟡 RAW RESPONSE TEXT:", response.text)
        response.raise_for_status()

        raw = response.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()

        # remove marcações ```json ou ```
        if raw.startswith("```json") or raw.startswith("```"):
            raw = re.sub(r"^```(json)?", "", raw).strip()
            raw = raw.rstrip("`").strip()

        # tenta carregar diretamente
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            # tenta cortar até o último fechamento de }
            end = raw.rfind("}")
            if end != -1:
                raw_truncado = raw[:end+1]
                return json.loads(raw_truncado)
            raise

    except Exception as e:
        raise RuntimeError(f"Falha ao gerar gráfico: {str(e)}")


