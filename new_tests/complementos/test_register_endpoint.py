import requests
import logging
import json
import sys
import os
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)8s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# URL base de la API
BASE_URL = "http://localhost:8000/api/v1"

def obtener_token():
    """Obtener token de autenticación mediante login"""
    url = f"{BASE_URL}/auth/login"
    data = {
        "username": "admin",
        "password": "admin123"
    }
    
    logger.info(f"Intentando login con {data['username']}...")
    response = requests.post(url, data=data)
    logger.info(f"Respuesta de login: {response.status_code}")
    
    if response.status_code != 200:
        logger.error(f"Error en login: {response.text}")
        return None
    
    token_data = response.json()
    token = token_data.get("access_token")
    logger.info(f"Token obtenido: {token[:10]}...")
    return token

def crear_usuario(token, datos_usuario):
    """Probar la creación de un usuario"""
    url = f"{BASE_URL}/auth/signup"  # Actualizado a /signup en lugar de /register
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Asegurar que el rol se envíe en minúsculas
    datos_usuario['role'] = datos_usuario['role'].lower()
    
    logger.info(f"Intentando crear usuario: {datos_usuario['username']}")
    logger.info(f"URL: {url}")
    logger.info(f"Headers: {headers}")
    logger.info(f"Datos: {json.dumps(datos_usuario, indent=2)}")
    
    try:
        response = requests.post(url, json=datos_usuario, headers=headers)
        logger.info(f"Código de estado: {response.status_code}")
        
        # Mejorar la visualización de la respuesta
        if response.status_code >= 400:
            logger.error(f"=== DETALLES DEL ERROR {response.status_code} ===")
            try:
                error_data = response.json()
                logger.error(f"Mensaje completo: {json.dumps(error_data, indent=2)}")
                # Extraer mensaje de validación si existe
                if isinstance(error_data, dict) and 'detail' in error_data:
                    detail = error_data['detail']
                    if isinstance(detail, list) and len(detail) > 0:
                        for error_item in detail:
                            if isinstance(error_item, dict) and 'msg' in error_item:
                                logger.error(f"Error de validación: {error_item['msg']}")
                                if 'loc' in error_item:
                                    logger.error(f"Ubicación del error: {error_item['loc']}")
            except Exception as e:
                logger.error(f"No se pudo obtener detalles JSON del error: {response.text}")
                logger.error(f"Excepción al procesar error: {str(e)}")
            logger.error("==========================================")
        else:
            try:
                logger.info(f"Respuesta JSON: {json.dumps(response.json(), indent=2)}")
            except:
                logger.info(f"Respuesta (texto): {response.text}")
    except Exception as e:
        logger.info(f"Respuesta (texto): {response.text}")
        logger.error(f"Error al procesar la respuesta: {str(e)}")
    
    return response

def crear_usuario_alternativo(token, datos_usuario):
    """Probar la creación de un usuario usando diferentes endpoints"""
    endpoints = [
        "/auth/register",
        "/auth/users",  # Un endpoint alternativo que podría existir
        "/users",       # Otro posible endpoint
        "/auth/user",   # Otro posible endpoint
    ]
    
    for endpoint in endpoints:
        url = f"{BASE_URL}{endpoint}"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        logger.info(f"\nProbando endpoint: {endpoint}")
        logger.info(f"URL completa: {url}")
        
        try:
            response = requests.post(url, json=datos_usuario, headers=headers)
            logger.info(f"Código de estado: {response.status_code}")
            
            try:
                logger.info(f"Respuesta: {response.json() if response.text else 'Sin contenido'}")
            except:
                logger.info(f"Respuesta (texto): {response.text}")
                
            if response.status_code < 400:
                logger.info(f"¡Éxito con el endpoint {endpoint}!")
                return response
        except Exception as e:
            logger.error(f"Error al probar {endpoint}: {str(e)}")
    
    return None

def main():
    """Función principal de prueba"""
    logger.info("=" * 80)
    logger.info("PRUEBA DE ENDPOINT DE REGISTRO DE USUARIOS")
    logger.info("=" * 80)
    
    # 1. Obtener token de autenticación
    token = obtener_token()
    if not token:
        logger.error("No se pudo obtener el token. Abortando.")
        return
    
    # 2. Datos para crear un usuario de prueba
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
    # 3. Primero prueba con rol editor
    logger.info("\n" + "=" * 80)
    logger.info("PRUEBA #1: CREANDO USUARIO CON ROL 'EDITOR'")
    logger.info("=" * 80)
    
    datos_editor = {
        "username": f"editor_{timestamp}",
        "email": f"editor_{timestamp}@example.com",
        "password": "test123",
        "full_name": "Usuario Editor de Prueba",
        "role": "editor"  # Un rol válido en el sistema
    }
    
    response_editor = crear_usuario(token, datos_editor)
    
    # 4. Ahora prueba específica con rol gerente
    logger.info("\n" + "=" * 80)
    logger.info("PRUEBA #2: CREANDO USUARIO CON ROL 'GERENTE'")
    logger.info("=" * 80)
    
    datos_gerente = {
        "username": f"gerente_{timestamp}",
        "email": f"gerente_{timestamp}@example.com",
        "password": "test123",
        "full_name": "Usuario Gerente de Prueba",
        "role": "gerente"
    }
    
    response_gerente = crear_usuario(token, datos_gerente)
    
    # 5. Verificar si el problema puede ser el campo role
    logger.info("\n" + "=" * 80)
    logger.info("PRUEBA #3: VERIFICANDO VALIDACIÓN DE ROLES")
    logger.info("=" * 80)
    
    # Intentar con las formas exactas permitidas por el backend
    roles_a_probar = [
        "administrador",    # Rol administrador (minúsculas)
        "gerente",          # Rol gerente (minúsculas)
        "editor",           # Rol editor (minúsculas)
        "usuario"           # Rol usuario (minúsculas)
    ]
    
    for i, test_role in enumerate(roles_a_probar):
        logger.info(f"\n{'-'*40}")
        logger.info(f"Probando con rol: '{test_role}' (tipo: {type(test_role).__name__})")
        logger.info(f"{'-'*40}")
        
        datos_test = {
            "username": f"test_role_{i}_{timestamp}",
            "email": f"test_role_{i}_{timestamp}@example.com",
            "password": "test123",
            "full_name": f"Test Role {i}",
            "role": test_role
        }
        
        crear_usuario(token, datos_test)
        
    # 6. Si todo falla, probar endpoints alternativos
    if response_gerente.status_code >= 400:
        logger.info("\n" + "=" * 80)
        logger.info("PRUEBA #4: ENDPOINTS ALTERNATIVOS")
        logger.info("=" * 80)
        crear_usuario_alternativo(token, datos_gerente)

if __name__ == "__main__":
    main()
