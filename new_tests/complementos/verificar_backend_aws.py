#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para verificar todos los endpoints críticos del backend en AWS
"""

import requests
import json
import sys
import time
from datetime import datetime

# Configuración
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
    """Obtiene token de autenticación con formato form-urlencoded"""
    color_print(f"=== Obteniendo token para {USERNAME} ===", "blue")
    
    login_url = f"{BASE_URL}/api/v1/auth/login"
    
    # Formato correcto: form-urlencoded con grant_type=password
    oauth_data = {
        "username": USERNAME,
        "password": PASSWORD,
        "grant_type": "password"
    }
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        color_print(f"Intentando login en: {login_url}", "blue")
        response = requests.post(login_url, data=oauth_data, headers=headers)
        
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
                        print(f"  Datos: {json.dumps(datos, indent=2)[:300]}...")
                    elif isinstance(datos, list):
                        print(f"  Lista con {len(datos)} elementos")
                        if datos:
                            print(f"  Primer elemento: {json.dumps(datos[0], indent=2)[:200]}...")
                except:
                    color_print(f"  Respuesta no es JSON: {response.text[:200]}...", "yellow")
            
            return True, response
        else:
            color_print(f"✗ ERROR ({status})", "red")
            color_print(f"  Respuesta: {response.text[:200]}...", "yellow")
            return False, response
    except Exception as e:
        color_print(f"✗ EXCEPCIÓN: {str(e)}", "red")
        return False, None

def main():
    """Función principal que prueba todos los endpoints importantes"""
    fecha_hora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    color_print(f"=== VERIFICACIÓN DE BACKEND AWS ({fecha_hora}) ===", "blue")
    
    # Probar endpoints públicos
    color_print("\n== Endpoints públicos ==", "blue")
    probar_endpoint("/docs", esperar_json=False)
    
    # Obtener token
    token = obtener_token()
    if not token:
        color_print("✗ No se pudo obtener token, abortando pruebas protegidas", "red")
        return
    
    # Probar endpoints críticos (Dashboard)
    color_print("\n== Endpoints de Dashboard ==", "blue")
    ok_dashboard, resp = probar_endpoint("/api/v1/dashboard/stats", token)
    
    # Probar endpoints de explotaciones
    color_print("\n== Endpoints de Explotaciones ==", "blue")
    ok_explotaciones, resp = probar_endpoint("/api/v1/dashboard/explotacions", token)
    
    if ok_explotaciones and resp:
        try:
            explotaciones = resp.json()
            if explotaciones and len(explotaciones) > 0:
                exp_id = explotaciones[0].get("id")
                if exp_id:
                    color_print(f"\n=== Probando detalle de explotación (ID: {exp_id}) ===", "blue")
                    probar_endpoint(f"/api/v1/dashboard/explotacions/{exp_id}", token)
        except:
            color_print("No se pudo obtener ID de explotación para prueba de detalle", "yellow")
    
    # Probar endpoints de animales
    color_print("\n== Endpoints de Animales ==", "blue")
    ok_animales, resp = probar_endpoint("/api/v1/animals", token)
    
    if ok_animales and resp:
        try:
            animales = resp.json()
            if animales and len(animales) > 0:
                animal_id = animales[0].get("id")
                if animal_id:
                    color_print(f"\n=== Probando detalle de animal (ID: {animal_id}) ===", "blue")
                    probar_endpoint(f"/api/v1/animals/{animal_id}", token)
                    
                    # Probar partos si es una vaca
                    genere = animales[0].get("genere")
                    if genere == "F":
                        color_print(f"\n=== Probando partos de vaca (ID: {animal_id}) ===", "blue")
                        probar_endpoint(f"/api/v1/animals/{animal_id}/partos", token)
        except:
            color_print("No se pudo obtener ID de animal para prueba de detalle", "yellow")
    
    # Resultado final
    color_print("\n=== VERIFICACIÓN COMPLETADA ===", "blue")
    if ok_dashboard and ok_explotaciones and ok_animales:
        color_print("✓ Backend y base de datos funcionando correctamente en AWS", "green")
        color_print("✓ Todos los endpoints críticos responden correctamente", "green")
        color_print("✓ El despliegue ha sido exitoso", "green")
    else:
        color_print("⚠ Algunos endpoints no están funcionando correctamente", "yellow")
        if not ok_dashboard:
            color_print("  ✗ Dashboard no funciona", "red")
        if not ok_explotaciones:
            color_print("  ✗ Explotaciones no funciona", "red")
        if not ok_animales:
            color_print("  ✗ Animales no funciona", "red")

if __name__ == "__main__":
    main()
