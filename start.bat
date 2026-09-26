@echo off
echo Starting Pneumonia Detection Decision-Support Tool...

start cmd /k "cd backend && python app.py"
start cmd /k "cd frontend && npm run dev"

echo Backend and Frontend are starting in new windows.
echo Frontend: http://localhost:5177
echo Backend API: http://localhost:5000
