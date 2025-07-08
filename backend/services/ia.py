import os
import requests
import pandas as pd
from dotenv import load_dotenv
import json
import re
from langdetect import detect

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
TOGETHER_URL = "https://api.together.xyz/v1/chat/completions"
TOGETHER_MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"

KEY_RESPONSE = TOGETHER_API_KEY
HEADERS = {
    "Authorization": f"Bearer {KEY_RESPONSE}",
    "Content-Type": "application/json"
}

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

def interpretar_pedido_usuario(df: pd.DataFrame, pedido: str) -> dict:
    df_preview = df.head(15)
    markdown = df_preview.to_markdown(index=False)

    prompt = f"""
    Você é um especialista em visualização de dados. Analise a tabela abaixo:

    {markdown}

    Com base na tabela e no pedido do usuário: "{pedido}", identifique:
    - tipo de gráfico (bar, line ou pie)
    - coluna a ser usada no eixo X
    - coluna a ser usada no eixo Y (se aplicável)
    - título do gráfico

    Responda apenas com um JSON como este:

    {{
    "type": "bar",
    "xKey": "Data",
    "yKey": "Vendas",
    "title": "Vendas por Dia"
    }}
    """

    body = {
        "model": TOGETHER_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.4,
        "max_tokens": 500
    }

    response = requests.post(TOGETHER_URL, headers=HEADERS, json=body)
    response.raise_for_status()

    content = response.json()["choices"][0]["message"]["content"]

    # Limpa código caso venha com ```json ou ```
    if content.startswith("```"):
        content = re.sub(r"^```(json)?", "", content).strip().rstrip("`")

    # Remove blocos ```json ou ```
    if content.startswith("```"):
        content = re.sub(r"^```(json)?", "", content).strip().rstrip("`")

    # Tenta extrair só o JSON principal
    match = re.search(r"\{.*\}", content, re.DOTALL)
    if match:
        json_text = match.group(0)
        return json.loads(json_text)

    raise ValueError("Não foi possível extrair JSON válido da resposta da IA.")


def montar_json_final(df: pd.DataFrame, params: dict) -> dict:
    tipo = params.get("type")
    x = params.get("xKey")
    y = params.get("yKey")
    titulo = params.get("title", "Gráfico Gerado")

    if tipo not in {"bar", "line", "pie"}:
        raise ValueError("Tipo de gráfico inválido.")

    if tipo == "pie":
        if not x or not y:
            raise ValueError("Pie chart requer xKey e yKey")
        data = df[[x, y]].dropna().head(20)
        result = [
            {
                x: str(row[x]),
                y: float(str(row[y]).replace('.', '').replace(',', '.'))
            }
            for _, row in data.iterrows()
        ]
        return {
            "type": "pie",
            "title": titulo,
            "data": result,
            "config": {
                "dataKey": y
            }
        }

    # bar ou line
    if not x or not y:
        raise ValueError("Gráficos de linha ou barra requerem xKey e yKey")

    data = df[[x, y]].dropna().head(50)
    result = [
        {
            x: str(row[x]),
            y: float(str(row[y]).replace('.', '').replace(',', '.'))
        }
        for _, row in data.iterrows()
    ]
    return {
        "type": tipo,
        "title": titulo,
        "data": result,
        "config": {
            "xKey": x,
            "yKey": y
        }
    }


def gerar_configuracao_grafico(df: pd.DataFrame, pedido_usuario: str) -> dict:
    try:
        interpretacao = interpretar_pedido_usuario(df, pedido_usuario)
        return montar_json_final(df, interpretacao)
    except Exception as e:
        raise RuntimeError(f"Falha ao gerar gráfico: {str(e)}")


