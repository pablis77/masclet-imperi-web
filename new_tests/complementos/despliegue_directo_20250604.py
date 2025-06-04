#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script profesional y directo para desplegar Masclet-Backend
Fecha: 04/06/2025
"""

import os
import sys
import time
import paramiko
import tarfile
import datetime
import subprocess
import getpass
from pathlib import Path

# Configuración
SERVIDOR = "108.129.139.119"
USUARIO = "ec2-user"
# Usaremos contraseña en lugar de clave SSH en pem
RUTA_LOCAL = os.path.abspath("c:/Proyectos/claude/masclet-imperi-web")
RUTA_REMOTA = "/home/ec2-user/masclet-imperi"
FECHA = datetime.datetime.now().strftime("%Y%m%d_%H%M")
USAR_CONTRASEÑA = True  # Cambiar a False si quieres usar clave SSH

def log(mensaje, tipo="INFO"):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{tipo}] {timestamp} - {mensaje}")

def empaquetar_backend():
    """Crea un paquete con todo lo necesario para el backend"""
    log("=== EMPAQUETANDO BACKEND ===")
    
    # Preparar nombre de archivo
    nombre_archivo = f"masclet_backend_{FECHA}.tar.gz"
    ruta_archivo = os.path.join(RUTA_LOCAL, "new_tests", "complementos", nombre_archivo)
    
    try:
        with tarfile.open(ruta_archivo, "w:gz") as tar:
            # Incluir Dockerfile actualizado
            log("Añadiendo Dockerfile...")
            tar.add(
                os.path.join(RUTA_LOCAL, "deployment", "Dockerfile.backend"),
                arcname="Dockerfile"
            )
            
            # Incluir directorio app del backend
            log("Añadiendo código del backend...")
            tar.add(
                os.path.join(RUTA_LOCAL, "backend", "app"),
                arcname="backend/app"
            )
            
            # Incluir directorio scripts
            if os.path.exists(os.path.join(RUTA_LOCAL, "backend", "scripts")):
                log("Añadiendo scripts...")
                tar.add(
                    os.path.join(RUTA_LOCAL, "backend", "scripts"),
                    arcname="backend/scripts"
                )
            
            # Incluir requirements.txt
            log("Añadiendo requirements.txt...")
            tar.add(
                os.path.join(RUTA_LOCAL, "backend", "requirements.txt"),
                arcname="backend/requirements.txt"
            )
            
            # Crear archivo .env correcto y añadirlo al paquete
            log("Creando archivo .env correcto...")
            env_temp = os.path.join(RUTA_LOCAL, "new_tests", "complementos", ".env.temp")
            with open(env_temp, "w") as f:
                f.write("""# Configuración del entorno para Masclet Imperi Backend
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
""")
            tar.add(env_temp, arcname=".env")
            os.remove(env_temp)
            
        log(f"Paquete creado: {ruta_archivo}")
        return ruta_archivo
    except Exception as e:
        log(f"Error al crear paquete: {str(e)}", "ERROR")
        sys.exit(1)

def transferir_paquete(ruta_paquete):
    """Transfiere el paquete al servidor remoto usando SFTP"""
    log("=== TRANSFIRIENDO PAQUETE AL SERVIDOR ===")
    
    try:
        # Usar SFTP integrado en Paramiko en lugar de SCP externo
        log(f"Transfiriendo {ruta_paquete} a {SERVIDOR}...")
        
        # Conectar al servidor
        cliente_ssh = conectar_ssh()
        sftp = cliente_ssh.open_sftp()
        
        # Crear directorio remoto si no existe
        try:
            sftp.stat(RUTA_REMOTA)
        except FileNotFoundError:
            log(f"Creando directorio remoto {RUTA_REMOTA}...")
            sftp.mkdir(RUTA_REMOTA)
        
        # Transferir archivo
        nombre_archivo = os.path.basename(ruta_paquete)
        destino = f"{RUTA_REMOTA}/{nombre_archivo}"
        log(f"Subiendo archivo a {destino}...")
        sftp.put(ruta_paquete, destino)
        
        # Cerrar conexiones
        sftp.close()
        cliente_ssh.close()
        
        log("Transferencia SFTP completada")
        return nombre_archivo
    except Exception as e:
        log(f"Error en transferencia: {str(e)}", "ERROR")
        sys.exit(1)

def conectar_ssh():
    """Establece conexión SSH con el servidor"""
    log("=== CONECTANDO AL SERVIDOR ===")
    
    try:
        cliente = paramiko.SSHClient()
        cliente.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        if USAR_CONTRASEÑA:
            password = getpass.getpass(f"Contraseña para {USUARIO}@{SERVIDOR}: ")
            cliente.connect(
                hostname=SERVIDOR,
                username=USUARIO,
                password=password,
                timeout=15
            )
        else:
            # Solicitar ruta de clave SSH
            clave_ssh = input(f"Ruta completa del archivo de clave SSH para {SERVIDOR}: ")
            cliente.connect(
                hostname=SERVIDOR,
                username=USUARIO,
                key_filename=clave_ssh,
                timeout=15
            )
            
        log("Conexión SSH establecida")
        return cliente
    except Exception as e:
        log(f"Error de conexión SSH: {str(e)}", "ERROR")
        sys.exit(1)

def ejecutar_comando(ssh_cliente, comando):
    """Ejecuta un comando remoto y muestra su salida"""
    log(f"Ejecutando: {comando}")
    
    stdin, stdout, stderr = ssh_cliente.exec_command(comando)
    status = stdout.channel.recv_exit_status()
    
    output = stdout.read().decode().strip()
    error = stderr.read().decode().strip()
    
    if output:
        log(f"SALIDA: {output}")
    
    if status != 0:
        log(f"ERROR (código {status}): {error}", "ERROR")
        return False, error
    else:
        log("Comando ejecutado correctamente")
        return True, output

def desplegar_backend(ssh_cliente, nombre_paquete):
    """Despliega el backend en el servidor"""
    log("=== DESPLEGANDO BACKEND ===")
    
    try:
        # 1. Descomprimir paquete
        log("Descomprimiendo paquete...")
        cmd_descomprimir = f"mkdir -p {RUTA_REMOTA} && cd {RUTA_REMOTA} && tar -xzf {nombre_paquete}"
        ok, _ = ejecutar_comando(ssh_cliente, cmd_descomprimir)
        if not ok:
            return False
        
        # 2. Crear directorios de volúmenes con permisos correctos
        log("Creando directorios para volúmenes...")
        directorios = ["logs", "uploads", "imports", "backups"]
        for dir in directorios:
            ejecutar_comando(ssh_cliente, f"mkdir -p {RUTA_REMOTA}/{dir}")
            ejecutar_comando(ssh_cliente, f"sudo chmod -R 777 {RUTA_REMOTA}/{dir}")
        
        # 3. Detener y eliminar contenedor backend si existe
        log("Limpiando contenedor backend anterior...")
        ejecutar_comando(ssh_cliente, "sudo docker stop masclet-backend 2>/dev/null || true")
        ejecutar_comando(ssh_cliente, "sudo docker rm masclet-backend 2>/dev/null || true")
        
        # 4. Construir imagen Docker con timeout más largo
        log("Construyendo imagen Docker (puede tardar unos minutos)...")
        cmd_build = f"cd {RUTA_REMOTA} && sudo docker build --no-cache -t masclet-backend:latest ."
        ok, _ = ejecutar_comando(ssh_cliente, cmd_build)
        if not ok:
            log("Error al construir la imagen", "ERROR")
            return False
        
        # 5. Crear red Docker si no existe
        log("Creando red Docker...")
        ejecutar_comando(ssh_cliente, "sudo docker network create masclet-network 2>/dev/null || true")
        
        # 6. Verificar si PostgreSQL está ejecutándose
        log("Verificando contenedor PostgreSQL...")
        _, db_output = ejecutar_comando(ssh_cliente, "sudo docker ps -a | grep masclet-db || echo 'No existe'")
        
        if "Up" not in db_output:
            log("Iniciando contenedor PostgreSQL...")
            cmd_db = (
                "sudo docker run -d --name masclet-db "
                "--network masclet-network "
                "-v masclet-db-data:/var/lib/postgresql/data "
                "-e POSTGRES_USER=postgres "
                "-e POSTGRES_PASSWORD=postgres "
                "-e POSTGRES_DB=masclet "
                "-p 5432:5432 postgres:15"
            )
            ok, _ = ejecutar_comando(ssh_cliente, cmd_db)
            if not ok:
                log("Error al iniciar PostgreSQL", "ERROR")
                return False
            
            log("Esperando 10 segundos para inicialización de PostgreSQL...")
            time.sleep(10)
        
        # 7. Iniciar contenedor backend con volúmenes y configuración
        log("Iniciando contenedor backend...")
        cmd_run = (
            "sudo docker run -d --name masclet-backend "
            "--network masclet-network "
            f"-v {RUTA_REMOTA}/logs:/app/logs "
            f"-v {RUTA_REMOTA}/uploads:/app/uploads "
            f"-v {RUTA_REMOTA}/imports:/app/imports "
            f"-v {RUTA_REMOTA}/backups:/app/backups "
            f"-v {RUTA_REMOTA}/.env:/app/.env "
            "-p 8000:8000 "
            "masclet-backend:latest"
        )
        ok, _ = ejecutar_comando(ssh_cliente, cmd_run)
        if not ok:
            log("Error al iniciar backend", "ERROR")
            return False
        
        return True
    except Exception as e:
        log(f"Error en despliegue: {str(e)}", "ERROR")
        return False

def verificar_backend(ssh_cliente):
    """Verifica el estado del backend desplegado"""
    log("=== VERIFICANDO DESPLIEGUE ===")
    
    # 1. Verificar contenedores activos
    log("Verificando estado de contenedores...")
    ejecutar_comando(ssh_cliente, "sudo docker ps")
    
    # 2. Verificar logs del backend
    log("Verificando logs del backend...")
    time.sleep(5)  # Dar tiempo a que inicie completamente
    ejecutar_comando(ssh_cliente, "sudo docker logs masclet-backend --tail 20")
    
    # 3. Probar endpoint de salud
    log("Probando endpoint de salud...")
    time.sleep(5)  # Esperar a que el servicio esté disponible
    ok, health_output = ejecutar_comando(ssh_cliente, "curl -s http://localhost:8000/api/v1/health")
    
    if ok and "Error" not in health_output:
        log("✅ BACKEND DESPLEGADO Y FUNCIONANDO CORRECTAMENTE", "SUCCESS")
        return True
    else:
        log("❌ BACKEND NO RESPONDE CORRECTAMENTE", "ERROR")
        return False

def main():
    """Función principal"""
    log("=== INICIANDO DESPLIEGUE MASCLET BACKEND ===")
    log(f"Fecha: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # 1. Empaquetar backend
        ruta_paquete = empaquetar_backend()
        
        # 2. Transferir paquete
        nombre_paquete = transferir_paquete(ruta_paquete)
        
        # 3. Conectar SSH
        ssh_cliente = conectar_ssh()
        
        try:
            # 4. Desplegar backend
            if desplegar_backend(ssh_cliente, nombre_paquete):
                # 5. Verificar despliegue
                verificar_backend(ssh_cliente)
            else:
                log("⚠️ DESPLIEGUE INCOMPLETO", "WARNING")
        finally:
            ssh_cliente.close()
            log("Conexión SSH cerrada")
    
    except KeyboardInterrupt:
        log("Proceso interrumpido por el usuario", "WARNING")
    except Exception as e:
        log(f"Error inesperado: {str(e)}", "ERROR")
    
    log("=== FIN DEL PROCESO ===")

if __name__ == "__main__":
    main()
