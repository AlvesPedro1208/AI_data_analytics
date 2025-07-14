from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ContaConectadaCreate(BaseModel):
    plataforma: str
    tipo: str
    token: str
    identificador_conta: str
    nome_conta: str
    data_conexao: datetime
    ativo: bool

class ContaConectada(ContaConectadaCreate):
    id: int

class AtualizaStatusConta(BaseModel):
    ativo: bool