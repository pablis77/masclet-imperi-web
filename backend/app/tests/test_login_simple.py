"""
Script simple para probar la autenticación directamente
"""
import requests
import json

def test_login():
    """Probar login con credenciales correctas"""
    url = "http://localhost:8000/api/v1/auth/login"
    
    # Datos de prueba
    data = {
        "username": "admin",
        "password": "admin123"
    }
    
    # Convertir a formato x-www-form-urlencoded
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        print(f"Probando autenticación en: {url}")
        print(f"Datos: {data}")
        
        # Hacer la petición
        response = requests.post(
            url, 
            data=data,
            headers=headers
        )
        
        # Mostrar resultados
        print(f"Código de respuesta: {response.status_code}")
        
        # Intentar mostrar los datos de respuesta
        try:
            response_data = response.json()
            print("Respuesta JSON:", json.dumps(response_data, indent=2))
        except Exception as e:
            print(f"No se pudo parsear la respuesta como JSON: {e}")
            print(f"Contenido de la respuesta: {response.text}")
        
        return response.status_code == 200
    
    except Exception as e:
        print(f"Error al hacer la solicitud: {e}")
        return False

if __name__ == "__main__":
    success = test_login()
    print(f"\nResultado de la prueba: {'ÉXITO' if success else 'FALLO'}")
