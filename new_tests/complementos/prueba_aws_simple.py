#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script muy simple para verificar el backend AWS
"""

import requests
import json

# URL base y credenciales 
BASE_URL = "http://108.129.139.119:8000"
USERNAME = "admin"
PASSWORD = "admin123"

print(f"=== VERIFICACIÓN BÁSICA DEL BACKEND AWS ===")

# 1. Verificar que la documentación está disponible
docs_url = f"{BASE_URL}/docs"
print(f"\nProbando documentación: {docs_url}")
try:
    response = requests.get(docs_url)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✓ Documentación OK")
    else:
        print("✗ Error en documentación")
except Exception as e:
    print(f"✗ Error: {str(e)}")

# 2. Probar login con formato correcto (form-urlencoded)
login_url = f"{BASE_URL}/api/v1/auth/login"
print(f"\nProbando login: {login_url}")

# El formato correcto es form-urlencoded con grant_type=password
oauth_data = {
    "username": USERNAME,
    "password": PASSWORD,
    "grant_type": "password"
}

headers = {
    "Content-Type": "application/x-www-form-urlencoded"
}

try:
    response = requests.post(login_url, data=oauth_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Respuesta: {response.text[:200]}")
    
    if response.status_code == 200:
        print("✓ Login OK")
        try:
            token_data = response.json()
            token = token_data.get("access_token")
            
            if token:
                print(f"Token: {token[:30]}...")
                
                # 3. Probar un endpoint protegido
                stats_url = f"{BASE_URL}/api/v1/dashboard/stats"
                print(f"\nProbando stats: {stats_url}")
                
                auth_headers = {
                    "Authorization": f"Bearer {token}"
                }
                
                stats_response = requests.get(stats_url, headers=auth_headers)
                print(f"Status: {stats_response.status_code}")
                
                if stats_response.status_code == 200:
                    print("✓ Dashboard stats OK")
                    print(f"Datos: {stats_response.text[:200]}...")
                else:
                    print("✗ Error en dashboard stats")
                    print(f"Respuesta: {stats_response.text[:200]}")
            else:
                print("✗ No se encontró token en la respuesta")
        except:
            print("✗ Error al parsear respuesta JSON")
    else:
        print("✗ Error en login")
except Exception as e:
    print(f"✗ Error: {str(e)}")

print("\n=== VERIFICACIÓN COMPLETADA ===")
