import requests
import pandas as pd

def extrair_dados_meta(access_token, ad_account_id, data_inicio, data_fim):
    url = f"https://graph.facebook.com/v19.0/{ad_account_id}/insights"
    params = {
        "access_token": access_token,
        "fields": "campaign_name,impressions,clicks,spend,cpm,ctr",
        "time_range[since]": data_inicio,
        "time_range[until]": data_fim,
        "level": "campaign",
        "limit": 100
    }

    dados = []
    while True:
        resp = requests.get(url, params=params)
        json_data = resp.json()
        dados.extend(json_data.get("data", []))
        if "next" in json_data.get("paging", {}):
            url = json_data["paging"]["next"]
            params = {}  # reset params ao seguir paginação
        else:
            break

    return pd.DataFrame(dados)
