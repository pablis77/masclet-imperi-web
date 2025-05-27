import sys
import os
import asyncio
import logging
from typing import List, Dict, Any
import json
from datetime import datetime

# Configura la ruta para importar módulos del proyecto
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from tortoise import Tortoise
from backend.app.models.user import User
from backend.app.core.config import get_settings

# Configuración de logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s [%(levelname)8s] %(message)s',
                   datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

async def check_users():
    """Comprueba y muestra información sobre los usuarios en la base de datos."""
    # Inicializar la conexión a la base de datos
    config = get_settings()
    db_url = config.DATABASE_URL
    print(f"Conectando a la base de datos: {db_url}")
    
    await Tortoise.init(
        db_url=db_url,
        modules={"models": ["backend.app.models.user"]}
    )
    
    try:
        # Obtener todos los usuarios
        users = await User.all()
        
        print("\n=== USUARIOS EN LA BASE DE DATOS ===\n")
        print(f"Total de usuarios: {len(users)}")
        
        # Tabla de usuarios
        print("\n{:<5} {:<15} {:<30} {:<15} {:<10}".format(
            "ID", "Username", "Email", "Role", "Active"
        ))
        print("-" * 80)
        
        for user in users:
            print("{:<5} {:<15} {:<30} {:<15} {:<10}".format(
                user.id,
                user.username,
                user.email,
                user.role,
                "Sí" if user.is_active else "No"
            ))
        
        print("\n=== DETALLES DE ROLES ===\n")
        
        # Contar usuarios por rol
        roles = {}
        for user in users:
            roles[user.role] = roles.get(user.role, 0) + 1
            
        for role, count in roles.items():
            print(f"Rol '{role}': {count} usuario(s)")
            
        # Verificar si existe un usuario Ramon con el rol correcto
        ramon_users = [u for u in users if u.username.lower() == 'ramon']
        if ramon_users:
            print("\n=== USUARIO RAMON ENCONTRADO ===")
            for ramon in ramon_users:
                print(f"ID: {ramon.id}")
                print(f"Username: {ramon.username}")
                print(f"Email: {ramon.email}")
                print(f"Rol actual: {ramon.role}")
                print(f"Activo: {'Sí' if ramon.is_active else 'No'}")
                if ramon.role != "Ramon":
                    print(f"\n⚠️ ADVERTENCIA: El usuario Ramon tiene el rol '{ramon.role}' en lugar de 'Ramon'")
        else:
            print("\n⚠️ ADVERTENCIA: No se encontró ningún usuario con nombre 'ramon'")
            
    except Exception as e:
        logger.error(f"Error al verificar usuarios: {str(e)}")
    finally:
        # Cerrar la conexión
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(check_users())
