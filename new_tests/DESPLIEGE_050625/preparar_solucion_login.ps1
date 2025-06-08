# Script para preparar la solución de login real para AWS
# Este script verifica y refina nuestro archivo de solución de login

$workDir = "C:\Proyectos\claude\masclet-imperi-web\new_tests\DESPLIEGE_050625"
$solutionFile = "$workDir\solucion_login_inyectada.js"
$outputDir = "$workDir\deploy"

# Crear directorio de salida si no existe
if (!(Test-Path $outputDir)) {
    Write-Host "📁 Creando directorio de salida..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Verificar que la solución existe
if (!(Test-Path $solutionFile)) {
    Write-Host "❌ Error: No se encontró el archivo de solución: $solutionFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivo de solución encontrado: $solutionFile" -ForegroundColor Green

# Copiar el archivo de solución al directorio de salida
Copy-Item $solutionFile -Destination "$outputDir\solucion_login.js"
Write-Host "✅ Solución copiada y preparada para despliegue" -ForegroundColor Green

# Crear un archivo HTML de prueba para inyección (facilitará la verificación)
$testHtml = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Login Fix - Test de Inyección</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
        button { margin-top: 10px; padding: 8px 15px; background: #4CAF50; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Test de Inyección de Login Fix</h1>
        <div id="status"></div>
        <h2>Script inyectado:</h2>
        <pre id="script-content"></pre>
        <button id="test-login">Probar Login</button>
    </div>

    <script>
        // Esta función simula la inyección del script
        function injectScript() {
            const status = document.getElementById('status');
            const scriptContent = document.getElementById('script-content');
            
            try {
                // Cargar el script de corrección
                const script = document.createElement('script');
                script.src = '/solucion_login.js';
                document.head.appendChild(script);
                
                script.onload = function() {
                    status.innerHTML = '<p class="success">✅ Script inyectado correctamente</p>';
                    
                    // Mostrar mensaje si se detecta la variable global de fix
                    setTimeout(() => {
                        if (window.__loginFixApplied) {
                            status.innerHTML += '<p class="success">✅ Login Fix inicializado correctamente</p>';
                        } else {
                            status.innerHTML += '<p class="error">❌ Login Fix no se ha inicializado</p>';
                        }
                    }, 500);
                };
                
                script.onerror = function() {
                    status.innerHTML = '<p class="error">❌ Error al cargar el script</p>';
                };
                
                // Cargar el contenido del script para mostrar
                fetch('/solucion_login.js')
                    .then(response => response.text())
                    .then(text => {
                        scriptContent.textContent = text;
                    })
                    .catch(err => {
                        scriptContent.textContent = 'Error al cargar el contenido: ' + err;
                    });
                
            } catch (err) {
                status.innerHTML = '<p class="error">❌ Error: ' + err.message + '</p>';
            }
        }
        
        // Iniciar la inyección al cargar
        document.addEventListener('DOMContentLoaded', injectScript);
        
        // Botón de prueba
        document.getElementById('test-login').addEventListener('click', function() {
            if (window.__loginFixApplied) {
                alert('El fix de login está aplicado. Verifica la consola para más información.');
                console.log('Logs de LoginFix:', JSON.parse(sessionStorage.getItem('loginFixLogs') || '[]'));
            } else {
                alert('El fix de login NO está aplicado.');
            }
        });
    </script>
</body>
</html>
"@

$testHtml | Out-File -FilePath "$outputDir\test_injection.html" -Encoding UTF8
Write-Host "✅ Página de prueba de inyección creada: $outputDir\test_injection.html" -ForegroundColor Green

Write-Host "✅ Preparación completada exitosamente" -ForegroundColor Green
Write-Host "📊 Resumen:"
Write-Host "  - Solución copiada a: $outputDir\solucion_login.js"
Write-Host "  - Página de prueba: $outputDir\test_injection.html"
