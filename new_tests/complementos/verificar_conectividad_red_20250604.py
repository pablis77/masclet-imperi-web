#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para verificar la conectividad de red entre contenedores Docker en AWS
Fecha: 04/06/2025 - 18:12

Este script:
1. Verifica que los contenedores estén en la misma red
2. Comprueba la resolución de nombres entre contenedores
3. Prueba la conectividad a la base de datos desde el contenedor API
4. Genera un informe detallado de la configuración de red
"""
import subprocess
import json
import time
import sys
from datetime import datetime

# Configuración
EC2_KEY_PATH = r"C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
EC2_HOST = "ec2-user@108.129.139.119"

def ejecutar_comando_ssh(comando, mostrar_salida=True):
    """Ejecuta un comando SSH en el servidor remoto"""
    cmd = f'ssh -i "{EC2_KEY_PATH}" {EC2_HOST} "{comando}"'
    print(f"Ejecutando: {cmd}" if mostrar_salida else "")
    
    resultado = subprocess.run(
        cmd, 
        shell=True, 
        text=True,
        capture_output=True
    )
    
    if mostrar_salida:
        print(f"SALIDA: {resultado.stdout}")
        if resultado.stderr:
            print(f"ERROR: {resultado.stderr}")
    
    return resultado.stdout, resultado.stderr, resultado.returncode

def main():
    """Función principal"""
    print("\n" + "=" * 80)
    print(" " * 16 + "VERIFICACIÓN DE CONECTIVIDAD DE RED EN AWS")
    print("=" * 80)
    print(f"Fecha y hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("=" * 80)
    
    # 1. Verificar existencia de red y contenedores
    print("\n1. VERIFICANDO RED DOCKER\n" + "-" * 30)
    stdout, stderr, rc = ejecutar_comando_ssh("docker network ls | grep masclet-network")
    
    # 2. Verificar contenedores conectados a la red
    print("\n2. CONTENEDORES EN LA RED\n" + "-" * 30)
    stdout, stderr, rc = ejecutar_comando_ssh(
        "docker network inspect masclet-network --format '{{.Containers}}'"
    )
    
    # 3. Probar conectividad entre contenedores
    print("\n3. CONECTIVIDAD ENTRE CONTENEDORES\n" + "-" * 30)
    
    # 3.1 Verificar si la API puede resolver el nombre del contenedor DB
    print("\n3.1. Resolución de nombres desde API a DB")
    stdout, stderr, rc = ejecutar_comando_ssh(
        "docker exec masclet-api ping -c 2 masclet-db"
    )
    if rc != 0:
        print("⚠️ La API no puede resolver el nombre del contenedor DB")
        
        # Verificar si el contenedor de API está funcionando
        stdout, stderr, rc = ejecutar_comando_ssh("docker ps | grep masclet-api")
        if stdout.strip() == "":
            print("❌ El contenedor masclet-api no está en ejecución")
            stdout, stderr, rc = ejecutar_comando_ssh("docker logs masclet-api")
    
    # 3.2 Verificar si la API puede conectarse a PostgreSQL
    print("\n3.2. Conectividad a PostgreSQL")
    stdout, stderr, rc = ejecutar_comando_ssh(
        "docker exec masclet-api python -c \"import psycopg2; conn=psycopg2.connect('dbname=masclet_imperi user=admin password=admin123 host=masclet-db'); print('✅ Conexión exitosa a PostgreSQL');\""
    )
    
    # 4. Información detallada de la red
    print("\n4. DETALLES DE LA RED DOCKER\n" + "-" * 30)
    stdout, stderr, rc = ejecutar_comando_ssh("docker network inspect masclet-network")
    
    # 5. Variables de entorno en contenedores
    print("\n5. VARIABLES DE ENTORNO\n" + "-" * 30)
    print("\n5.1. Variables en masclet-api")
    stdout, stderr, rc = ejecutar_comando_ssh(
        "docker exec masclet-api env | grep -E 'POSTGRES|DATABASE'"
    )
    
    print("\n" + "=" * 80)
    print(" " * 25 + "FIN DE LA VERIFICACIÓN")
    print("=" * 80 + "\n")
    
    # Resumen y recomendaciones
    print("\nRESUMEN Y PRÓXIMOS PASOS:")
    print("1. Verificar que ambos contenedores estén en ejecución")
    print("2. Comprobar que las variables de entorno de la API son correctas")
    print("3. Asegurarse de que la API tiene acceso a la base de datos")
    print("4. Probar los endpoints principales con curl o un navegador")
    print("   curl http://108.129.139.119:8000/api/v1/health")

if __name__ == "__main__":
    main()
