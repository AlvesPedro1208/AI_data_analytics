# backend/api/endpoints/meta.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import os

router = APIRouter()

class MetaRequest(BaseModel):
    access_token: str
    ad_account_id: str
    since: str = "2025-03-01"
    until: str = "2025-12-31"

@router.post("/meta/dados")
def obter_dados_meta(request: MetaRequest):
    url = f"https://graph.facebook.com/v19.0/{request.ad_account_id}/insights"
    params = {
        "access_token": request.access_token,
        "fields": "campaign_name,impressions,clicks,spend,cpm,ctr,date_start,date_stop",
        "time_range[since]": request.since,
        "time_range[until]": request.until,
        "level": "campaign",
        "limit": 50
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())

    return {"dados": response.json().get("data", [])}
