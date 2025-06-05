# Script para preparar paquete de despliegue completo para Ramón
# Este script crea una copia completa del backend y todos los componentes
# necesarios para un despliegue rápido en el servidor de Ramón
# Fecha: 05/06/2025

# Configuración
$AWSKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2User = "ec2-user"
$EC2Address = "108.129.139.119"
$BackupSource = "C:\Proyectos\claude\masclet-imperi-web\backup_aws_20250605"
$TargetFolder = "C:\Proyectos\AWS\contenedores despliegue RAMON"
$fecha = Get-Date -Format "yyyyMMdd_HHmmss"

# Crear carpetas necesarias si no existen
Write-Host "Creando estructura de carpetas para el despliegue de Ramón..." -ForegroundColor Cyan
New-Item -Path $TargetFolder -ItemType Directory -Force | Out-Null
$folders = @(
    "db",
    "backend",
    "frontend",
    "docker",
    "scripts"
)

foreach ($folder in $folders) {
    New-Item -Path "$TargetFolder\$folder" -ItemType Directory -Force | Out-Null
}

# 1. Copiar backup de base de datos existente
Write-Host "Copiando el backup de la base de datos..." -ForegroundColor Green
$dbBackup = Get-ChildItem -Path "$BackupSource" -Filter "*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($dbBackup) {
    Copy-Item -Path $dbBackup.FullName -Destination "$TargetFolder\db\" -Force
    Write-Host "  → Backup de base de datos copiado: $($dbBackup.Name)" -ForegroundColor White
} else {
    Write-Host "  ✕ No se encontró archivo de backup de base de datos" -ForegroundColor Red
}

# 2. Copiar archivos de configuración AWS
Write-Host "`nCopiando archivos de configuración..." -ForegroundColor Green
$configFiles = Get-ChildItem -Path "$BackupSource" -Filter "*.yml" -Recurse
foreach ($file in $configFiles) {
    Copy-Item -Path $file.FullName -Destination "$TargetFolder\docker\" -Force
    Write-Host "  → Archivo de configuración copiado: $($file.Name)" -ForegroundColor White
}

# Copiar archivos .env para backend
$envFiles = Get-ChildItem -Path "$BackupSource" -Filter "*.env" -Recurse
foreach ($file in $envFiles) {
    Copy-Item -Path $file.FullName -Destination "$TargetFolder\backend\" -Force
    Write-Host "  → Archivo de entorno copiado: $($file.Name)" -ForegroundColor White
}

# 3. Obtener Dockerfile actualizado directamente del backend AWS
Write-Host "`nDescargando Dockerfile actual del backend..." -ForegroundColor Green
ssh -i $AWSKey $EC2User@$EC2Address "cat /home/ec2-user/backend.Dockerfile" | Out-File -FilePath "$TargetFolder\docker\backend.Dockerfile" -Encoding utf8 -Force
Write-Host "  → Dockerfile del backend descargado" -ForegroundColor White

# 4. Obtener requirements.txt actualizado
Write-Host "`nDescargando requirements.txt con dependencias actualizadas..." -ForegroundColor Green
ssh -i $AWSKey $EC2User@$EC2Address "cat /home/ec2-user/requirements.txt" | Out-File -FilePath "$TargetFolder\backend\requirements.txt" -Encoding utf8 -Force
Write-Host "  → Archivo requirements.txt descargado" -ForegroundColor White

# 5. Crear scripts de un solo clic para el despliegue
Write-Host "`nGenerando scripts de despliegue simplificados para Ramón..." -ForegroundColor Green

# Script de despliegue rápido
$scriptDespliegue = @'
#!/bin/bash
# Script de despliegue rápido - Masclet Imperi
# Generado automáticamente el $(date)

echo "====================================================="
echo "  DESPLIEGUE RÁPIDO MASCLET IMPERI - BACKEND"
echo "====================================================="

# 1. Crear red Docker si no existe
docker network create masclet-network 2>/dev/null || true

# 2. Desplegar base de datos PostgreSQL
echo -e "\n[1/3] Desplegando base de datos PostgreSQL..."
docker run -d --name masclet-db \
  --network masclet-network \
  -e POSTGRES_USER=masclet_imperi \
  -e POSTGRES_PASSWORD=masclet123 \
  -e POSTGRES_DB=masclet_imperi_db \
  -v pg_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15.3-alpine

# 3. Restaurar backup
echo -e "\n[2/3] Restaurando datos desde backup..."
sleep 5  # Esperar a que la base de datos esté lista
BACKUP_FILE=$(ls -t ./db/*.sql | head -1)
docker exec -i masclet-db psql -U masclet_imperi -d masclet_imperi_db < "$BACKUP_FILE"

# 4. Desplegar backend
echo -e "\n[3/3] Desplegando backend..."
docker build -t masclet-backend:latest -f ./docker/backend.Dockerfile .
docker run -d --name masclet-backend \
  --network masclet-network \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://masclet_imperi:masclet123@masclet-db:5432/masclet_imperi_db \
  --restart unless-stopped \
  masclet-backend:latest

echo -e "\nDespliegue completado con éxito!"
echo "API disponible en: http://localhost:8000"
echo "Documentación: http://localhost:8000/docs"
echo "Credenciales de acceso:"
echo "  - Usuario: admin@mascletimperi.com"
echo "  - Password: admin123"
echo "====================================================="
'@

# Guardar script de despliegue
$scriptDespliegue | Out-File -FilePath "$TargetFolder\scripts\despliegue_rapido.sh" -Encoding utf8 -Force
Write-Host "  → Script de despliegue rápido generado" -ForegroundColor White

# Script de verificación del sistema
$scriptVerificacion = @'
#!/bin/bash
# Script de verificación - Masclet Imperi
# Permite comprobar que todo está funcionando correctamente

echo "====================================================="
echo "  VERIFICACIÓN DEL SISTEMA MASCLET IMPERI"
echo "====================================================="

echo -e "\n[1] Verificando contenedores Docker..."
docker ps -a

echo -e "\n[2] Verificando logs del backend..."
docker logs --tail 20 masclet-backend

echo -e "\n[3] Verificando conexión a la API..."
curl -s http://localhost:8000/api/v1/health | grep -q "ok" && \
  echo "✓ API FUNCIONANDO CORRECTAMENTE" || \
  echo "✗ ERROR EN LA API"

echo -e "\n[4] Verificando base de datos..."
docker exec -i masclet-db psql -U masclet_imperi -d masclet_imperi_db -c "SELECT count(*) FROM users;"

echo -e "\n====================================================="
echo "  VERIFICACIÓN COMPLETADA"
echo "====================================================="
'@

# Guardar script de verificación
$scriptVerificacion | Out-File -FilePath "$TargetFolder\scripts\verificar_sistema.sh" -Encoding utf8 -Force
Write-Host "  → Script de verificación generado" -ForegroundColor White

# 6. Crear README sencillo con instrucciones
$readme = @"
# DESPLIEGUE RÁPIDO MASCLET IMPERI - BACKEND
**Fecha de preparación: $(Get-Date -Format 'dd/MM/yyyy')**

## INSTRUCCIONES PARA RAMÓN

### Requisitos previos
- Docker y Docker Compose instalados
- Acceso a internet para descargar las imágenes base

### Pasos para el despliegue

1. **Copiar** toda esta carpeta al servidor de destino
2. **Ejecutar** el script de despliegue rápido:

```bash
cd ruta/a/esta/carpeta
chmod +x ./scripts/despliegue_rapido.sh
./scripts/despliegue_rapido.sh
```

3. **Verificar** que todo funciona correctamente:

```bash
chmod +x ./scripts/verificar_sistema.sh
./scripts/verificar_sistema.sh
```

### Acceso al sistema

- **Backend API**: http://localhost:8000
- **Swagger API Docs**: http://localhost:8000/docs
- **Credenciales por defecto**:
  - Usuario: admin@mascletimperi.com
  - Contraseña: admin123

### En caso de problemas

Si encuentras algún problema durante el despliegue:

1. Revisa los logs del contenedor: `docker logs masclet-backend`
2. Verifica la conexión a la base de datos: `docker logs masclet-db`
3. Reinicia los contenedores: `docker restart masclet-backend masclet-db`

### Contenido del paquete de despliegue

- **./db/** - Backup de la base de datos
- **./backend/** - Archivos de configuración del backend
- **./docker/** - Dockerfiles y configuraciones
- **./scripts/** - Scripts de despliegue y verificación
"@

# Guardar README
$readme | Out-File -FilePath "$TargetFolder\README.md" -Encoding utf8 -Force
Write-Host "  → README con instrucciones generado" -ForegroundColor White

# 7. Generar archivo verificación
$verificacionContenido = @"
# VERIFICACIÓN DE CONTENIDO - MASCLET IMPERI BACKEND
Paquete generado el: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')

## Ficheros incluidos:

"@

foreach ($folder in $folders) {
    $verificacionContenido += "`n### Carpeta $folder`n"
    $files = Get-ChildItem -Path "$TargetFolder\$folder" -Recurse | Select-Object FullName, Length
    foreach ($file in $files) {
        $relativePath = $file.FullName.Replace("$TargetFolder\", "")
        $sizeKB = [Math]::Round($file.Length / 1KB, 2)
        $verificacionContenido += "- $relativePath ($sizeKB KB)`n"
    }
}

$verificacionContenido | Out-File -FilePath "$TargetFolder\VERIFICACION.md" -Encoding utf8 -Force

# Comprimir todo para facilitar la transferencia
Write-Host "`nComprimiendo todo el paquete para facilitar la transferencia..." -ForegroundColor Green
Compress-Archive -Path "$TargetFolder\*" -DestinationPath "$TargetFolder\masclet_backend_despliegue_ramon_$fecha.zip" -Force
Write-Host "  → Paquete comprimido: masclet_backend_despliegue_ramon_$fecha.zip" -ForegroundColor White

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "   PAQUETE DE DESPLIEGUE PARA RAMÓN COMPLETADO" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Ubicación: $TargetFolder" -ForegroundColor Yellow
Write-Host "Archivo ZIP: $TargetFolder\masclet_backend_despliegue_ramon_$fecha.zip" -ForegroundColor Yellow
Write-Host "Instrucciones: $TargetFolder\README.md" -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Cyan
