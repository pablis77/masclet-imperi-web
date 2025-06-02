#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script completo para verificar el backend de Masclet Imperi en AWS
=================================================================

Este script realiza una verificación exhaustiva del backend desplegado en AWS,
comprobando la autenticación, los endpoints críticos y el estado de la base de datos.

Endpoints verificados:
1. /docs - Documentación Swagger
2. /api/v1/auth/login - Autenticación
3. /api/v1/dashboard/stats - Estadísticas
4. /api/v1/dashboard/explotacions - Explotaciones
5. /api/v1/animals - Listado de animales

Autor: Equipo Masclet Imperi
Fecha: Junio 2025
"""

import requests
import json
import sys
import time
import os
from datetime import datetime
from colorama import init, Fore, Style

# Inicializar colorama para Windows
init()

# Configuración
BASE_URL = "http://108.129.139.119:8000"
USERNAME = "admin"
PASSWORD = "admin123"
TIMEOUT = 10  # segundos

# Endpoints críticos a verificar
ENDPOINTS = [
    {"ruta": "/docs", "metodo": "GET", "auth": False, "nombre": "Documentación Swagger", "esperar_json": False},
    {"ruta": "/api/v1/dashboard/stats", "metodo": "GET", "auth": True, "nombre": "Estadísticas Dashboard"},
    {"ruta": "/api/v1/dashboard/explotacions", "metodo": "GET", "auth": True, "nombre": "Explotaciones"},
    {"ruta": "/api/v1/animals", "metodo": "GET", "auth": True, "nombre": "Listado de Animales"}
]

def imprimir_cabecera():
    """Imprime la cabecera del script"""
    print(f"{Fore.CYAN}{'=' * 80}")
    print(f"{Fore.CYAN}{'VERIFICACIÓN DEL BACKEND MASCLET IMPERI EN AWS':^80}")
    print(f"{Fore.CYAN}{'=' * 80}")
    print(f"{Fore.CYAN}URL Base: {Fore.WHITE}{BASE_URL}")
    print(f"{Fore.CYAN}Fecha y hora: {Fore.WHITE}{datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"{Fore.CYAN}{'=' * 80}{Style.RESET_ALL}\n")

def color_print(mensaje, color=None):
    """Imprime mensaje con color usando colorama"""
    colores = {
        'rojo': Fore.RED,
        'verde': Fore.GREEN,
        'amarillo': Fore.YELLOW,
        'azul': Fore.CYAN,
        'magenta': Fore.MAGENTA,
        'reset': Style.RESET_ALL
    }
    
    if color in colores:
        print(f"{colores[color]}{mensaje}{colores['reset']}")
    else:
        print(mensaje)

def obtener_token():
    """Obtiene token de autenticación con formato form-urlencoded"""
    color_print(f"\n[*] Obteniendo token para {USERNAME}", "azul")
    
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
        color_print(f"[*] Intentando login en: {login_url}", "azul")
        response = requests.post(login_url, data=oauth_data, headers=headers, timeout=TIMEOUT)
        
        if response.status_code == 200:
            try:
                token_data = response.json()
                if "access_token" in token_data:
                    color_print(f"[✓] ¡Login exitoso!", "verde")
                    token = token_data['access_token']
                    token_cortado = f"{token[:20]}...{token[-10:]}" if len(token) > 30 else token
                    color_print(f"[✓] Token obtenido: {token_cortado}", "verde")
                    return token
                else:
                    color_print(f"[✗] Respuesta sin token: {response.text[:100]}...", "rojo")
                    return None
            except:
                color_print(f"[✗] Respuesta no es JSON válido: {response.text[:100]}...", "rojo")
                return None
        else:
            color_print(f"[✗] Error en login: Status {response.status_code}", "rojo")
            color_print(f"    Respuesta: {response.text[:100]}...", "amarillo")
            return None
    except Exception as e:
        color_print(f"[✗] Excepción: {str(e)}", "rojo")
        return None

def probar_endpoint(ruta, token=None, metodo="GET", data=None, esperar_json=True, nombre=None):
    """Prueba un endpoint específico y muestra resultados"""
    url = f"{BASE_URL}{ruta}"
    nombre_endpoint = nombre if nombre else ruta
    
    color_print(f"\n[*] Probando {metodo} {nombre_endpoint}", "azul")
    color_print(f"    URL: {url}", "azul")
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if metodo == "GET":
            response = requests.get(url, headers=headers, timeout=TIMEOUT)
        elif metodo == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=TIMEOUT)
        
        status = response.status_code
        
        if 200 <= status < 300:
            color_print(f"[✓] OK ({status})", "verde")
            
            if esperar_json:
                try:
                    datos = response.json()
                    if isinstance(datos, dict):
                        print(f"    Datos: {json.dumps(datos, indent=2, ensure_ascii=False)[:300]}...")
                        # Extraer información importante según el endpoint
                        if ruta == "/api/v1/dashboard/stats":
                            extraer_stats_dashboard(datos)
                        elif ruta == "/api/v1/dashboard/explotacions":
                            extraer_info_explotaciones(datos)
                        elif ruta == "/api/v1/animals":
                            extraer_info_animales(datos)
                    elif isinstance(datos, list):
                        print(f"    Lista con {len(datos)} elementos")
                        if len(datos) > 0 and isinstance(datos[0], dict):
                            print(f"    Primer elemento: {json.dumps(datos[0], indent=2, ensure_ascii=False)[:200]}...")
                        
                        # Extraer información importante según el endpoint
                        if ruta == "/api/v1/dashboard/explotacions":
                            extraer_info_explotaciones(datos)
                        elif ruta == "/api/v1/animals":
                            extraer_info_animales(datos)
                    
                    return True, datos
                except Exception as e:
                    color_print(f"[!] Error al procesar JSON: {str(e)}", "amarillo")
                    print(f"    Respuesta: {response.text[:200]}...")
                    return True, None
            else:
                if len(response.text) > 300:
                    print(f"    Respuesta: {response.text[:300]}...")
                else:
                    print(f"    Respuesta: {response.text}")
                return True, response.text
        else:
            color_print(f"[✗] Error: Status {status}", "rojo")
            color_print(f"    Respuesta: {response.text[:200]}...", "amarillo")
            return False, None
    except Exception as e:
        color_print(f"[✗] Excepción: {str(e)}", "rojo")
        return False, None

def extraer_stats_dashboard(datos):
    """Extrae y muestra información relevante de las estadísticas del dashboard"""
    try:
        color_print("\n[i] Información del Dashboard:", "magenta")
        print(f"    • Total animales: {datos.get('total_animals', 'N/A')}")
        print(f"    • Machos: {datos.get('total_machos', 'N/A')}")
        print(f"    • Hembras: {datos.get('total_hembras', 'N/A')}")
        print(f"    • Ratio partos por vaca: {datos.get('partos_por_vaca', 'N/A')}")
        
        estados_alletar = datos.get('estados_alletar', {})
        if estados_alletar:
            print("\n    Distribución de estados de amamantamiento:")
            for estado, cantidad in estados_alletar.items():
                print(f"    • {estado}: {cantidad}")
        
        estados_animal = datos.get('estados_animal', {})
        if estados_animal:
            print("\n    Distribución de estados de animal:")
            for estado, cantidad in estados_animal.items():
                print(f"    • {estado}: {cantidad}")
    except Exception as e:
        color_print(f"[!] Error al extraer estadísticas: {str(e)}", "amarillo")

def extraer_info_explotaciones(datos):
    """Extrae y muestra información relevante de las explotaciones"""
    try:
        if isinstance(datos, list):
            color_print("\n[i] Información de Explotaciones:", "magenta")
            print(f"    • Total explotaciones: {len(datos)}")
            
            if len(datos) > 0:
                print("\n    Lista de explotaciones:")
                for i, explotacion in enumerate(datos, 1):
                    explotacio = explotacion.get('explotacio', 'N/A')
                    num_animals = explotacion.get('num_animals', 'N/A')
                    print(f"    • {i}. {explotacio} - Animales: {num_animals}")
    except Exception as e:
        color_print(f"[!] Error al extraer información de explotaciones: {str(e)}", "amarillo")

def extraer_info_animales(datos):
    """Extrae y muestra información relevante de los animales"""
    try:
        if isinstance(datos, list):
            color_print("\n[i] Información de Animales:", "magenta")
            print(f"    • Total animales en respuesta: {len(datos)}")
            
            machos = [a for a in datos if a.get('genere') == 'M']
            hembras = [a for a in datos if a.get('genere') == 'F']
            
            print(f"    • Machos: {len(machos)}")
            print(f"    • Hembras: {len(hembras)}")
            
            # Analizar estados de amamantamiento
            alletar_0 = [a for a in hembras if a.get('alletar') == 0]
            alletar_1 = [a for a in hembras if a.get('alletar') == 1]
            alletar_2 = [a for a in hembras if a.get('alletar') == 2]
            
            print("\n    Distribución de estados de amamantamiento:")
            print(f"    • No amamantan (0): {len(alletar_0)}")
            print(f"    • Amamantan a un ternero (1): {len(alletar_1)}")
            print(f"    • Amamantan a dos terneros (2): {len(alletar_2)}")
            
            # Mostrar algunos ejemplos
            if len(datos) > 0:
                print("\n    Ejemplos de animales:")
                for i, animal in enumerate(datos[:3], 1):
                    nombre = animal.get('nom', 'N/A')
                    genere = animal.get('genere', 'N/A')
                    explotacio = animal.get('explotacio', 'N/A')
                    alletar = animal.get('alletar', 'N/A')
                    estado = animal.get('estado', 'N/A')
                    print(f"    • {i}. {nombre} (Género: {genere}, Explotación: {explotacio}, Estado: {estado}, Amamantamiento: {alletar})")
    except Exception as e:
        color_print(f"[!] Error al extraer información de animales: {str(e)}", "amarillo")

def verificar_backend():
    """Verifica todos los aspectos del backend"""
    imprimir_cabecera()
    
    # Paso 1: Verificar que el servidor responde
    color_print("\n[*] Verificando que el servidor responde...", "azul")
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=TIMEOUT)
        if response.status_code == 200:
            color_print(f"[✓] Servidor responde correctamente", "verde")
        else:
            color_print(f"[✗] Servidor responde con código {response.status_code}", "rojo")
            return False
    except Exception as e:
        color_print(f"[✗] No se puede conectar al servidor: {str(e)}", "rojo")
        return False
    
    # Paso 2: Obtener token de autenticación
    token = obtener_token()
    if not token:
        color_print("[✗] No se pudo obtener token de autenticación", "rojo")
        return False
    
    # Paso 3: Verificar endpoints críticos
    resultados = []
    for endpoint in ENDPOINTS:
        ruta = endpoint["ruta"]
        auth = endpoint["auth"]
        nombre = endpoint["nombre"]
        metodo = endpoint.get("metodo", "GET")
        esperar_json = endpoint.get("esperar_json", True)
        
        token_usar = token if auth else None
        exito, datos = probar_endpoint(
            ruta=ruta, 
            token=token_usar, 
            metodo=metodo, 
            esperar_json=esperar_json,
            nombre=nombre
        )
        
        resultados.append({
            "endpoint": ruta,
            "nombre": nombre,
            "exito": exito,
            "datos": datos
        })
    
    # Paso 4: Resumen de la verificación
    color_print("\n\n" + "="*80, "azul")
    color_print("RESUMEN DE VERIFICACIÓN", "azul")
    color_print("="*80, "azul")
    
    exitos = [r for r in resultados if r["exito"]]
    fallos = [r for r in resultados if not r["exito"]]
    
    color_print(f"\n✓ Endpoints verificados con éxito: {len(exitos)}/{len(resultados)}", "verde")
    color_print(f"✗ Endpoints con fallos: {len(fallos)}/{len(resultados)}", "rojo" if fallos else "verde")
    
    if fallos:
        color_print("\nEndpoints con fallos:", "rojo")
        for fallo in fallos:
            color_print(f"  • {fallo['nombre']} ({fallo['endpoint']})", "rojo")
    
    # Resultado final
    if len(fallos) == 0:
        color_print("\n[✓] VERIFICACIÓN EXITOSA: El backend está funcionando correctamente", "verde")
        return True
    else:
        color_print("\n[✗] VERIFICACIÓN FALLIDA: Hay problemas con algunos endpoints", "rojo")
        return False

if __name__ == "__main__":
    try:
        verificar_backend()
    except KeyboardInterrupt:
        color_print("\n\n[!] Verificación interrumpida por el usuario", "amarillo")
    except Exception as e:
        color_print(f"\n[✗] Error no manejado: {str(e)}", "rojo")
        import traceback
        traceback.print_exc()
