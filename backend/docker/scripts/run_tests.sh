#!/bin/bash
# Script para ejecución de pruebas automatizadas
# Ubicación: backend/docker/scripts/run_tests.sh

set -e

# Configuración
TEST_DIR="/app/tests"
LOG_DIR="/logs/tests"
REPORT_DIR="/app/reports/tests"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Tipos de pruebas
declare -A TEST_TYPES=(
    ["unit"]="tests/unit"
    ["integration"]="tests/integration"
    ["api"]="tests/api"
    ["e2e"]="tests/e2e"
    ["performance"]="tests/performance"
)

# Configuración de cobertura
declare -A COVERAGE_THRESHOLDS=(
    ["lines"]="85"
    ["branches"]="75"
    ["functions"]="90"
    ["statements"]="85"
)

# Configuración de pytest
PYTEST_ARGS=(
    "--verbosity=2"
    "--showlocals"
    "--cov=app"
    "--cov-report=html:${REPORT_DIR}/coverage"
    "--cov-report=term"
    "--junitxml=${REPORT_DIR}/junit/test-results.xml"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/tests_${TIMESTAMP}.log"
}

# Preparar entorno de pruebas
setup_test_env() {
    log_message "INFO" "Preparando entorno de pruebas..."
    
    # Crear directorios necesarios
    mkdir -p "$TEST_DIR" "$LOG_DIR" "$REPORT_DIR"/{coverage,junit,reports}
    
    # Configurar base de datos de prueba
    export POSTGRES_DB="test_masclet_imperi"
    export POSTGRES_USER="postgres"
    export POSTGRES_PASSWORD="test1234"
    
    # Crear base de datos de prueba
    psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS $POSTGRES_DB"
    psql -h localhost -U postgres -c "CREATE DATABASE $POSTGRES_DB"
    
    # Aplicar migraciones
    aerich upgrade
    
    # Cargar datos de prueba
    python manage.py load_test_data
    
    return 0
}

# Ejecutar pruebas unitarias
run_unit_tests() {
    log_message "INFO" "Ejecutando pruebas unitarias..."
    
    pytest "${PYTEST_ARGS[@]}" "${TEST_TYPES[unit]}"
    local status=$?
    
    if [ $status -eq 0 ]; then
        log_message "SUCCESS" "Pruebas unitarias completadas"
    else
        log_message "ERROR" "Pruebas unitarias fallaron"
    fi
    
    return $status
}

# Ejecutar pruebas de integración
run_integration_tests() {
    log_message "INFO" "Ejecutando pruebas de integración..."
    
    pytest "${PYTEST_ARGS[@]}" "${TEST_TYPES[integration]}"
    local status=$?
    
    if [ $status -eq 0 ]; then
        log_message "SUCCESS" "Pruebas de integración completadas"
    else
        log_message "ERROR" "Pruebas de integración fallaron"
    fi
    
    return $status
}

# Ejecutar pruebas API
run_api_tests() {
    log_message "INFO" "Ejecutando pruebas de API..."
    
    pytest "${PYTEST_ARGS[@]}" "${TEST_TYPES[api]}"
    local status=$?
    
    if [ $status -eq 0 ]; then
        log_message "SUCCESS" "Pruebas de API completadas"
    else
        log_message "ERROR" "Pruebas de API fallaron"
    fi
    
    return $status
}

# Ejecutar pruebas end-to-end
run_e2e_tests() {
    log_message "INFO" "Ejecutando pruebas end-to-end..."
    
    # Iniciar servicios necesarios
    docker-compose up -d db api
    
    # Esperar a que los servicios estén listos
    sleep 10
    
    pytest "${PYTEST_ARGS[@]}" "${TEST_TYPES[e2e]}"
    local status=$?
    
    if [ $status -eq 0 ]; then
        log_message "SUCCESS" "Pruebas end-to-end completadas"
    else
        log_message "ERROR" "Pruebas end-to-end fallaron"
    fi
    
    # Detener servicios
    docker-compose down
    
    return $status
}

# Verificar cobertura
check_coverage() {
    log_message "INFO" "Verificando cobertura..."
    
    local coverage_report="${REPORT_DIR}/coverage/index.html"
    if [ ! -f "$coverage_report" ]; then
        log_message "ERROR" "Reporte de cobertura no encontrado"
        return 1
    fi
    
    # Verificar umbrales
    local failed=0
    for metric in "${!COVERAGE_THRESHOLDS[@]}"; do
        local threshold="${COVERAGE_THRESHOLDS[$metric]}"
        local coverage
        coverage=$(grep "$metric" "$coverage_report" | awk '{print $2}' | tr -d '%')
        
        if [ -z "$coverage" ] || [ "$coverage" -lt "$threshold" ]; then
            log_message "ERROR" "Cobertura de $metric ($coverage%) por debajo del umbral ($threshold%)"
            ((failed++))
        fi
    done
    
    return $failed
}

# Generar reporte de pruebas
generate_test_report() {
    log_message "INFO" "Generando reporte de pruebas..."
    local report_file="$REPORT_DIR/reports/test_report_${TIMESTAMP}.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Pruebas</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Reporte de Pruebas</h1>
    <p>Generado: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>Resumen</h2>
    <table>
        <tr>
            <th>Tipo</th>
            <th>Total</th>
            <th>Pasaron</th>
            <th>Fallaron</th>
            <th>Cobertura</th>
        </tr>
EOF
    
    # Añadir resultados
    for type in "${!TEST_TYPES[@]}"; do
        local total passed failed coverage
        total=$(grep -c "test_.*" "${TEST_TYPES[$type]}/test_*.py" 2>/dev/null || echo 0)
        passed=$(grep -c "PASSED" "$LOG_DIR/tests_${TIMESTAMP}.log" || echo 0)
        failed=$((total - passed))
        coverage=$(grep "$type" "$coverage_report" 2>/dev/null | awk '{print $2}' || echo "N/A")
        
        cat >> "$report_file" << EOF
        <tr>
            <td>$type</td>
            <td>$total</td>
            <td class="success">$passed</td>
            <td class="error">$failed</td>
            <td>$coverage</td>
        </tr>
EOF
    done
    
    cat >> "$report_file" << EOF
    </table>
    
    <h2>Detalles de Errores</h2>
    <pre>
$(grep "FAILED" "$LOG_DIR/tests_${TIMESTAMP}.log" || echo "No se encontraron errores")
    </pre>
    
    <h2>Log Completo</h2>
    <pre>
$(cat "$LOG_DIR/tests_${TIMESTAMP}.log")
    </pre>
</body>
</html>
EOF
}

# Función principal
main() {
    local test_type="${1:-all}"
    log_message "INFO" "Iniciando ejecución de pruebas: $test_type"
    
    # Preparar entorno
    setup_test_env
    
    # Variables de estado
    local status=0
    local failed_types=()
    
    case "$test_type" in
        "unit")
            run_unit_tests || status=$?
            ;;
        "integration")
            run_integration_tests || status=$?
            ;;
        "api")
            run_api_tests || status=$?
            ;;
        "e2e")
            run_e2e_tests || status=$?
            ;;
        "all")
            # Ejecutar todos los tipos de prueba
            for type in "${!TEST_TYPES[@]}"; do
                if ! run_"${type}"_tests; then
                    failed_types+=("$type")
                    ((status++))
                fi
            done
            ;;
        *)
            log_message "ERROR" "Tipo de prueba desconocido: $test_type"
            return 1
            ;;
    esac
    
    # Verificar cobertura
    check_coverage
    
    # Generar reporte
    generate_test_report
    
    # Resumen final
    if [ ${#failed_types[@]} -eq 0 ]; then
        log_message "SUCCESS" "Todas las pruebas completadas exitosamente"
    else
        log_message "ERROR" "Pruebas fallidas en: ${failed_types[*]}"
    fi
    
    return $status
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