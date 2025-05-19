#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para probar el endpoint de importación CSV a través de la API.
"""
import os
import sys
import requests
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Constantes
API_BASE_URL = "http://127.0.0.1:8000/api/v1"
AUTH_URL = f"{API_BASE_URL}/auth/login"
IMPORT_URL = f"{API_BASE_URL}/imports/csv"
USERNAME = "admin"
PASSWORD = "admin123"

# Archivo CSV
MATRIZ_MASTER = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'backend', 'database', 'matriz_master.csv')

def main():
    """Función principal"""
    try:
        print("=== PRUEBA DE ENDPOINT DE IMPORTACIÓN ===")
        print(f"Archivo a importar: {MATRIZ_MASTER}")
        
        # 1. Autenticarse y obtener token
        print("\n1. Intentando autenticación...")
        
        # Usando form-data (application/x-www-form-urlencoded)
        auth_data = {
            "username": USERNAME,
            "password": PASSWORD
        }
        
        # Realizar la solicitud de autenticación
        auth_response = requests.post(
            AUTH_URL, 
            data=auth_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Status code: {auth_response.status_code}")
        print(f"Response: {auth_response.text[:100]}...")
        
        if auth_response.status_code != 200:
            print(f"ERROR: Autenticación fallida. Status: {auth_response.status_code}")
            print(f"Respuesta: {auth_response.text}")
            return 1
        
        # Extraer token
        auth_result = auth_response.json()
        token = auth_result.get("access_token")
        
        if not token:
            print("ERROR: No se recibió token de acceso")
            return 1
        
        print(f"✅ Autenticación exitosa! Token: {token[:15]}...")
        
        # 2. Probar el endpoint de importación
        print("\n2. Probando endpoint de importación...")
        
        # Preparar archivo y datos para importación
        with open(MATRIZ_MASTER, 'rb') as f:
            files = {
                'file': (os.path.basename(MATRIZ_MASTER), f, 'text/csv')
            }
            
            import_data = {
                'description': 'Prueba de importación desde API'
            }
            
            # Headers de autenticación
            headers = {
                'Authorization': f'Bearer {token}'
            }
            
            # Realizar la solicitud de importación
            import_response = requests.post(
                IMPORT_URL,
                files=files,
                data=import_data,
                headers=headers
            )
            
            print(f"Status code: {import_response.status_code}")
            
            if import_response.status_code in [200, 201, 202]:
                print("✅ Importación exitosa!")
                print(f"Respuesta: {import_response.text[:500]}...")
                
                # Intentar parsear y mostrar resultado
                try:
                    result = import_response.json()
                    print("\n=== RESULTADO DE IMPORTACIÓN ===")
                    print(f"ID: {result.get('id')}")
                    print(f"Status: {result.get('status')}")
                    
                    if 'result' in result:
                        res = result['result']
                        print(f"Total registros: {res.get('total', 0)}")
                        print(f"Éxitos: {res.get('success', 0)}")
                        print(f"Errores: {res.get('errors', 0)}")
                        
                        if res.get('errors', 0) > 0 and 'error_details' in res:
                            print("\nDetalles de errores:")
                            for error in res['error_details']:
                                print(f"- {error.get('message', 'Error sin detalle')}")
                except Exception as json_err:
                    print(f"Error al parsear respuesta: {str(json_err)}")
                
                return 0
            else:
                print(f"ERROR: Importación fallida. Status: {import_response.status_code}")
                print(f"Respuesta: {import_response.text}")
                return 1
    
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
