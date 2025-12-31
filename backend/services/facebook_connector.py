import json
import requests
from database.connection import get_db_connection
from schemas.connector import FacebookDataConfig, DataSourceCreate
from typing import Dict, Any, List

def get_account_token(account_id: str):
    conn = get_db_connection()
    cur = conn.cursor()
    # Remove act_ prefix if present for DB lookup if stored without it
    # But usually stored with it or checked. The current code in meta_extractor does trim.
    # Let's try to match exactly or with/without prefix.
    
    clean_id = account_id.replace("act_", "")
    
    cur.execute("""
        SELECT token FROM accounts_ads_facebook
        WHERE (identificador_conta = %s OR identificador_conta = %s) 
        AND ativo = 1
        LIMIT 1
    """, (clean_id, f"act_{clean_id}"))
    
    row = cur.fetchone()
    cur.close()
    conn.close()
    
    if row:
        return row[0]
    return None

def fetch_facebook_data(config: FacebookDataConfig) -> List[Dict[str, Any]]:
    token = get_account_token(config.account_id)
    if not token:
        raise Exception(f"Account {config.account_id} not found or inactive.")

    account_id_str = config.account_id
    if not account_id_str.startswith("act_"):
        account_id_str = f"act_{account_id_str}"

    url = f"https://graph.facebook.com/v19.0/{account_id_str}/insights"
    
    params = {
        "access_token": token,
        "level": config.level,
        "fields": ",".join(config.fields),
        "limit": 500
    }

    if config.breakdowns:
        params["breakdowns"] = ",".join(config.breakdowns)
        
    if config.time_increment:
        if config.time_increment == "all_days":
            params["time_increment"] = "all_days"
        elif config.time_increment == "monthly":
             params["time_increment"] = "monthly"
        else:
            # integer or default
            params["time_increment"] = config.time_increment

    if config.date_range:
        params["time_range"] = json.dumps({
            "since": config.date_range.since,
            "until": config.date_range.until
        })
        
    if config.filtering:
        params["filtering"] = json.dumps(config.filtering)

    all_data = []
    
    while url:
        print(f"Requesting: {url} with params {params}")
        response = requests.get(url, params=params)
        data = response.json()
        
        if "error" in data:
            raise Exception(f"Facebook API Error: {data['error'].get('message')}")
            
        if "data" in data:
            all_data.extend(data["data"])
        
        # Pagination
        if "paging" in data and "next" in data["paging"]:
            url = data["paging"]["next"]
            params = {} # params are encoded in the next url
        else:
            url = None
            
    return all_data

def save_data_source_db(name: str, config: FacebookDataConfig, data: List[Dict[str, Any]]):
    conn = get_db_connection()
    cur = conn.cursor()
    
    config_json = config.model_dump_json()
    data_json = json.dumps(data)
    
    cur.execute("""
        INSERT INTO data_sources (name, source_type, config, data)
        VALUES (%s, 'facebook_ads', %s, %s)
        RETURNING id, name, source_type, created_at
    """, (name, config_json, data_json))
    
    # Handle RETURNING for SQLite (it might not support RETURNING in older versions, but wrapper handles it? 
    # Actually standard SQLite doesn't support RETURNING in older versions. 
    # The psycopg2 wrapper I wrote doesn't emulate RETURNING perfectly if underlying sqlite doesn't support it.
    # But Python 3.12 sqlite3 usually supports RETURNING.
    
    try:
        row = cur.fetchone()
        conn.commit()
        result = dict(row) if row else {"id": cur.lastrowid, "name": name}
    except Exception:
        # Fallback if RETURNING fails
        conn.commit()
        result = {"id": cur.lastrowid, "name": name}
        
    cur.close()
    conn.close()
    return result

def list_data_sources():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=True) # Dictionary cursor
    cur.execute("SELECT id, name, source_type, created_at, updated_at FROM data_sources ORDER BY created_at DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows

def get_data_source_by_id(source_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=True)
    cur.execute("SELECT * FROM data_sources WHERE id = %s", (source_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    
    if row:
        # Parse JSON fields
        row_dict = dict(row)
        if row_dict.get('config'):
            row_dict['config'] = json.loads(row_dict['config'])
        if row_dict.get('data'):
            row_dict['data'] = json.loads(row_dict['data'])
        return row_dict
    return None
