# Limpiar y ejecutar contenedores
Write-Host "🧹 Limpiando contenedores anteriores..." -ForegroundColor Yellow
docker-compose down
docker-compose rm -f

Write-Host "🚀 Construyendo y levantando contenedores..." -ForegroundColor Green
docker-compose up --build
