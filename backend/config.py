import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

HUNAR_API_KEY = os.getenv("HUNAR_API_KEY", "")
HUNAR_BASE_URL = os.getenv("HUNAR_BASE_URL", "https://api.voice.hunar.ai/external/v1")
APOLLO_API_KEY = os.getenv("APOLLO_API_KEY", "")
PROXYCURL_API_KEY = os.getenv("PROXYCURL_API_KEY", "")
PORT = int(os.getenv("PORT", 5000))
