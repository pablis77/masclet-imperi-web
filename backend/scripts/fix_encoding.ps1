# Verificar permisos de administrador
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "Este script necesita permisos de administrador"
    exit 1
}

$postgresPath = "C:\Program Files\PostgreSQL\17\data"
$postgresqlConf = Join-Path $postgresPath "postgresql.conf"

Write-Host "Configurando encoding PostgreSQL..." -ForegroundColor Green

try {
    # Detener PostgreSQL
    Stop-Service postgresql-x64-17
    Start-Sleep -Seconds 5

    # Añadir configuración de encoding
    $encodingConfig = @"

# Encoding Settings
client_encoding = 'WIN1252'
lc_messages = 'Spanish_Spain.1252'
lc_monetary = 'Spanish_Spain.1252'
lc_numeric = 'Spanish_Spain.1252'
lc_time = 'Spanish_Spain.1252'
"@
    Add-Content $postgresqlConf $encodingConfig
    Write-Host "✓ Encoding configurado" -ForegroundColor Green

    # Reiniciar PostgreSQL
    Start-Service postgresql-x64-17
    Start-Sleep -Seconds 10
    Write-Host "✓ PostgreSQL reiniciado" -ForegroundColor Green
}
catch {
    Write-Error "Error: $_"
    exit 1
}