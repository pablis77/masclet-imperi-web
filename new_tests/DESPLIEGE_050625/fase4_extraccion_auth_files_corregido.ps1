#!/bin/pwsh
# Script corregido para extraer y analizar los archivos de autenticación del contenedor Node.js

Write-Host "🔍 Extrayendo archivos de autenticación del contenedor Node.js..." -ForegroundColor Cyan

# Crear un archivo temporal con los comandos bash
$tempScript = @"
#!/bin/bash
# Identificar el contenedor Node.js
CONTAINER_ID=\$(docker ps | grep masclet-frontend-node | awk '{print \$1}')
echo "Contenedor Node.js identificado: \$CONTAINER_ID"

# Crear un directorio para los archivos extraídos
mkdir -p /home/ubuntu/auth_files_extracted

# Extraer archivos clave de autenticación
echo -e "\n===== ARCHIVOS DE AUTENTICACIÓN =====\n"

# 1. Servicio de autenticación
echo -e "\n1. authService.js:"
docker exec \$CONTAINER_ID cat /app/client/_astro/authService.CvC7CJU-.js > /home/ubuntu/auth_files_extracted/authService.js
cat /home/ubuntu/auth_files_extracted/authService.js

# 2. Configuración de API
echo -e "\n2. apiConfig.js:"
docker exec \$CONTAINER_ID cat /app/client/_astro/apiConfig.BYL0hBvc.js > /home/ubuntu/auth_files_extracted/apiConfig.js
cat /home/ubuntu/auth_files_extracted/apiConfig.js

# 3. Servicio API
echo -e "\n3. apiService.js (primeras 50 líneas):"
docker exec \$CONTAINER_ID cat /app/client/_astro/apiService.CS3_UAep.js > /home/ubuntu/auth_files_extracted/apiService.js
head -n 50 /home/ubuntu/auth_files_extracted/apiService.js

# 4. API principal
echo -e "\n4. api.js (primeras 50 líneas):"
docker exec \$CONTAINER_ID cat /app/client/_astro/api.DMcPciep.js > /home/ubuntu/auth_files_extracted/api.js
head -n 50 /home/ubuntu/auth_files_extracted/api.js

# 5. Debugger de login si existe
echo -e "\n5. LoginDebugger.js:"
docker exec \$CONTAINER_ID cat /app/client/_astro/LoginDebugger.CtqAYyG1.js > /home/ubuntu/auth_files_extracted/LoginDebugger.js
cat /home/ubuntu/auth_files_extracted/LoginDebugger.js

# 6. Middleware de autenticación
echo -e "\n6. AuthMiddleware.js:"
docker exec \$CONTAINER_ID cat /app/client/_astro/AuthMiddleware.D03sPIq0.js > /home/ubuntu/auth_files_extracted/AuthMiddleware.js
cat /home/ubuntu/auth_files_extracted/AuthMiddleware.js

# 7. Scripts de limpieza de localStorage
echo -e "\n7. ClearLocalStorage.js:"
docker exec \$CONTAINER_ID cat /app/client/_astro/ClearLocalStorage.mpz0pt7h.js > /home/ubuntu/auth_files_extracted/ClearLocalStorage.js
cat /home/ubuntu/auth_files_extracted/ClearLocalStorage.js

# 8. Verificar flujo de inicio de sesión
echo -e "\n===== FLUJO DE LOGIN =====\n"
echo "Buscando referencias al endpoint de login en los archivos:"
grep -r "login" /home/ubuntu/auth_files_extracted/ || echo "No se encontraron referencias explícitas a 'login'"
grep -r "token" /home/ubuntu/auth_files_extracted/ || echo "No se encontraron referencias a 'token'"
grep -r "oauth" /home/ubuntu/auth_files_extracted/ || echo "No se encontraron referencias a 'oauth'"
grep -r "access_token" /home/ubuntu/auth_files_extracted/ || echo "No se encontraron referencias a 'access_token'"

# 9. Verificar si hay variables de entorno relacionadas con API
echo -e "\n===== VARIABLES DE ENTORNO =====\n"
docker exec \$CONTAINER_ID env | grep -i api || echo "No se encontraron variables de entorno relacionadas con API"
docker exec \$CONTAINER_ID env | grep -i url || echo "No se encontraron variables de entorno relacionadas con URL"
docker exec \$CONTAINER_ID env | grep -i auth || echo "No se encontraron variables de entorno relacionadas con auth"

echo -e "\nArchivos guardados en /home/ubuntu/auth_files_extracted/"

# Empaquetar los archivos para descargarlos si fuera necesario
tar -czf /home/ubuntu/auth_files.tar.gz -C /home/ubuntu auth_files_extracted
"@

# Guardar el script en un archivo temporal
$tempFile = New-TemporaryFile
$tempScriptPath = "$($tempFile.FullName).sh"
$tempScript | Out-File -FilePath $tempScriptPath -Encoding utf8

# Transferir el script al servidor y ejecutarlo
Write-Host "🔄 Transfiriendo script al servidor..." -ForegroundColor Yellow
scp -i "C:\Proyectos\claude\masclet-imperi-web\new_tests\DESPLIEGE_050625\llaves\key-masclet-aws-ramon.pem" $tempScriptPath ubuntu@3.249.142.217:/home/ubuntu/extract_auth.sh

Write-Host "🚀 Ejecutando script en el servidor..." -ForegroundColor Yellow
ssh -i "C:\Proyectos\claude\masclet-imperi-web\new_tests\DESPLIEGE_050625\llaves\key-masclet-aws-ramon.pem" ubuntu@3.249.142.217 "chmod +x /home/ubuntu/extract_auth.sh && /home/ubuntu/extract_auth.sh"

# Eliminar archivos temporales
Remove-Item $tempScriptPath
Remove-Item $tempFile

Write-Host "✅ Análisis de archivos de autenticación completado." -ForegroundColor Green
Write-Host "Los archivos extraídos están en el servidor en /home/ubuntu/auth_files_extracted/"
Write-Host "También se ha creado un archivo comprimido en /home/ubuntu/auth_files.tar.gz"
