#!/bin/bash
# Script para probar los scripts de mantenimiento
# Ubicación: backend/docker/scripts/test_maintenance.sh

set -e

# Configuración
TEST_DIR="/app/tests/maintenance"
LOG_DIR="/logs/tests/maintenance"
SCRIPTS_DIR="/app/scripts"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Scripts a testear
declare -A SCRIPTS=(
    ["init_maintenance.sh"]="Inicialización del sistema"
    ["maintenance_manager.sh"]="Gestión de mantenimiento"
    ["setup_permissions.sh"]="Configuración de permisos"
    ["setup_monitoring.sh"]="Configuración de monitorización"
    ["setup_notifications.sh"]="Configuración de notificaciones"
    ["setup_recovery.sh"]="Configuración de recuperación"
    ["network_check.sh"]="Verificación de red"
    ["check_system.sh"]="Verificación del sistema"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/test_${TIMESTAMP}.log"
}

# Preparar entorno de pruebas
setup_test_environment() {
    log_message "INFO" "Preparando entorno de pruebas..."
    
    # Crear directorios de test
    mkdir -p "$TEST_DIR"/{data,logs,config,temp}
    mkdir -p "$LOG_DIR"
    
    # Crear datos de prueba
    echo "test_data" > "$TEST_DIR/data/test.txt"
    chmod 644 "$TEST_DIR/data/test.txt"
    
    # Crear usuario de prueba
    useradd -M -s /bin/false test_user 2>/dev/null || true
    
    # Exportar variables de test
    export TEST_MODE="true"
    export TEST_DIR
}

# Limpiar entorno de pruebas
cleanup_test_environment() {
    log_message "INFO" "Limpiando entorno de pruebas..."
    
    # Eliminar directorios de test
    rm -rf "$TEST_DIR"
    
    # Eliminar usuario de test
    userdel test_user 2>/dev/null || true
    
    # Limpiar variables
    unset TEST_MODE
    unset TEST_DIR
}

# Test de script individual
test_script() {
    local script="$1"
    local description="$2"
    local test_output
    local exit_code=0
    
    log_message "INFO" "Testing $script: $description"
    
    # Verificar existencia del script
    if [ ! -f "$SCRIPTS_DIR/$script" ]; then
        log_message "ERROR" "Script no encontrado: $script"
        return 1
    fi
    
    # Verificar permisos
    if [ ! -x "$SCRIPTS_DIR/$script" ]; then
        log_message "ERROR" "Script no ejecutable: $script"
        return 1
    }
    
    # Ejecutar script con output redirigido
    test_output=$(bash -x "$SCRIPTS_DIR/$script" 2>&1) || exit_code=$?
    
    # Verificar resultado
    if [ $exit_code -eq 0 ]; then
        log_message "SUCCESS" "Test exitoso para $script"
        echo "$test_output" >> "$LOG_DIR/success_${script%.*}_${TIMESTAMP}.log"
    else
        log_message "ERROR" "Test fallido para $script (código: $exit_code)"
        echo "$test_output" >> "$LOG_DIR/error_${script%.*}_${TIMESTAMP}.log"
    fi
    
    return $exit_code
}

# Verificar dependencias
check_dependencies() {
    local missing_deps=0
    
    # Comandos requeridos
    local required_commands=(
        "bash"
        "useradd"
        "userdel"
        "chmod"
        "chown"
        "mkdir"
        "rm"
    )
    
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &>/dev/null; then
            log_message "ERROR" "Comando requerido no encontrado: $cmd"
            ((missing_deps++))
        fi
    done
    
    return $missing_deps
}

# Generar reporte de pruebas
generate_test_report() {
    local total_tests="$1"
    local passed_tests="$2"
    local report_file="$LOG_DIR/report_${TIMESTAMP}.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Pruebas de Mantenimiento</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        .summary { font-size: 1.2em; margin: 20px 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Reporte de Pruebas de Mantenimiento</h1>
    <p>Fecha: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <div class="summary">
        <p>Total de pruebas: $total_tests</p>
        <p>Pruebas exitosas: $passed_tests</p>
        <p>Pruebas fallidas: $((total_tests - passed_tests))</p>
    </div>
    
    <h2>Resultados Detallados</h2>
    <table>
        <tr>
            <th>Script</th>
            <th>Descripción</th>
            <th>Resultado</th>
        </tr>
EOF
    
    # Añadir resultados de cada script
    for script in "${!SCRIPTS[@]}"; do
        local result
        if [ -f "$LOG_DIR/success_${script%.*}_${TIMESTAMP}.log" ]; then
            result="<span class='success'>✓ Exitoso</span>"
        else
            result="<span class='error'>✗ Fallido</span>"
        fi
        
        cat >> "$report_file" << EOF
        <tr>
            <td>$script</td>
            <td>${SCRIPTS[$script]}</td>
            <td>$result</td>
        </tr>
EOF
    done
    
    cat >> "$report_file" << EOF
    </table>
    
    <h2>Logs de Error</h2>
    <pre>
$(find "$LOG_DIR" -name "error_*_${TIMESTAMP}.log" -type f -exec cat {} \;)
    </pre>
</body>
</html>
EOF
}

# Función principal
main() {
    log_message "INFO" "Iniciando pruebas de mantenimiento..."
    
    # Verificar dependencias
    if ! check_dependencies; then
        log_message "ERROR" "Faltan dependencias requeridas"
        exit 1
    fi
    
    # Preparar entorno
    setup_test_environment
    
    local total_tests=${#SCRIPTS[@]}
    local passed_tests=0
    
    # Ejecutar pruebas
    for script in "${!SCRIPTS[@]}"; do
        if test_script "$script" "${SCRIPTS[$script]}"; then
            ((passed_tests++))
        fi
    done
    
    # Generar reporte
    generate_test_report "$total_tests" "$passed_tests"
    
    # Limpiar entorno
    cleanup_test_environment
    
    # Resumen final
    log_message "INFO" "Pruebas completadas. Exitosas: $passed_tests/$total_tests"
    
    # Retornar estado
    [ "$passed_tests" -eq "$total_tests" ]
}

# Manejo de errores
trap 'log_message "ERROR" "Error en línea $LINENO: $BASH_COMMAND"' ERR

# Verificar usuario root
if [ "$(id -u)" != "0" ]; then
    log_message "ERROR" "Este script debe ejecutarse como root"
    exit 1
fi

# Ejecutar script
main "$@"