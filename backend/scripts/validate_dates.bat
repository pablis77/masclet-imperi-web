@echo off
REM Script para validar fechas en matriz_master.csv

echo === Validador de Fechas de Masclet Imperi ===
echo.

REM Activar entorno virtual si existe
if exist "..\venv\Scripts\activate.bat" (
    call ..\venv\Scripts\activate.bat
)

REM Establecer variables de entorno
set PYTHONPATH=..
set PYTHONIOENCODING=utf-8

REM Ejecutar script de validación
echo Ejecutando validación de fechas...
echo.
python validate_dates.py

REM Guardar código de salida
set EXIT_CODE=%ERRORLEVEL%

REM Mostrar resultados según el código de salida
if %EXIT_CODE% EQU 0 (
    echo.
    echo === Validación Completada con Éxito ===
    echo Todas las fechas en matriz_master.csv son válidas.
) else (
    echo.
    echo === Se Encontraron Errores ===
    echo Revise el reporte anterior para ver los detalles.
)

REM Desactivar entorno virtual
if exist "..\venv\Scripts\deactivate.bat" (
    call ..\venv\Scripts\deactivate.bat
)

echo.
echo Presione cualquier tecla para salir...
pause > nul
exit /b %EXIT_CODE%