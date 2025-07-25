from backend.database.connection import get_db_connection
from backend.schemas.user_accounts import UserAccountCreate
from psycopg2.extras import RealDictCursor

def associar_usuario_conta(user_account: UserAccountCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO user_accounts (user_id, account_id)
        VALUES (%s, %s)
        RETURNING id, user_id, account_id
    ''', (user_account.user_id, user_account.account_id))
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return result

def listar_contas_por_usuario(user_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('''
        SELECT a.* FROM accounts_ads_facebook a
        JOIN user_accounts ua ON a.id = ua.account_id
        WHERE ua.user_id = %s
    ''', (user_id,))
    accounts = cur.fetchall()
    cur.close()
    conn.close()
    return accounts

def desassociar_usuario_conta(user_id: int, account_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM user_accounts WHERE user_id = %s AND account_id = %s', (user_id, account_id))
    conn.commit()
    cur.close()
    conn.close()
    return {'status': 'desassociado', 'user_id': user_id, 'account_id': account_id} 