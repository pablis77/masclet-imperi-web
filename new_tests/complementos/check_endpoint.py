import requests
import sys
import json
import os

def check_endpoint(url):
    """Prueba un endpoint de API y muestra la respuesta detallada"""
    print(f"Probando endpoint: {url}")
    
    # Intentar obtener token de autenticación
    token = None
    try:
        with open(os.path.expanduser("~/.masclet_token"), "r") as f:
            token = f.read().strip()
        print("Token encontrado en archivo local")
    except:
        print("No se encontró archivo de token, intentando obtenerlo del localStorage")
        # No se pudo leer el token desde el archivo
        pass
    
    if not token:
        # Intentar autenticarse
        auth_url = url.split('/api/')[0] + '/api/v1/auth/login'
        auth_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        try:
            auth_resp = requests.post(auth_url, json=auth_data)
            if auth_resp.status_code == 200:
                token_data = auth_resp.json()
                token = token_data.get("access_token")
                print(f"Autenticación exitosa, token obtenido")
            else:
                print(f"Error de autenticación: {auth_resp.status_code} - {auth_resp.text}")
        except Exception as e:
            print(f"Error al intentar autenticarse: {str(e)}")
    
    # Cabeceras para la solicitud
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
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
    if len(sys.argv) < 2:
        print("Uso: python check_endpoint.py <URL>")
        sys.exit(1)
    
    url = sys.argv[1]
    check_endpoint(url)
