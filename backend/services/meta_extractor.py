from backend.database.connection import get_db_connection
import json
import requests
from backend.services.user_facebook import buscar_usuario_por_facebook_id

CAMPOS_VALIDOS = {
    "ad": {"campaign_name", "adset_name", "ad_name", "impressions", "reach", "clicks", "cpc", "spend", "ad_id"},
    "adset": {"campaign_name", "adset_name", "impressions", "reach", "clicks", "cpc", "spend", "adset_id"},
    "campaign": {"campaign_name", "impressions", "reach", "clicks", "cpc", "spend", "campaign_id", "configured_status", "effective_status"}
}

def buscar_dados_meta(account_id: str, user_facebook_id: str, data_inicial: str = None, data_final: str = None, fields: str = None):
    # Busca o id do usuário
    user = buscar_usuario_por_facebook_id(user_facebook_id)
    if not user or not user.get('id'):
        return {"erro": "Usuário não encontrado para o facebook_id informado"}
    user_id = user['id']

    # Conecta ao banco e busca a conta com identificador correspondente
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, token FROM accounts_ads_facebook
        WHERE TRIM(identificador_conta) = %s AND plataforma = 'Facebook Ads' AND ativo = true
        LIMIT 1
    """, (account_id,))
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return {"erro": "Conta não encontrada ou inativa"}
    account_db_id, token = row

    account_id_str = str(account_id)
    if not account_id_str.startswith("act_"):
        account_id_str = f"act_{account_id_str}"

    url_base = f"https://graph.facebook.com/v19.0/{account_id_str}/insights"
    niveis = ["ad", "adset", "campaign"]
    resultado = []
    for nivel in niveis:
        campos = set((fields or "").split(","))
        campos_validos = CAMPOS_VALIDOS[nivel]
        campos_ignorados = [c for c in campos if c and c not in campos_validos]
        # Filtro especial para campaign: status fields só podem ir sozinhos
        if nivel == "campaign":
            status_fields = {"configured_status", "effective_status"}
            if status_fields & campos:
                campos_status_selecionados = [c for c in status_fields if c in campos]
                outros_campos = [c for c in campos if c not in status_fields]
                if outros_campos:
                    return {
                        "erro": "Combinação inválida de campos: 'configured_status' e 'effective_status' só podem ser usados sozinhos no nível campaign. Escolha apenas um deles ou remova os outros campos.",
                        "campos_invalidos": campos_status_selecionados,
                        "nivel": "campaign"
                    }
        fields_filtrados = ",".join([c for c in campos if c in campos_validos])
        params = {
            "access_token": token,
            "level": nivel,
            "fields": fields_filtrados or ",".join(campos_validos),
            "limit": 1000
        }
        if data_inicial and data_final:
            params["time_range"] = json.dumps({
                "since": data_inicial,
                "until": data_final
            })
        print(f'DEBUG - Tentando nível: {nivel}')
        print('DEBUG - Campos enviados para Facebook:', params["fields"])
        print('DEBUG - URL:', url_base)
        print('DEBUG - Params:', params)
        url = url_base
        campos_retorno = fields_filtrados.split(',') if fields_filtrados else list(campos_validos)
        while url:
            response = requests.get(url, params=params if '?' not in url else {})
            data = response.json()
            print('DEBUG - Resposta da API Facebook:', data)
            if not response.ok or "error" in data:
                return {"erro": f"Erro da Meta API: {data.get('error', {}).get('message', response.text)}", "debug": data}
            if not data.get("data"):
                break
            for item in data.get("data", []):
                registro = {}
                for campo in campos:
                    if campo:
                        registro[campo] = item.get(campo, "-")
                registro["campaign_name"] = item.get("campaign_name", "")
                registro["adset_name"] = item.get("adset_name", "") or item.get("addset_name", "")
                registro["ad_name"] = item.get("ad_name", "")
                registro["status"] = item.get("status", "ACTIVE")
                registro["impressions"] = int(float(item.get("impressions", 0) or 0)) if item.get("impressions") not in [None, "-"] else 0
                registro["reach"] = int(float(item.get("reach", 0) or 0)) if item.get("reach") not in [None, "-"] else 0
                registro["clicks"] = int(float(item.get("clicks", 0) or 0)) if item.get("clicks") not in [None, "-"] else 0
                registro["cpc"] = float(item.get("cpc", 0) or 0) if item.get("cpc") not in [None, "-"] else 0
                registro["spend"] = float(item.get("spend", 0) or 0) if item.get("spend") not in [None, "-"] else 0
                registro["date_start"] = item.get("date_start", "")
                registro["date_stop"] = item.get("date_stop", "")
                for campo in campos:
                    if campo and campo not in registro:
                        registro[campo] = "-"
                registro["nivel"] = nivel
                resultado.append(registro)
            next_url = data.get("paging", {}).get("next")
            if not next_url:
                break
            url = next_url
            params = None
        # Não faz return aqui, continua para juntar todos os níveis
    # INSERIR NO BANCO, evitando duplicatas
    print(f'[DEBUG] Tentando inserir {len(resultado)} registros no banco para account_id={account_db_id}, user_id={user_id}')
    inseridos = 0
    pulados = 0
    for registro in resultado:
        ad_id = registro.get("ad_id")
        date_start = registro.get("date_start")
        date_stop = registro.get("date_stop")
        # Verifica duplicata
        try:
            cur.execute("""
                SELECT 1 FROM account_ads_facebook_dataframe
                WHERE account_id = %s AND user_id = %s AND ad_id = %s AND date_start = %s AND date_stop = %s
            """, (account_db_id, user_id, ad_id, date_start, date_stop))
            if cur.fetchone():
                pulados += 1
                continue
            # Prepara campos numéricos
            impressions = int_or_none(registro.get("impressions"))
            reach = int_or_none(registro.get("reach"))
            clicks = int_or_none(registro.get("clicks"))
            cpc = parse_numeric(registro.get("cpc"))
            spend = parse_numeric(registro.get("spend"))
            frequency = parse_numeric(registro.get("frequency"))
            ctr = parse_numeric(registro.get("ctr"))
            cpm = parse_numeric(registro.get("cpm"))
            # Insert
            cur.execute("""
                INSERT INTO account_ads_facebook_dataframe (
                    account_id, user_id, data_extracao, campaign_name, adset_name, ad_name,
                    impressions, reach, clicks, cpc, spend, ad_id, frequency, ctr, cpm, date_start, date_stop, nivel, status, objective, actions
                ) VALUES (%s, %s, NOW(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                account_db_id,
                user_id,
                registro.get("campaign_name"),
                registro.get("adset_name"),
                registro.get("ad_name"),
                impressions,
                reach,
                clicks,
                cpc,
                spend,
                ad_id,
                frequency,
                ctr,
                cpm,
                registro.get("date_start"),
                registro.get("date_stop"),
                registro.get("nivel"),
                registro.get("status"),
                registro.get("objective"),
                registro.get("actions"),
            ))
            inseridos += 1
        except Exception as e:
            print(f"[ERRO] Falha ao inserir registro no banco: {e}\n\nRegistro: {registro}")
    print(f'[DEBUG] Inseridos: {inseridos} | Pulados (duplicatas): {pulados}')
    conn.commit()
    cur.close()
    conn.close()
    return {"dados": resultado}

def parse_numeric(value):
    try:
        if value in (None, '', '-', 'null'):
            return None
        return float(value)
    except Exception:
        return None

def int_or_none(value):
    try:
        if value in (None, '', '-', 'null'):
            return None
        return int(float(value))
    except Exception:
        return None

def carregar_account_ads_facebook_dataframe(account_id=None, user_id=None, limit=1000):
    """
    Lê os dados da tabela account_ads_facebook_dataframe e retorna um DataFrame pandas.
    Pode filtrar por account_id e/ou user_id. Por padrão, retorna até 1000 linhas.
    """
    import pandas as pd
    conn = get_db_connection()
    query = "SELECT * FROM account_ads_facebook_dataframe"
    filtros = []
    params = []
    if account_id:
        filtros.append("account_id = %s")
        params.append(account_id)
    if user_id:
        filtros.append("user_id = %s")
        params.append(user_id)
    if filtros:
        query += " WHERE " + " AND ".join(filtros)
    query += f" ORDER BY data_extracao DESC LIMIT {limit}"
    df = pd.read_sql(query, conn, params=params)
    conn.close()
    # Conversão explícita dos campos numéricos
    campos_numericos = ["impressions", "reach", "clicks", "cpc", "spend", "ctr", "cpm", "frequency"]
    for col in campos_numericos:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    return df
