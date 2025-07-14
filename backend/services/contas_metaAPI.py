from backend.database.connection import get_db_connection
from backend.schemas.conta_metaAPI import ContaConectadaCreate

def listar_contas():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, plataforma, tipo, token, identificador_conta, nome_conta, data_conexao, ativo FROM contas_conectadas")
    rows = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]
    return [dict(zip(colnames, row)) for row in rows]

def criar_conta(conta: ContaConectadaCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO contas_conectadas (
            plataforma, tipo, token, identificador_conta,
            nome_conta, data_conexao, ativo
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        conta.plataforma, conta.tipo, conta.token, conta.identificador_conta,
        conta.nome_conta, conta.data_conexao, conta.ativo
    ))
    conn.commit() 
    cur.close()
    conn.close()

def deletar_conta(id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM contas_conectadas WHERE id = %s", (id,))
    return {"status": "deletado", "id": id}


def atualizar_status(id: int, ativo: bool):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE contas_conectadas SET ativo = %s WHERE id = %s", (ativo, id))
    conn.commit()
    cur.close()
    conn.close()
    return {"status": "atualizado", "id": id}