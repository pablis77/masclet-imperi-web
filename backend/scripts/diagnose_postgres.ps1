# Set output encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Verificar permisos de administrador
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Error "Este script necesita permisos de administrador"
    exit 1
}

Write-Host "`nDiagnostico de PostgreSQL..." -ForegroundColor Yellow

# Verificar servicio
$service = Get-Service postgresql-x64-17
$serviceStatus = if ($service.Status -eq 'Running') { "[OK] Ejecutandose" } else { "[X] Detenido" }
$serviceColor = if ($service.Status -eq 'Running') { "Green" } else { "Red" }
Write-Host "`nServicio PostgreSQL: $serviceStatus" -ForegroundColor $serviceColor

# Variables de estado
$configOk = $false
$hbaOk = $false

# Verificar postgresql.conf
$postgresqlConf = "C:\Program Files\PostgreSQL\17\data\postgresql.conf"
Write-Host "`nVerificando postgresql.conf:" -ForegroundColor Yellow
if (Test-Path $postgresqlConf) {
    $config = Get-Content $postgresqlConf -Raw -Encoding UTF8
    $configOk = $config -match "listen_addresses\s*=\s*'*\*'*"
    $configStatus = if ($configOk) { "[OK] Configuracion correcta" } else { "[X] Configuracion incorrecta" }
    $configColor = if ($configOk) { "Green" } else { "Red" }
    Write-Host $configStatus -ForegroundColor $configColor
} else {
    Write-Host "[X] Archivo no encontrado" -ForegroundColor Red
}

# Verificar pg_hba.conf
$pgHbaConf = "C:\Program Files\PostgreSQL\17\data\pg_hba.conf"
Write-Host "`nVerificando pg_hba.conf:" -ForegroundColor Yellow
if (Test-Path $pgHbaConf) {
    $hbaConfig = Get-Content $pgHbaConf -Raw -Encoding UTF8
    $hbaOk = $hbaConfig -match "host\s+all\s+all\s+127\.0\.0\.1/32\s+trust"
    $hbaStatus = if ($hbaOk) { "[OK] Configuracion correcta" } else { "[X] Configuracion incorrecta" }
    $hbaColor = if ($hbaOk) { "Green" } else { "Red" }
    Write-Host $hbaStatus -ForegroundColor $hbaColor
} else {
    Write-Host "[X] Archivo no encontrado" -ForegroundColor Red
}

# Verificar puerto
Write-Host "`nVerificando puerto 5432:" -ForegroundColor Yellow
$testPort = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
$portStatus = if ($testPort.TcpTestSucceeded) { "[OK] Puerto accesible" } else { "[X] Puerto no accesible" }
$portColor = if ($testPort.TcpTestSucceeded) { "Green" } else { "Red" }
Write-Host $portStatus -ForegroundColor $portColor

# Estado general
$allOk = $service.Status -eq 'Running' -and $configOk -and $hbaOk -and $testPort.TcpTestSucceeded

Write-Host "`nEstado general:" -ForegroundColor Yellow
$finalStatus = if ($allOk) { "[OK] Todo correcto" } else { "[X] Hay problemas que requieren atencion" }
$finalColor = if ($allOk) { "Green" } else { "Red" }
Write-Host $finalStatus -ForegroundColor $finalColor

Write-Host "`nDiagnostico completado.`n" -ForegroundColor Blue