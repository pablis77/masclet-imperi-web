import requests
import json
import sys
import os
import logging

# Configuración de logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s [%(levelname)8s] %(message)s',
                   datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

API_URL = "http://localhost:8000/api/v1"

def login(username, password):
    """Iniciar sesión y obtener token de acceso"""
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            data={"username": username, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            return token
        else:
            logger.error(f"Error al iniciar sesión: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error al conectar con la API: {str(e)}")
        return None

def get_users(token):
    """Obtener lista de usuarios"""
    try:
        response = requests.get(
            f"{API_URL}/users/",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Error al obtener usuarios: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error al conectar con la API: {str(e)}")
        return None

def main():
    """Función principal para verificar usuario Ramon"""
    print("\n=== VERIFICANDO ROL DE USUARIO RAMON ===\n")
    
    # Iniciar sesión como admin
    token = login("admin", "admin123")
    if not token:
        print("No se pudo iniciar sesión. Verifique que el servidor backend esté en ejecución.")
        return
    
    print("Sesión iniciada correctamente como admin.")
    
    # Obtener lista de usuarios
    users = get_users(token)
    if not users:
        print("No se pudieron obtener los usuarios.")
        return
    
    # Depurar la respuesta para entender su estructura
    print(f"\nRespuesta de la API (raw):")
    print(json.dumps(users, indent=2))
    
    # Verificar estructura y buscar usuario Ramon
    if isinstance(users, list):
        print(f"\nTotal de usuarios encontrados: {len(users)}")
        
        ramon_users = [u for u in users if isinstance(u, dict) and u.get("username", "").lower() == "ramon"]
        
        if ramon_users:
            for ramon in ramon_users:
                print("\n=== INFORMACIÓN DEL USUARIO RAMON ===")
                print(f"ID: {ramon.get('id')}")
                print(f"Username: {ramon.get('username')}")
                print(f"Email: {ramon.get('email')}")
                print(f"Rol actual: {ramon.get('role')}")
                print(f"Activo: {'Sí' if ramon.get('is_active') else 'No'}")
                
                # Verificar si el rol es "Ramon"
                if ramon.get("role") != "Ramon":
                    print(f"\n⚠️ ADVERTENCIA: El usuario Ramon tiene el rol '{ramon.get('role')}' en lugar de 'Ramon'")
                    print("\nPara que todo funcione correctamente, se debe actualizar el rol en la base de datos.")
                else:
                    print("\n✅ ¡El usuario Ramon tiene el rol correcto 'Ramon'!")
        else:
            print("\n⚠️ No se encontró ningún usuario con username 'ramon'.")

if __name__ == "__main__":
    main()
