@echo off
setlocal enabledelayedexpansion

:: Script unificado para ejecutar los tests de Masclet Imperi
:: Uso: run_tests.bat [tipo] [destino] [opciones]
::   - tipo: unit, integration, api, all (default: all)
::   - destino: path específico o categoría (default: tests)
::   - opciones: cualquier opción adicional para pytest

echo ==============================================
echo Masclet Imperi - Sistema de Tests Unificado
echo ==============================================

:: Valores por defecto
set "TIPO=all"
set "DESTINO=tests"
set "OPCIONES=-v"

:: Procesar argumentos
if not "%~1"=="" set "TIPO=%~1"
if not "%~2"=="" set "DESTINO=%~2"
if not "%~3"=="" set "OPCIONES=%~3"

:: Configurar el entorno
set PYTHONPATH=.
set TEST_DB_URL=sqlite://:memory:

:: Limpiar caché de Python antes de ejecutar los tests
echo Limpiando caché de Python...
for /d /r . %%d in (__pycache__) do (
    if exist "%%d" rd /s /q "%%d"
)

echo.
echo Ejecutando tests de tipo: %TIPO%
echo Destino: %DESTINO%
echo Opciones: %OPCIONES%
echo.

:: Determinar qué tests ejecutar según el tipo
if "%TIPO%"=="unit" (
    echo Ejecutando tests unitarios...
    pytest tests/models -v %OPCIONES%
) else if "%TIPO%"=="integration" (
    echo Ejecutando tests de integración...
    pytest tests/integration -v %OPCIONES%
) else if "%TIPO%"=="api" (
    echo Ejecutando tests de API...
    pytest tests/api -v %OPCIONES%
) else if "%TIPO%"=="all" (
    echo Ejecutando todos los tests...
    pytest %DESTINO% -v %OPCIONES%
) else (
    echo Ejecutando tests específicos: %DESTINO%
    pytest %DESTINO% -v %OPCIONES%
)

echo.
echo Test completado. Revisa los resultados arriba.
echo.

endlocal