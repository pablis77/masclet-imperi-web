"""
Script para verificar el nombre de usuario exacto de Ramon en la base de datos.
Este script comprueba si es 'ramon' o 'Ramon' (con mayúscula o minúscula).
"""
import os
import sys
import asyncio
import logging
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Añadimos el directorio raíz al path para importar los módulos de la aplicación
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.app.models.user import User, UserRole
from backend.app.core.database import SQLALCHEMY_DATABASE_URL

async def check_ramon_username():
    """Verificar el nombre de usuario exacto de Ramon en la base de datos."""
    
    print("\n🔍 VERIFICACIÓN DE NOMBRE DE USUARIO DE RAMON EN LA BASE DE DATOS 🔍")
    print("="*80)
    
    # Conectar a la base de datos
    database_url = SQLALCHEMY_DATABASE_URL
    # Asegurarnos que usamos async
    if not database_url.startswith('postgresql+asyncpg'):
        database_url = database_url.replace('postgresql', 'postgresql+asyncpg')
    
    logger.info(f"Conectando a la base de datos: {database_url}")
    engine = create_async_engine(database_url)
    
    try:
        async with AsyncSession(engine) as session:
            # 1. Buscar usuarios con nombre similar a Ramon (ignorando mayúsculas/minúsculas)
            query = text("SELECT * FROM users WHERE LOWER(username) = 'ramon'")
            result = await session.execute(query)
            users = result.fetchall()
            
            if not users:
                print("❌ No se encontró ningún usuario con nombre 'ramon' (en cualquier forma)")
                return
                
            print(f"✅ Se encontraron {len(users)} usuarios con nombre similar a 'ramon':")
            print("-"*80)
            
            for user in users:
                print(f"ID: {user.id}")
                print(f"Username exacto: '{user.username}' (tipo: {type(user.username)})")
                print(f"Role: {user.role}")
                print(f"Email: {user.email}")
                print(f"Activo: {user.is_active}")
                print("-"*80)
            
            # 2. Verificar si hay problemas de consistencia
            ramon_variations = []
            for user in users:
                if user.username not in ramon_variations:
                    ramon_variations.append(user.username)
            
            if len(ramon_variations) > 1:
                print("⚠️ ALERTA: Existen múltiples variaciones del nombre 'ramon':")
                for variation in ramon_variations:
                    print(f"  - '{variation}'")
                print("Esto puede causar problemas de inicio de sesión y permisos.")
                
            # 3. Verificar coherencia entre usuario y JWT
            query = text("SELECT * FROM tokens WHERE user_id IN (SELECT id FROM users WHERE LOWER(username) = 'ramon')")
            result = await session.execute(query)
            tokens = result.fetchall()
            
            if tokens:
                print(f"\n🔐 Tokens asociados a usuario Ramon: {len(tokens)}")
                for token in tokens:
                    print(f"Token ID: {token.id}")
                    print(f"User ID: {token.user_id}")
                    print(f"Fecha expiración: {token.expires}")
                    
            # 4. Recomendar solución si es necesario
            if len(ramon_variations) > 1:
                print("\n🔧 RECOMENDACIÓN:")
                print("  1. Estandarizar el nombre de usuario a 'Ramon' (con R mayúscula)")
                print("  2. Actualizar todos los componentes frontend para usar esta forma")
                print("  3. Asegurar que el login acepte ambas formas o solo la correcta")
    
    except Exception as e:
        print(f"❌ Error al verificar el nombre de usuario: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_ramon_username())
