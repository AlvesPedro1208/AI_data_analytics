from backend.database.connection import get_db_connection
import json
import requests

def buscar_dados_meta(account_id: str, data_inicial: str, data_final: str):
    # Conecta ao banco e busca a conta com identificador correspondente
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT token FROM contas_conectadas
        WHERE TRIM(identificador_conta) = %s AND plataforma = 'Facebook Ads' AND ativo = true
        LIMIT 1
    """, (account_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {"erro": "Conta não encontrada ou inativa"}

    token = row[0]

    url_base = f"https://graph.facebook.com/v19.0/{account_id}/insights"
    params = {
        "access_token": token,
        "level": "ad",
        "fields": "campaign_name,adset_name,ad_name,impressions,reach,clicks,cpc,spend,ad_id",
        "time_range": json.dumps({
            "since": data_inicial,
            "until": data_final
        }),
        "limit": 1000
    }

    resultado = []
    url = url_base

    while url:
        response = requests.get(url, params=params if '?' not in url else {})
        if not response.ok:
            try:
                erro_data = response.json().get("error", {})
                if erro_data.get("code") == 190:
                    # (Opcional) Marcar como inativo
                    conn = get_db_connection()
                    cur = conn.cursor()
                    cur.execute("""
                        UPDATE contas_conectadas
                        SET ativo = false
                        WHERE TRIM(identificador_conta) = %s
                    """, (account_id,))
                    conn.commit()
                    cur.close()
                    conn.close()
                    return {"erro": "Token expirado. Refaça a conexão com a conta Meta Ads."}
                else:
                    return {"erro": f"Erro da Meta API: {erro_data.get('message', 'Erro desconhecido')}"}
            except Exception:
                return {"erro": f"Erro da Meta API: {response.text}"}
        
        data = response.json()
        for item in data.get("data", []):
            resultado.append({
                "campaign_name": item.get("campaign_name", ""),
                "adset_name": item.get("adset_name", ""),
                "ad_name": item.get("ad_name", ""),
                "status": "ACTIVE",  # opcional: pode ser ajustado
                "impressions": int(item.get("impressions", 0)),
                "reach": int(item.get("reach", 0)),
                "clicks": int(item.get("clicks", 0)),
                "cpc": float(item.get("cpc", 0)),
                "spend": float(item.get("spend", 0)),
                "date_start": data_inicial,
                "date_stop": data_final
            })

        url = data.get("paging", {}).get("next")  # próxima página
        params = None  # evita duplicar se url já tiver query params

    return {"dados": resultado}
