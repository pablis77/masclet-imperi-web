# Verificar permisos de administrador
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "Este script necesita permisos de administrador"
    exit 1
}

$postgresPath = "C:\Program Files\PostgreSQL\17\data"
$postgresqlConf = Join-Path $postgresPath "postgresql.conf"
$pgHbaConf = Join-Path $postgresPath "pg_hba.conf"

try {
    Write-Host "Configurando PostgreSQL..." -ForegroundColor Green
    
    # Crear backup de los archivos
    Copy-Item $postgresqlConf "$postgresqlConf.bak" -Force
    Copy-Item $pgHbaConf "$pgHbaConf.bak" -Force
    Write-Host "✓ Backup creado" -ForegroundColor Green
    
    # Modificar postgresql.conf
    $config = Get-Content $postgresqlConf
    $config = $config -replace "^#?listen_addresses.*$", "listen_addresses = '*'"
    $config = $config -replace "^#?max_connections.*$", "max_connections = 100"
    $config | Set-Content $postgresqlConf
    Write-Host "✓ postgresql.conf actualizado" -ForegroundColor Green
    
    # Modificar pg_hba.conf
    $hbaConfig = @"
# TYPE  DATABASE        USER            ADDRESS                 METHOD
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
host    all             all             0.0.0.0/0               trust
# IPv6 local connections:
host    all             all             ::1/128                 trust
"@
    Set-Content $pgHbaConf $hbaConfig
    Write-Host "✓ pg_hba.conf actualizado" -ForegroundColor Green
    
    # Detener PostgreSQL
    Write-Host "Deteniendo PostgreSQL..." -ForegroundColor Yellow
    Stop-Service postgresql-x64-17
    Start-Sleep -Seconds 5
    
    # Iniciar PostgreSQL
    Write-Host "Iniciando PostgreSQL..." -ForegroundColor Yellow
    Start-Service postgresql-x64-17
    Start-Sleep -Seconds 5
    
    # Verificar estado del servicio
    $service = Get-Service postgresql-x64-17
    if ($service.Status -eq 'Running') {
        Write-Host "✓ PostgreSQL reiniciado correctamente" -ForegroundColor Green
    } else {
        throw "PostgreSQL no se inició correctamente"
    }
    
    Write-Host "`nConfiguración completada con éxito" -ForegroundColor Green
}
catch {
    Write-Error "Error: $_"
    # Restaurar backups si hay error
    if (Test-Path "$postgresqlConf.bak") {
        Copy-Item "$postgresqlConf.bak" $postgresqlConf -Force
        Copy-Item "$pgHbaConf.bak" $pgHbaConf -Force
        Write-Host "Backups restaurados" -ForegroundColor Yellow
    }
    exit 1
}