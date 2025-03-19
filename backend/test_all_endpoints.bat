@echo off
SETLOCAL EnableDelayedExpansion

REM Configuración
set BASE_URL=http://localhost:8000/api/v1
set CONTENT_TYPE="Content-Type: application/json"

echo === INICIANDO PRUEBAS SISTEMÁTICAS DE ENDPOINTS ===
echo Resultados se guardarán en test_results.md
echo.

REM 1. GET /api/v1/animals/
echo === 1. Probando GET /animals/ ===
echo "1.1 Sin filtros"
curl -s %BASE_URL%/animals/
echo.
echo "1.2 Con filtro explotación"
curl -s "%BASE_URL%/animals/?explotacio=Gurans"
echo.
echo "1.3 Con filtro género"
curl -s "%BASE_URL%/animals/?genere=M"
echo.
echo "1.4 Con filtro estado"
curl -s "%BASE_URL%/animals/?estado=OK"
echo.
echo "1.5 Con filtro fechas"
curl -s "%BASE_URL%/animals/?fecha_desde=01/01/2020&fecha_hasta=31/12/2020"
echo.
echo "1.6 Con paginación"
curl -s "%BASE_URL%/animals/?offset=0&limit=5"
echo.

REM 2. Crear animales de prueba
echo === 2. Creando animales de prueba ===
echo "2.1 Crear toro (datos mínimos)"
curl -s -X POST %BASE_URL%/animals/ -H %CONTENT_TYPE% -d "{\"explotacio\":\"Gurans\",\"nom\":\"TEST-1\",\"genere\":\"M\",\"estado\":\"OK\"}"
echo.
echo "2.2 Crear toro (todos los campos)"
curl -s -X POST %BASE_URL%/animals/ -H %CONTENT_TYPE% -d "{\"explotacio\":\"Gurans\",\"nom\":\"1\",\"genere\":\"M\",\"estado\":\"OK\",\"quadra\":\"Riera\",\"cod\":\"7892\",\"num_serie\":\"ES07090513\",\"dob\":\"31/01/2020\"}"
echo.
echo "2.3 Crear vaca"
curl -s -X POST %BASE_URL%/animals/ -H %CONTENT_TYPE% -d "{\"explotacio\":\"Gurans\",\"nom\":\"20-36\",\"genere\":\"F\",\"estado\":\"OK\",\"alletar\":false,\"dob\":\"02/03/2020\"}"
echo.

REM 3. GET individual
echo === 3. Probando GET /animals/{id} ===
echo "3.1 Animal existente"
curl -s %BASE_URL%/animals/2
echo.
echo "3.2 Animal no existente"
curl -s %BASE_URL%/animals/999
echo.

REM 4. PUT actualización
echo === 4. Probando PUT /animals/{id} ===
echo "4.1 Actualizar un campo"
curl -s -X PUT %BASE_URL%/animals/1 -H %CONTENT_TYPE% -d "{\"quadra\":\"Nueva Riera\"}"
echo.
echo "4.2 Actualizar múltiples campos"
curl -s -X PUT %BASE_URL%/animals/2 -H %CONTENT_TYPE% -d "{\"alletar\":true,\"quadra\":\"Q1\"}"
echo.
echo "4.3 Intentar revivir animal"
curl -s -X PUT %BASE_URL%/animals/3 -H %CONTENT_TYPE% -d "{\"estado\":\"OK\"}"
echo.

REM 5. DELETE (marcar como fallecido)
echo === 5. Probando DELETE /animals/{id} ===
echo "5.1 Marcar animal como fallecido"
curl -s -X DELETE %BASE_URL%/animals/1
echo.
echo "5.2 Intentar marcar animal ya fallecido"
curl -s -X DELETE %BASE_URL%/animals/1
echo.

REM 6. Búsqueda
echo === 6. Probando GET /animals/search ===
echo "6.1 Búsqueda por nombre"
curl -s "%BASE_URL%/animals/search?q=TEST-1"
echo.
echo "6.2 Búsqueda por código"
curl -s "%BASE_URL%/animals/search?q=7892"
echo.
echo "6.3 Búsqueda sin resultados"
curl -s "%BASE_URL%/animals/search?q=NORESULTS"
echo.

REM 7. Partos
echo === 7. Probando endpoints de partos ===
echo "7.1 Registrar parto normal"
curl -s -X POST %BASE_URL%/animals/2/parts -H %CONTENT_TYPE% -d "{\"data\":\"19/12/2022\",\"genere_fill\":\"M\",\"estat_fill\":\"OK\",\"numero_part\":1}"
echo.
echo "7.2 Registrar parto esforrada"
curl -s -X POST %BASE_URL%/animals/2/parts -H %CONTENT_TYPE% -d "{\"data\":\"17/11/2023\",\"genere_fill\":\"esforrada\",\"estat_fill\":\"DEF\",\"numero_part\":2}"
echo.
echo "7.3 Intentar registrar parto en macho"
curl -s -X POST %BASE_URL%/animals/1/parts -H %CONTENT_TYPE% -d "{\"data\":\"01/01/2024\",\"genere_fill\":\"M\",\"estat_fill\":\"OK\",\"numero_part\":1}"
echo.
echo "7.4 Listar partos"
curl -s %BASE_URL%/animals/2/parts
echo.

REM 8. Casos especiales
echo === 8. Probando casos especiales ===
echo "8.1 Fecha inválida"
curl -s -X POST %BASE_URL%/animals/ -H %CONTENT_TYPE% -d "{\"explotacio\":\"Gurans\",\"nom\":\"TEST-ERR\",\"genere\":\"M\",\"estado\":\"OK\",\"dob\":\"2024-01-01\"}"
echo.
echo "8.2 Género inválido"
curl -s -X POST %BASE_URL%/animals/ -H %CONTENT_TYPE% -d "{\"explotacio\":\"Gurans\",\"nom\":\"TEST-ERR\",\"genere\":\"X\",\"estado\":\"OK\"}"
echo.
echo "8.3 Estado inválido"
curl -s -X POST %BASE_URL%/animals/ -H %CONTENT_TYPE% -d "{\"explotacio\":\"Gurans\",\"nom\":\"TEST-ERR\",\"genere\":\"M\",\"estado\":\"INVALID\"}"
echo.

echo === PRUEBAS COMPLETADAS ===
echo Revisa test_results.md para ver los resultados
pause