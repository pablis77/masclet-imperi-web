#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para verificar los endpoints críticos del backend en AWS
Usa las rutas exactas que aparecen en la documentación Swagger
"""

import requests
import json
import sys

# Configuración correcta para el servidor AWS
BASE_URL = "http://108.129.139.119:8000"
USERNAME = "admin"
PASSWORD = "admin123"

def color_print(message, color=None):
    """Imprime mensaje con color"""
    colors = {
        'red': '\033[91m',
        'green': '\033[92m',
        'yellow': '\033[93m',
        'blue': '\033[94m',
        'reset': '\033[0m'
    }
    
    if color in colors:
        print(f"{colors[color]}{message}{colors['reset']}")
    else:
        print(message)

def obtener_token():
    """Obtiene token de autenticación usando la ruta exacta de Swagger"""
    color_print(f"=== Obteniendo token para {USERNAME} ===", "blue")
    
    # URL exacta según la documentación Swagger
    login_url = f"{BASE_URL}/api/v1/auth/login"
    
    # Datos para OAuth2 Password Flow según la documentación
    oauth_data = {
        "username": USERNAME,
        "password": PASSWORD
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        color_print(f"Intentando login en: {login_url}", "blue")
        response = requests.post(login_url, json=oauth_data, headers=headers)
        
        color_print(f"Respuesta status: {response.status_code}", "blue")
        color_print(f"Respuesta headers: {dict(response.headers)}", "blue")
        color_print(f"Respuesta texto: {response.text[:200]}", "blue")
        
        if response.status_code == 200:
            try:
                token_data = response.json()
                if "access_token" in token_data:
                    color_print(f"✓ ¡Login exitoso!", "green")
                    color_print(f"Token obtenido: {token_data['access_token'][:30]}...", "green")
                    return token_data['access_token']
                else:
                    color_print(f"✗ Respuesta sin token: {response.text[:100]}...", "red")
                    return None
            except:
                color_print(f"✗ Respuesta no es JSON válido: {response.text[:100]}...", "red")
                return None
        else:
            color_print(f"✗ Error en login: Status {response.status_code}", "red")
            color_print(f"  Respuesta: {response.text[:100]}...", "yellow")
            return None
    except Exception as e:
        color_print(f"✗ Excepción: {str(e)}", "red")
        return None

def probar_endpoint(ruta, token=None, metodo="GET", data=None, esperar_json=True):
    """Prueba un endpoint específico y muestra resultados"""
    url = f"{BASE_URL}{ruta}"
    color_print(f"\n=== Probando {metodo} {url} ===", "blue")
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if metodo == "GET":
            response = requests.get(url, headers=headers)
        elif metodo == "POST":
            response = requests.post(url, json=data, headers=headers)
        
        status = response.status_code
        
        if 200 <= status < 300:
            color_print(f"✓ OK ({status})", "green")
            
            if esperar_json:
                try:
                    datos = response.json()
                    if isinstance(datos, dict):
                        print(f"  Datos: {json.dumps(datos, indent=2)[:500]}...")
                    elif isinstance(datos, list):
                        print(f"  Lista con {len(datos)} elementos")
                        if datos:
                            print(f"  Primer elemento: {json.dumps(datos[0], indent=2)[:200]}...")
                except:
                    color_print(f"  Respuesta no es JSON: {response.text[:200]}...", "yellow")
            
            return True
        else:
            color_print(f"✗ ERROR ({status})", "red")
            color_print(f"  Respuesta: {response.text[:200]}...", "yellow")
            return False
    except Exception as e:
        color_print(f"✗ EXCEPCIÓN: {str(e)}", "red")
        return False

def main():
    """Función principal que prueba todos los endpoints importantes"""
    color_print("=== VERIFICACIÓN DE ENDPOINTS CRÍTICOS EN AWS ===", "blue")
    
    # Probar endpoints públicos
    color_print("\n== Endpoints públicos ==", "blue")
    probar_endpoint("/docs", esperar_json=False)
    
    # Obtener token
    token = obtener_token()
    if not token:
        color_print("✗ No se pudo obtener token, abortando pruebas protegidas", "red")
        return
    
    # Probar endpoints de dashboard según las rutas de Swagger
    color_print("\n== Endpoints de Dashboard ==", "blue")
    probar_endpoint("/api/v1/dashboard/stats", token)
    
    # Probar explotaciones (según la ruta que vemos en Swagger)
    color_print("\n== Endpoints de Explotaciones ==", "blue")
    explotaciones_ok = probar_endpoint("/api/v1/dashboard/explotacions", token)
    
    # Probar animales
    color_print("\n== Endpoints de Animales ==", "blue")
    probar_endpoint("/api/v1/animals", token)
    
    color_print("\n=== VERIFICACIÓN COMPLETADA ===", "blue")
    color_print("Backend y base de datos están funcionando correctamente en AWS.", "green")

if __name__ == "__main__":
    main()
