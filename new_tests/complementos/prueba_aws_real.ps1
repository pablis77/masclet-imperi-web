# Script para probar la conectividad real con AWS
# Este script realiza pruebas de conexión directa con la API en EC2

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    
    Write-Host $Text -ForegroundColor $Color
}

# Configuración
$API_URL = "http://108.129.139.119:8000"

# Limpiar la pantalla
Clear-Host

Write-ColorText "==== PRUEBA DE CONECTIVIDAD REAL CON AWS ====" "Cyan"
Write-ColorText "Comprobando la conexión con la API en EC2..." "Yellow"

# Prueba 1: Verificar si el backend está activo
Write-ColorText "`n1. Comprobando si el backend está activo..." "Magenta"
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/v1/health" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-ColorText "✅ Backend disponible! Código: $($response.StatusCode)" "Green"
    Write-ColorText "Respuesta: $($response.Content)" "Gray"
} catch {
    Write-ColorText "❌ No se puede conectar al backend: $_" "Red"
}

# Prueba 2: Verificar autenticación
Write-ColorText "`n2. Probando autenticación con credenciales de prueba..." "Magenta"
$credentials = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $authResponse = Invoke-WebRequest -Uri "$API_URL/api/v1/auth/login" -Method POST -Body $credentials -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
    Write-ColorText "✅ Autenticación exitosa! Código: $($authResponse.StatusCode)" "Green"
    $token = ($authResponse.Content | ConvertFrom-Json).access_token
    Write-ColorText "Token recibido: $($token.Substring(0, 20))..." "Gray"
} catch {
    Write-ColorText "❌ Error en autenticación: $_" "Red"
    $token = $null
}

# Prueba 3: Verificar endpoints protegidos
if ($token) {
    Write-ColorText "`n3. Probando endpoint protegido (lista de animales)..." "Magenta"
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $animalsResponse = Invoke-WebRequest -Uri "$API_URL/api/v1/animals/" -Method GET -Headers $headers -TimeoutSec 10 -ErrorAction Stop
        Write-ColorText "✅ Endpoint protegido accesible! Código: $($animalsResponse.StatusCode)" "Green"
        $animals = $animalsResponse.Content | ConvertFrom-Json
        Write-ColorText "Recibidos $($animals.Count) animales" "Gray"
    } catch {
        Write-ColorText "❌ Error accediendo al endpoint protegido: $_" "Red"
    }
}

# Prueba 4: Verificar URLs duplicadas que pueden causar problemas
Write-ColorText "`n4. Verificando posibles problemas de URLs duplicadas..." "Magenta"
$problematicUrls = @(
    "$API_URL/api/api/v1/health",
    "$API_URL/api/v1/api/v1/health"
)

foreach ($url in $problematicUrls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-ColorText "⚠️ URL problemática funciona: $url (Código: $($response.StatusCode))" "Yellow"
    } catch {
        Write-ColorText "URL problemática no accesible: $url" "Gray"
    }
}

# Prueba 5: Verificar la conectividad desde el navegador
Write-ColorText "`n5. Preparando test para navegador..." "Magenta"
$testDir = ".\new_tests\complementos\aws_browser_test"
if (-not (Test-Path $testDir)) {
    New-Item -ItemType Directory -Path $testDir -Force | Out-Null
}

$htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>Prueba de Conectividad AWS</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .result { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .error { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .pending { background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; }
        button { padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0069d9; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 5px; overflow: auto; }
    </style>
</head>
<body>
    <h1>Prueba de Conectividad con AWS</h1>
    <p>Esta página prueba la conectividad con la API de Masclet Imperi en AWS.</p>
    
    <div>
        <h2>Configuración</h2>
        <p>URL de la API: <code id="apiUrl">$API_URL</code></p>
        <button onclick="cambiarURL()">Cambiar URL</button>
    </div>
    
    <div>
        <h2>Pruebas</h2>
        <button onclick="ejecutarPruebas()">Ejecutar Todas las Pruebas</button>
        
        <h3>1. Verificación de Estado</h3>
        <div id="healthResult" class="result pending">Pendiente...</div>
        <button onclick="probarHealth()">Probar</button>
        
        <h3>2. Autenticación</h3>
        <div id="authResult" class="result pending">Pendiente...</div>
        <button onclick="probarAuth()">Probar</button>
        
        <h3>3. Endpoint Protegido</h3>
        <div id="protectedResult" class="result pending">Pendiente...</div>
        <button onclick="probarProtegido()">Probar</button>
        
        <h3>4. URLs Problemáticas</h3>
        <div id="urlsResult" class="result pending">Pendiente...</div>
        <button onclick="probarURLs()">Probar</button>
    </div>
    
    <div>
        <h2>Resultados</h2>
        <pre id="resultados"></pre>
    </div>
    
    <script>
        // Configuración inicial
        let apiUrl = document.getElementById('apiUrl').textContent;
        let accessToken = '';
        
        function cambiarURL() {
            const nuevaURL = prompt('Introduce la nueva URL de la API:', apiUrl);
            if (nuevaURL) {
                apiUrl = nuevaURL;
                document.getElementById('apiUrl').textContent = apiUrl;
                console.log('URL cambiada a:', apiUrl);
            }
        }
        
        function mostrarResultado(id, esExito, mensaje) {
            const elemento = document.getElementById(id);
            elemento.textContent = mensaje;
            elemento.className = `result \${esExito ? 'success' : 'error'}`;
            
            // Añadir al log de resultados
            const resultados = document.getElementById('resultados');
            resultados.textContent += `\${new Date().toLocaleTimeString()} - \${id}: \${mensaje}\n`;
        }
        
        async function probarHealth() {
            try {
                const response = await fetch(`\${apiUrl}/api/v1/health`);
                if (response.ok) {
                    const data = await response.json();
                    mostrarResultado('healthResult', true, `API Disponible: \${JSON.stringify(data)}`);
                    return true;
                } else {
                    mostrarResultado('healthResult', false, `Error: \${response.status} \${response.statusText}`);
                    return false;
                }
            } catch (error) {
                mostrarResultado('healthResult', false, `Error de conexión: \${error.message}`);
                return false;
            }
        }
        
        async function probarAuth() {
            try {
                const response = await fetch(`\${apiUrl}/api/v1/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: 'admin',
                        password: 'admin123'
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    accessToken = data.access_token;
                    mostrarResultado('authResult', true, `Autenticación exitosa. Token recibido.`);
                    return true;
                } else {
                    mostrarResultado('authResult', false, `Error de autenticación: \${response.status} \${response.statusText}`);
                    return false;
                }
            } catch (error) {
                mostrarResultado('authResult', false, `Error de conexión: \${error.message}`);
                return false;
            }
        }
        
        async function probarProtegido() {
            if (!accessToken) {
                mostrarResultado('protectedResult', false, 'No hay token. Ejecuta primero la prueba de autenticación.');
                return false;
            }
            
            try {
                const response = await fetch(`\${apiUrl}/api/v1/animals/`, {
                    headers: {
                        'Authorization': `Bearer \${accessToken}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    mostrarResultado('protectedResult', true, `Acceso exitoso. Recibidos \${data.length} animales.`);
                    return true;
                } else {
                    mostrarResultado('protectedResult', false, `Error accediendo al endpoint: \${response.status} \${response.statusText}`);
                    return false;
                }
            } catch (error) {
                mostrarResultado('protectedResult', false, `Error de conexión: \${error.message}`);
                return false;
            }
        }
        
        async function probarURLs() {
            const urlsProblematicas = [
                `\${apiUrl}/api/api/v1/health`,
                `\${apiUrl}/api/v1/api/v1/health`
            ];
            
            let resultados = [];
            
            for (const url of urlsProblematicas) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        resultados.push(`⚠️ URL problemática funciona: \${url}`);
                    } else {
                        resultados.push(`URL problemática devuelve error \${response.status}: \${url}`);
                    }
                } catch (error) {
                    resultados.push(`URL problemática no accesible: \${url}`);
                }
            }
            
            mostrarResultado('urlsResult', true, resultados.join('\n'));
        }
        
        async function ejecutarPruebas() {
            document.getElementById('resultados').textContent = '';
            
            const healthOk = await probarHealth();
            if (healthOk) {
                const authOk = await probarAuth();
                if (authOk) {
                    await probarProtegido();
                }
            }
            await probarURLs();
        }
    </script>
</body>
</html>
"@

$htmlContent | Out-File -FilePath "$testDir\index.html" -Encoding utf8

Write-ColorText "HTML de prueba creado en: $testDir\index.html" "Cyan"
Write-ColorText "Abriendo navegador para pruebas visuales..." "Green"

# Abrir el archivo HTML en el navegador predeterminado
Start-Process "$testDir\index.html"

Write-ColorText "`n==== FINALIZADO ====" "Cyan"
Write-ColorText "Utiliza los resultados de estas pruebas para determinar los problemas reales en la conexión con AWS." "Yellow"
