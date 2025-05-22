#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import logging
import asyncio
import requests
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

async def diagnosticar_api():
    """Script para diagnosticar problemas con la API"""
    logger.info("Iniciando diagnóstico de la API...")
    
    # Base URL de la API
    base_url = "http://127.0.0.1:8000/api/v1"
    
    # 1. Comprobar si el servidor está activo
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            logger.info(f"✅ API activa. Respuesta: {response.json()}")
        else:
            logger.error(f"❌ API no responde correctamente. Código: {response.status_code}")
    except Exception as e:
        logger.error(f"❌ Error al conectar con la API: {e}")
    
    # 2. Intentar iniciar sesión para obtener un token
    try:
        login_data = {
            "username": "admin",
            "password": "admin",
            "grant_type": "password"
        }
        login_headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        # Convertir a formato form-urlencoded
        form_data = "&".join([f"{k}={v}" for k, v in login_data.items()])
        
        response = requests.post(
            f"{base_url}/auth/login", 
            data=form_data,
            headers=login_headers
        )
        
        if response.status_code == 200:
            token = response.json().get("access_token")
            logger.info(f"✅ Login exitoso. Token obtenido: {token[:10]}...")
            
            # 3. Probar endpoints con el token
            auth_header = {"Authorization": f"Bearer {token}"}
            
            # Probar dashboard/stats
            stats_response = requests.get(f"{base_url}/dashboard/stats", headers=auth_header)
            if stats_response.status_code == 200:
                logger.info(f"✅ Endpoint dashboard/stats funciona correctamente")
                # Mostrar fragmento de los datos
                data = stats_response.json()
                if data and "animales" in data:
                    logger.info(f"   Datos de animales: {data['animales'].keys()}")
                    if "partos" in data:
                        logger.info(f"   Datos de partos disponibles: {list(data['partos'].keys() if data['partos'] else [])}")
                else:
                    logger.error(f"❌ No se encontraron datos de animales en la respuesta")
            else:
                logger.error(f"❌ Error en endpoint dashboard/stats: {stats_response.status_code}")
            
            # Probar dashboard/partos
            partos_response = requests.get(f"{base_url}/dashboard/partos", headers=auth_header)
            if partos_response.status_code == 200:
                logger.info(f"✅ Endpoint dashboard/partos funciona correctamente")
                data = partos_response.json()
                logger.info(f"   Datos obtenidos: {list(data.keys() if data else [])}")
            else:
                logger.error(f"❌ Error en endpoint dashboard/partos: {partos_response.status_code}")
                
        else:
            logger.error(f"❌ Error en login: {response.status_code} - {response.text}")
    
    except Exception as e:
        logger.error(f"❌ Error durante las pruebas: {e}")
    
    logger.info("Diagnóstico finalizado")

if __name__ == "__main__":
    # Ejecutar el diagnóstico
    asyncio.run(diagnosticar_api())
