#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script que prueba específicamente el endpoint de usuarios con diferentes métodos de autenticación
y muestra exactamente qué está ocurriendo con la respuesta.
"""

import os
import sys
import json
import logging
import asyncio
import httpx
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# URL base de la API
API_BASE_URL = "http://localhost:8000/api/v1"

# Credenciales de admin por defecto
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

async def login(username, password):
    """Inicia sesión y obtiene un token de acceso"""
    logger.info(f"Intentando login con {username}...")
    
    async with httpx.AsyncClient(base_url=API_BASE_URL) as client:
        try:
            # Usar formato de datos correcto para endpoint de login
            response = await client.post(
                "/auth/login", 
                data={
                    "username": username,
                    "password": password
                }
            )
            
            logger.info(f"Respuesta de login: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                token = data.get("access_token")
                logger.info(f"Token obtenido: {token[:15]}...")
                return token
            else:
                logger.error(f"Error en login: {response.text}")
                return None
        except Exception as e:
            logger.error(f"Excepción en login: {e}")
            return None

async def get_user_info(token):
    """Obtiene información del usuario actual usando el token"""
    logger.info("Obteniendo información del usuario actual...")
    
    async with httpx.AsyncClient(base_url=API_BASE_URL) as client:
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = await client.get("/auth/me", headers=headers)
            
            logger.info(f"Respuesta /auth/me: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Datos del usuario: {json.dumps(data, indent=2)}")
                return data
            else:
                logger.error(f"Error obteniendo usuario: {response.text}")
                return None
        except Exception as e:
            logger.error(f"Excepción obteniendo usuario: {e}")
            return None

async def get_users_list(token, with_params=True):
    """Obtiene la lista de usuarios usando diferentes métodos"""
    logger.info(f"Obteniendo lista de usuarios (con_params={with_params})...")
    
    async with httpx.AsyncClient(base_url=API_BASE_URL) as client:
        try:
            headers = {"Authorization": f"Bearer {token}"}
            url = "/auth/users"
            
            if with_params:
                url += "?page=1&limit=10"
            
            logger.info(f"URL: {url}")
            logger.info(f"Headers: {headers}")
            
            # Primera prueba: GET estándar
            response = await client.get(url, headers=headers)
            
            logger.info(f"Respuesta GET {url}: {response.status_code}")
            logger.info(f"Headers de respuesta: {dict(response.headers)}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    logger.info(f"Datos JSON: {json.dumps(data, indent=2)}")
                    return data
                except:
                    # Si falla la decodificación JSON, mostrar el contenido como texto
                    logger.warning("No se pudo decodificar como JSON")
                    content = response.text
                    logger.info(f"Contenido texto: {content}")
                    
                    # Intentar mostrar bytes para ver si hay datos binarios
                    content_bytes = response.content
                    logger.info(f"Contenido bytes: {content_bytes[:100]}...")
                    
                    return None
            else:
                logger.error(f"Error obteniendo usuarios: {response.text}")
                return None
        except Exception as e:
            logger.error(f"Excepción obteniendo usuarios: {e}")
            return None

async def try_alternative_get_methods(token):
    """Prueba métodos alternativos para obtener usuarios"""
    logger.info("Probando métodos alternativos para obtener usuarios...")
    
    async with httpx.AsyncClient(base_url=API_BASE_URL) as client:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Método 1: Enviar accept: application/json explícitamente
        try:
            logger.info("Método 1: Con header Accept explícito")
            headers_with_accept = {**headers, "Accept": "application/json"}
            response = await client.get("/auth/users", headers=headers_with_accept)
            logger.info(f"Respuesta: {response.status_code}")
            if response.status_code == 200:
                logger.info(f"Contenido: {response.text[:200]}...")
        except Exception as e:
            logger.error(f"Error en método 1: {e}")
        
        # Método 2: Probar con URL alternativa (con slash final)
        try:
            logger.info("Método 2: URL con slash final")
            response = await client.get("/auth/users/", headers=headers)
            logger.info(f"Respuesta: {response.status_code}")
            if response.status_code == 200:
                logger.info(f"Contenido: {response.text[:200]}...")
        except Exception as e:
            logger.error(f"Error en método 2: {e}")
        
        # Método 3: Probar endpoint alternativo register
        try:
            logger.info("Método 3: Probar endpoint /auth/register")
            response = await client.options("/auth/register")
            logger.info(f"OPTIONS /auth/register: {response.status_code}")
            if response.status_code == 200:
                logger.info(f"Headers: {dict(response.headers)}")
        except Exception as e:
            logger.error(f"Error en método 3: {e}")
        
        # Método 4: Probar con otras opciones de método HTTP
        try:
            logger.info("Método 4: POST a /auth/users")
            response = await client.post("/auth/users", headers=headers)
            logger.info(f"POST /auth/users: {response.status_code}")
        except Exception as e:
            logger.error(f"Error en método 4: {e}")

async def main():
    """Función principal de prueba"""
    logger.info("=" * 60)
    logger.info("DIAGNÓSTICO DE ENDPOINT DE USUARIOS")
    logger.info("=" * 60)
    
    # Paso 1: Login para obtener token
    token = await login(ADMIN_USERNAME, ADMIN_PASSWORD)
    if not token:
        logger.error("No se pudo obtener token, abortando pruebas")
        return
    
    # Paso 2: Obtener información del usuario actual
    user_info = await get_user_info(token)
    if not user_info:
        logger.warning("No se pudo obtener información del usuario, pero continuando con pruebas")
    
    # Paso 3: Obtener lista de usuarios (con parámetros)
    users_with_params = await get_users_list(token, with_params=True)
    
    # Paso 4: Obtener lista de usuarios (sin parámetros)
    users_without_params = await get_users_list(token, with_params=False)
    
    # Paso 5: Probar métodos alternativos
    await try_alternative_get_methods(token)
    
    logger.info("\nPrueba completada.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Prueba interrumpida por el usuario")
    except Exception as e:
        logger.error(f"Error general: {e}")
        import traceback
        logger.error(traceback.format_exc())
