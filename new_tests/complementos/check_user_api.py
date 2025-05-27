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
            f"{API_URL}/auth/users",
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

def get_current_user(token):
    """Obtener información del usuario actual"""
    try:
        response = requests.get(
            f"{API_URL}/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Error al obtener usuario actual: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error al conectar con la API: {str(e)}")
        return None

def main():
    """Función principal para verificar usuarios"""
    print("\n=== VERIFICANDO USUARIOS A TRAVÉS DE LA API ===\n")
    
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
    
    print(f"\nTotal de usuarios encontrados: {len(users)}")
    print("\n{:<5} {:<15} {:<30} {:<15} {:<10}".format(
        "ID", "Username", "Email", "Role", "Active"
    ))
    print("-" * 80)
    
    ramon_found = False
    for user in users:
        is_active = user.get("is_active", False)
        print("{:<5} {:<15} {:<30} {:<15} {:<10}".format(
            user.get("id", ""),
            user.get("username", ""),
            user.get("email", ""),
            user.get("role", ""),
            "Sí" if is_active else "No"
        ))
        
        # Verificar si encontramos al usuario Ramon
        if user.get("username", "").lower() == "ramon":
            ramon_found = True
            print("\n=== INFORMACIÓN DEL USUARIO RAMON ===")
            print(f"ID: {user.get('id')}")
            print(f"Username: {user.get('username')}")
            print(f"Email: {user.get('email')}")
            print(f"Rol actual: {user.get('role')}")
            print(f"Activo: {'Sí' if user.get('is_active') else 'No'}")
            
            # Verificar si el rol es "Ramon"
            if user.get("role") != "Ramon":
                print(f"\n⚠️ ADVERTENCIA: El usuario Ramon tiene el rol '{user.get('role')}' en lugar de 'Ramon'")
                print("\nPara que todo funcione correctamente, se debe actualizar el rol en la base de datos.")
    
    if not ramon_found:
        print("\n⚠️ No se encontró ningún usuario con username 'ramon'.")

if __name__ == "__main__":
    main()
