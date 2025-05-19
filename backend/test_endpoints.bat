@echo off
SETLOCAL EnableDelayedExpansion

echo Testing API endpoints...
echo.

REM Configuración
set BASE_URL=http://localhost:8000/api/v1
set CONTENT_TYPE="Content-Type: application/json"

echo 1. Test conexión básica
curl -s %BASE_URL%/
echo.
echo.

echo 2. Crear toro de referencia (ID: 1)
curl -s -X POST %BASE_URL%/animals/ -H %CONTENT_TYPE% -d "{\"explotacio\":\"Gurans\",\"nom\":\"1\",\"genere\":\"M\",\"estado\":\"OK\",\"quadra\":\"Riera\",\"cod\":\"7892\",\"num_serie\":\"ES07090513\",\"dob\":\"31/01/2020\"}"
echo.
echo.

echo 3. Crear vaca de referencia (ID: 20-36)
curl -s -X POST %BASE_URL%/animals/ -H %CONTENT_TYPE% -d "{\"explotacio\":\"Gurans\",\"nom\":\"20-36\",\"genere\":\"F\",\"estado\":\"OK\",\"pare\":\"Xero\",\"mare\":\"11-03\",\"cod\":\"6350\",\"num_serie\":\"ES02090513\",\"dob\":\"02/03/2020\",\"alletar\":false}"
echo.
echo.

echo 4. Añadir primer parto a 20-36
curl -s -X POST %BASE_URL%/animals/2/parts -H %CONTENT_TYPE% -d "{\"data\":\"19/12/2022\",\"genere_fill\":\"esforrada\",\"estat_fill\":\"DEF\",\"numero_part\":1}"
echo.
echo.

echo 5. Añadir segundo parto a 20-36
curl -s -X POST %BASE_URL%/animals/2/parts -H %CONTENT_TYPE% -d "{\"data\":\"17/11/2023\",\"genere_fill\":\"M\",\"estat_fill\":\"OK\",\"numero_part\":2}"
echo.
echo.

echo 6. Obtener detalles del toro
curl -s %BASE_URL%/animals/1
echo.
echo.

echo 7. Obtener detalles de la vaca con partos
curl -s %BASE_URL%/animals/2
echo.
echo.

echo 8. Listar animales de Gurans
curl -s "%BASE_URL%/animals/?explotacio=Gurans"
echo.
echo.

echo 9. Buscar por número de serie
curl -s "%BASE_URL%/animals/search?q=ES07090513"
echo.
echo.

echo 10. Actualizar ubicación del toro
curl -s -X PUT %BASE_URL%/animals/1 -H %CONTENT_TYPE% -d "{\"quadra\":\"Nueva Riera\"}"
echo.
echo.

echo 11. Cambiar estado alletar de la vaca
curl -s -X PUT %BASE_URL%/animals/2 -H %CONTENT_TYPE% -d "{\"alletar\":true}"
echo.
echo.

echo 12. Intentar cambiar estado de animal fallecido (debe fallar)
curl -s -X POST %BASE_URL%/animals/ -H %CONTENT_TYPE% -d "{\"explotacio\":\"Gurans\",\"nom\":\"test-fail\",\"genere\":\"M\",\"estado\":\"DEF\"}"
curl -s -X PUT %BASE_URL%/animals/3 -H %CONTENT_TYPE% -d "{\"estado\":\"OK\"}"
echo.
echo.

echo 13. Filtrar por fecha y género
curl -s "%BASE_URL%/animals/?explotacio=Gurans&genere=F&fecha_desde=01/01/2020&fecha_hasta=31/12/2020"
echo.
echo.

echo Pruebas completadas.
pause