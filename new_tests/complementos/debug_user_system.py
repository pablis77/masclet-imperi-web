#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script de diagnóstico completo para el sistema de usuarios
Este script realiza:
1. Análisis directo de la base de datos para ver todos los usuarios existentes
2. Prueba directa de endpoints relacionados con usuarios
3. Verificación de permisos y roles
4. Comprobación de serialización de respuestas
"""

import os
import sys
import json
import logging
import asyncio
import inspect
from datetime import datetime
from pathlib import Path

# Configurar el path para importar desde el proyecto
PROJECT_ROOT = Path(__file__).parent.parent.parent.absolute()
sys.path.append(str(PROJECT_ROOT))

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

try:
    # Importar dependencias del backend
    from fastapi import FastAPI
    from backend.app.core.config import Settings, ROLES, Action, UserRole
    from backend.app.auth.models import User
    from backend.app.auth.security import create_access_token
    from backend.app.database import init_db, TORTOISE_ORM
    from tortoise.expressions import Q
    from tortoise import Tortoise
    import httpx
    
    # Importaciones adicionales que pueden ser necesarias
    from tortoise.contrib.fastapi import register_tortoise
    
    logger.info("Importaciones completadas correctamente")
except ImportError as e:
    logger.error(f"Error importando dependencias: {e}")
    logger.error("Asegúrate de ejecutar este script desde la raíz del proyecto")
    sys.exit(1)

# Funciones de diagnóstico
async def analizar_usuarios_bd():
    """Analiza directamente los usuarios en la base de datos"""
    logger.info("=" * 50)
    logger.info("ANÁLISIS DIRECTO DE USUARIOS EN LA BASE DE DATOS")
    logger.info("=" * 50)
    
    try:
        # Obtener todos los usuarios
        usuarios = await User.all()
        logger.info(f"Se encontraron {len(usuarios)} usuarios en la base de datos")
        
        # Mostrar información detallada de cada usuario
        for idx, usuario in enumerate(usuarios, 1):
            logger.info(f"\nUsuario {idx}:")
            logger.info(f"  ID: {usuario.id}")
            logger.info(f"  Username: {usuario.username}")
            logger.info(f"  Email: {usuario.email}")
            logger.info(f"  Nombre completo: {usuario.full_name}")
            logger.info(f"  Rol: {usuario.role}")
            logger.info(f"  Activo: {usuario.is_active}")
            logger.info(f"  Fecha de creación: {usuario.created_at}")
            logger.info(f"  Fecha de actualización: {usuario.updated_at}")
            
            # Verificar si el hash de la contraseña existe
            logger.info(f"  Contraseña hasheada: {'Sí' if usuario.hashed_password else 'No'}")
            
            # Verificar permisos según el rol
            if usuario.role in ROLES:
                permisos = ROLES[usuario.role]
                logger.info(f"  Permisos: {', '.join([p.name for p in permisos])}")
                logger.info(f"  Puede gestionar usuarios: {Action.GESTIONAR_USUARIOS in permisos}")
            else:
                logger.info(f"  ADVERTENCIA: El rol '{usuario.role}' no está definido en ROLES")
        
        # Verificar rol administrador
        admin_users = await User.filter(role="admin")
        admin_users_role = await User.filter(role="administrador")
        logger.info(f"\nUsuarios con rol 'admin': {len(admin_users)}")
        logger.info(f"Usuarios con rol 'administrador': {len(admin_users_role)}")
        
        # Información adicional sobre el esquema ROLES
        logger.info("\nEsquema de ROLES definido en el sistema:")
        for role, actions in ROLES.items():
            logger.info(f"  {role}: {len(actions)} permisos")
        
        # Verificar si hay inconsistencias en roles
        all_roles = set(usuario.role for usuario in usuarios)
        defined_roles = set(r.value for r in UserRole)
        unknown_roles = all_roles - defined_roles
        if unknown_roles:
            logger.warning(f"Se encontraron roles no definidos en el sistema: {unknown_roles}")
        
        return usuarios
    except Exception as e:
        logger.error(f"Error analizando usuarios: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return []

async def probar_endpoints_usuarios():
    """Prueba los endpoints relacionados con usuarios directamente"""
    logger.info("\n" + "=" * 50)
    logger.info("PRUEBA DE ENDPOINTS DE USUARIOS")
    logger.info("=" * 50)
    
    # Crear un cliente HTTP
    async with httpx.AsyncClient(base_url="http://localhost:8000/api/v1") as client:
        try:
            # 1. Intentar login con admin
            logger.info("\nProbando endpoint de login...")
            login_data = {
                "username": "admin",
                "password": "admin123"
            }
            login_response = await client.post("/auth/login", data=login_data)
            logger.info(f"Status code: {login_response.status_code}")
            
            if login_response.status_code == 200:
                token_data = login_response.json()
                token = token_data.get("access_token")
                logger.info(f"Token obtenido: {token[:15]}...")
                
                # Configurar headers con el token
                headers = {"Authorization": f"Bearer {token}"}
                
                # 2. Obtener información del usuario actual
                logger.info("\nProbando endpoint /auth/me...")
                me_response = await client.get("/auth/me", headers=headers)
                logger.info(f"Status code: {me_response.status_code}")
                if me_response.status_code == 200:
                    user_data = me_response.json()
                    logger.info(f"Datos del usuario: {json.dumps(user_data, indent=2)}")
                else:
                    logger.error(f"Error: {me_response.text}")
                
                # 3. Obtener lista de usuarios
                logger.info("\nProbando endpoint /auth/users...")
                users_response = await client.get("/auth/users", headers=headers)
                logger.info(f"Status code: {users_response.status_code}")
                logger.info(f"Headers: {dict(users_response.headers)}")
                logger.info(f"Content-Type: {users_response.headers.get('content-type')}")
                
                if users_response.status_code == 200:
                    # Intentar obtener el contenido de diferentes formas
                    try:
                        users_data = users_response.json()
                        logger.info(f"Datos (json): {json.dumps(users_data, indent=2)}")
                    except json.JSONDecodeError:
                        logger.warning("No se pudo decodificar como JSON")
                        
                    logger.info(f"Texto de respuesta: {users_response.text}")
                    logger.info(f"Bytes de respuesta: {users_response.content[:100]}...")
                else:
                    logger.error(f"Error: {users_response.text}")
                
                # 4. Intentar con URL alternativa por si hay un problema de routing
                logger.info("\nProbando endpoint alternativo /auth/users/...")
                alt_users_response = await client.get("/auth/users/", headers=headers)
                logger.info(f"Status code: {alt_users_response.status_code}")
                
                # 5. Verificar endpoint de registro
                logger.info("\nVerificando endpoint de registro...")
                register_response = await client.options("/auth/register")
                logger.info(f"OPTIONS /auth/register status: {register_response.status_code}")
                
                signup_response = await client.options("/auth/signup")
                logger.info(f"OPTIONS /auth/signup status: {signup_response.status_code}")
            else:
                logger.error(f"Login fallido: {login_response.text}")
        
        except Exception as e:
            logger.error(f"Error probando endpoints: {e}")
            import traceback
            logger.error(traceback.format_exc())

async def verificar_permisos():
    """Verifica la configuración de permisos en el sistema"""
    logger.info("\n" + "=" * 50)
    logger.info("VERIFICACIÓN DE PERMISOS")
    logger.info("=" * 50)
    
    try:
        # Mostrar todos los roles definidos
        logger.info("\nRoles definidos en el sistema:")
        for role in UserRole:
            logger.info(f"  - {role.name} ({role.value})")
        
        # Mostrar todas las acciones definidas
        logger.info("\nAcciones definidas en el sistema:")
        for action in Action:
            logger.info(f"  - {action.name} ({action.value})")
        
        # Mostrar la matriz de permisos
        logger.info("\nMatriz de permisos por rol:")
        for role, actions in ROLES.items():
            action_names = [action.name for action in actions]
            logger.info(f"  {role.name} ({role.value}): {', '.join(action_names)}")
        
        # Verificar específicamente GESTIONAR_USUARIOS
        logger.info("\nVerificación específica de GESTIONAR_USUARIOS:")
        for role, actions in ROLES.items():
            can_manage = Action.GESTIONAR_USUARIOS in actions
            logger.info(f"  {role.name} ({role.value}): {'✓' if can_manage else '✗'}")
    
    except Exception as e:
        logger.error(f"Error verificando permisos: {e}")
        import traceback
        logger.error(traceback.format_exc())

async def prueba_creacion_usuario():
    """Prueba la creación de un usuario de prueba"""
    logger.info("\n" + "=" * 50)
    logger.info("PRUEBA DE CREACIÓN DE USUARIO")
    logger.info("=" * 50)
    
    try:
        # Verificar si ya existe un usuario de prueba
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        username = f"test_user_{timestamp}"
        
        existing_user = await User.get_or_none(username=username)
        if existing_user:
            logger.info(f"El usuario {username} ya existe, saltando creación")
            return
        
        # Crear un usuario de prueba directamente en la BD
        logger.info(f"Creando usuario de prueba: {username}")
        user = await User.create_user(
            username=username,
            password="test123",
            email=f"{username}@test.com",
            full_name="Usuario de Prueba",
            role="usuario"
        )
        
        logger.info(f"Usuario creado: {user.username} (ID: {user.id})")
        
        # Verificar que se pueda obtener
        retrieved_user = await User.get_or_none(username=username)
        if retrieved_user:
            logger.info(f"Usuario recuperado correctamente: {retrieved_user.username}")
        else:
            logger.error("No se pudo recuperar el usuario recién creado")
        
        # Crear un token para este usuario
        token = create_access_token(data={"sub": user.username})
        logger.info(f"Token generado: {token[:15]}...")
        
    except Exception as e:
        logger.error(f"Error en la prueba de creación: {e}")
        import traceback
        logger.error(traceback.format_exc())

async def verificar_serializacion():
    """Verifica la serialización de los modelos de usuario"""
    logger.info("\n" + "=" * 50)
    logger.info("VERIFICACIÓN DE SERIALIZACIÓN")
    logger.info("=" * 50)
    
    try:
        # Obtener un usuario
        user = await User.first()
        if not user:
            logger.error("No se encontraron usuarios para probar la serialización")
            return
        
        logger.info(f"Usuario para prueba: {user.username} (ID: {user.id})")
        
        # Probar diferentes métodos de serialización
        # 1. Dict
        try:
            user_dict = user.__dict__
            filtered_dict = {k: v for k, v in user_dict.items() if not k.startswith('_')}
            logger.info(f"1. Dict: {json.dumps(filtered_dict, default=str, indent=2)}")
        except Exception as e:
            logger.error(f"Error en serialización dict: {e}")
        
        # 2. Model schema
        try:
            from pydantic import BaseModel
            
            class UserModel(BaseModel):
                id: int
                username: str
                email: str
                full_name: str
                role: str
                is_active: bool
                created_at: datetime
                updated_at: datetime
                
                class Config:
                    arbitrary_types_allowed = True
            
            user_model = UserModel(
                id=user.id,
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                role=user.role,
                is_active=user.is_active,
                created_at=user.created_at,
                updated_at=user.updated_at
            )
            
            logger.info(f"2. Pydantic: {user_model.json(indent=2)}")
        except Exception as e:
            logger.error(f"Error en serialización pydantic: {e}")
        
        # 3. Manual JSON
        try:
            manual_json = json.dumps({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            }, indent=2)
            
            logger.info(f"3. Manual JSON: {manual_json}")
        except Exception as e:
            logger.error(f"Error en serialización manual: {e}")
            
    except Exception as e:
        logger.error(f"Error general en verificación de serialización: {e}")
        import traceback
        logger.error(traceback.format_exc())

async def inicializar_bd():
    """Inicializa la conexión a la base de datos sin depender de FastAPI"""
    try:
        # Crear una instancia dummy de FastAPI para init_db
        app = FastAPI()
        
        # Intentar con init_db primero
        try:
            logger.info("Intentando inicializar BD con init_db...")
            await init_db(app)
            logger.info("Conexión a BD inicializada correctamente con init_db")
            return True
        except Exception as e:
            logger.warning(f"No se pudo inicializar con init_db: {e}")
            
            # Método alternativo: usar directamente Tortoise.init
            try:
                logger.info("Intentando inicializar directamente con Tortoise.init...")
                # Usar la configuración de TORTOISE_ORM
                await Tortoise.init(TORTOISE_ORM)
                logger.info("Conexión a BD inicializada correctamente con Tortoise.init")
                return True
            except Exception as e2:
                logger.warning(f"No se pudo inicializar con Tortoise.init: {e2}")
                
                # Último recurso: inicializar manualmente
                try:
                    from backend.app.core.config import settings
                    logger.info("Intentando inicialización manual con configuración específica...")
                    db_url = settings.database_url
                    await Tortoise.init(
                        db_url=db_url,
                        modules={"models": settings.MODELS}
                    )
                    logger.info("Conexión a BD inicializada manualmente")
                    return True
                except Exception as e3:
                    logger.error(f"Error en inicialización manual: {e3}")
                    return False
    except Exception as e:
        logger.error(f"Error general inicializando BD: {e}")
        return False

async def main():
    """Función principal que ejecuta todas las pruebas"""
    logger.info("Iniciando diagnóstico completo del sistema de usuarios")
    
    # Inicializar la conexión a la BD
    logger.info("Inicializando conexión a la base de datos...")
    bd_ok = await inicializar_bd()
    
    if not bd_ok:
        logger.error("No se pudo inicializar la conexión a la base de datos. Continuando con pruebas que no requieren BD...")
        # Ejecutar sólo pruebas que no requieren BD
        await probar_endpoints_usuarios()
    else:
        # Ejecutar todas las pruebas
        await analizar_usuarios_bd()
        await probar_endpoints_usuarios()
        await verificar_permisos()
        await prueba_creacion_usuario()
        await verificar_serializacion()
    
    # Intentar cerrar conexiones (podría fallar si no se establecieron)
    try:
        logger.info("\nCerrando conexiones...")
        await Tortoise.close_connections()
    except Exception as e:
        logger.warning(f"Error al cerrar conexiones: {e}")
    
    logger.info("\nDiagnóstico completo finalizado!")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Diagnóstico interrumpido por el usuario")
    except Exception as e:
        logger.error(f"Error en el diagnóstico: {e}")
        import traceback
        logger.error(traceback.format_exc())
        sys.exit(1)
