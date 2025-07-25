from pydantic import BaseModel

class UserAccountBase(BaseModel):
    user_id: int
    account_id: int

class UserAccountCreate(UserAccountBase):
    pass

class UserAccount(UserAccountBase):
    id: int

    class Config:
        orm_mode = True 