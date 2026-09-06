#!/bin/bash
echo "======================================================================"
echo "Starting Hunar.AI Voice Hiring Assistant & People Search Suite..."
echo "======================================================================"

echo "[1/2] Starting Python Backend on port 5000..."
(cd backend && python main.py) &

echo "[2/2] Starting Next.js Frontend on port 3000..."
(cd frontend && npm run dev) &

echo ""
echo "Application running! Access at http://localhost:3000"
echo "======================================================================"
