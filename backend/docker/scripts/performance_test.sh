#!/bin/bash
# Script para pruebas de rendimiento del sistema
# Ubicación: backend/docker/scripts/performance_test.sh

set -e

# Configuración
TEST_DIR="/app/performance_tests"
LOG_DIR="/logs/performance"
CONFIG_DIR="/app/config/performance"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Endpoints a probar
declare -A TEST_ENDPOINTS=(
    ["health"]="http://localhost:8000/api/health"
    ["animals"]="http://localhost:8000/api/animals"
    ["partos"]="http://localhost:8000/api/partos"
    ["search"]="http://localhost:8000/api/animals/search"
    ["dashboard"]="http://localhost:8000/api/dashboard/stats"
)

# Umbrales de rendimiento
declare -A THRESHOLDS=(
    ["response_time"]="500"      # ms máximos
    ["requests_per_sec"]="50"    # mínimo
    ["error_rate"]="1"          # % máximo
    ["cpu_usage"]="80"          # % máximo
    ["memory_usage"]="85"       # % máximo
    ["db_queries"]="30"         # máximo por request
)

# Parámetros de prueba
declare -A TEST_PARAMS=(
    ["concurrent_users"]="50"    # usuarios concurrentes
    ["test_duration"]="300"     # segundos
    ["ramp_up_time"]="60"       # segundos
    ["think_time"]="1"          # segundos entre requests
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/performance_${TIMESTAMP}.log"
}

# Prueba de endpoint individual
test_endpoint() {
    local name="$1"
    local url="$2"
    log_message "INFO" "Probando endpoint: $name ($url)"
    
    # Resultados
    local results_file="$TEST_DIR/results/${name}_${TIMESTAMP}.txt"
    
    # Test con Apache Benchmark
    ab -n 1000 -c "${TEST_PARAMS[concurrent_users]}" \
       -t "${TEST_PARAMS[test_duration]}" \
       -H "Authorization: Bearer $TEST_TOKEN" \
       "$url" > "$results_file"
    
    # Analizar resultados
    local rps=$(grep "Requests per second" "$results_file" | awk '{print $4}')
    local mean_time=$(grep "Time per request" "$results_file" | head -1 | awk '{print $4}')
    local errors=$(grep "Failed requests" "$results_file" | awk '{print $3}')
    
    # Verificar umbrales
    if [ "$(echo "$mean_time > ${THRESHOLDS[response_time]}" | bc)" -eq 1 ]; then
        log_message "WARNING" "$name: Tiempo de respuesta alto: ${mean_time}ms"
    fi
    
    if [ "$(echo "$rps < ${THRESHOLDS[requests_per_sec]}" | bc)" -eq 1 ]; then
        log_message "WARNING" "$name: RPS bajo: $rps"
    fi
    
    local error_rate=$(echo "scale=2; $errors / 1000 * 100" | bc)
    if [ "$(echo "$error_rate > ${THRESHOLDS[error_rate]}" | bc)" -eq 1 ]; then
        log_message "WARNING" "$name: Tasa de error alta: ${error_rate}%"
    fi
    
    return 0
}

# Prueba de base de datos
test_database() {
    log_message "INFO" "Probando rendimiento de base de datos..."
    
    # pgbench con configuración específica
    pgbench -i -s 10 masclet_imperi > /dev/null 2>&1
    
    # Test de carga
    pgbench -c "${TEST_PARAMS[concurrent_users]}" \
            -T "${TEST_PARAMS[test_duration]}" \
            -P 10 \
            masclet_imperi > "$TEST_DIR/results/db_${TIMESTAMP}.txt"
    
    # Analizar resultados
    local tps=$(grep "tps" "$TEST_DIR/results/db_${TIMESTAMP}.txt" | tail -1 | awk '{print $3}')
    local latency=$(grep "latency" "$TEST_DIR/results/db_${TIMESTAMP}.txt" | tail -1 | awk '{print $4}')
    
    log_message "INFO" "DB Performance: $tps tps, $latency ms latencia media"
}

# Prueba de carga completa
load_test() {
    log_message "INFO" "Iniciando prueba de carga completa..."
    
    # Configurar JMeter test
    cat > "$TEST_DIR/jmeter/test_plan.jmx" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="Masclet Load Test">
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
      <stringProp name="TestPlan.comments"></stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <stringProp name="TestPlan.user_define_classpath"></stringProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Users">
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <intProp name="LoopController.loops">-1</intProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">${TEST_PARAMS[concurrent_users]}</stringProp>
        <stringProp name="ThreadGroup.ramp_time">${TEST_PARAMS[ramp_up_time]}</stringProp>
        <longProp name="ThreadGroup.start_time">1373789594000</longProp>
        <longProp name="ThreadGroup.end_time">1373789594000</longProp>
        <boolProp name="ThreadGroup.scheduler">true</boolProp>
        <stringProp name="ThreadGroup.duration">${TEST_PARAMS[test_duration]}</stringProp>
        <stringProp name="ThreadGroup.delay">0</stringProp>
      </ThreadGroup>
      <hashTree>
        <!-- Añadir samplers para cada endpoint -->
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
EOF
    
    # Ejecutar JMeter test
    jmeter -n -t "$TEST_DIR/jmeter/test_plan.jmx" \
           -l "$TEST_DIR/results/jmeter_${TIMESTAMP}.jtl" \
           -e -o "$TEST_DIR/reports/${TIMESTAMP}"
}

# Monitorizar recursos
monitor_resources() {
    log_message "INFO" "Monitorizando recursos del sistema..."
    
    while true; do
        # CPU
        local cpu_usage
        cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
        
        # Memoria
        local mem_usage
        mem_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
        
        # Disco IO
        local disk_io
        disk_io=$(iostat -x 1 1 | tail -n 2 | head -n 1 | awk '{print $14}')
        
        # Network IO
        local net_io
        net_io=$(netstat -i | grep eth0 | awk '{print $3 + $7}')
        
        # Guardar métricas
        echo "$(date +%s),$cpu_usage,$mem_usage,$disk_io,$net_io" >> "$TEST_DIR/metrics/system_${TIMESTAMP}.csv"
        
        sleep 1
    done
}

# Generar reporte de rendimiento
generate_performance_report() {
    local report_file="$LOG_DIR/performance_report_${TIMESTAMP}.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Rendimiento</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .good { color: green; }
        .warning { color: orange; }
        .critical { color: red; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
        .chart { width: 100%; height: 300px; margin: 20px 0; }
    </style>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
    <h1>Reporte de Rendimiento</h1>
    <p>Fecha: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>Resumen de Pruebas</h2>
    <table>
        <tr>
            <th>Endpoint</th>
            <th>RPS</th>
            <th>Tiempo Medio</th>
            <th>Error Rate</th>
        </tr>
EOF
    
    # Añadir resultados por endpoint
    for name in "${!TEST_ENDPOINTS[@]}"; do
        local result_file="$TEST_DIR/results/${name}_${TIMESTAMP}.txt"
        if [ -f "$result_file" ]; then
            local rps mean_time errors
            rps=$(grep "Requests per second" "$result_file" | awk '{print $4}')
            mean_time=$(grep "Time per request" "$result_file" | head -1 | awk '{print $4}')
            errors=$(grep "Failed requests" "$result_file" | awk '{print $3}')
            
            cat >> "$report_file" << EOF
        <tr>
            <td>$name</td>
            <td>$rps</td>
            <td>${mean_time}ms</td>
            <td>$errors</td>
        </tr>
EOF
        fi
    done
    
    # Añadir gráficos de métricas
    cat >> "$report_file" << EOF
    </table>
    
    <h2>Gráficos de Rendimiento</h2>
    <div id="cpu_chart" class="chart"></div>
    <div id="memory_chart" class="chart"></div>
    <div id="response_time_chart" class="chart"></div>
    
    <script>
        // Cargar datos de métricas y crear gráficos
        fetch('$TEST_DIR/metrics/system_${TIMESTAMP}.csv')
            .then(response => response.text())
            .then(data => {
                const lines = data.trim().split('\n');
                const timestamps = [];
                const cpu = [];
                const memory = [];
                
                lines.forEach(line => {
                    const [ts, cpu_val, mem_val] = line.split(',');
                    timestamps.push(new Date(ts * 1000));
                    cpu.push(cpu_val);
                    memory.push(mem_val);
                });
                
                Plotly.newPlot('cpu_chart', [{
                    x: timestamps,
                    y: cpu,
                    type: 'scatter',
                    name: 'CPU Usage'
                }], {
                    title: 'CPU Usage Over Time'
                });
                
                Plotly.newPlot('memory_chart', [{
                    x: timestamps,
                    y: memory,
                    type: 'scatter',
                    name: 'Memory Usage'
                }], {
                    title: 'Memory Usage Over Time'
                });
            });
    </script>
    
    <h2>Log de Pruebas</h2>
    <pre>
$(tail -n 50 "$LOG_DIR/performance_${TIMESTAMP}.log")
    </pre>
</body>
</html>
EOF
}

# Función principal
main() {
    log_message "INFO" "Iniciando pruebas de rendimiento..."
    
    # Crear directorios necesarios
    mkdir -p "$TEST_DIR/"{results,metrics,reports,jmeter} "$LOG_DIR"
    
    # Iniciar monitoreo en background
    monitor_resources &
    local monitor_pid=$!
    
    # Probar cada endpoint
    for name in "${!TEST_ENDPOINTS[@]}"; do
        test_endpoint "$name" "${TEST_ENDPOINTS[$name]}"
    done
    
    # Prueba de base de datos
    test_database
    
    # Prueba de carga completa
    load_test
    
    # Detener monitoreo
    kill $monitor_pid
    
    # Generar reporte
    generate_performance_report
    
    log_message "SUCCESS" "Pruebas de rendimiento completadas"
    return 0
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