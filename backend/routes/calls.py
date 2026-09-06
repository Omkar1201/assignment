from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any
from services.hunar_service import hunar_service

router = APIRouter(prefix="/api/calls", tags=["Calls"])

@router.get("/")
async def list_calls(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    status: Optional[str] = None
):
    try:
        return await hunar_service.list_calls(page, page_size, status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{call_id}")
async def get_call(call_id: str):
    try:
        return await hunar_service.get_call(call_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_call(call_data: Dict[str, Any]):
    res = await hunar_service.create_call(call_data)
    if isinstance(res, dict) and res.get("error"):
        raise HTTPException(status_code=res.get("status_code", 400), detail=res.get("data"))
    return res

@router.post("/bulk")
async def create_bulk_calls(bulk_data: Dict[str, Any]):
    res = await hunar_service.create_bulk_calls(bulk_data)
    if isinstance(res, dict) and res.get("error"):
        raise HTTPException(status_code=res.get("status_code", 400), detail=res.get("data"))
    return res

@router.get("/numbers/list")
async def list_numbers():
    try:
        return await hunar_service.list_numbers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
