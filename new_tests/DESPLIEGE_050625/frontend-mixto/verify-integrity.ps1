# Script para verificar integridad de archivos críticos durante el despliegue
param (
    [string]$remoteHost = "34.253.203.194",
    [string]$remoteUser = "ec2-user",
    [string]$keyPath = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem",
    [string]$deploySourceDir = "C:\Proyectos\claude\masclet-imperi-web",
    [string]$remoteDeployDir = "~/masclet-imperi-web-deploy"
)

# Colores para mejorar la legibilidad
$colorSuccess = [ConsoleColor]::Green
$colorWarning = [ConsoleColor]::Yellow
$colorError = [ConsoleColor]::Red
$colorInfo = [ConsoleColor]::Cyan

# Función para mostrar mensajes con formato
function Write-ColorMessage {
    param (
        [string]$message,
        [ConsoleColor]$color,
        [switch]$noNewLine
    )
    
    if ($noNewLine) {
        Write-Host $message -ForegroundColor $color -NoNewLine
    }
    else {
        Write-Host $message -ForegroundColor $color
    }
}

# Función para ejecutar comandos SSH
function Invoke-SshCommand {
    param (
        [string]$command
    )
    
    Write-ColorMessage "Ejecutando: $command" $colorInfo -noNewLine
    Write-Host ""
    
    $output = ssh -i $keyPath "${remoteUser}@${remoteHost}" $command
    
    return $output
}

# Lista de archivos críticos para verificar
$filesToVerify = @(
    "docker-compose.yml",
    "node.Dockerfile",
    "nginx.Dockerfile",
    "nginx.conf",
    "docker-diagnose.js",
    "docker-api-injector.js",
    "docker-api-injection.html",
    "client/index.html",
    "server/entry.mjs"
)

Write-ColorMessage "===== VERIFICACIÓN DE INTEGRIDAD DE ARCHIVOS =====" $colorSuccess

$totalFiles = $filesToVerify.Count
$validFiles = 0
$failedFiles = 0

foreach ($file in $filesToVerify) {
    Write-ColorMessage "Verificando archivo: $file" $colorInfo -noNewLine
    
    # Comprobamos primero si el archivo existe localmente
    if (-not (Test-Path "$deploySourceDir\$file")) {
        Write-ColorMessage " [❌ ERROR: No encontrado localmente]" $colorError
        $failedFiles++
        continue
    }
    
    # Calcular hash local
    $localHash = (Get-FileHash -Algorithm MD5 -Path "$deploySourceDir\$file").Hash
    
    # Calcular hash remoto (asegurarse de que existe)
    $remoteExists = Invoke-SshCommand "test -f $remoteDeployDir/$file && echo exists || echo missing"
    
    if ($remoteExists -eq "missing") {
        Write-ColorMessage " [❌ ERROR: No encontrado en servidor]" $colorError
        $failedFiles++
        continue
    }
    
    $remoteHash = Invoke-SshCommand "md5sum $remoteDeployDir/$file | awk '{print \`$1}'"
    
    # Comparar hashes
    if ($localHash -eq $remoteHash) {
        Write-ColorMessage " [✅ OK]" $colorSuccess
        $validFiles++
    } else {
        Write-ColorMessage " [❌ ERROR: Hash no coincide]" $colorError
        Write-ColorMessage "  Local:  $localHash" $colorWarning
        Write-ColorMessage "  Remoto: $remoteHash" $colorWarning
        
        # Preguntar si transferir de nuevo
        Write-ColorMessage "¿Transferir archivo de nuevo? (s/n): " $colorWarning -noNewLine
        $respuesta = Read-Host
        
        if ($respuesta -eq "s" -or $respuesta -eq "S") {
            Write-ColorMessage "Transfiriendo archivo..." $colorInfo
            scp -i $keyPath "$deploySourceDir\$file" "${remoteUser}@${remoteHost}:$remoteDeployDir/$file"
            
            # Verificar de nuevo
            $newRemoteHash = Invoke-SshCommand "md5sum $remoteDeployDir/$file | awk '{print \`$1}'"
            
            if ($localHash -eq $newRemoteHash) {
                Write-ColorMessage "  ✅ Archivo transferido correctamente" $colorSuccess
                $validFiles++
            } else {
                Write-ColorMessage "  ❌ ERROR: La transferencia no solucionó el problema" $colorError
                $failedFiles++
            }
        } else {
            $failedFiles++
        }
    }
}

# Mostrar resumen
Write-ColorMessage "`nRESUMEN DE VERIFICACIÓN:" $colorSuccess
Write-ColorMessage "✅ Archivos correctos: $validFiles de $totalFiles" $colorSuccess
if ($failedFiles -gt 0) {
    Write-ColorMessage "❌ Archivos con problemas: $failedFiles de $totalFiles" $colorError
    Write-ColorMessage "Se recomienda resolver estos problemas antes de continuar" $colorWarning
} else {
    Write-ColorMessage "¡Todos los archivos críticos están correctos!" $colorSuccess
}
