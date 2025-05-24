#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para diagnosticar problemas de CORS entre frontend y backend
Autor: Cascade AI
Fecha: 24/05/2025
"""

import requests
import json
import sys
import os
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# URL base de la API
BACKEND_URL = "http://localhost:8000/api/v1"
FRONTEND_URL = "http://localhost:3000"

def probar_cors(url, origen, metodo="GET", datos=None, token=None):
    """Prueba una petición con CORS específico"""
    logger.info(f"Probando petición {metodo} a {url} desde origen {origen}")
    
    headers = {
        "Content-Type": "application/json",
        "Origin": origen
    }
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        # Realizar la petición según el método
        if metodo.upper() == "OPTIONS":
            # Para OPTIONS, usamos requests.options
            response = requests.options(url, headers=headers)
        elif metodo.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif metodo.upper() == "POST":
            response = requests.post(url, headers=headers, json=datos)
        else:
            logger.error(f"Método no soportado: {metodo}")
            return False
        
        # Mostrar información de la respuesta
        logger.info(f"Código de estado: {response.status_code}")
        logger.info("Encabezados de respuesta:")
        for key, value in response.headers.items():
            logger.info(f"  {key}: {value}")
        
        # Verificar encabezados CORS
        cors_headers = [
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Methods",
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Credentials",
            "Access-Control-Expose-Headers",
            "Access-Control-Max-Age"
        ]
        
        logger.info("Análisis de encabezados CORS:")
        for header in cors_headers:
            value = response.headers.get(header)
            if value:
                logger.info(f"  ✅ {header}: {value}")
            else:
                logger.info(f"  ❌ {header}: No presente")
        
        # Intentar parsear la respuesta como JSON
        try:
            data = response.json()
            logger.info("Respuesta JSON:")
            logger.info(json.dumps(data, indent=2, ensure_ascii=False))
        except Exception as json_error:
            logger.warning(f"Respuesta no es JSON válido: {json_error}")
            logger.info("Contenido de la respuesta:")
            logger.info("-" * 50)
            logger.info(response.text[:500])  # Mostrar primeros 500 caracteres
            logger.info("-" * 50)
        
        return response.status_code < 400  # Éxito si código < 400
    
    except Exception as e:
        logger.error(f"Error al probar el endpoint: {str(e)}")
        return False

def diagnosticar_cors():
    """Realiza un diagnóstico completo de problemas CORS"""
    logger.info("=== DIAGNÓSTICO DE PROBLEMAS CORS ===")
    logger.info(f"Backend URL: {BACKEND_URL}")
    logger.info(f"Frontend URL: {FRONTEND_URL}")
    logger.info(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 40)
    
    # Token de prueba (simulado)
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcyMDAwMDAwMH0.signature"
    
    # 1. Probar petición OPTIONS desde el frontend
    logger.info("\n1. VERIFICANDO PETICIÓN OPTIONS (PREFLIGHT)")
    options_success = probar_cors(f"{BACKEND_URL}/backup/list", FRONTEND_URL, "OPTIONS", token=token)
    logger.info(f"Resultado: {'✅ OK' if options_success else '❌ FALLO'}")
    
    # 2. Probar petición GET desde el frontend
    logger.info("\n2. VERIFICANDO PETICIÓN GET")
    get_success = probar_cors(f"{BACKEND_URL}/backup/list", FRONTEND_URL, "GET", token=token)
    logger.info(f"Resultado: {'✅ OK' if get_success else '❌ FALLO'}")
    
    # 3. Probar petición POST desde el frontend
    logger.info("\n3. VERIFICANDO PETICIÓN POST")
    post_data = {
        "include_animals": True,
        "include_births": True,
        "include_config": True,
        "created_by": "diagnostico_script",
        "description": "Backup de diagnóstico CORS"
    }
    post_success = probar_cors(f"{BACKEND_URL}/backup/create", FRONTEND_URL, "POST", post_data, token)
    logger.info(f"Resultado: {'✅ OK' if post_success else '❌ FALLO'}")
    
    # Resultado global
    logger.info("\n=== RESULTADO DEL DIAGNÓSTICO ===")
    if options_success and get_success and post_success:
        logger.info("✅ CORS CONFIGURADO CORRECTAMENTE")
    else:
        logger.error("❌ PROBLEMAS CON LA CONFIGURACIÓN CORS")
        
        # Sugerencias según los fallos detectados
        if not options_success:
            logger.info("Sugerencia para petición OPTIONS:")
            logger.info("- Verificar que el middleware CORS está configurado correctamente")
            logger.info("- Verificar que el origen del frontend está en la lista de orígenes permitidos")
        
        if not get_success:
            logger.info("Sugerencia para petición GET:")
            logger.info("- Verificar que el token de autenticación es válido")
            logger.info("- Verificar que el endpoint está correctamente configurado")
        
        if not post_success:
            logger.info("Sugerencia para petición POST:")
            logger.info("- Verificar que el formato de los datos es correcto")
            logger.info("- Verificar que el endpoint acepta peticiones POST")
    
    return options_success and get_success and post_success

if __name__ == "__main__":
    exito = diagnosticar_cors()
    sys.exit(0 if exito else 1)
