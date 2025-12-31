from fastapi import APIRouter, HTTPException, Depends
from typing import List, Any, Dict
from schemas.connector import FacebookDataConfig, DataSourceCreate, DataSourceResponse
from services import facebook_connector

router = APIRouter()

@router.post("/facebook/preview")
def preview_facebook_data(config: FacebookDataConfig):
    try:
        data = facebook_connector.fetch_facebook_data(config)
        return {"data": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/facebook/save")
def save_facebook_data_source(payload: DataSourceCreate):
    try:
        # If data is not provided in payload, fetch it now? 
        # The user prompt implies: "Importing data... Salva os dados".
        # Usually user previews then saves. The payload likely contains the data or we fetch again.
        # For efficiency, if payload has data, save it. If not, fetch.
        
        data_to_save = payload.data
        if not data_to_save:
             data_to_save = facebook_connector.fetch_facebook_data(payload.config)
             
        result = facebook_connector.save_data_source_db(payload.name, payload.config, data_to_save)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/data-sources")
def list_data_sources():
    return facebook_connector.list_data_sources()

@router.get("/data-sources/{source_id}")
def get_data_source(source_id: int):
    source = facebook_connector.get_data_source_by_id(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found")
    return source
