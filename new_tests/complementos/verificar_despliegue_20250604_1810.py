#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para verificar el despliegue en AWS
Fecha: 04/06/2025 - 18:10

Este script:
1. Verifica que los contenedores Docker estén funcionando
2. Comprueba la conectividad a la base de datos
3. Prueba los endpoints principales de la API
4. Genera un informe del estado del despliegue
"""
import subprocess
import json
import time
import sys
import re
import datetime
import requests
from urllib.parse import urljoin
from tabulate import tabulate

# Configuración
EC2_KEY_PATH = r"C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
EC2_HOST = "ec2-user@108.129.139.119"
BASE_URL = "http://108.129.139.119:8000"
API_PREFIX = "/api/v1"

def ejecutar_comando_ssh(comando, mostrar_salida=True):
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

def probar_endpoint(endpoint, método="GET", datos=None, token=None):
    url = urljoin(BASE_URL, endpoint)
    headers = {'Content-Type': 'application/json'}
    
    if token:
        headers['Authorization'] = f"Bearer {token}"
    
    try:
        if método.upper() == "GET":
            respuesta = requests.get(url, headers=headers, timeout=5)
        elif método.upper() == "POST":
            respuesta = requests.post(url, json=datos, headers=headers, timeout=5)
        else:
            return f"Método no soportado: {método}", None, None
        
        return (
            f"HTTP {respuesta.status_code}", 
            respuesta.elapsed.total_seconds(),
            respuesta.json() if respuesta.status_code < 400 else None
        )
    except requests.exceptions.RequestException as e:
        return f"Error: {str(e)}", None, None
    except json.JSONDecodeError:
        return f"HTTP {respuesta.status_code} (No JSON)", respuesta.elapsed.total_seconds(), None

def obtener_token_acceso():
    url = urljoin(BASE_URL, f"{API_PREFIX}/auth/login")
    datos = {"username": "admin", "password": "admin123"}
    headers = {'Content-Type': 'application/json'}
    
    try:
        respuesta = requests.post(url, json=datos, headers=headers, timeout=5)
        if respuesta.status_code == 200:
            return respuesta.json().get('access_token')
        return None
    except:
        return None

def main():
    print("\n" + "=" * 80)
    print(" " * 17 + "VERIFICACIÓN DEL DESPLIEGUE MASCLET IMPERI EN AWS")
    print("=" * 80)
    print(f"URL Base: {BASE_URL}")
    print(f"Fecha y hora: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("=" * 80)
    
    # 1. Verificar contenedores Docker
    print("\n1. ESTADO DE CONTENEDORES DOCKER\n" + "-" * 30)
    stdout, stderr, rc = ejecutar_comando_ssh("docker ps -a")
    
    # 2. Verificar conectividad a base de datos
    print("\n2. VERIFICACIÓN DE BASE DE DATOS\n" + "-" * 30)
    stdout, stderr, rc = ejecutar_comando_ssh(
        "docker exec masclet-db psql -U admin -d masclet_imperi -c '\\dt'"
    )
    
    # 3. Probar endpoint de salud
    print("\n3. VERIFICACIÓN DE ENDPOINT DE SALUD\n" + "-" * 30)
    estado, tiempo, datos = probar_endpoint(f"{API_PREFIX}/health")
    print(f"Estado: {estado}")
    print(f"Tiempo de respuesta: {tiempo} segundos")
    print(f"Datos: {datos}")
    
    # 4. Probar autenticación
    print("\n4. VERIFICACIÓN DE AUTENTICACIÓN\n" + "-" * 30)
    estado, tiempo, datos = probar_endpoint(
        f"{API_PREFIX}/auth/login", 
        método="POST",
        datos={"username": "admin", "password": "admin123"}
    )
    print(f"Estado: {estado}")
    print(f"Tiempo de respuesta: {tiempo} segundos")
    
    token = datos.get('access_token') if datos else None
    if token:
        print("✅ Token de acceso obtenido correctamente")
    else:
        print("❌ No se pudo obtener el token de acceso")
    
    # 5. Probar endpoints principales con autenticación
    if token:
        print("\n5. VERIFICACIÓN DE ENDPOINTS PRINCIPALES\n" + "-" * 30)
        endpoints = [
            f"{API_PREFIX}/dashboard/stats",
            f"{API_PREFIX}/animals/",
            f"{API_PREFIX}/dashboard/explotacions/",
            f"{API_PREFIX}/users/",
        ]
        
        resultados = []
        for endpoint in endpoints:
            estado, tiempo, datos = probar_endpoint(endpoint, token=token)
            resultados.append([endpoint, estado, f"{tiempo:.3f}s" if tiempo else "N/A"])
            
        print(tabulate(resultados, headers=["Endpoint", "Estado", "Tiempo"], tablefmt="grid"))
    
    print("\n" + "=" * 80)
    print(" " * 25 + "FIN DE LA VERIFICACIÓN")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
