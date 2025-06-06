# Script para diagnosticar y reparar problemas de despliegue Docker
# Este script debe ejecutarse después de ejecutar el script de despliegue cuando ha fallado

# Configuración
$remoteHost = "34.253.203.194"
$keyPath = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$sshUser = "ec2-user"
$remoteDeployDir = "~/masclet-imperi-web-deploy"

# Función para ejecutar comandos SSH
function Invoke-SshCommand {
    param (
        [string]$command
    )
    
    Write-Host "» Ejecutando: $command" -ForegroundColor Yellow
    $result = ssh -i $keyPath "$sshUser@$remoteHost" $command
    return $result
}

# Función para ejecutar comandos SSH con output detallado
function Invoke-VerboseSshCommand {
    param (
        [string]$command,
        [string]$description = ""
    )
    
    if ($description) {
        Write-Host "⚙️ $description" -ForegroundColor Cyan
    }
    
    Write-Host "» Ejecutando: $command" -ForegroundColor Yellow
    $result = ssh -i $keyPath "$sshUser@$remoteHost" $command
    Write-Host $result
    Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray
    return $result
}

# Cabecera
Write-Host @"
╔════════════════════════════════════════════════════════╗
║ DIAGNÓSTICO Y REPARACIÓN DE DESPLIEGUE DOCKER MASCLET  ║
╚════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# FASE 1: Diagnóstico del estado actual
Write-Host "FASE 1: Diagnóstico del estado actual 🔍" -ForegroundColor Green

# Verificar estado de Docker
Invoke-VerboseSshCommand "docker ps -a" "Verificando contenedores Docker activos"

# Verificar espacio en disco
Invoke-VerboseSshCommand "df -h | grep '/dev/'" "Verificando espacio en disco"

# Verificar la estructura de archivos en el servidor
Invoke-VerboseSshCommand "ls -la $remoteDeployDir" "Verificando estructura del directorio de despliegue"
Invoke-VerboseSshCommand "find $remoteDeployDir -name 'entry.mjs'" "Buscando archivo entry.mjs crucial"
Invoke-VerboseSshCommand "ls -la $remoteDeployDir/server 2>/dev/null || echo 'No existe el directorio server'" "Verificando directorio server"
Invoke-VerboseSshCommand "ls -la $remoteDeployDir/client 2>/dev/null || echo 'No existe el directorio client'" "Verificando directorio client"

# FASE 2: Verificar red Docker
Write-Host "FASE 2: Verificando red Docker 🌐" -ForegroundColor Green
Invoke-VerboseSshCommand "docker network ls | grep masclet" "Listando redes Docker masclet"
Invoke-VerboseSshCommand "docker network inspect masclet-network" "Inspeccionando red masclet-network"

# FASE 3: Corregir estructura de directorios si es necesario
Write-Host "FASE 3: Corregir estructura de archivos si es necesaria 📂" -ForegroundColor Green

# Comprobar si necesitamos reorganizar los archivos
$serverDirExists = Invoke-SshCommand "[ -d $remoteDeployDir/server ] && echo 'true' || echo 'false'"
$clientDirExists = Invoke-SshCommand "[ -d $remoteDeployDir/client ] && echo 'true' || echo 'false'"

if ($serverDirExists -eq "false") {
    Write-Host "⚠️ No existe el directorio server, buscando alternativas..." -ForegroundColor Yellow
    
    # Buscar si hay algún directorio que pueda contener archivos del servidor
    $possibleServerDirs = Invoke-SshCommand "find $remoteDeployDir -type d -name '*server*' 2>/dev/null || echo ''"
    
    if ($possibleServerDirs) {
        Write-Host "✅ Encontrado posible directorio server: $possibleServerDirs" -ForegroundColor Green
        Invoke-SshCommand "mkdir -p $remoteDeployDir/server && cp -r $possibleServerDirs/* $remoteDeployDir/server/"
    } else {
        # Si no encontramos un directorio de servidor, busquemos el archivo entry.mjs y organicemos en base a eso
        $entryFile = Invoke-SshCommand "find $remoteDeployDir -type f -name 'entry.mjs' 2>/dev/null || echo ''"
        
        if ($entryFile) {
            Write-Host "✅ Encontrado entry.mjs en $entryFile" -ForegroundColor Green
            $entryDir = Invoke-SshCommand "dirname $entryFile"
            Invoke-SshCommand "mkdir -p $remoteDeployDir/server && cp -r $entryDir/* $remoteDeployDir/server/"
        } else {
            Write-Host "❌ No se encontró entry.mjs ni directorio server" -ForegroundColor Red
        }
    }
}

if ($clientDirExists -eq "false") {
    Write-Host "⚠️ No existe el directorio client, corrigiendo estructura..." -ForegroundColor Yellow
    
    # Buscar archivos estáticos que normalmente estarían en el directorio client
    $staticFiles = Invoke-SshCommand "find $remoteDeployDir -name '*.js' -o -name '*.css' -o -name '*.html' -o -name '*.png' -o -name '*.jpg' | grep -v 'node_modules' | head -5"
    
    if ($staticFiles) {
        Write-Host "✅ Encontrados archivos estáticos, reorganizando..." -ForegroundColor Green
        Invoke-SshCommand "mkdir -p $remoteDeployDir/client && find $remoteDeployDir -name '*.js' -o -name '*.css' -o -name '*.html' -o -name '*.png' -o -name '*.jpg' | grep -v 'node_modules' -o -name '*.js' | xargs -I{} cp {} $remoteDeployDir/client/"
    } else {
        Write-Host "❌ No se encontraron archivos estáticos" -ForegroundColor Red
    }
}

# FASE 4: Modificar los Dockerfiles si es necesario
Write-Host "FASE 4: Crear Dockerfile simplificado 📄" -ForegroundColor Green

# Crear un script en el servidor para encontrar y usar entry.mjs en cualquier ubicación
$findEntryScript = @"
#!/bin/sh
# Script para encontrar entry.mjs y ejecutar
ENTRY_FILE=\$(find /app -name 'entry.mjs' | head -1)
if [ -z "\$ENTRY_FILE" ]; then
  echo "No se encontró entry.mjs"
  exit 1
fi
echo "Encontrado entry.mjs en \$ENTRY_FILE"
cd \$(dirname "\$ENTRY_FILE")
node \$(basename "\$ENTRY_FILE")
"@

# Crear un Dockerfile simplificado
$simplifiedDockerfile = @"
FROM node:18-alpine

WORKDIR /app

# Copiar todo el directorio
COPY . /app

# Instalar dependencias básicas
RUN npm install express compression cookie --no-save

# Instalar herramientas de diagnóstico
RUN apk add --no-cache curl busybox-extras

# Crear script para ejecutar entry.mjs
RUN echo '$findEntryScript' > /app/start.sh && chmod +x /app/start.sh

# Exponer puertos
EXPOSE 3000

# Comando para ejecutar
CMD ["/app/start.sh"]
"@

# Crear docker-compose simplificado que solo levante nginx
$simplifiedCompose = @"
services:
  # Nginx como proxy inverso y servidor de estáticos
  masclet-frontend-nginx:
    image: nginx:alpine
    container_name: masclet-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./client:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    networks:
      - masclet-network

networks:
  masclet-network:
    external: true
"@

# Escribir los archivos simplificados en el servidor
Invoke-SshCommand "echo '$simplifiedDockerfile' > $remoteDeployDir/simple.Dockerfile"
Invoke-SshCommand "echo '$simplifiedCompose' > $remoteDeployDir/simple-compose.yml"

# FASE 5: Intentar despliegue simplificado
Write-Host "FASE 5: Intentando despliegue simplificado 🚀" -ForegroundColor Green
Invoke-VerboseSshCommand "cd $remoteDeployDir && docker-compose -f simple-compose.yml up -d" "Desplegando versión simplificada (solo Nginx)"

# Verificar resultado
Invoke-VerboseSshCommand "docker ps" "Verificando contenedores activos después del despliegue"
Invoke-VerboseSshCommand "docker logs masclet-frontend" "Logs del contenedor Nginx"

# Mensaje final
Write-Host @"
═══════════════════════════════════════════════════════════════════
  DIAGNÓSTICO Y DESPLIEGUE SIMPLIFICADO COMPLETADO
  
  Siguiente paso:
  1. Si el contenedor Nginx se levantó correctamente, ya tenemos
     acceso a los archivos estáticos en http://$remoteHost/
  
  2. Para completar el despliegue con SSR, ejecutar:
     cd $remoteDeployDir && 
     docker build -t masclet-node -f simple.Dockerfile . &&
     docker run -d --name masclet-node -p 3000:3000 --network masclet-network masclet-node
═══════════════════════════════════════════════════════════════════
"@ -ForegroundColor Cyan
