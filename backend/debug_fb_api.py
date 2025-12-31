
import requests
import json
import datetime
from database.connection import get_db_connection

def test_api():
    conn = get_db_connection()
    cur = conn.cursor()
    # Pega o token da conta específica
    cur.execute("SELECT token FROM accounts_ads_facebook WHERE identificador_conta = '1196456040855213'")
    row = cur.fetchone()
    if not row:
        print("Conta não encontrada")
        return
    token = row[0]
    conn.close()

    account_id = "act_1196456040855213"
    url = f"https://graph.facebook.com/v19.0/{account_id}/insights"
    
    # Teste 1: last_90d
    params_90d = {
        "access_token": token,
        "level": "campaign",
        "date_preset": "last_90d",
        "time_increment": "1",
        "limit": 1
    }
    resp = requests.get(url, params=params_90d)
    print(f"Status last_90d: {resp.status_code}")
    data = resp.json()
    print(f"Items last_90d: {len(data.get('data', []))}")
    if 'error' in data:
        print(data['error'])

    # Teste 2: last_1y (Calculado manualmente)
    today = datetime.date(2025, 12, 31) # Simulando a data do ambiente
    one_year_ago = today - datetime.timedelta(days=365)
    
    time_range = {
        "since": one_year_ago.strftime("%Y-%m-%d"),
        "until": today.strftime("%Y-%m-%d")
    }
    
    params_1y = {
        "access_token": token,
        "level": "campaign",
        "time_range": json.dumps(time_range),
        "time_increment": "1",
        "limit": 1
    }
    
    resp = requests.get(url, params=params_1y)
    print(f"Status last_1y: {resp.status_code}")
    data = resp.json()
    print(f"Items last_1y: {len(data.get('data', []))}")
    if 'error' in data:
        print(data['error'])

    # Teste 3: maximum
    params_max = {
        "access_token": token,
        "level": "campaign",
        "date_preset": "maximum",
        "time_increment": "1",
        "limit": 1
    }
    resp = requests.get(url, params=params_max)
    print(f"Status maximum: {resp.status_code}")
    if resp.status_code != 200:
        print(resp.json())

if __name__ == "__main__":
    test_api()
