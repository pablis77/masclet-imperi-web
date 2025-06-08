# Fase 1: Diagnóstico HTML de la página de login
# Este script analiza la estructura HTML de la página de login para identificar
# exactamente qué formulario necesitamos interceptar

Write-Host "🔍 Fase 1: Analizando estructura HTML de la página de login..." -ForegroundColor Cyan

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"

# 1. Crear script para analizar la página de login
$diagnosticoHtml = @'
#!/bin/bash
set -e

echo "===== DIAGNÓSTICO HTML DE LA PÁGINA DE LOGIN ====="

# 1. Obtener la página de login y guardarla
echo -e "\n1. Obteniendo la página de login..."
curl -s http://localhost:80/login > /tmp/login.html

# 2. Analizar la estructura del formulario de login
echo -e "\n2. Analizando estructura del formulario de login..."
echo "Elementos de formulario encontrados:"
grep -A 20 "<form" /tmp/login.html | grep -E "form|input|button" | grep -v "<!--"

echo -e "\nElementos input para username:"
grep -E 'input.*name="(username|email)"' /tmp/login.html

echo -e "\nElementos input para password:"
grep -E 'input.*name="password"' /tmp/login.html

echo -e "\nBotones de submit:"
grep -E 'button.*type="submit"|input.*type="submit"' /tmp/login.html

# 3. Buscar scripts relacionados con login
echo -e "\n3. Buscando scripts relacionados con login..."
grep -A 5 "<script" /tmp/login.html | head -20

# 4. Analizar rutas de API utilizadas para login
echo -e "\n4. Buscando referencias a endpoints de API de login..."
grep -E "api.*auth|api.*login" /tmp/login.html

# 5. Comprobar si hay referencias a localhost o IPs estáticas
echo -e "\n5. Buscando referencias a localhost o IPs estáticas..."
grep -E 'localhost|127\.0\.0\.1|192\.168\.' /tmp/login.html

# 6. Buscar jQuery o frameworks de gestión de formularios
echo -e "\n6. Buscando referencias a jQuery o frameworks de gestión de formularios..."
grep -E 'jquery|axios|fetch|XMLHttpRequest' /tmp/login.html

# 7. Guardar HTML para análisis posterior
echo -e "\n7. HTML completo guardado en /tmp/login.html"

echo -e "\n===== DIAGNÓSTICO HTML COMPLETADO ====="
'@

# 2. Transferir y ejecutar el script - con tratamiento para finales de línea
$tempFile = New-TemporaryFile
$diagnosticoHtml | Out-File -FilePath $tempFile.FullName -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF)
Get-Content -Path $tempFile.FullName -Raw | 
    ForEach-Object { $_ -replace "`r`n", "`n" } |
    ssh -i $KEY_PATH $SERVER "cat > /tmp/fase1_diagnostico_html.sh"

Remove-Item -Path $tempFile.FullName

Write-Host "🔍 Ejecutando diagnóstico HTML..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/fase1_diagnostico_html.sh && sh /tmp/fase1_diagnostico_html.sh"

Write-Host @"
✅ Diagnóstico HTML completado.

Este análisis nos muestra exactamente:
1. La estructura del formulario de login
2. Los nombres de los campos username y password
3. El tipo de botón de submit
4. Si hay scripts que interceptan el formulario
5. Si hay referencias a endpoints incorrectos (localhost, etc.)

Con esta información podemos crear un script específico para el formulario real.
"@ -ForegroundColor Green
