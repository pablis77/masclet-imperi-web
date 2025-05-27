"""
Script para listar los usuarios en la base de datos y sus detalles.
"""
import asyncio
import sys
import os
from pathlib import Path

# Agregar el directorio raíz al path para importar los módulos de la aplicación
sys.path.append(str(Path(__file__).parent.parent.parent))

from tortoise import Tortoise
from backend.app.models.user import User

async def main():
    """Función principal"""
    # Conectar a la base de datos
    await Tortoise.init(
        db_url='postgres://postgres:1234@localhost:5433/masclet_imperi',
        modules={'models': ['backend.app.models.user']}
    )
    
    try:
        # Obtener todos los usuarios
        users = await User.all()
        
        print("\n=== USUARIOS EN LA BASE DE DATOS ===\n")
        for user in users:
            print(f"ID: {user.id}")
            print(f"Username: {user.username}")
            print(f"Email: {user.email}")
            print(f"Role: {user.role}")
            print(f"Password hash: {user.password_hash[:20]}...")
            print(f"Activo: {user.is_active}")
            print(f"Creado: {user.created_at}")
            print(f"Actualizado: {user.updated_at}")
            print("-" * 50)
            
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        # Cerrar la conexión
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(main())
