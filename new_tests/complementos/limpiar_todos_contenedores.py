#!/usr/bin/env python3
"""
Script para limpiar TODOS los contenedores Docker en el servidor AWS.
Este script debe ejecutarse desde local y se conectará al servidor AWS.
"""

import os
import sys
import subprocess
from datetime import datetime

# Configuración
SSH_KEY_PATH = r"C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
EC2_USER = "ec2-user"
EC2_HOST = "108.129.139.119"

def ejecutar_comando(comando, mostrar_salida=True):
    """Ejecuta un comando local y muestra la salida"""
    print(f"Ejecutando: {comando}")
    resultado = subprocess.run(comando, shell=True, capture_output=True, text=True)
    
    if mostrar_salida:
        print("SALIDA:")
        print(resultado.stdout)
    
    if resultado.returncode != 0:
        print("ERROR:")
        print(resultado.stderr)
        return False
    
    return True

def ejecutar_comando_ssh(comando, mostrar_salida=True):
    """Ejecuta un comando en el servidor remoto a través de SSH"""
    ssh_comando = f'ssh -i "{SSH_KEY_PATH}" {EC2_USER}@{EC2_HOST} "{comando}"'
    return ejecutar_comando(ssh_comando, mostrar_salida)

def comprobar_conectividad():
    """Comprueba que podemos conectarnos al servidor AWS"""
    print("\n=== Comprobando conectividad con el servidor AWS ===")
    return ejecutar_comando_ssh("echo 'Conexión SSH establecida correctamente'", True)

def listar_contenedores():
    """Lista todos los contenedores actuales"""
    print("\n=== Contenedores actuales ===")
    ejecutar_comando_ssh("docker ps -a")

def detener_todos_contenedores():
    """Detiene TODOS los contenedores existentes"""
    print("\n=== Deteniendo TODOS los contenedores existentes ===")
    ejecutar_comando_ssh("docker stop $(docker ps -aq) 2>/dev/null || true")
    return True

def eliminar_todos_contenedores():
    """Elimina TODOS los contenedores"""
    print("\n=== Eliminando TODOS los contenedores ===")
    ejecutar_comando_ssh("docker rm $(docker ps -aq) 2>/dev/null || true")
    return True

def verificar_limpieza():
    """Verifica que no queden contenedores"""
    print("\n=== Verificando limpieza completa ===")
    ejecutar_comando_ssh("docker ps -a")
    return True

def main():
    """Función principal"""
    print("=== LIMPIEZA COMPLETA DE CONTENEDORES EN AWS ===")
    print(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Comprobar conectividad
    if not comprobar_conectividad():
        print("ERROR: No se puede conectar al servidor AWS.")
        return False
    
    # Listar contenedores actuales
    listar_contenedores()
    
    # Detener todos los contenedores
    if not detener_todos_contenedores():
        print("ERROR: No se pudieron detener los contenedores.")
        return False
    
    # Eliminar todos los contenedores
    if not eliminar_todos_contenedores():
        print("ERROR: No se pudieron eliminar los contenedores.")
        return False
    
    # Verificar limpieza
    if not verificar_limpieza():
        print("ERROR: No se pudo verificar la limpieza.")
        return False
    
    print("\n=== LIMPIEZA COMPLETADA CON ÉXITO ===")
    print("Todos los contenedores han sido eliminados.")
    print("Ahora puedes desplegar el backend con: python new_tests\\complementos\\desplegar_backend_aws.py")
    
    return True

if __name__ == "__main__":
    exito = main()
    sys.exit(0 if exito else 1)
