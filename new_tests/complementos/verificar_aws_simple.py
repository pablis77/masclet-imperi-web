#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script simplificado para verificar endpoints básicos del backend en AWS
"""

import requests

# Configuración
API_BASE = "http://108.129.139.119:8000/api/v1"

def probar_endpoint(url, metodo="GET", json=None):
    """Prueba un endpoint y muestra el resultado"""
    url_completa = f"{API_BASE}{url}"
    print(f"\n=== Probando {metodo} {url_completa} ===")
    
    try:
        if metodo == "GET":
            response = requests.get(url_completa)
        elif metodo == "POST":
            response = requests.post(url_completa, json=json)
        
        print(f"Código de estado: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        try:
            datos = response.json()
            print(f"Datos (primeros 500 caracteres): {str(datos)[:500]}")
        except:
            print(f"Respuesta no es JSON: {response.text[:200]}")
        
        return response
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

# Probar endpoints públicos
print("=== VERIFICACIÓN DE BACKEND EN AWS ===")
probar_endpoint("/docs")
probar_endpoint("/openapi.json")

# Probar autenticación
print("\n=== Autenticación ===")
auth_response = probar_endpoint("/auth/login", metodo="POST", json={
    "username": "admin",
    "password": "admin123"
})

# Si la autenticación fue exitosa, probar endpoints protegidos
if auth_response and auth_response.status_code == 200:
    token = auth_response.json().get("access_token")
    if token:
        print("\n=== Endpoints protegidos ===")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Probar dashboard
        dashboard_url = "/dashboard/stats/"
        url_completa = f"{API_BASE}{dashboard_url}"
        print(f"\n=== Probando GET {url_completa} con token ===")
        try:
            response = requests.get(url_completa, headers=headers)
            print(f"Código de estado: {response.status_code}")
            print(f"Headers: {dict(response.headers)}")
            try:
                datos = response.json()
                print(f"Datos (primeros 500 caracteres): {str(datos)[:500]}")
            except:
                print(f"Respuesta no es JSON: {response.text[:200]}")
        except Exception as e:
            print(f"Error: {str(e)}")
    else:
        print("No se pudo obtener token a pesar de que la autenticación fue exitosa")
else:
    print("La autenticación falló, no se pueden probar endpoints protegidos")
