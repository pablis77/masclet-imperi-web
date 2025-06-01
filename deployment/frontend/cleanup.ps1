# Script para limpiar restos de despliegues anteriores en el servidor EC2
param (
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEM_PATH
)

Write-Host "🧹 Iniciando limpieza de despliegues anteriores en $EC2_IP..." -ForegroundColor Cyan

try {
    # Conectar al servidor y ejecutar comandos de limpieza
    ssh -i $PEM_PATH ec2-user@$EC2_IP "
        echo '🔍 Buscando contenedores Docker anteriores...'
        
        # Detener y eliminar contenedor frontend si existe
        if docker ps -a | grep -q masclet-frontend; then
            echo '🛑 Deteniendo contenedor masclet-frontend...'
            docker stop masclet-frontend
            docker rm masclet-frontend
            echo '✅ Contenedor eliminado correctamente'
        else
            echo '❓ No se encontró contenedor masclet-frontend'
        fi
        
        # Limpiar directorio de frontend si existe
        if [ -d '/home/ec2-user/masclet-imperi-frontend' ]; then
            echo '🗑️ Limpiando directorio de frontend...'
            rm -rf /home/ec2-user/masclet-imperi-frontend
            echo '✅ Directorio limpiado correctamente'
        else
            echo '❓ No se encontró directorio de frontend'
        fi
        
        # Eliminar imágenes de nginx antiguas
        echo '🗑️ Limpiando imágenes de nginx no utilizadas...'
        docker image prune -a -f --filter='reference=nginx*' --filter='until=24h'
        
        # Crear directorio limpio para nuevo despliegue
        echo '📁 Creando directorio para nuevo despliegue...'
        mkdir -p /home/ec2-user/masclet-imperi-frontend
        
        echo '✅ Limpieza completada exitosamente'
    "
    
    Write-Host "✅ Limpieza completada con éxito!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error durante la limpieza: $_" -ForegroundColor Red
    exit 1
}
