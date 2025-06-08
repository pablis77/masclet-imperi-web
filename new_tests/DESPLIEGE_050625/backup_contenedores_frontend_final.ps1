# Script PowerShell para crear copias de seguridad de los contenedores frontend
# Este script se conecta al servidor AWS y ejecuta comandos bash para realizar respaldos completos

# Configuración inicial
$fechaActual = Get-Date -Format "yyyyMMdd_HHmmss"
Write-Host "🔒 Creando copias de seguridad de contenedores frontend - $fechaActual" -ForegroundColor Cyan

# Crear el script bash que se ejecutará en el servidor
$bashScript = @'
#!/bin/bash
# Script para crear copias de seguridad de los contenedores frontend

# Configurar directorio de respaldo
FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ec2-user/backups/frontend_$FECHA"
mkdir -p $BACKUP_DIR
echo "Directorio de respaldo creado: $BACKUP_DIR"

# 1. Identificar los contenedores
echo "Buscando contenedores de frontend..."
NGINX_CONTAINER=$(docker ps | grep masclet-frontend | grep -v masclet-frontend-node | awk '{print $1}')
NODE_CONTAINER=$(docker ps | grep masclet-frontend-node | awk '{print $1}')

echo "Contenedor Nginx: $NGINX_CONTAINER"
echo "Contenedor Node.js: $NODE_CONTAINER"

# 2. Crear respaldo de imágenes Docker
echo "===== RESPALDO DE IMÁGENES DOCKER ====="
# Obtener IDs de imágenes
if [ -n "$NGINX_CONTAINER" ]; then
  NGINX_IMAGE=$(docker inspect --format='{{.Config.Image}}' $NGINX_CONTAINER)
  echo "Imagen Nginx: $NGINX_IMAGE"
  
  # Guardar imagen
  echo "Guardando imagen Nginx..."
  docker save $NGINX_IMAGE -o $BACKUP_DIR/nginx_image.tar
else
  echo "⚠️ No se encontró contenedor Nginx activo"
fi

if [ -n "$NODE_CONTAINER" ]; then
  NODE_IMAGE=$(docker inspect --format='{{.Config.Image}}' $NODE_CONTAINER)
  echo "Imagen Node.js: $NODE_IMAGE"
  
  # Guardar imagen
  echo "Guardando imagen Node.js..."
  docker save $NODE_IMAGE -o $BACKUP_DIR/nodejs_image.tar
else
  echo "⚠️ No se encontró contenedor Node.js activo"
fi

# 3. Extraer archivos de configuración y código relevante
echo ""
echo "===== EXTRACCIÓN DE ARCHIVOS DE CONFIGURACIÓN ====="

# Nginx: configuración y archivos estáticos
if [ -n "$NGINX_CONTAINER" ]; then
  echo "Extrayendo configuración de Nginx..."
  
  # Crear directorios
  mkdir -p $BACKUP_DIR/nginx/conf
  mkdir -p $BACKUP_DIR/nginx/html
  
  # Extraer configuración
  docker cp $NGINX_CONTAINER:/etc/nginx/conf.d/ $BACKUP_DIR/nginx/conf/
  docker cp $NGINX_CONTAINER:/etc/nginx/nginx.conf $BACKUP_DIR/nginx/conf/
  docker cp $NGINX_CONTAINER:/usr/share/nginx/html/ $BACKUP_DIR/nginx/html/
  
  echo "✅ Configuración de Nginx extraída"
fi

# Node.js: archivos de código y configuración
if [ -n "$NODE_CONTAINER" ]; then
  echo "Extrayendo archivos de Node.js..."
  
  # Crear directorios
  mkdir -p $BACKUP_DIR/nodejs/app
  mkdir -p $BACKUP_DIR/nodejs/config
  
  # Extraer código y configuración
  docker cp $NODE_CONTAINER:/app/ $BACKUP_DIR/nodejs/
  
  # Extraer archivos específicos de autenticación
  echo "Extrayendo archivos específicos de autenticación..."
  docker exec $NODE_CONTAINER find /app -name "*auth*.js" -o -name "*login*.js" > $BACKUP_DIR/nodejs/auth_files.txt
  
  cat $BACKUP_DIR/nodejs/auth_files.txt | while read file; do
    if [ -n "$file" ]; then
      # Crear directorio de destino si no existe
      dest_dir="$BACKUP_DIR/nodejs/auth$(dirname $file | sed 's/\/app//')"
      mkdir -p "$dest_dir"
      
      # Copiar archivo
      docker cp "$NODE_CONTAINER:$file" "$dest_dir/"
    fi
  done
  
  echo "✅ Archivos de Node.js extraídos"
fi

# 4. Extraer variables de entorno
echo ""
echo "===== EXTRACCIÓN DE VARIABLES DE ENTORNO ====="
if [ -n "$NGINX_CONTAINER" ]; then
  docker inspect $NGINX_CONTAINER | grep -A 20 "Env" > $BACKUP_DIR/nginx_environment.txt
  echo "Variables de entorno de Nginx guardadas"
fi

if [ -n "$NODE_CONTAINER" ]; then
  docker inspect $NODE_CONTAINER | grep -A 20 "Env" > $BACKUP_DIR/nodejs_environment.txt
  echo "Variables de entorno de Node.js guardadas"
fi

# 5. Crear script de restauración
echo ""
echo "===== CREANDO SCRIPT DE RESTAURACIÓN ====="

cat > $BACKUP_DIR/restore.sh << EOL
#!/bin/bash
# Script de restauración generado automáticamente

echo "🔄 Iniciando restauración de contenedores frontend desde backup"

# Cargar imágenes
if [ -f nginx_image.tar ]; then
  echo "Cargando imagen de Nginx..."
  docker load -i nginx_image.tar
fi

if [ -f nodejs_image.tar ]; then
  echo "Cargando imagen de Node.js..."
  docker load -i nodejs_image.tar
fi

echo "✅ Restauración completa. Verifique las imágenes Docker disponibles con 'docker images'."
echo "Para recrear los contenedores, use los comandos docker run correspondientes."
EOL

# Hacer ejecutable el script de restauración
chmod +x $BACKUP_DIR/restore.sh
echo "Script de restauración creado: $BACKUP_DIR/restore.sh"

# 6. Comprimir todo para facilitar la transferencia
echo ""
echo "===== COMPRIMIENDO RESPALDO ====="
cd /home/ec2-user/backups
tar -czf frontend_backup_$FECHA.tar.gz frontend_$FECHA
echo "Respaldo comprimido creado: /home/ec2-user/backups/frontend_backup_$FECHA.tar.gz"

# Ajustar permisos del backup
chmod -R 755 /home/ec2-user/backups/frontend_$FECHA
chmod 644 /home/ec2-user/backups/frontend_backup_$FECHA.tar.gz

# Información final
echo ""
echo "✅ RESPALDO COMPLETADO"
echo "Puede encontrar los respaldos en:"
echo "- Directorio completo: $BACKUP_DIR"
echo "- Archivo comprimido: /home/ec2-user/backups/frontend_backup_$FECHA.tar.gz"
echo ""
echo "Para restaurar los contenedores, acceda al directorio de respaldo y ejecute el script restore.sh"

# Limpiar archivos temporales si es necesario
# rm -f /home/ec2-user/backups/temp_*
'@

# Crear un archivo temporal con el script bash
$tempScriptPath = "$env:TEMP\backup_containers_$(Get-Random).sh"
$bashScript | Out-File -FilePath $tempScriptPath -Encoding utf8

try {
    # IP del servidor AWS actual
    $serverIp = "34.253.203.194"
    $user = "ec2-user"
    
    # Realizar una prueba de conexión antes de continuar
    Write-Host "🔄 Verificando conexión SSH con el servidor..." -ForegroundColor Yellow
    
    # Ruta de la clave SSH
    $keyPath = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
    
    if (Test-Path $keyPath) {
        Write-Host "✅ Usando clave SSH desde: $keyPath" -ForegroundColor Green
    } else {
        Write-Host "❌ No se encontró la clave SSH en la ruta especificada: $keyPath" -ForegroundColor Red
        throw "Clave SSH no encontrada"
    }
    
    # Probar conexión SSH
    Write-Host "🔄 Intentando conexión con el servidor AWS..." -ForegroundColor Yellow
    
    try {
        $testResult = ssh -i $keyPath -o ConnectTimeout=5 $user@${serverIp} "echo '✅ Conexión SSH exitosa'"
        if ($testResult -like "*Conexión SSH exitosa*") {
            Write-Host "✅ Conexión SSH establecida correctamente" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ No se pudo establecer conexión SSH con el servidor." -ForegroundColor Red
        Write-Host "Posibles causas:" -ForegroundColor Yellow
        Write-Host "  - La dirección IP del servidor es incorrecta" -ForegroundColor Yellow
        Write-Host "  - La clave SSH no tiene los permisos adecuados" -ForegroundColor Yellow
        Write-Host "  - El usuario '$user' no existe o no tiene acceso" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Por favor, verifique los siguientes datos:" -ForegroundColor Yellow
        Write-Host "Dirección IP del servidor AWS: $serverIp"
        
        # Intentar otra vez después de la retroalimentación
        try {
            $testResult = ssh -i $keyPath -o ConnectTimeout=10 $user@${serverIp} "echo 'Conexión SSH exitosa'"
            if ($testResult -like "*Conexión SSH exitosa*") {
                Write-Host "✅ Conexión SSH establecida en segundo intento" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ Sigue sin ser posible conectar con el servidor." -ForegroundColor Red
            Write-Host "El script no puede continuar." -ForegroundColor Red
            throw "Fallo de conexión SSH"
        }
    }
    
    # Transferir el script al servidor y ejecutarlo
    Write-Host "🔄 Transfiriendo script al servidor..." -ForegroundColor Yellow
    
    # Usar el comando correcto de SCP en PowerShell
    scp -i $keyPath $tempScriptPath $user@${serverIp}:/home/ec2-user/backup_containers.sh
    
    Write-Host "🚀 Ejecutando script en el servidor..." -ForegroundColor Yellow
    ssh -i $keyPath $user@${serverIp} "chmod +x /home/ec2-user/backup_containers.sh && /home/ec2-user/backup_containers.sh"
    
    # Eliminar el archivo temporal
    Remove-Item $tempScriptPath -Force
    
    Write-Host "✅ Proceso de respaldo completado." -ForegroundColor Green
    Write-Host "Los respaldos están disponibles en el servidor en /home/ec2-user/backups/" -ForegroundColor Green
    
    # Preguntar si quiere descargar el archivo comprimido
    $descargar = Read-Host "¿Quieres descargar una copia local del respaldo? (s/n)"
    if ($descargar -eq "s") {
        # Crear directorio de respaldo local si no existe
        $localBackupDir = "C:\Proyectos\claude\masclet-imperi-web\new_tests\DESPLIEGE_050625\backups"
        if (-not (Test-Path $localBackupDir)) {
            New-Item -ItemType Directory -Path $localBackupDir | Out-Null
        }
        
        # Obtener el nombre del último archivo de respaldo
        $ultimoBackup = ssh -i $keyPath $user@${serverIp} "ls -t /home/ec2-user/backups/frontend_backup_*.tar.gz | head -1"
        
        if ($ultimoBackup) {
            $nombreArchivo = Split-Path $ultimoBackup -Leaf
            $rutaDestino = Join-Path $localBackupDir $nombreArchivo
            
            Write-Host "🔄 Descargando archivo de respaldo..." -ForegroundColor Yellow
            scp -i $keyPath $user@${serverIp}:$ultimoBackup $rutaDestino
            
            if (Test-Path $rutaDestino) {
                Write-Host "✅ Respaldo descargado exitosamente a: $rutaDestino" -ForegroundColor Green
            } else {
                Write-Host "❌ Error al descargar el respaldo" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ No se encontró ningún archivo de respaldo en el servidor" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Error durante el proceso de respaldo: $_" -ForegroundColor Red
}
