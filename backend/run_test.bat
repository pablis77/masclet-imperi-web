@echo off
echo Starting FastAPI server...
start /B uvicorn app.main:app --reload --log-level debug
timeout /t 5 /nobreak
echo Running test script...
python tests/test_api.py
pause