from fastapi import APIRouter, Query
from typing import Optional, Dict, Any
from services.search_service import search_service

router = APIRouter(prefix="/api/search", tags=["People Search"])

@router.post("/parse-jd")
async def parse_jd(payload: Dict[str, str]):
    jd_text = payload.get("jd_text", "")
    return search_service.parse_job_description(jd_text)

@router.post("/candidates")
async def search_candidates(payload: Dict[str, Any]):
    jd_text = payload.get("jd_text", "")
    query = payload.get("query", "")
    skill_filter = payload.get("skill_filter", "")
    location_filter = payload.get("location_filter", "")
    min_exp = payload.get("min_exp", 0)

    results = search_service.search_candidates(
        jd_text=jd_text,
        query=query,
        skill_filter=skill_filter,
        location_filter=location_filter,
        min_exp=min_exp
    )
    return {"count": len(results), "candidates": results}
