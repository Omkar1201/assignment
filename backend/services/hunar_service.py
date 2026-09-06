import json
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional
from config import HUNAR_API_KEY, HUNAR_BASE_URL

class HunarService:
    def __init__(self):
        self.base_url = HUNAR_BASE_URL
        self.headers = {
            "X-API-Key": HUNAR_API_KEY,
            "Content-Type": "application/json",
            "User-Agent": "Hunar-Hiring-Assistant/1.0"
        }

    def _make_request(self, method: str, endpoint: str, params: Optional[Dict[str, Any]] = None, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        if params:
            query_str = urllib.parse.urlencode({k: v for k, v in params.items() if v is not None})
            if query_str:
                url = f"{url}?{query_str}"

        body_bytes = None
        if data is not None:
            body_bytes = json.dumps(data).encode('utf-8')

        req = urllib.request.Request(url, data=body_bytes, headers=self.headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                resp_text = resp.read().decode('utf-8')
                return json.loads(resp_text)
        except urllib.error.HTTPError as e:
            try:
                err_body = e.read().decode('utf-8')
                err_json = json.loads(err_body)
                return {"error": True, "status_code": e.code, "data": err_json}
            except Exception:
                return {"error": True, "status_code": e.code, "message": str(e)}
        except Exception as e:
            return {"error": True, "status_code": 500, "message": str(e)}

    def list_agents(self, page: int = 1, page_size: int = 20, language: Optional[str] = None, voice_persona: Optional[str] = None, status: Optional[str] = None) -> Dict[str, Any]:
        params = {"page": page, "page_size": page_size}
        if language:
            params["language"] = language
        if voice_persona:
            params["voice_persona"] = voice_persona
        if status:
            params["status"] = status
        return self._make_request("GET", "/agents/", params=params)

    def get_agent(self, agent_id: str) -> Dict[str, Any]:
        return self._make_request("GET", f"/agents/{agent_id}/")

    def create_agent(self, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        return self._make_request("POST", "/agents/", data=agent_data)

    def update_agent(self, agent_id: str, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        return self._make_request("PUT", f"/agents/{agent_id}/", data=agent_data)

    def create_call(self, call_data: Dict[str, Any]) -> Dict[str, Any]:
        return self._make_request("POST", "/calls/", data=call_data)

    def create_bulk_calls(self, bulk_data: Dict[str, Any]) -> Dict[str, Any]:
        return self._make_request("POST", "/calls/bulk/", data=bulk_data)

    def list_calls(self, page: int = 1, page_size: int = 20, status: Optional[str] = None) -> Dict[str, Any]:
        params = {"page": page, "page_size": page_size}
        if status:
            params["status"] = status
        return self._make_request("GET", "/calls/", params=params)

    def get_call(self, call_id: str) -> Dict[str, Any]:
        return self._make_request("GET", f"/calls/{call_id}/")

    def list_numbers(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        return self._make_request("GET", "/numbers/", params={"page": page, "page_size": page_size})

hunar_service = HunarService()
