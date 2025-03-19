import asyncio
import os
import sys
import requests
import json
from urllib.parse import urlencode

# URL del endpoint de autenticación
AUTH_URL = "http://192.168.68.57:8000/api/v1/auth/login"

def test_auth():
    """Prueba de autenticación directa usando requests"""
    print("Probando autenticación directamente con requests...")
    
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
            return True
        else:
            print("Autenticación fallida.")
            return False
            
    except Exception as e:
        print(f"Error durante la prueba: {str(e)}")
        return False

if __name__ == "__main__":
    test_auth()
