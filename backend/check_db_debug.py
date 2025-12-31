import sqlite3
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "app_db.sqlite")

def check_db():
    print(f"Checking database at: {DB_FILE}")
    conn = sqlite3.connect(DB_FILE)
    
    print("\n--- Users ---")
    users = pd.read_sql("SELECT * FROM user_facebook", conn)
    print(users)
    
    print("\n--- Accounts ---")
    accounts = pd.read_sql("SELECT * FROM accounts_ads_facebook", conn)
    print(accounts)
    
    print("\n--- Dataframe (First 5 rows) ---")
    try:
        df = pd.read_sql("SELECT * FROM account_ads_facebook_dataframe LIMIT 5", conn)
        print(df)
        
        count = pd.read_sql("SELECT count(*) as total FROM account_ads_facebook_dataframe", conn)
        print(f"\nTotal rows in dataframe: {count['total'].iloc[0]}")
    except Exception as e:
        print(f"Error reading dataframe: {e}")
        
    conn.close()

if __name__ == "__main__":
    check_db()
