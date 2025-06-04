#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para ver los logs completos del backend en el servidor
"""

import sys
import paramiko
import getpass
import time

# Configuración del servidor
SERVER_HOST = "108.129.139.119"
SERVER_USER = "ec2-user"

def conectar_ssh():
    """Conecta al servidor por SSH con contraseña"""
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    # Solicitar contraseña
    password = getpass.getpass(f"Contraseña para {SERVER_USER}@{SERVER_HOST}: ")
    
    try:
        client.connect(
            hostname=SERVER_HOST,
            username=SERVER_USER,
            password=password
        )
        print(f"\n[INFO] Conexión SSH establecida con {SERVER_USER}@{SERVER_HOST}\n")
        return client
    except Exception as e:
        print(f"[ERROR] No se pudo conectar: {str(e)}")
        sys.exit(1)

def ejecutar_comando(ssh_client, command):
    """Ejecuta un comando remoto y muestra su salida"""
    print(f"Ejecutando: {command}")
    stdin, stdout, stderr = ssh_client.exec_command(command)
    exit_code = stdout.channel.recv_exit_status()
    
    # Mostrar salida
    output = stdout.read().decode("utf-8")
    error = stderr.read().decode("utf-8")
    
    if output:
        print(f"\n=== SALIDA ===\n{output}")
    if error:
        print(f"\n=== ERROR ===\n{error}")
    
    return exit_code

def main():
    """Función principal"""
    print("\n=== VERIFICANDO LOGS DEL BACKEND ===\n")
    
    # Conectar por SSH
    ssh_client = conectar_ssh()
    
    try:
        # Ver logs completos del contenedor backend
        ejecutar_comando(ssh_client, "sudo docker logs masclet-backend")
        
        # Ver estado del contenedor
        ejecutar_comando(ssh_client, "sudo docker ps -a | grep masclet-backend")
        
        # Verificar el endpoint de salud
        ejecutar_comando(ssh_client, "curl -s http://localhost:8000/api/v1/health || echo 'Error: endpoint de salud no disponible'")
    finally:
        ssh_client.close()
        print("\n=== VERIFICACIÓN COMPLETADA ===\n")

if __name__ == "__main__":
    main()
