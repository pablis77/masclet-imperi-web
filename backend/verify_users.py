#!/usr/bin/env python
"""
Script para verificar los usuarios en la base de datos.
"""
import asyncio
import sys
from tortoise import Tortoise

async def init_db():
    # Configuración de la base de datos
    await Tortoise.init(
        db_url="postgres://postgres:1234@localhost:5432/masclet_imperi",
        modules={"models": ["app.models.user", "app.models.animal", "app.models.explotacio"]}
    )

async def check_users():
    from app.models.user import User
    try:
        # Inicializar la base de datos
        await init_db()
        
        # Obtener todos los usuarios
        users = await User.all()
        
        print(f"\nUsuarios en la base de datos: {len(users)}")
        print("=" * 40)
        
        for user in users:
            print(f"Username: {user.username}")
            print(f"Email: {user.email}")
            print(f"Rol: {user.role}")
            print(f"Activo: {user.is_active}")
            print("-" * 40)
            
        # Verificar si existe el usuario administrador
        admin = await User.get_or_none(username="admin")
        if admin:
            print("\nUsuario admin encontrado:")
            print(f"- ID: {admin.id}")
            print(f"- Activo: {admin.is_active}")
            print(f"- Rol: {admin.role}")
            print("\nLa contraseña no se puede verificar directamente, pero el usuario existe.")
        else:
            print("\n¡ALERTA! Usuario admin no encontrado en la base de datos.")
            
    except Exception as e:
        print(f"Error al verificar usuarios: {e}")
    finally:
        # Cerrar conexiones
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(check_users())
