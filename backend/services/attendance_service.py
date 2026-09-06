import random
from datetime import datetime
from typing import List, Dict, Any

# Dynamic Location State Store
LOCATION_METRICS = {
    f"LOC-{i:03d}": {
        "id": f"LOC-{i:03d}",
        "name": f"Site #{i} - {city}",
        "region": region,
        "total_workers": 10,
        "present_workers": 7 + (i % 3),
        "absent_workers": 3 - (i % 3),
        "status": "PARTIAL",
        "last_call_time": f"08:{45 + (i % 15):02d} AM"
    }
    for i, (city, region) in enumerate([
        ("Bengaluru North", "South"), ("Bengaluru South", "South"), ("Mumbai Central", "West"),
        ("Navi Mumbai", "West"), ("Delhi Connaught", "North"), ("Gurugram Cyberhub", "North"),
        ("Noida Sector 62", "North"), ("Hyderabad Hitec", "South"), ("Chennai Port", "South"),
        ("Kolkata SaltLake", "East"), ("Pune Hinjewadi", "West"), ("Ahmedabad GIDC", "West"),
        ("Jaipur Industrial", "North"), ("Chandigarh Tech", "North"), ("Kochi InfoPark", "South"),
        ("Indore Pithampur", "Central"), ("Nagpur Logistics", "Central"), ("Surat Textile", "West"),
        ("Coimbatore Mills", "South"), ("Lucknow Transport", "North")
    ] * 5, start=1)
}

ATTENDANCE_LOGS: List[Dict[str, Any]] = []

class AttendanceService:
    @staticmethod
    def get_system_architecture() -> Dict[str, Any]:
        """Returns the complete solution architecture writeup for HR attendance tracking without smartphones."""
        return {
            "title": "Voice-First Voice AI & PSTN Telephony Attendance Engine for 1,000 Staff across 100 Locations",
            "problem": "Track daily attendance of 1,000 employees spread across 100 remote locations with ZERO smartphone dependency and NO mobile apps.",
            "core_pillars": [
                {
                    "name": "1. Inbound Voice AI Toll-Free IVR Check-In",
                    "description": "Each worker calls a dedicated local toll-free number (e.g. 1800-ATTEND-AI) from any basic feature phone (Nokia/JioPhone) or location landline. The Hunar LLM Voice Agent greets them in their regional language, verifies identity via voice passphrase + voice acoustic signature, and logs shift start instantly."
                },
                {
                    "name": "2. Outbound Automated Location Group Check-In",
                    "description": "At shift start time (e.g., 9:00 AM), the Hunar Voice AI Agent automatically calls the landline / feature phone of the site supervisor at all 100 locations. The supervisor confirms total workers present via spoken voice response or DTMF keypads, which the LLM parses into structured attendance records."
                },
                {
                    "name": "3. PSTN Caller ID & Cell-Tower Location Geofencing",
                    "description": "Every call captures PSTN telecom exchange metadata or Cell Tower LAC/CID to verify caller physical location, preventing remote clock-in fraud without GPS."
                },
                {
                    "name": "4. Low-Cost POTS / GSM Hardware Voice Station",
                    "description": "At remote sites without phones, install a $15 rugged 2G/4G voice hardware unit with single-button press to connect directly to the LLM attendance agent."
                }
            ],
            "workflow_steps": [
                "Worker arrives at location -> Dials Toll-Free / Press Voice Button on POTS Box",
                "Hunar LLM Voice Agent answers: 'Welcome Ramesh! Speak your 4-digit PIN and location code.'",
                "LLM performs real-time speech recognition & voice biometric verification",
                "Attendance timestamp logged to HR Central Database & instant confirmation SMS sent to worker's feature phone",
                "HR Dashboard updates in real time with live location heatmap, late alerts, and attendance summary"
            ]
        }

    @staticmethod
    def get_locations_summary() -> List[Dict[str, Any]]:
        """Generates real-time attendance matrix for 100 locations."""
        return list(LOCATION_METRICS.values())

    @staticmethod
    def simulate_voice_checkin(worker_name: str, emp_id: str, location_id: str, speech_input: str) -> Dict[str, Any]:
        """Simulates a live Voice AI IVR attendance call from a feature phone / landline."""
        now = datetime.now().strftime("%I:%M:%S %p")
        
        # Dynamically update location matrix state
        loc = LOCATION_METRICS.get(location_id)
        if loc:
            loc["present_workers"] = min(loc["total_workers"], loc["present_workers"] + 1)
            loc["absent_workers"] = max(0, loc["total_workers"] - loc["present_workers"])
            loc["status"] = "COMPLETED" if loc["present_workers"] == loc["total_workers"] else "PARTIAL"
            loc["last_call_time"] = now
            loc_name = loc["name"]
        else:
            loc_name = "Site #1 - Bengaluru"

        log_entry = {
            "timestamp": now,
            "emp_id": emp_id,
            "worker_name": worker_name,
            "location_id": location_id,
            "location_name": loc_name,
            "speech_transcript": speech_input,
            "verified_by_llm": True,
            "status": "PRESENT",
            "telecom_node": "PSTN-BGLR-EXCHANGE-4",
            "confirmation_sms": f"Confirmed! Attendance marked for {worker_name} ({emp_id}) at {loc_name} at {now}."
        }
        ATTENDANCE_LOGS.insert(0, log_entry)
        return log_entry

    @staticmethod
    def get_recent_logs() -> List[Dict[str, Any]]:
        return ATTENDANCE_LOGS[:20]

attendance_service = AttendanceService()
