from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class DateRange(BaseModel):
    since: str
    until: str

class FacebookDataConfig(BaseModel):
    account_id: str
    level: str = "campaign"  # ad, adset, campaign, account
    fields: List[str]
    breakdowns: Optional[List[str]] = None
    date_range: Optional[DateRange] = None
    filtering: Optional[List[Dict[str, Any]]] = None
    time_increment: Optional[str] = "1" # "1" for daily, "monthly", "all_days"

class DataSourceCreate(BaseModel):
    name: str
    source_type: str = "facebook_ads"
    config: FacebookDataConfig
    data: List[Dict[str, Any]] # The raw data fetched

class DataSourceResponse(BaseModel):
    id: int
    name: str
    source_type: str
    config: Dict[str, Any]
    data: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
