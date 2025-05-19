@echo off
SETLOCAL

REM Activar entorno virtual si existe
IF EXIST venv\Scripts\activate.bat (
    CALL venv\Scripts\activate.bat
)

REM Establecer variables de entorno
SET DEBUG=True
SET DB_NAME=masclet_imperi
SET PYTHONPATH=.

REM Arrancar el servidor con uvicorn en modo reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

ENDLOCAL