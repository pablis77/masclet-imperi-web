# Script PowerShell para verificar la base de datos en AWS
# Fecha: 04/06/2025

# Definir colores para mejor visualización
function Write-ColorOutput($ForegroundColor) {
    # Guardar los colores originales
    $originalForegroundColor = $host.UI.RawUI.ForegroundColor
    
    # Establecer los nuevos colores
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    
    # Llamada a Write-Output
    if ($args) {
        Write-Output $args
    }
    else {
        # Input de la tubería
        $input | Write-Output
    }
    
    # Restaurar los colores originales
    $host.UI.RawUI.ForegroundColor = $originalForegroundColor
}

function Print-Header($text) {
    Write-ColorOutput Blue ("=" * 70)
    Write-ColorOutput Blue " $text"
    Write-ColorOutput Blue ("=" * 70)
}

# Rutas y configuraciones
$KeyPath = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$RemoteHost = "ec2-user@108.129.139.119"
$ContentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SqlFile = Join-Path $ContentDir "check_db.sql"

Print-Header "VALIDACIÓN DE BASE DE DATOS AWS"
Write-Output "Realizando conexión SSH a AWS para verificar la base de datos..."
Write-Output ""

# 1. Comprobar el estado de los contenedores
Write-Output "Verificando estado de los contenedores Docker..."
ssh -i $KeyPath $RemoteHost "docker ps -a | grep masclet"

# 2. Verificar espacio en disco y estado del sistema
Write-Output "`nVerificando espacio en disco en el servidor..."
ssh -i $KeyPath $RemoteHost "df -h | grep -E '/$|/var'"

# 3. Ejecutar consulta SQL para verificar la base de datos
Write-Output "`nVerificando estructura y datos de la base de datos..."

# Cargar el contenido del archivo SQL
$sqlContent = Get-Content $SqlFile -Raw

# Enviar a través de SSH
Write-Output "Ejecutando consultas SQL en la base de datos remota..."
$sqlContent | ssh -i $KeyPath $RemoteHost "docker exec -i masclet-db psql -U postgres -d masclet_imperi"

Write-Output "`nVerificación de base de datos completada."

# 4. Verificar logs del contenedor de la base de datos
Write-Output "`nÚltimos logs del contenedor de la base de datos:"
ssh -i $KeyPath $RemoteHost "docker logs --tail 20 masclet-db"

# 5. Información sobre acciones posibles
Print-Header "ACCIONES POSIBLES"
Write-Output "Si la base de datos está correcta y tiene los datos necesarios, se debe preservar."
Write-Output "En caso contrario, puedes resetearla utilizando los scripts apropiados."
Write-Output ""
Write-Output "Comandos útiles:"
Write-Output "1. Reiniciar contenedor DB: ssh -i $KeyPath $RemoteHost 'docker restart masclet-db'"
Write-Output "2. Ver estado de conexión: ssh -i $KeyPath $RemoteHost `"docker exec masclet-db pg_isready -U postgres`""
