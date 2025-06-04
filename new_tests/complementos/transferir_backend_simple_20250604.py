#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para transferir y desplegar el backend de Masclet Imperi en servidor AWS EC2
Fecha: 04/06/2025
Versión: 1.0
"""

import os
import sys
import time
import logging
import subprocess
import paramiko
import tarfile
import datetime

# Configuración básica
SERVIDOR = "108.129.139.119"
USUARIO = "ec2-user"
CLAVE_PRIVADA = os.path.expanduser("~/.ssh/aws-masclet.pem")
RUTA_LOCAL = "c:\\Proyectos\\claude\\masclet-imperi-web"
RUTA_SERVIDOR = "/home/ec2-user/masclet-imperi"

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] %(asctime)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger()

def ejecutar_comando_local(comando, cwd=None):
    """Ejecuta un comando en la máquina local y devuelve la salida"""
    logger.info(f"Ejecutando comando local: {comando}")
    proceso = subprocess.run(comando, shell=True, text=True, capture_output=True, cwd=cwd)
    if proceso.returncode != 0:
        logger.error(f"Error en comando ({proceso.returncode}): {proceso.stderr}")
    else:
        logger.info(f"Comando completado con éxito (status {proceso.returncode})")
    return proceso.returncode, proceso.stdout, proceso.stderr

def crear_paquete():
    """Crea un archivo tar.gz con el backend y el Dockerfile"""
    logger.info("Creando paquete de backend...")
    
    # Definir archivos y directorios a incluir
    fecha = datetime.datetime.now().strftime("%Y%m%d_%H%M")
    nombre_paquete = f"masclet_backend_{fecha}.tar.gz"
    ruta_paquete = os.path.join(RUTA_LOCAL, "new_tests", "complementos", nombre_paquete)

    try:
        with tarfile.open(ruta_paquete, "w:gz") as tar:
            # Añadir el Dockerfile optimizado
            tar.add(
                os.path.join(RUTA_LOCAL, "deployment", "Dockerfile.complete"),
                arcname="Dockerfile"
            )
            
            # Añadir directorios del backend
            tar.add(
                os.path.join(RUTA_LOCAL, "backend", "app"),
                arcname="backend/app"
            )
            tar.add(
                os.path.join(RUTA_LOCAL, "backend", "scripts"),
                arcname="backend/scripts"
            )
            
            # Añadir requirements.txt
            tar.add(
                os.path.join(RUTA_LOCAL, "backend", "requirements.txt"),
                arcname="backend/requirements.txt"
            )

        logger.info(f"Paquete creado: {ruta_paquete}")
        return ruta_paquete
    except Exception as e:
        logger.error(f"Error al crear paquete: {str(e)}")
        sys.exit(1)

def transferir_archivos(ruta_paquete):
    """Transfiere archivos al servidor vía SCP"""
    try:
        logger.info(f"Transfiriendo archivos al servidor {SERVIDOR}...")
        
        # Convertir ruta Windows a formato compatible con SCP
        ruta_paquete_scp = ruta_paquete.replace("\\", "/")
        nombre_paquete = os.path.basename(ruta_paquete)
        
        comando = f'scp -i "{CLAVE_PRIVADA}" "{ruta_paquete_scp}" {USUARIO}@{SERVIDOR}:{RUTA_SERVIDOR}/'
        status, salida, error = ejecutar_comando_local(comando)
        
        if status != 0:
            logger.error(f"Error al transferir archivos: {error}")
            sys.exit(1)
        
        logger.info("Archivos transferidos correctamente")
        return nombre_paquete
    except Exception as e:
        logger.error(f"Error en transferencia: {str(e)}")
        sys.exit(1)

def conectar_ssh():
    """Establece conexión SSH con el servidor"""
    try:
        logger.info(f"Conectando a {SERVIDOR} vía SSH...")
        cliente = paramiko.SSHClient()
        cliente.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        cliente.connect(
            hostname=SERVIDOR,
            username=USUARIO,
            key_filename=CLAVE_PRIVADA,
            timeout=10
        )
        logger.info("Conexión SSH establecida")
        return cliente
    except Exception as e:
        logger.error(f"Error al conectar por SSH: {str(e)}")
        sys.exit(1)

def ejecutar_comando_ssh(cliente, comando):
    """Ejecuta un comando en el servidor vía SSH"""
    logger.info(f"Ejecutando: {comando}")
    stdin, stdout, stderr = cliente.exec_command(comando)
    exit_status = stdout.channel.recv_exit_status()
    
    salida = stdout.read().decode('utf-8').strip()
    error = stderr.read().decode('utf-8').strip()
    
    if exit_status != 0:
        logger.error(f"Error en comando (status {exit_status}): {error}")
    else:
        if salida:
            logger.info(f"SALIDA: {salida}")
        logger.info(f"Comando completado con éxito (status {exit_status})")
    
    return exit_status, salida, error

def desplegar_backend(cliente, nombre_paquete):
    """Despliega el backend en el servidor"""
    logger.info("=== Iniciando despliegue de backend ===")
    
    # 1. Crear directorios necesarios
    ejecutar_comando_ssh(cliente, f"mkdir -p {RUTA_SERVIDOR}")
    
    # 2. Descomprimir paquete
    ejecutar_comando_ssh(cliente, f"cd {RUTA_SERVIDOR} && tar -xzf {nombre_paquete}")
    
    # 3. Crear archivo .env
    ejecutar_comando_ssh(cliente, f'''cat > {RUTA_SERVIDOR}/.env << 'EOL'
# Configuración del entorno para Masclet Imperi Backend
DATABASE_URL=postgresql://postgres:postgres@masclet-db:5432/masclet
DB_HOST=masclet-db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=masclet
SECRET_KEY=73a8a29a52e305a86741bb5e369f582f7531b54e76bd0bec0e0b8306cb95824c
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
BACKEND_CORS_ORIGINS=["*"]
EOL''')
    
    # 4. Crear directorios para volúmenes con permisos correctos
    ejecutar_comando_ssh(cliente, "mkdir -p /home/ec2-user/masclet-imperi/logs")
    ejecutar_comando_ssh(cliente, "sudo chmod -R 777 /home/ec2-user/masclet-imperi/logs")
    ejecutar_comando_ssh(cliente, "mkdir -p /home/ec2-user/masclet-imperi/uploads")
    ejecutar_comando_ssh(cliente, "sudo chmod -R 777 /home/ec2-user/masclet-imperi/uploads")
    ejecutar_comando_ssh(cliente, "mkdir -p /home/ec2-user/masclet-imperi/imports")
    ejecutar_comando_ssh(cliente, "sudo chmod -R 777 /home/ec2-user/masclet-imperi/imports")
    ejecutar_comando_ssh(cliente, "mkdir -p /home/ec2-user/masclet-imperi/backups")
    ejecutar_comando_ssh(cliente, "sudo chmod -R 777 /home/ec2-user/masclet-imperi/backups")
    
    # 5. Parar contenedores existentes
    ejecutar_comando_ssh(cliente, "sudo docker stop masclet-backend || true")
    ejecutar_comando_ssh(cliente, "sudo docker rm masclet-backend || true")
    
    # 6. Construir imagen Docker
    ejecutar_comando_ssh(cliente, f"cd {RUTA_SERVIDOR} && sudo docker build -t masclet-imperi-api:latest .")
    
    # 7. Crear red si no existe
    ejecutar_comando_ssh(cliente, "sudo docker network create masclet-network || true")
    
    # 8. Iniciar contenedor PostgreSQL si no está en ejecución
    status, salida, _ = ejecutar_comando_ssh(cliente, "sudo docker ps -q -f name=masclet-db")
    if not salida:
        logger.info("Iniciando contenedor PostgreSQL...")
        ejecutar_comando_ssh(cliente, '''
        sudo docker run -d --name masclet-db \
        --network masclet-network \
        -p 5432:5432 \
        -v /home/ec2-user/masclet-imperi/postgres-data:/var/lib/postgresql/data \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_DB=masclet \
        postgres:15
        ''')
    
    # 9. Iniciar contenedor backend
    ejecutar_comando_ssh(cliente, '''
    sudo docker run -d --name masclet-backend \
    --network masclet-network \
    -p 8000:8000 \
    -v /home/ec2-user/masclet-imperi/logs:/app/logs \
    -v /home/ec2-user/masclet-imperi/uploads:/app/uploads \
    -v /home/ec2-user/masclet-imperi/imports:/app/imports \
    -v /home/ec2-user/masclet-imperi/backups:/app/backups \
    -v /home/ec2-user/masclet-imperi/.env:/app/.env \
    masclet-imperi-api:latest
    ''')
    
    # 10. Verificar estado de los contenedores
    time.sleep(5)  # Esperar a que los contenedores estén en funcionamiento
    ejecutar_comando_ssh(cliente, "sudo docker ps")
    
    # 11. Verificar logs de backend
    ejecutar_comando_ssh(cliente, "sudo docker logs masclet-backend")
    
    # 12. Verificar endpoint de salud
    time.sleep(5)  # Esperar a que el backend esté listo
    ejecutar_comando_ssh(cliente, "curl http://localhost:8000/api/v1/health || echo 'Health check fallido'")

def main():
    """Función principal"""
    logger.info("=== INICIANDO TRANSFERENCIA Y DESPLIEGUE DE BACKEND MASCLET IMPERI ===")
    logger.info(f"Fecha y hora: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. Crear paquete de backend
    ruta_paquete = crear_paquete()
    
    # 2. Transferir archivos
    nombre_paquete = transferir_archivos(ruta_paquete)
    
    # 3. Conectar por SSH
    cliente_ssh = conectar_ssh()
    
    try:
        # 4. Desplegar backend
        desplegar_backend(cliente_ssh, nombre_paquete)
        
        # 5. Finalizar
        logger.info("=== DESPLIEGUE COMPLETADO ===")
    except Exception as e:
        logger.error(f"Error en el despliegue: {str(e)}")
    finally:
        cliente_ssh.close()
        logger.info("Conexión SSH cerrada")
        logger.info("=== FIN DEL PROCESO ===")

if __name__ == "__main__":
    main()
