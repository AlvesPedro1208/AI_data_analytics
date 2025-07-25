from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserFacebookBase(BaseModel):
    username: str
    facebook_id: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None

class UserFacebookCreate(UserFacebookBase):
    pass

class UserFacebook(UserFacebookBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 