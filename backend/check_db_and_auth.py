import asyncio
import os
import sys
import requests
import json
from urllib.parse import urlencode
from tortoise import Tortoise, run_async
from app.core.config import Settings, get_settings

# URL del endpoint de autenticación
AUTH_URL = "http://localhost:8000/api/v1/auth/login"

async def check_database():
    """Verificar la conexión a la base de datos y los usuarios existentes"""
    print("Verificando la base de datos...")
    
    try:
        # Inicializar Tortoise ORM usando la configuración de la aplicación
        from app.main import init_db
        await init_db()
        
        print("Conexión a la base de datos establecida correctamente")
        
        # Verificar modelos registrados
        print(f"Modelos registrados: {Tortoise.apps}")
        
        # Importar modelo de usuario
        from app.models.user import User
        
        # Verificar usuarios existentes
        users = await User.all()
        print(f"Número de usuarios en la base de datos: {len(users)}")
        
        # Mostrar información de usuarios
        for user in users:
            print(f"Usuario: {user.username}, Email: {user.email}, Rol: {user.role}, Activo: {user.is_active}")
            print(f"Hash de contraseña (primeros 20 caracteres): {user.password_hash[:20]}...")
        
        # Verificar si existe el usuario admin
        admin = await User.filter(username="admin").first()
        if admin:
            print(f"Usuario admin encontrado: {admin.username}, Hash: {admin.password_hash[:20]}...")
        else:
            print("Usuario admin no encontrado")
            
            # Crear usuario admin si no existe
            from app.core.auth import get_password_hash
            
            print("Creando usuario admin...")
            admin = User(
                username="admin",
                email="admin@mascletimperi.com",
                password_hash=get_password_hash("admin123"),
                role="administrador",
                is_active=True
            )
            await admin.save()
            print(f"Usuario admin creado con éxito: {admin.username}, Hash: {admin.password_hash[:20]}...")
        
    except Exception as e:
        print(f"Error al verificar la base de datos: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        # Cerrar conexiones
        await Tortoise.close_connections()

def test_auth():
    """Prueba de autenticación directa usando requests"""
    print("\nProbando autenticación directamente con requests...")
    
    # Datos de autenticación
    data = {
        "username": "admin",
        "password": "admin123"
    }
    
    # Cabeceras
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }
    
    try:
        # Convertir a formato form-urlencoded
        form_data = urlencode(data)
        
        # Realizar la solicitud
        print(f"Enviando solicitud POST a {AUTH_URL}")
        print(f"Datos: {data}")
        print(f"Headers: {headers}")
        
        # Habilitar el modo de depuración para ver la solicitud completa
        import http.client as http_client
        http_client.HTTPConnection.debuglevel = 1
        
        response = requests.post(
            AUTH_URL,
            data=form_data,
            headers=headers
        )
        
        # Imprimir resultados
        print(f"Código de estado: {response.status_code}")
        print(f"Respuesta: {response.text}")
        print(f"Headers de respuesta: {response.headers}")
        
        if response.status_code == 200:
            print("¡Autenticación exitosa!")
            try:
                # Intentar parsear la respuesta como JSON
                response_data = response.json()
                print("\nDatos del token:")
                print(f"Token: {response_data.get('access_token')[:20]}...")
                print(f"Tipo: {response_data.get('token_type')}")
                
                # Si hay datos de usuario, mostrarlos
                if 'user' in response_data:
                    user_data = response_data['user']
                    print("\nDatos del usuario:")
                    print(f"ID: {user_data.get('id')}")
                    print(f"Username: {user_data.get('username')}")
                    print(f"Email: {user_data.get('email')}")
                    print(f"Rol: {user_data.get('role')}")
                    print(f"Activo: {user_data.get('is_active')}")
            except json.JSONDecodeError:
                print("La respuesta no es un JSON válido")
            return True
        else:
            print("Autenticación fallida.")
            return False
            
    except Exception as e:
        print(f"Error durante la prueba: {str(e)}")
        return False

if __name__ == "__main__":
    # Verificar la base de datos primero
    run_async(check_database())
    
    # Luego probar la autenticación
    test_auth()
