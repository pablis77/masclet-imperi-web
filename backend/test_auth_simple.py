#!/usr/bin/env python
"""
Script simple para probar la autenticación con el usuario admin.
"""
import requests
import json

# URL del endpoint de autenticación
AUTH_URL = "http://localhost:8000/api/v1/auth/login"

# Credenciales a probar (según la memoria del sistema)
AUTH_DATA = {
    "username": "admin",
    "password": "admin123"
}

def test_auth():
    """Prueba la autenticación con el usuario admin."""
    print(f"Probando autenticación con usuario: {AUTH_DATA['username']}")
    print(f"URL: {AUTH_URL}")
    
    try:
        # Para OAuth2PasswordRequestForm, debemos enviar los datos como form-data
        response = requests.post(
            AUTH_URL, 
            data=AUTH_DATA,  # Usar data en lugar de json
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"\nCódigo de estado: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            print("Autenticación exitosa!")
            print(f"Token: {token_data.get('access_token')[:20]}...")
            return True
        else:
            print(f"Error de autenticación: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_auth()
