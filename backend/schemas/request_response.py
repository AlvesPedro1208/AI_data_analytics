from pydantic import BaseModel
from typing import List, Optional

class RequisicaoIA(BaseModel):
    pergunta: str
    amostra: List[dict]

class RequisicaoGrafico(BaseModel):
    pergunta: str
    amostra: List[dict]
