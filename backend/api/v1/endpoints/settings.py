from fastapi import APIRouter, HTTPException
from database.connection import get_db_connection
from schemas.settings import SettingCreate, SettingResponse
import sqlite3

router = APIRouter()

@router.get("/", response_model=list[SettingResponse])
def get_settings():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=True) # as_dict=True
    cursor.execute("SELECT * FROM settings")
    rows = cursor.fetchall()
    conn.close()
    return rows

@router.get("/{key}", response_model=SettingResponse)
def get_setting(key: str):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=True)
    cursor.execute("SELECT * FROM settings WHERE key = %s", (key,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Setting not found")
    return row

@router.post("/", response_model=SettingResponse)
def create_or_update_setting(setting: SettingCreate):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=True)
    
    # Check if exists
    cursor.execute("SELECT id FROM settings WHERE key = %s", (setting.key,))
    row = cursor.fetchone()
    
    if row:
        # Update
        cursor.execute("UPDATE settings SET value = %s, updated_at = CURRENT_TIMESTAMP WHERE key = %s", (setting.value, setting.key))
        # Need to fetch the ID again or just reuse
        setting_id = row['id']
    else:
        # Insert
        cursor.execute("INSERT INTO settings (key, value) VALUES (%s, %s)", (setting.key, setting.value))
        setting_id = cursor.cursor.lastrowid # Accessing underlying sqlite cursor for lastrowid
    
    conn.commit()
    conn.close()
    
    return {
        "id": setting_id,
        "key": setting.key,
        "value": setting.value
    }
