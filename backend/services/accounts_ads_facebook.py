from database.connection import get_db_connection
from schemas.accounts_ads_facebook import AccountAdsFacebookCreate
from psycopg2.extras import RealDictCursor

def criar_account(account: AccountAdsFacebookCreate):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('''
        INSERT INTO accounts_ads_facebook (plataforma, tipo, token, identificador_conta, nome_conta, data_conexao, ativo)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id, plataforma, tipo, token, identificador_conta, nome_conta, data_conexao, ativo
    ''', (
        account.plataforma, account.tipo, account.token, account.identificador_conta,
        account.nome_conta, account.data_conexao, account.ativo
    ))
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return result

def listar_accounts():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM accounts_ads_facebook')
    accounts = cur.fetchall()
    cur.close()
    conn.close()
    return accounts

def buscar_account_por_id(account_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM accounts_ads_facebook WHERE id = %s', (account_id,))
    account = cur.fetchone()
    cur.close()
    conn.close()
    return account

def listar_accounts_por_facebook_id(facebook_id: str):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('''
        SELECT * FROM accounts_ads_facebook 
        WHERE token IN (SELECT access_token FROM user_facebook WHERE facebook_id = %s)
    ''', (facebook_id,))
    accounts = cur.fetchall()
    cur.close()
    conn.close()
    return accounts

def atualizar_status_account(account_id: int, ativo: bool):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('''
        UPDATE accounts_ads_facebook 
        SET ativo = %s
        WHERE id = %s
        RETURNING *
    ''', (ativo, account_id))
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return result

def deletar_account(account_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('DELETE FROM accounts_ads_facebook WHERE id = %s RETURNING id', (account_id,))
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return result
