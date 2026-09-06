from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any
from services.hunar_service import hunar_service

router = APIRouter(prefix="/api/agents", tags=["Agents"])

@router.get("/")
async def list_agents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    language: Optional[str] = None,
    voice_persona: Optional[str] = None,
    status: Optional[str] = None
):
    try:
        data = await hunar_service.list_agents(page, page_size, language, voice_persona, status)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    try:
        return await hunar_service.get_agent(agent_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_agent(agent_data: Dict[str, Any]):
    res = await hunar_service.create_agent(agent_data)
    if isinstance(res, dict) and res.get("error"):
        raise HTTPException(status_code=res.get("status_code", 400), detail=res.get("data"))
    return res

@router.put("/{agent_id}")
async def update_agent(agent_id: str, agent_data: Dict[str, Any]):
    res = await hunar_service.update_agent(agent_id, agent_data)
    if isinstance(res, dict) and res.get("error"):
        raise HTTPException(status_code=res.get("status_code", 400), detail=res.get("data"))
    return res
