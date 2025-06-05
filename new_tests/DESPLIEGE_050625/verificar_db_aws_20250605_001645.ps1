# Script de verificación de base de datos AWS para Masclet Imperi
# Fecha: 05/06/2025 00:16:45

# Parámetros de conexión
$keyPath = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$serverIP = "108.129.139.119"
$dbUser = "admin"
$dbPassword = "admin123"
$dbName = "masclet_imperi"

Write-Host "===== VERIFICACIÓN DE DESPLIEGUE AWS MASCLET IMPERI =====" -ForegroundColor Green
Write-Host "Fecha y hora: $(Get-Date)" -ForegroundColor Yellow
Write-Host ""

# 1. Verificar conectividad SSH
Write-Host "1. Verificando conectividad SSH..." -ForegroundColor Cyan
$sshTest = ssh -i $keyPath ec2-user@$serverIP "echo 'Conexión SSH establecida'"
if ($sshTest -eq "Conexión SSH establecida") {
    Write-Host "   ✓ Conexión SSH OK" -ForegroundColor Green
}
else {
    Write-Host "   ✗ Problema con la conexión SSH" -ForegroundColor Red
    exit
}

# 2. Verificar contenedores Docker
Write-Host "2. Verificando contenedores Docker..." -ForegroundColor Cyan
$dockerContainers = ssh -i $keyPath ec2-user@$serverIP "docker ps -a"
Write-Host $dockerContainers

# Analizar el estado de los contenedores
if ($dockerContainers -match "masclet-db") {
    Write-Host "   ✓ Contenedor masclet-db encontrado" -ForegroundColor Green
}
else {
    Write-Host "   ✗ Contenedor masclet-db NO encontrado" -ForegroundColor Red
}

if ($dockerContainers -match "masclet-backend") {
    Write-Host "   ✓ Contenedor masclet-backend encontrado" -ForegroundColor Green
}
else {
    Write-Host "   ✗ Contenedor masclet-backend NO encontrado" -ForegroundColor Red
}

if ($dockerContainers -match "masclet-frontend") {
    Write-Host "   ✓ Contenedor masclet-frontend encontrado" -ForegroundColor Green
}
else {
    Write-Host "   ✗ Contenedor masclet-frontend NO encontrado" -ForegroundColor Red
}

# 3. Verificar salud de la base de datos
Write-Host "3. Verificando salud de la base de datos..." -ForegroundColor Cyan
$dbHealth = ssh -i $keyPath ec2-user@$serverIP "docker exec masclet-db pg_isready -U $dbUser"
Write-Host "   $dbHealth"

# 4. Consultar tablas y conteos
Write-Host "4. Consultando estructura de la base de datos..." -ForegroundColor Cyan

# Listar tablas
$tables = ssh -i $keyPath ec2-user@$serverIP "docker exec -i masclet-db psql -U $dbUser -d $dbName -c '\dt'"
Write-Host "   Tablas en la base de datos:" -ForegroundColor Yellow
Write-Host $tables

# Conteo de registros
Write-Host "   Conteo de registros por tabla:" -ForegroundColor Yellow
$countAnimals = ssh -i $keyPath ec2-user@$serverIP "docker exec -i masclet-db psql -U $dbUser -d $dbName -c 'SELECT COUNT(*) FROM animal;'"
Write-Host "   Animales: $countAnimals"

$countPartos = ssh -i $keyPath ec2-user@$serverIP "docker exec -i masclet-db psql -U $dbUser -d $dbName -c 'SELECT COUNT(*) FROM parto;'"
Write-Host "   Partos: $countPartos"

$countUsuarios = ssh -i $keyPath ec2-user@$serverIP "docker exec -i masclet-db psql -U $dbUser -d $dbName -c 'SELECT COUNT(*) FROM usuario;'"
Write-Host "   Usuarios: $countUsuarios" 

$countExplotaciones = ssh -i $keyPath ec2-user@$serverIP "docker exec -i masclet-db psql -U $dbUser -d $dbName -c 'SELECT COUNT(*) FROM explotacio;'"
Write-Host "   Explotaciones: $countExplotaciones"

# 5. Muestra de datos (limitada por seguridad)
Write-Host "5. Muestra de datos de ejemplo..." -ForegroundColor Cyan

# Usuarios (sin contraseñas)
$userSample = ssh -i $keyPath ec2-user@$serverIP "docker exec -i masclet-db psql -U $dbUser -d $dbName -c 'SELECT id, username, email, is_active, is_superuser FROM usuario LIMIT 3;'"
Write-Host "   Muestra de usuarios:" -ForegroundColor Yellow
Write-Host $userSample

# Animales
$animalSample = ssh -i $keyPath ec2-user@$serverIP "docker exec -i masclet-db psql -U $dbUser -d $dbName -c 'SELECT id, nom, explotacio, genere, estado FROM animal LIMIT 3;'"
Write-Host "   Muestra de animales:" -ForegroundColor Yellow
Write-Host $animalSample

# 6. Estado y logs del contenedor de base de datos
Write-Host "6. Últimos logs de la base de datos..." -ForegroundColor Cyan
$dbLogs = ssh -i $keyPath ec2-user@$serverIP "docker logs --tail 10 masclet-db"
Write-Host $dbLogs

# 7. Verificar espacio en disco
Write-Host "7. Espacio en disco disponible..." -ForegroundColor Cyan
$diskSpace = ssh -i $keyPath ec2-user@$serverIP "df -h"
Write-Host $diskSpace

# 8. Comandos útiles para el administrador
Write-Host "`nCOMANDOS ÚTILES PARA GESTIONAR LA BASE DE DATOS:" -ForegroundColor Magenta
Write-Host "- Reiniciar contenedor de base de datos: ssh -i $keyPath ec2-user@$serverIP 'docker restart masclet-db'" -ForegroundColor Yellow
Write-Host "- Ver logs completos: ssh -i $keyPath ec2-user@$serverIP 'docker logs masclet-db'" -ForegroundColor Yellow
Write-Host "- Entrar al shell de PostgreSQL: ssh -i $keyPath ec2-user@$serverIP 'docker exec -it masclet-db psql -U $dbUser -d $dbName'" -ForegroundColor Yellow
Write-Host "- Backup de la base de datos: ssh -i $keyPath ec2-user@$serverIP 'docker exec masclet-db pg_dump -U $dbUser $dbName > backup_$(Get-Date -Format "yyyyMMdd").sql'" -ForegroundColor Yellow

Write-Host "`n===== FIN DE LA VERIFICACIÓN =====" -ForegroundColor Green