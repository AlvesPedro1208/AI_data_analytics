from pydantic import BaseModel
from datetime import datetime

class AccountAdsFacebookBase(BaseModel):
    plataforma: str
    tipo: str
    token: str
    identificador_conta: str
    nome_conta: str
    data_conexao: datetime
    ativo: bool = True

class AccountAdsFacebookCreate(AccountAdsFacebookBase):
    pass

class AccountAdsFacebook(AccountAdsFacebookBase):
    id: int

    class Config:
        orm_mode = True 