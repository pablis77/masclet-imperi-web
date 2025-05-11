"""
Script sencillo para probar el endpoint de importación CSV
"""
import requests
import os
import json

# URL del endpoint
BASE_URL = "http://localhost:8000/api/v1"
ENDPOINT = f"{BASE_URL}/imports/csv"

# Ruta al archivo CSV de prueba
CSV_PATH = "c:\\Proyectos\\claude\\masclet-imperi-web\\backend\\database\\pruebaampliacion.csv"

# Token de autenticación (para desarrollo)
# En un entorno real, esto vendría de un login
TOKEN = "test_token_for_development"

def probar_endpoint_import():
    """Probar el endpoint de importación CSV"""
    print(f"Probando endpoint: {ENDPOINT}")
    
    # Verificar que el archivo existe
    if not os.path.exists(CSV_PATH):
        print(f"Error: El archivo {CSV_PATH} no existe")
        return
    
    # Abrir el archivo CSV
    with open(CSV_PATH, 'rb') as f:
        # Configurar la petición
        headers = {
            'Authorization': f'Bearer {TOKEN}'
        }
        
        # Preparar datos del formulario
        files = {
            'file': (os.path.basename(CSV_PATH), f, 'text/csv')
        }
        
        data = {
            'description': 'Prueba de importación directa',
        }
        
        print(f"Enviando archivo: {os.path.basename(CSV_PATH)}")
        print(f"Tamaño del archivo: {os.path.getsize(CSV_PATH)} bytes")
        
        # Hacer la petición POST
        try:
            response = requests.post(
                ENDPOINT, 
                headers=headers,
                files=files,
                data=data
            )
            
            # Verificar la respuesta
            if response.status_code == 200:
                print("¡Éxito! Respuesta del servidor:")
                result = response.json()
                print(json.dumps(result, indent=2, ensure_ascii=False))
                return True
            else:
                print(f"Error {response.status_code}: {response.reason}")
                print("Contenido de la respuesta:")
                print(response.text)
                return False
                
        except Exception as e:
            print(f"Error al hacer la petición: {str(e)}")
            return False

if __name__ == "__main__":
    probar_endpoint_import()
