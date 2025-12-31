from pydantic import BaseModel
from typing import Optional

class SettingCreate(BaseModel):
    key: str
    value: str

class SettingResponse(BaseModel):
    id: int
    key: str
    value: Optional[str] = None
    
    class Config:
        from_attributes = True
