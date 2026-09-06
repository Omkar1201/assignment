@echo off
echo ======================================================================
echo Starting Hunar.AI Voice Hiring Assistant & People Search Suite...
echo ======================================================================

echo [1/2] Launching Python Backend on http://localhost:5000...
start "Hunar Backend (Python)" cmd /k "cd backend && python main.py"

echo [2/2] Launching Next.js Frontend on http://localhost:3000...
start "Hunar Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo Application started! Open http://localhost:3000 in your browser.
echo ======================================================================
