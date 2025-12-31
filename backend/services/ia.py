import os
import google.generativeai as genai
import pandas as pd
from dotenv import load_dotenv
import json
import re
from langdetect import detect
from database.connection import get_db_connection

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

def get_gemini_api_key():
    # Try DB first
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=True)
        cursor.execute("SELECT value FROM settings WHERE key = 'GEMINI_API_KEY'")
        row = cursor.fetchone()
        conn.close()
        if row and row['value']:
            return row['value']
    except Exception as e:
        print(f"Erro ao buscar API Key no banco: {e}")
        pass
    
    # Fallback to env
    return os.getenv("GEMINI_API_KEY")

def configure_genai():
    api_key = get_gemini_api_key()
    if api_key:
        genai.configure(api_key=api_key)
        return True
    return False

def get_gemini_model():
    configure_genai()
    try:
        return genai.GenerativeModel('gemini-2.5-flash')
    except:
        return genai.GenerativeModel('gemini-flash-latest')

def gerar_insight_ia(df: pd.DataFrame, pergunta: str) -> str:
    if not configure_genai():
        return "⚠️ API Key do Google Gemini não encontrada. Configure nas Configurações ou no arquivo .env"

    try:
        idioma = detect(pergunta)
    except Exception:
        idioma = "pt"

    linguagem_prompt = {
        "pt": "Responda de forma analítica, clara e orientada a negócios. Responda em português.",
        "en": "Respond in an analytical, clear, and business-oriented manner. Answer in Portuguese - Brazil."
    }.get(idioma, "Respond in the same language as the question.")

    # Limit rows to avoid token limit if dataframe is huge, though Gemini has 1M context.
    # 50 rows is a safe start for "insight" on structure/sample.
    csv_data = df.head(50).to_csv(index=False)

    prompt = f"""
    Abaixo estão os dados de uma planilha (amostra das primeiras 50 linhas):

    {csv_data}

    Você é um assistente de análise de dados que responde de forma direta, curta e objetiva.
    Responda sempre em português do Brasil. Não adicione explicações desnecessárias.
    Foque apenas no que foi perguntado.
    Com base nesses dados, responda à seguinte pergunta: "{pergunta}"

    {linguagem_prompt}
    """

    try:
        model = get_gemini_model()
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Erro ao processar resposta da IA: {str(e)}"

# Alias para manter compatibilidade temporária se necessário, 
# mas vamos atualizar o import no chat.py
gerar_insight_ia_together = gerar_insight_ia

def interpretar_pedido_usuario(df: pd.DataFrame, pedido: str) -> dict:
    if not configure_genai():
        raise RuntimeError("API Key do Google Gemini não configurada.")

    df_preview = df.head(15)
    csv_data = df_preview.to_csv(index=False)

    prompt = f"""
    Você é um especialista em visualização de dados. Analise a tabela abaixo:

    {csv_data}

    Com base na tabela e no pedido do usuário: "{pedido}", identifique:
    - tipo de gráfico (bar, line ou pie)
    - coluna a ser usada no eixo X
    - coluna a ser usada no eixo Y (se aplicável)
    - título do gráfico
    - Se é necessário agregar dados (soma, média, contagem) e como agrupar.
    - Se o usuário pediu para alterar um gráfico existente ("altera", "muda", "ajusta", "atualiza", "troca", "corrige", "formata", "nos dias"), defina operation como "update". Caso contrário, "create".

    REGRAS DE INTERPRETAÇÃO:
    1. "Dividido por dias" ou "por dia" significa Agrupamento por Data (groupBy) e Agregação (aggregation: sum ou mean).
    2. "Total de clicks" significa aggregation: "sum" na coluna de clicks.
    3. Se houver coluna 'date_start', 'date_stop' ou similar, use-a para eixo X quando falar de tempo.
    4. Se o pedido for "evolução", "histórico" ou "tempo", prefira gráfico de linha (line).
    5. Se o pedido for "distribuição" ou "porcentagem", prefira gráfico de pizza (pie) ou barras (bar).

    Responda apenas com um JSON como este (sem explicações, sem comentários, sem texto antes ou depois, apenas o JSON puro):

    {{
    "operation": "create",
    "type": "bar",
    "xKey": "date_start",
    "yKey": "clicks",
    "title": "Cliques por Dia",
    "aggregation": "sum",
    "groupBy": "date_start"
    }}

    NOTA: O campo "operation" deve ser "update" APENAS se o usuário estiver pedindo explicitamente para modificar o gráfico anterior. Se for um novo pedido sem contexto de alteração, use "create".
    """

    try:
        model = get_gemini_model()
        response = model.generate_content(prompt)
        content = response.text

        print("DEBUG - Resposta bruta da IA:", content)

        # Limpeza básica de markdown code blocks
        if "```" in content:
            content = content.replace("```json", "").replace("```", "")
        
        content = content.strip()
        
        # Tenta extrair JSON
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if match:
            json_text = match.group(0)
            result = json.loads(json_text)
        else:
            result = json.loads(content)

        # Force update operation if keywords are present in user request
        keywords_update = ["altera", "muda", "atualiza", "troca", "corrige", "refaz", "ajusta", "formata"]
        if any(k in pedido.lower() for k in keywords_update):
            if result.get("operation") != "update":
                print(f"DEBUG - Forçando operation='update' baseado em keywords no pedido: '{pedido}'")
                result["operation"] = "update"
        
        # Force dateFormat if requested
        if "dd/mm/yyyy" in pedido.lower():
             result["dateFormat"] = "%d/%m/%Y"
        elif "dd/mm" in pedido.lower():
             result["dateFormat"] = "%d/%m"
        
        return result

    except Exception as e:
        print(f"Erro ao interpretar pedido: {e}")
        # Tenta fallback simples se falhar
        if "vendas" in pedido.lower():
             return {"type": "bar", "xKey": df.columns[0], "yKey": df.columns[1], "title": "Gráfico Estimado"}
        raise ValueError("Não foi possível extrair JSON válido da resposta da IA.")



def montar_json_final(df: pd.DataFrame, params: dict) -> dict:
    tipo = params.get("type")
    x = params.get("xKey")
    y = params.get("yKey")
    titulo = params.get("title", "Gráfico Gerado")
    operation = params.get("operation", "create")
    aggregation = params.get("aggregation")
    group_by = params.get("groupBy")

    # Normaliza nomes de colunas removendo barras invertidas
    if x:
        x = x.replace("\\", "")
    if y:
        y = y.replace("\\", "")
    if group_by:
        group_by = group_by.replace("\\", "")

    # Tenta casar xKey e yKey com as colunas reais do DataFrame
    def match_col(col_name):
        if not col_name: return None
        if col_name in df.columns:
            return col_name
        
        # Mapeamento semântico manual para casos comuns
        if col_name.lower() in ['data', 'dia', 'tempo', 'date', 'day']:
            for c in df.columns:
                if 'date' in c.lower() or 'dia' in c.lower():
                    return c
        
        # Procura por similaridade ignorando case e underscores
        col_name_norm = col_name.lower().replace("_", "")
        best_match = None
        
        for c in df.columns:
            c_norm = c.lower().replace("_", "")
            if c_norm == col_name_norm:
                return c
            if col_name_norm in c_norm: # match parcial (ex: 'clicks' em 'inline_link_clicks')
                 best_match = c
        
        return best_match

    x_real = match_col(x) if x else None
    y_real = match_col(y) if y else None
    group_by_real = match_col(group_by) if group_by else None

    # Helper para limpar números antes de agregar
    def clean_number(val):
        if pd.isna(val):
            return 0.0
        if isinstance(val, (int, float)):
            return float(val)
        val_str = str(val).strip()
        try:
            return float(val_str)
        except:
            try:
                return float(val_str.replace('.', '').replace(',', '.'))
            except:
                return 0.0

    # Se houver pedido de agregação, processa o DataFrame
    if aggregation and group_by_real and y_real:
        print(f"DEBUG - Agregando dados: {aggregation} por {group_by_real}")
        try:
            # Garante que y_real seja numérico
            df[y_real] = df[y_real].apply(clean_number)
            
            # Se group_by for data, tenta converter para datetime para ordenar corretamente
            if 'date' in group_by_real.lower() or 'dia' in group_by_real.lower():
                try:
                    df[group_by_real] = pd.to_datetime(df[group_by_real])
                except:
                    pass

            if aggregation == 'sum':
                df_agg = df.groupby(group_by_real)[y_real].sum().reset_index()
            elif aggregation == 'mean':
                df_agg = df.groupby(group_by_real)[y_real].mean().reset_index()
            elif aggregation == 'count':
                df_agg = df.groupby(group_by_real)[y_real].count().reset_index()
            else:
                df_agg = df # Fallback

            # Se convertemos para datetime, volta para string formatada se for dia
            if pd.api.types.is_datetime64_any_dtype(df_agg[group_by_real]):
                # Let's use a passed param or default
                fmt = params.get("dateFormat", '%Y-%m-%d')
                df_agg[group_by_real] = df_agg[group_by_real].dt.strftime(fmt)
            
            df = df_agg
            x_real = group_by_real # O eixo X passa a ser a coluna de agrupamento
        except Exception as e:
            print(f"Erro na agregação: {e}")
            # Se der erro na agregação, segue com df original

    if tipo not in {"bar", "line", "pie"}:
        raise ValueError("Tipo de gráfico inválido.")

    if tipo == "pie":
        if not x_real or not y_real:
            raise ValueError(f"Pie chart requer xKey e yKey válidos. Colunas disponíveis: {list(df.columns)}")
        
        # Limita a 20 fatias para não quebrar o gráfico
        data = df[[x_real, y_real]].dropna().head(20)
        
        result = [
            {
                x_real: str(row[x_real]),
                y_real: clean_number(row[y_real])
            }
            for _, row in data.iterrows()
        ]
        json_final = {
            "type": "pie",
            "title": titulo,
            "operation": operation,
            "data": result,
            "config": {
                "dataKey": y_real,
                "xKey": x_real,
                "yKey": y_real
            }
        }
        print("DEBUG - JSON FINAL DO GRÁFICO (pie):", json_final)
        if not result:
            raise ValueError(f"Nenhum dado encontrado para as colunas '{x_real}' e '{y_real}'. Colunas disponíveis: {list(df.columns)}")
        return json_final

    # bar ou line
    if not x_real or not y_real:
        raise ValueError(f"Gráficos de linha ou barra requerem xKey e yKey válidos. Colunas disponíveis: {list(df.columns)}")

    data = df[[x_real, y_real]].dropna().head(50)
    result = [
        {
            x_real: str(row[x_real]),
            y_real: clean_number(row[y_real])
        }
        for _, row in data.iterrows()
    ]
    json_final = {
        "type": tipo,
        "title": titulo,
        "operation": operation,
        "data": result,
        "config": {
            "dataKey": y_real, # Para o componente genérico
            "xKey": x_real,
            "yKey": y_real
        }
    }
    print("DEBUG - JSON FINAL DO GRÁFICO:", json_final)
    if not result:
        raise ValueError(f"Nenhum dado encontrado para as colunas '{x_real}' e '{y_real}'. Colunas disponíveis: {list(df.columns)}")
    return json_final

def gerar_configuracao_grafico(df: pd.DataFrame, pedido: str) -> dict:
    params = interpretar_pedido_usuario(df, pedido)
    return montar_json_final(df, params)

