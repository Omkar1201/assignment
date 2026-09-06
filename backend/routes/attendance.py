from fastapi import APIRouter
from typing import Dict, Any
from services.attendance_service import attendance_service

router = APIRouter(prefix="/api/attendance", tags=["Attendance System"])

@router.get("/architecture")
async def get_architecture():
    return attendance_service.get_system_architecture()

@router.get("/locations")
async def get_locations():
    return attendance_service.get_locations_summary()

@router.get("/logs")
async def get_logs():
    return attendance_service.get_recent_logs()

@router.post("/simulate-checkin")
async def simulate_checkin(payload: Dict[str, Any]):
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
