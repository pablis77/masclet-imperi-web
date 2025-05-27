import requests
import sys
import json
import os
import jwt
from datetime import datetime, timedelta

def create_test_token():
    """Crea un token JWT de prueba para admin"""
    # Datos del payload
    payload = {
        "sub": "admin@masclet.com",
        "exp": datetime.utcnow() + timedelta(days=1),
        "role": "admin",
        "username": "admin"
    }
    
    # Secret key - usar la misma que en la aplicación
    # En producción esto debería estar en un archivo .env
    secret_key = "your-secret-key-for-jwt-goes-here"
    
    # Generar token
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    return token

def check_endpoint(url):
    """Prueba un endpoint de API y muestra la respuesta detallada"""
    print(f"Probando endpoint: {url}")
    
    # Crear un token de prueba
    token = create_test_token()
    print(f"Token de prueba creado para admin")
    
    # Cabeceras para la solicitud
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        # Realizar la solicitud
        response = requests.get(url, headers=headers)
        
        # Mostrar la información de la respuesta
        print(f"\nCódigo de estado: {response.status_code} {response.reason}")
        print(f"Cabeceras de respuesta:")
        for header, value in response.headers.items():
            print(f"  {header}: {value}")
        
        # Intentar mostrar el cuerpo de la respuesta como JSON
        try:
            json_response = response.json()
            print("\nCuerpo de la respuesta (JSON):")
            print(json.dumps(json_response, indent=2, ensure_ascii=False))
        except:
            # Si no es JSON, mostrar como texto
            print("\nCuerpo de la respuesta (texto):")
            print(response.text[:500])  # Mostrar solo los primeros 500 caracteres
            if len(response.text) > 500:
                print("... [contenido truncado] ...")
        
    except Exception as e:
        print(f"Error al realizar la solicitud: {str(e)}")

if __name__ == "__main__":
    # URL del endpoint de backups
    url = "http://localhost:8000/api/v1/backup/list"
    check_endpoint(url)
