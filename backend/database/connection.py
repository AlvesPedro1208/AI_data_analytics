import os
import sqlite3
import psycopg2
from dotenv import load_dotenv

load_dotenv()

class SQLiteCursorWrapper:
    def __init__(self, cursor, as_dict=False):
        self.cursor = cursor
        self.as_dict = as_dict

    def execute(self, query, params=None):
        # Replace %s with ? for SQLite compatibility
        # This is a simple replacement; strictly speaking, we should be careful about %s inside strings,
        # but for this project's queries it should be fine.
        query = query.replace('%s', '?')
        try:
            if params:
                self.cursor.execute(query, params)
            else:
                self.cursor.execute(query)
        except Exception as e:
            print(f"SQLite Execution Error: {e}")
            print(f"Query: {query}")
            print(f"Params: {params}")
            raise e
        return self

    def fetchone(self):
        row = self.cursor.fetchone()
        if row is None:
            return None
        if self.as_dict:
            return dict(row)
        return row

    def fetchall(self):
        rows = self.cursor.fetchall()
        if self.as_dict:
            return [dict(row) for row in rows]
        return rows

    def close(self):
        self.cursor.close()

    @property
    def rowcount(self):
        return self.cursor.rowcount
    
    @property
    def description(self):
        return self.cursor.description

class SQLiteConnectionWrapper:
    def __init__(self, db_file):
        self.conn = sqlite3.connect(db_file, detect_types=sqlite3.PARSE_DECLTYPES|sqlite3.PARSE_COLNAMES)
        self.conn.row_factory = sqlite3.Row  # Enable name access
        self.autocommit = True # Dummy property to satisfy psycopg2 usage

    def cursor(self, cursor_factory=None):
        # If cursor_factory is provided (like RealDictCursor), we treat it as a request for dict output
        as_dict = cursor_factory is not None
        return SQLiteCursorWrapper(self.conn.cursor(), as_dict=as_dict)

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()

def get_db_connection():
    db_type = os.getenv("DB_TYPE", "postgres")
    
    if db_type == "sqlite":
        # Ensure the database is initialized
        db_file = os.getenv("DB_NAME", "app_db.sqlite")
        
        # If relative path, make it relative to the backend root (assuming this runs from backend root or consistent location)
        # But safest is to use absolute path or rely on CWD. 
        # Given we are in backend/database, let's look for it in backend/ or root.
        # Let's assume it's in the current working directory or specify a path.
        if not os.path.isabs(db_file):
            # Try to locate it relative to this file
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            db_path = os.path.join(base_dir, db_file)
        else:
            db_path = db_file
            
        return SQLiteConnectionWrapper(db_path)

    # Fallback to Postgres
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
    )
    conn.autocommit = True
    return conn
