"""
Script para probar el login de Ramon y verificar que tiene los permisos correctos.

Este script:
1. Intenta iniciar sesión como Ramon
2. Verifica que obtiene un token con el rol correcto
3. Intenta acceder a un endpoint protegido
"""

import requests
import sys
import os
import json
import logging
import jwt
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Añadir la ruta del proyecto al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Importar configuración
from backend.app.core.config import get_settings

# URL base para las pruebas
settings = get_settings()
BASE_URL = f"http://localhost:8000"  # URL base del backend

def test_login_ramon():
    """Probar login como Ramon y verificar permisos"""
    logger.info("=== PRUEBA DE LOGIN PARA RAMON ===")
    
    # Datos de login
    login_data = {
        "username": "Ramon",
        "password": "admin123"  # Asumimos que esta es la contraseña
    }
    
    # Importante: FastAPI espera que los datos se envíen en formato form-data
    # en lugar de JSON para el endpoint de login
    login_form = {
        "username": "Ramon",
        "password": "admin123"
    }
    
    try:
        # Paso 1: Intentar login
        logger.info(f"Intentando login como {login_form['username']}...")
        login_url = f"{BASE_URL}/api/v1/auth/login"
        # Usamos data en lugar de json para form-data
        login_response = requests.post(login_url, data=login_form)
        
        # Verificar respuesta
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result.get("access_token")
            logger.info(f"✅ Login exitoso. Status code: {login_response.status_code}")
            logger.info(f"Token recibido: {token[:20]}...")
            
            # Decodificar token para ver el rol
            payload = jwt.decode(token, options={"verify_signature": False})
            logger.info(f"Información del token:")
            logger.info(f"  - Usuario: {payload.get('sub')}")
            logger.info(f"  - Rol: {payload.get('role')}")
            logger.info(f"  - Expira: {datetime.fromtimestamp(payload.get('exp'))}")
            
            # Verificar que el rol es correcto
            if payload.get("role") == "Ramon":
                logger.info(f"✅ Rol correcto en el token: {payload.get('role')}")
            else:
                logger.error(f"❌ Rol incorrecto en el token: {payload.get('role')}, se esperaba 'Ramon'")
            
            # Paso 2: Probar endpoint protegido
            logger.info("Probando acceso a endpoint protegido...")
            headers = {"Authorization": f"Bearer {token}"}
            
            # Intentar acceder al listado de usuarios (requiere permisos especiales)
            users_url = f"{BASE_URL}/api/v1/users"
            users_response = requests.get(users_url, headers=headers)
            
            if users_response.status_code == 200:
                logger.info(f"✅ Acceso exitoso al endpoint protegido. Status code: {users_response.status_code}")
                users = users_response.json()
                logger.info(f"Número de usuarios obtenidos: {len(users)}")
            else:
                logger.error(f"❌ Error al acceder al endpoint protegido. Status code: {users_response.status_code}")
                logger.error(f"Respuesta: {users_response.text}")
            
            # Probar otro endpoint: listado de animales (debería funcionar)
            animals_url = f"{BASE_URL}/api/v1/animals"
            animals_response = requests.get(animals_url, headers=headers)
            
            if animals_response.status_code == 200:
                logger.info(f"✅ Acceso exitoso al endpoint de animales. Status code: {animals_response.status_code}")
                animals = animals_response.json()
                logger.info(f"Número de animales obtenidos: {len(animals)}")
            else:
                logger.error(f"❌ Error al acceder al endpoint de animales. Status code: {animals_response.status_code}")
                logger.error(f"Respuesta: {animals_response.text}")
                
        else:
            logger.error(f"❌ Error en el login. Status code: {login_response.status_code}")
            logger.error(f"Respuesta: {login_response.text}")
            
    except Exception as e:
        logger.error(f"Error durante la prueba: {str(e)}")
    
    logger.info("=== FIN DE LA PRUEBA ===")

if __name__ == "__main__":
    test_login_ramon()
