#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para diagnosticar problemas con el endpoint de backup
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
API_URL = "http://localhost:8000/api/v1"

def probar_endpoint(url, metodo="GET", datos=None, token=None):
    """Prueba un endpoint específico y muestra información detallada"""
    logger.info(f"Probando endpoint: {url} (Método: {metodo})")
    
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        # Realizar la petición según el método
        if metodo.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif metodo.upper() == "POST":
            response = requests.post(url, headers=headers, json=datos)
        elif metodo.upper() == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            logger.error(f"Método no soportado: {metodo}")
            return False
        
        # Mostrar información de la respuesta
        logger.info(f"Código de estado: {response.status_code}")
        logger.info("Encabezados de respuesta:")
        for key, value in response.headers.items():
            logger.info(f"  {key}: {value}")
        
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

def diagnosticar_backups():
    """Realiza un diagnóstico completo del sistema de backups"""
    logger.info("=== DIAGNÓSTICO DE SISTEMA DE BACKUPS ===")
    logger.info(f"URL base: {API_URL}")
    logger.info(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 40)
    
    # Token de prueba (simulado)
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcyMDAwMDAwMH0.signature"
    
    # 1. Verificar endpoint de listado
    logger.info("\n1. VERIFICANDO ENDPOINT DE LISTADO DE BACKUPS")
    list_success = probar_endpoint(f"{API_URL}/backup/list", "GET", token=token)
    logger.info(f"Resultado: {'✅ OK' if list_success else '❌ FALLO'}")
    
    # 2. Verificar endpoint de creación
    logger.info("\n2. VERIFICANDO ENDPOINT DE CREACIÓN DE BACKUPS")
    create_data = {
        "include_animals": True,
        "include_births": True,
        "include_config": True,
        "created_by": "diagnostico_script",
        "description": "Backup de diagnóstico"
    }
    create_success = probar_endpoint(f"{API_URL}/backup/create", "POST", create_data, token)
    logger.info(f"Resultado: {'✅ OK' if create_success else '❌ FALLO'}")
    
    # 3. Verificar estructura de directorios
    logger.info("\n3. VERIFICANDO ESTRUCTURA DE DIRECTORIOS")
    backup_dir = os.path.join("backend", "backups")
    if os.path.exists(backup_dir):
        logger.info(f"✅ Directorio de backups existe: {backup_dir}")
        backups = [f for f in os.listdir(backup_dir) if f.endswith('.sql')]
        logger.info(f"Número de backups encontrados: {len(backups)}")
        if backups:
            logger.info("Últimos 5 backups:")
            for backup in sorted(backups, reverse=True)[:5]:
                backup_path = os.path.join(backup_dir, backup)
                size_mb = os.path.getsize(backup_path) / (1024 * 1024)
                mod_time = datetime.fromtimestamp(os.path.getmtime(backup_path))
                logger.info(f"  - {backup} ({size_mb:.2f} MB) - {mod_time}")
    else:
        logger.error(f"❌ Directorio de backups no existe: {backup_dir}")
    
    # Resultado global
    logger.info("\n=== RESULTADO DEL DIAGNÓSTICO ===")
    if list_success and create_success:
        logger.info("✅ TODOS LOS ENDPOINTS FUNCIONAN CORRECTAMENTE")
    else:
        logger.error("❌ ALGUNOS ENDPOINTS PRESENTAN PROBLEMAS")
        
        # Sugerencias según los fallos detectados
        if not list_success:
            logger.info("Sugerencia para endpoint de listado:")
            logger.info("- Verificar que el router en backup.py tenga @router.get('/list')")
            logger.info("- Verificar que BackupService.list_backups() esté implementado")
        
        if not create_success:
            logger.info("Sugerencia para endpoint de creación:")
            logger.info("- Verificar que el router en backup.py tenga @router.post('/create')")
            logger.info("- Verificar que BackupService.create_backup() esté implementado")
    
    return list_success and create_success

if __name__ == "__main__":
    exito = diagnosticar_backups()
    sys.exit(0 if exito else 1)
