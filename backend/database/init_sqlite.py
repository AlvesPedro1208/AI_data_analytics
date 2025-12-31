import sqlite3
import os

# Define the database path relative to this script
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_FILE = os.path.join(BASE_DIR, "app_db.sqlite")

def init_db():
    print(f"Initializing database at: {DB_FILE}")
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Create user_facebook table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_facebook (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        facebook_id TEXT,
        access_token TEXT,
        refresh_token TEXT,
        token_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Create accounts_ads_facebook table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS accounts_ads_facebook (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plataforma TEXT,
        tipo TEXT,
        token TEXT,
        identificador_conta TEXT,
        nome_conta TEXT,
        data_conexao TIMESTAMP,
        ativo BOOLEAN DEFAULT 1
    );
    """)

    # Create user_accounts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        account_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES user_facebook(id),
        FOREIGN KEY(account_id) REFERENCES accounts_ads_facebook(id)
    );
    """)

    # Create data_sources table (Funnel-like storage)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS data_sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        source_type TEXT NOT NULL, -- e.g., 'facebook_ads'
        config TEXT, -- JSON string storing configuration (fields, range, etc.)
        data TEXT, -- JSON string storing the fetched data (or path to file)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Create account_ads_facebook_dataframe table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS account_ads_facebook_dataframe (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER,
        user_id INTEGER,
        data_extracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        campaign_name TEXT,
        adset_name TEXT,
        ad_name TEXT,
        impressions INTEGER,
        reach INTEGER,
        clicks INTEGER,
        cpc REAL,
        spend REAL,
        ad_id TEXT,
        frequency REAL,
        ctr REAL,
        cpm REAL,
        date_start TEXT,
        date_stop TEXT,
        nivel TEXT,
        status TEXT,
        objective TEXT,
        actions TEXT,
        FOREIGN KEY(account_id) REFERENCES accounts_ads_facebook(id),
        FOREIGN KEY(user_id) REFERENCES user_facebook(id)
    );
    """)

    # Create settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()
    print(f"Database initialized successfully.")

if __name__ == "__main__":
    init_db()
