import sqlite3
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "app_db.sqlite")

def check_accounts():
    conn = sqlite3.connect(DB_FILE)
    df = pd.read_sql("SELECT id, identificador_conta, nome_conta FROM accounts_ads_facebook LIMIT 20", conn)
    print(df)
    conn.close()

if __name__ == "__main__":
    check_accounts()
