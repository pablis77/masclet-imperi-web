#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script simple para ver logs del backend desplegado
"""

import paramiko
import sys

# Configuración del servidor
SSH_HOST = "108.129.139.119"
SSH_USER = "ec2-user"
SSH_KEY = None  # Lo dejamos en None ya que el servidor está configurado para clave almacenada

def main():
    print("\n=== VERIFICANDO LOGS DEL BACKEND ===\n")
    
    # Conectar SSH
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        # Conectar con las claves almacenadas en ~/.ssh/
        client.connect(hostname=SSH_HOST, username=SSH_USER)
        print(f"Conectado a {SSH_HOST}\n")
        
        # Ver los logs completos del contenedor backend
        stdin, stdout, stderr = client.exec_command("sudo docker logs masclet-backend")
        logs = stdout.read().decode('utf-8')
        error = stderr.read().decode('utf-8')
        
        if logs:
            print("=== LOGS DEL BACKEND ===\n")
            print(logs)
            
        if error:
            print("\n=== ERRORES ===\n")
            print(error)
            
        # Ver el estado del contenedor
        stdin, stdout, stderr = client.exec_command("sudo docker ps -a | grep masclet-backend")
        print("\n=== ESTADO DEL CONTENEDOR ===\n")
        print(stdout.read().decode('utf-8'))
        
    except Exception as e:
        print(f"Error: {str(e)}")
        
    finally:
        client.close()
        print("\n=== FIN DE LA VERIFICACIÓN ===\n")

if __name__ == "__main__":
    main()
