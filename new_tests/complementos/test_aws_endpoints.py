#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para probar los endpoints principales del backend en AWS
Enfocado especialmente en dashboard y explotaciones
"""

import requests
import json
import sys

# Configuración
API_BASE_URL = "http://108.129.139.119:8000/api/v1"
ADMIN_USER = "admin"
ADMIN_PASSWORD = "admin123"

# Colores para consola
class Colors:
    OK = '\033[92m'  # Verde
    ERROR = '\033[91m'  # Rojo
    WARNING = '\033[93m'  # Amarillo
    RESET = '\033[0m'  # Reset

def print_colored(message, color=Colors.RESET):
    """Imprime un mensaje con color"""
    print(f"{color}{message}{Colors.RESET}")

def get_auth_token():
    """Obtiene token de autenticación para el usuario admin"""
    try:
        login_url = f"{API_BASE_URL}/auth/login"
        print(f"Intentando autenticación en: {login_url}")
        print(f"Datos: {json.dumps({"username": ADMIN_USER, "password": ADMIN_PASSWORD})}")
        
        response = requests.post(
            login_url,
            json={"username": ADMIN_USER, "password": ADMIN_PASSWORD}
        )
        
        print(f"Código de estado: {response.status_code}")
        print(f"Headers: {response.headers}")
        print(f"Respuesta: {response.text[:500]}")
        
        if response.status_code == 200:
            try:
                resp_json = response.json()
                print(f"JSON: {json.dumps(resp_json)}")
                token = resp_json.get("access_token")
                if token:
                    print_colored(f"✓ Autenticación exitosa para {ADMIN_USER}", Colors.OK)
                    return token
                else:
                    print_colored("✗ Error: Respuesta de autenticación no contiene token", Colors.ERROR)
                    return None
            except Exception as e:
                print_colored(f"✗ Error al procesar JSON: {str(e)}", Colors.ERROR)
                return None
        else:
            print_colored(f"✗ Error de autenticación ({response.status_code}): {response.text}", Colors.ERROR)
            return None
    except Exception as e:
        print_colored(f"✗ Error en autenticación: {str(e)}", Colors.ERROR)
        return None

def test_endpoint(endpoint, token=None, expected_status=200):
    """Prueba un endpoint específico y muestra resultados"""
    url = f"{API_BASE_URL}{endpoint}"
    headers = {}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        response = requests.get(url, headers=headers)
        status = response.status_code
        
        if status == expected_status:
            print_colored(f"✓ {url} - OK ({status})", Colors.OK)
            
            try:
                data = response.json()
                if isinstance(data, dict) and len(data) > 0:
                    print("  Datos recibidos: " + json.dumps(data, indent=2)[:200] + "...")
                elif isinstance(data, list):
                    print(f"  Recibidos {len(data)} elementos")
                    if len(data) > 0:
                        print("  Primer elemento: " + json.dumps(data[0], indent=2)[:200] + "...")
            except:
                print("  No se pudo parsear respuesta como JSON")
                
            return True
        else:
            print_colored(f"✗ {url} - ERROR ({status}): {response.text[:100]}", Colors.ERROR)
            return False
    except Exception as e:
        print_colored(f"✗ {url} - EXCEPCIÓN: {str(e)}", Colors.ERROR)
        return False

def main():
    """Función principal que ejecuta las pruebas"""
    print_colored("=== PRUEBA DE ENDPOINTS DEL BACKEND EN AWS ===", Colors.WARNING)
    print(f"URL Base: {API_BASE_URL}")
    
    # Probar endpoints públicos
    print_colored("\n== Endpoints públicos ==", Colors.WARNING)
    test_endpoint("/docs", expected_status=200)
    test_endpoint("/openapi.json", expected_status=200)
    
    # Autenticación
    token = get_auth_token()
    if not token:
        print_colored("No se pudo obtener token. Abortando pruebas protegidas.", Colors.ERROR)
        sys.exit(1)
    
    # Probar endpoints de dashboard
    print_colored("\n== Endpoints de Dashboard ==", Colors.WARNING)
    test_endpoint("/dashboard/stats/", token)
    
    # Obtener lista de explotaciones
    print_colored("\n== Obteniendo lista de explotaciones ==", Colors.WARNING)
    try:
        url = f"{API_BASE_URL}/dashboard/explotacions/"
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            explotacions = response.json()
            print_colored(f"✓ Se encontraron {len(explotacions)} explotaciones", Colors.OK)
            
            if len(explotacions) > 0:
                # Mostrar detalles de las explotaciones
                for i, exp in enumerate(explotacions):
                    print(f"  {i+1}. ID: {exp.get('id')}, Código: {exp.get('explotacio')}")
                
                # Probar endpoint de detalles para la primera explotación
                if explotacions:
                    exp_id = explotacions[0].get("id")
                    print_colored(f"\n== Probando explotación ID {exp_id} ==", Colors.WARNING)
                    test_endpoint(f"/dashboard/explotacions/{exp_id}/", token)
            else:
                print_colored("  No hay explotaciones para probar detalles", Colors.WARNING)
        else:
            print_colored(f"✗ Error al obtener explotaciones ({response.status_code}): {response.text}", Colors.ERROR)
    except Exception as e:
        print_colored(f"✗ Error al procesar explotaciones: {str(e)}", Colors.ERROR)
    
    # Probar otros endpoints importantes
    print_colored("\n== Otros endpoints importantes ==", Colors.WARNING)
    test_endpoint("/dashboard/recent-activity/", token)
    test_endpoint("/dashboard/summary/", token)
    test_endpoint("/dashboard/partos/", token)
    
    print_colored("\n=== PRUEBA COMPLETADA ===", Colors.WARNING)

if __name__ == "__main__":
    main()
