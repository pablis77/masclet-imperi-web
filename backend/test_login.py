#!/usr/bin/env python
"""
Script para probar directamente la autenticación sin pasar por el endpoint HTTP.
"""
import asyncio
import sys
from tortoise import Tortoise
from app.core.auth import authenticate_user, verify_password

async def init_db():
    # Configuración de la base de datos
    await Tortoise.init(
        db_url="postgres://postgres:1234@localhost:5432/masclet_imperi",
        modules={"models": ["app.models.user", "app.models.animal", "app.models.explotacio"]}
    )

async def test_login():
    try:
        # Inicializar la base de datos
        await init_db()
        
        # Credenciales a probar
        username = "admin"
        password = "admin123"
        
        print(f"\nProbando autenticación para usuario: {username}")
        print("=" * 50)
        
        # Intentar autenticar directamente
        user = await authenticate_user(username, password)
        
        if user:
            print(f"✅ Autenticación exitosa para {username}")
            print(f"- ID: {user.id}")
            print(f"- Email: {user.email}")
            print(f"- Rol: {user.role}")
        else:
            print(f"❌ Autenticación fallida para {username}")
            
            # Intentar obtener el usuario para verificar si existe
            from app.models.user import User
            user_obj = await User.get_or_none(username=username)
            
            if user_obj:
                print(f"- Usuario encontrado en base de datos")
                print(f"- ID: {user_obj.id}")
                print(f"- Hash de contraseña: {user_obj.password_hash[:15]}...")
                
                # Verificar manualmente la contraseña
                is_password_correct = verify_password(password, user_obj.password_hash)
                print(f"- Verificación manual de contraseña: {'Correcta' if is_password_correct else 'Incorrecta'}")
            else:
                print(f"- Usuario no encontrado en base de datos")
    
    except Exception as e:
        print(f"Error durante la prueba de autenticación: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Cerrar conexiones
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(test_login())
