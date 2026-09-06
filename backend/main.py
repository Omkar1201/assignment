import os
import uvicorn
from typing import Optional, Dict, Any
from fastapi import FastAPI, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import PORT
from services.hunar_service import hunar_service
from services.search_service import search_service
from services.attendance_service import attendance_service

app = FastAPI(
    title="Hunar AI Hiring Assistant & Workforce Platform Backend API",
    description="FastAPI Backend for Hunar.AI Voice Agents, People Search & Reachout, and Attendance System",
    version="1.0.0"
)

# Enable CORS for Next.js frontend (Vercel / Local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root & Health Endpoints
@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Hunar AI Hiring Assistant & People Search Platform Backend (FastAPI)",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health():
    return {
        "status": "online",
        "service": "Hunar AI Hiring Assistant & People Search Platform Backend (FastAPI)",
        "version": "1.0.0"
    }

# --- AGENTS API ---
@app.get("/api/agents")
def list_agents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    language: Optional[str] = None,
    voice_persona: Optional[str] = None,
    status: Optional[str] = None
):
    res = hunar_service.list_agents(page=page, page_size=page_size, language=language, voice_persona=voice_persona, status=status)
    if isinstance(res, dict) and res.get("error"):
        return JSONResponse(content=res.get("data", res), status_code=res.get("status_code", 400))
    return res

@app.get("/api/agents/{agent_id}")
def get_agent(agent_id: str):
    res = hunar_service.get_agent(agent_id)
    if isinstance(res, dict) and res.get("error"):
        return JSONResponse(content=res.get("data", res), status_code=res.get("status_code", 400))
    return res

@app.post("/api/agents")
def create_agent(agent_data: Dict[str, Any] = Body(...)):
    res = hunar_service.create_agent(agent_data)
    if isinstance(res, dict) and res.get("error"):
        return JSONResponse(content=res.get("data", res), status_code=res.get("status_code", 400))
    return res

@app.put("/api/agents/{agent_id}")
def update_agent(agent_id: str, agent_data: Dict[str, Any] = Body(...)):
    res = hunar_service.update_agent(agent_id, agent_data)
    if isinstance(res, dict) and res.get("error"):
        return JSONResponse(content=res.get("data", res), status_code=res.get("status_code", 400))
    return res

# --- CALLS API ---
@app.get("/api/calls")
def list_calls(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None
):
    res = hunar_service.list_calls(page=page, page_size=page_size, status=status)
    if isinstance(res, dict) and res.get("error"):
        return JSONResponse(content=res.get("data", res), status_code=res.get("status_code", 400))
    return res

@app.get("/api/calls/{call_id}")
def get_call(call_id: str):
    res = hunar_service.get_call(call_id)
    if isinstance(res, dict) and res.get("error"):
        return JSONResponse(content=res.get("data", res), status_code=res.get("status_code", 400))
    return res

@app.post("/api/calls")
def create_call(call_data: Dict[str, Any] = Body(...)):
    res = hunar_service.create_call(call_data)
    if isinstance(res, dict) and res.get("error"):
        return JSONResponse(content=res.get("data", res), status_code=res.get("status_code", 400))
    return res

@app.post("/api/calls/bulk")
def create_bulk_calls(bulk_data: Dict[str, Any] = Body(...)):
    res = hunar_service.create_bulk_calls(bulk_data)
    if isinstance(res, dict) and res.get("error"):
        return JSONResponse(content=res.get("data", res), status_code=res.get("status_code", 400))
    return res

@app.get("/api/numbers")
def list_numbers():
    res = hunar_service.list_numbers()
    if isinstance(res, dict) and res.get("error"):
        return JSONResponse(content=res.get("data", res), status_code=res.get("status_code", 400))
    return res

# --- PEOPLE SEARCH API ---
@app.post("/api/search/parse-jd")
def parse_jd(payload: Dict[str, Any] = Body(...)):
    jd_text = payload.get("jd_text", "")
    return search_service.parse_job_description(jd_text)

@app.post("/api/search/candidates")
def search_candidates(payload: Dict[str, Any] = Body(...)):
    jd_text = payload.get("jd_text", "")
    query = payload.get("query", "")
    skill_filter = payload.get("skill_filter", "")
    location_filter = payload.get("location_filter", "")
    min_exp = int(payload.get("min_exp", 0))
    provider = payload.get("provider", "pdl")
    provider_api_key = payload.get("provider_api_key", "")

    results = search_service.search_candidates(
        jd_text=jd_text,
        query=query,
        skill_filter=skill_filter,
        location_filter=location_filter,
        min_exp=min_exp,
        provider=provider,
        provider_api_key=provider_api_key
    )
    return {"count": len(results), "candidates": results}

# --- ATTENDANCE SYSTEM API ---
@app.get("/api/attendance/architecture")
def get_attendance_architecture():
    return attendance_service.get_system_architecture()

@app.get("/api/attendance/locations")
def get_attendance_locations():
    return attendance_service.get_locations_summary()

@app.get("/api/attendance/logs")
def get_attendance_logs():
    return attendance_service.get_recent_logs()

@app.post("/api/attendance/simulate-checkin")
def simulate_attendance_checkin(payload: Dict[str, Any] = Body(...)):
    worker_name = payload.get("worker_name", "Ramesh Kumar")
    emp_id = payload.get("emp_id", "EMP-9021")
    location_id = payload.get("location_id", "LOC-001")
    speech_input = payload.get("speech_input", "Present sir, location Site 1, Ramesh Kumar EMP 9021")

    res = attendance_service.simulate_voice_checkin(
        worker_name=worker_name,
        emp_id=emp_id,
        location_id=location_id,
        speech_input=speech_input
    )
    return res

if __name__ == "__main__":
    print(f"Starting FastAPI Backend on port {PORT} with Uvicorn...")
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
