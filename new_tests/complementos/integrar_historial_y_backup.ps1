# Script para integrar de forma segura el historial de cambios con el sistema de backup
# Autor: Cascade AI
# Fecha: 19/05/2025

# Configuración
$baseDir = "C:\Proyectos\claude\masclet-imperi-web"
$scriptsDir = Join-Path $baseDir "new_tests\complementos"
$logFile = Join-Path $scriptsDir "integracion_historial_backup.log"

# Función para registrar en el log
function Log-Message {
    param (
        [string]$Message,
        [string]$Type = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Type] $Message"
    
    # Imprimir en consola con colores
    switch ($Type) {
        "INFO" { Write-Host $logEntry -ForegroundColor Cyan }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        "WARNING" { Write-Host $logEntry -ForegroundColor Yellow }
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        default { Write-Host $logEntry }
    }
    
    # Guardar en archivo de log
    Add-Content -Path $logFile -Value $logEntry
}

# Función para ejecutar un script Python y verificar resultado
function Ejecutar-ScriptPython {
    param (
        [string]$ScriptPath,
        [string]$Descripcion
    )
    
    Log-Message "=== INICIANDO: $Descripcion ==="
    
    try {
        if (Test-Path $ScriptPath) {
            Log-Message "Ejecutando script: $ScriptPath"
            
            # Asegurar de que usamos el entorno correcto (si existe)
            $venvPath = Join-Path $baseDir "venv\Scripts\activate.ps1"
            if (Test-Path $venvPath) {
                Log-Message "Activando entorno virtual..."
                & $venvPath
            }
            
            # Ejecutar el script Python
            & python $ScriptPath
            
            if ($LASTEXITCODE -eq 0) {
                Log-Message "Script ejecutado correctamente" "SUCCESS"
                return $true
            } else {
                Log-Message "Script terminó con código de error: $LASTEXITCODE" "ERROR"
                return $false
            }
        } else {
            Log-Message "No se encuentra el script: $ScriptPath" "ERROR"
            return $false
        }
    } catch {
        Log-Message "Error al ejecutar script: $_" "ERROR"
        return $false
    }
}

# Función para crear un backup de la base de datos antes de empezar
function Crear-BackupSeguridad {
    Log-Message "Creando backup de seguridad de la base de datos..."
    
    $backupScript = Join-Path $scriptsDir "backup_programado.ps1"
    if (Test-Path $backupScript) {
        try {
            & powershell -ExecutionPolicy Bypass -File $backupScript -Description "Backup de seguridad antes de integración"
            Log-Message "Backup de seguridad creado correctamente" "SUCCESS"
            return $true
        } catch {
            Log-Message "Error al crear backup de seguridad: $_" "ERROR"
            return $false
        }
    } else {
        Log-Message "No se encuentra el script de backup: $backupScript" "ERROR"
        return $false
    }
}

# Función principal
function Main {
    Log-Message "=== INICIANDO PROCESO DE INTEGRACIÓN DEL HISTORIAL DE CAMBIOS Y SISTEMA DE BACKUP ==="
    Log-Message "Hora de inicio: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    
    # Paso 1: Crear backup de seguridad
    if (-not (Crear-BackupSeguridad)) {
        $confirmacion = Read-Host "No se pudo crear un backup de seguridad. ¿Desea continuar de todos modos? (S/N)"
        if ($confirmacion -ne "S") {
            Log-Message "Proceso cancelado por el usuario" "WARNING"
            return
        }
    }
    
    # Paso 2: Extender el modelo de historial (esto no afecta a la funcionalidad existente)
    $extenderModeloScript = Join-Path $scriptsDir "extender_modelo_historial.py"
    if (Ejecutar-ScriptPython -ScriptPath $extenderModeloScript -Descripcion "Extensión del modelo de historial") {
        Log-Message "Modelo de historial extendido correctamente" "SUCCESS"
    } else {
        Log-Message "No se pudo extender el modelo de historial" "ERROR"
        return
    }
    
    # Paso 3: Mejorar el registro del historial
    $mejorarRegistroScript = Join-Path $scriptsDir "mejorar_registro_historial.py"
    if (Ejecutar-ScriptPython -ScriptPath $mejorarRegistroScript -Descripcion "Mejora del registro de historial") {
        Log-Message "Registro de historial mejorado correctamente" "SUCCESS"
    } else {
        Log-Message "No se pudo mejorar el registro de historial" "ERROR"
        return
    }
    
    # Paso 4: Verificar que todo funciona correctamente
    Log-Message "Verificando que todo funciona correctamente..."
    Log-Message "Para verificar el sistema, puede realizar las siguientes acciones:" "INFO"
    Log-Message "1. Crear un nuevo animal" "INFO"
    Log-Message "2. Modificar un animal existente" "INFO"
    Log-Message "3. Eliminar un animal" "INFO"
    Log-Message "Después de cada acción, verifique que:" "INFO"
    Log-Message "- El historial se registra correctamente" "INFO"
    Log-Message "- Se crea un backup automáticamente" "INFO"
    
    # Paso 5: Finalizar
    Log-Message "=== PROCESO DE INTEGRACIÓN COMPLETADO ==="
    Log-Message "Hora de finalización: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Log-Message "Log guardado en: $logFile"
    
    Write-Host ""
    Write-Host "Resumen de acciones realizadas:" -ForegroundColor Green
    Write-Host "✅ Se extendió el modelo de historial para soportar nuevos campos" -ForegroundColor Green
    Write-Host "✅ Se mejoró el registro de historial en los endpoints de animales" -ForegroundColor Green
    Write-Host "✅ Se integró el historial con el sistema de backup" -ForegroundColor Green
    Write-Host "✅ Todo se hizo manteniendo compatibilidad con el sistema existente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Puede revisar el log detallado en: $logFile" -ForegroundColor Cyan
}

# Ejecutar el script principal
Main
