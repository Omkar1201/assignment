import os
import traceback
from flask import Flask, request, jsonify
from config import PORT
from services.hunar_service import hunar_service
from services.search_service import search_service
from services.attendance_service import attendance_service

app = Flask(__name__)

@app.errorhandler(Exception)
def handle_exception(e):
    err_tb = traceback.format_exc()
    print("FLASK ERROR TRACEBACK:\n", err_tb)
    return jsonify({"error": str(e), "traceback": err_tb}), 500

# Add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-API-Key"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response

@app.route("/options_handler", methods=["OPTIONS"])
def handle_options():
    return jsonify({"status": "ok"}), 200

# Root & Health Endpoints
@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "status": "online",
        "service": "Hunar AI Hiring Assistant & People Search Platform Backend",
        "version": "1.0.0"
    })

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "Hunar AI Hiring Assistant & People Search Platform Backend",
        "version": "1.0.0"
    })

# --- AGENTS API ---
@app.route("/api/agents", methods=["GET"])
def list_agents():
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 20))
    language = request.args.get("language")
    voice_persona = request.args.get("voice_persona")
    status = request.args.get("status")
    
    res = hunar_service.list_agents(page=page, page_size=page_size, language=language, voice_persona=voice_persona, status=status)
    if isinstance(res, dict) and res.get("error"):
        return jsonify(res.get("data", res)), res.get("status_code", 400)
    return jsonify(res)

@app.route("/api/agents/<agent_id>", methods=["GET"])
def get_agent(agent_id):
    res = hunar_service.get_agent(agent_id)
    if isinstance(res, dict) and res.get("error"):
        return jsonify(res.get("data", res)), res.get("status_code", 400)
    return jsonify(res)

@app.route("/api/agents", methods=["POST"])
def create_agent():
    data = request.get_json(force=True, silent=True) or {}
    res = hunar_service.create_agent(data)
    if isinstance(res, dict) and res.get("error"):
        return jsonify(res.get("data", res)), res.get("status_code", 400)
    return jsonify(res)

@app.route("/api/agents/<agent_id>", methods=["PUT"])
def update_agent(agent_id):
    data = request.get_json(force=True, silent=True) or {}
    res = hunar_service.update_agent(agent_id, data)
    if isinstance(res, dict) and res.get("error"):
        return jsonify(res.get("data", res)), res.get("status_code", 400)
    return jsonify(res)


# --- CALLS API ---
@app.route("/api/calls", methods=["GET"])
def list_calls():
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 20))
    status = request.args.get("status")
    
    res = hunar_service.list_calls(page=page, page_size=page_size, status=status)
    if isinstance(res, dict) and res.get("error"):
        return jsonify(res.get("data", res)), res.get("status_code", 400)
    return jsonify(res)

@app.route("/api/calls/<call_id>", methods=["GET"])
def get_call(call_id):
    res = hunar_service.get_call(call_id)
    if isinstance(res, dict) and res.get("error"):
        return jsonify(res.get("data", res)), res.get("status_code", 400)
    return jsonify(res)

@app.route("/api/calls", methods=["POST"])
def create_call():
    data = request.get_json(force=True, silent=True) or {}
    res = hunar_service.create_call(data)
    if isinstance(res, dict) and res.get("error"):
        return jsonify(res.get("data", res)), res.get("status_code", 400)
    return jsonify(res)

@app.route("/api/calls/bulk", methods=["POST"])
def create_bulk_calls():
    data = request.get_json(force=True, silent=True) or {}
    res = hunar_service.create_bulk_calls(data)
    if isinstance(res, dict) and res.get("error"):
        return jsonify(res.get("data", res)), res.get("status_code", 400)
    return jsonify(res)

@app.route("/api/numbers", methods=["GET"])
def list_numbers():
    res = hunar_service.list_numbers()
    if isinstance(res, dict) and res.get("error"):
        return jsonify(res.get("data", res)), res.get("status_code", 400)
    return jsonify(res)


# --- PEOPLE SEARCH API ---
@app.route("/api/search/parse-jd", methods=["POST"])
def parse_jd():
    data = request.get_json(force=True, silent=True) or {}
    jd_text = data.get("jd_text", "")
    return jsonify(search_service.parse_job_description(jd_text))

@app.route("/api/search/candidates", methods=["POST"])
def search_candidates():
    data = request.get_json(force=True, silent=True) or {}
    jd_text = data.get("jd_text", "")
    query = data.get("query", "")
    skill_filter = data.get("skill_filter", "")
    location_filter = data.get("location_filter", "")
    min_exp = int(data.get("min_exp", 0))
    provider = data.get("provider", "pdl")
    provider_api_key = data.get("provider_api_key", "")

    results = search_service.search_candidates(
        jd_text=jd_text,
        query=query,
        skill_filter=skill_filter,
        location_filter=location_filter,
        min_exp=min_exp,
        provider=provider,
        provider_api_key=provider_api_key
    )
    return jsonify({"count": len(results), "candidates": results})


# --- ATTENDANCE SYSTEM API ---
@app.route("/api/attendance/architecture", methods=["GET"])
def get_attendance_architecture():
    return jsonify(attendance_service.get_system_architecture())

@app.route("/api/attendance/locations", methods=["GET"])
def get_attendance_locations():
    return jsonify(attendance_service.get_locations_summary())

@app.route("/api/attendance/logs", methods=["GET"])
def get_attendance_logs():
    return jsonify(attendance_service.get_recent_logs())

@app.route("/api/attendance/simulate-checkin", methods=["POST"])
def simulate_attendance_checkin():
    data = request.get_json(force=True, silent=True) or {}
    worker_name = data.get("worker_name", "Ramesh Kumar")
    emp_id = data.get("emp_id", "EMP-9021")
    location_id = data.get("location_id", "LOC-001")
    speech_input = data.get("speech_input", "Present sir, location Site 1, Ramesh Kumar EMP 9021")

    res = attendance_service.simulate_voice_checkin(
        worker_name=worker_name,
        emp_id=emp_id,
        location_id=location_id,
        speech_input=speech_input
    )
    return jsonify(res)


if __name__ == "__main__":
    print(f"Starting Flask Backend on port {PORT}...")
    app.run(host="0.0.0.0", port=PORT, debug=False)
