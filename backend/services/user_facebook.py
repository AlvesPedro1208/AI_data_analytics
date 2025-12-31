from database.connection import get_db_connection
from schemas.user_facebook import UserFacebookCreate
from psycopg2.extras import RealDictCursor

def criar_usuario(user: UserFacebookCreate):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    # Verifica se já existe pelo facebook_id
    cur.execute('SELECT * FROM user_facebook WHERE facebook_id = %s', (user.facebook_id,))
    existing = cur.fetchone()
    if existing:
        # Atualiza o access_token e retorna o usuário atualizado
        cur.execute('''
            UPDATE user_facebook
            SET access_token = %s, refresh_token = %s, token_expires_at = %s
            WHERE facebook_id = %s
            RETURNING id, username, facebook_id, access_token, refresh_token, token_expires_at, created_at
        ''', (user.access_token, user.refresh_token, user.token_expires_at, user.facebook_id))
        updated = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return updated
    # Se não existe, insere normalmente
    cur.execute('''
        INSERT INTO user_facebook (username, facebook_id, access_token, refresh_token, token_expires_at)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id, username, facebook_id, access_token, refresh_token, token_expires_at, created_at
    ''', (
        user.username, user.facebook_id, user.access_token, user.refresh_token, user.token_expires_at
    ))
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return result

def listar_usuarios():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM user_facebook')
    users = cur.fetchall()
    cur.close()
    conn.close()
    return users

def buscar_usuario_por_id(user_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM user_facebook WHERE id = %s', (user_id,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

def buscar_usuario_por_facebook_id(facebook_id: str):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM user_facebook WHERE facebook_id = %s', (facebook_id,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

def buscar_user_id_por_facebook_id(facebook_id: str):
    from database.connection import get_db_connection
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM user_facebook WHERE facebook_id = %s", (facebook_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if row:
        return row[0]
    return None 