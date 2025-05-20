import sys
import os
import json
import asyncio
import requests
from datetime import datetime

# Configurar las rutas para acceder a los módulos de la aplicación
script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(script_dir)))
sys.path.append(root_dir)

# URL de la API para obtener los datos del dashboard
API_URL = "http://localhost:8000/api/v1/dashboard/partos"

def print_header(text):
    print(f"\n{'=' * 40}")
    print(f"{text}")
    print(f"{'=' * 40}\n")

def verify_data_format(data):
    print_header("VERIFICACIÓN DEL FORMATO DE DATOS DEL DASHBOARD")
    
    # Verificar la presencia de campos clave
    print(f"Campos principales en la respuesta: {list(data.keys())}")
    
    # Verificar la distribución por mes
    if 'por_mes' in data:
        print_header("DISTRIBUCIÓN MENSUAL DE PARTOS")
        print(f"Tipo de datos: {type(data['por_mes'])}")
        print(f"Estructura de datos: {data['por_mes']}")
        
        # Verificar si hay valores mayores que cero
        if isinstance(data['por_mes'], dict):
            has_values = any(value > 0 for value in data['por_mes'].values())
            print(f"¿Tiene valores positivos? {has_values}")
            
            # Listar los meses presentes
            print(f"Meses presentes: {list(data['por_mes'].keys())}")
            
            # Verificar si los meses están en formato correcto (primera letra mayúscula)
            for month in data['por_mes'].keys():
                if not month[0].isupper():
                    print(f"⚠️ ALERTA: El mes '{month}' no comienza con mayúscula!")
    else:
        print("❌ ERROR: No se encontró la distribución mensual en los datos")
    
    # Verificar la distribución anual
    if 'distribucion_anual' in data:
        print_header("DISTRIBUCIÓN ANUAL DE PARTOS")
        print(f"Tipo de datos: {type(data['distribucion_anual'])}")
        print(f"Estructura de datos: {data['distribucion_anual']}")
        
        # Verificar si hay valores mayores que cero
        if isinstance(data['distribucion_anual'], dict):
            has_values = any(value > 0 for value in data['distribucion_anual'].values())
            print(f"¿Tiene valores positivos? {has_values}")
    else:
        print("❌ ERROR: No se encontró la distribución anual en los datos")

def main():
    print(f"Iniciando verificación de datos del dashboard a las {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Consultando API en: {API_URL}")
    
    try:
        # Realizar la petición a la API
        response = requests.get(API_URL)
        response.raise_for_status()
        
        # Convertir la respuesta a JSON
        data = response.json()
        
        # Verificar el formato de los datos
        verify_data_format(data)
        
    except requests.exceptions.RequestException as e:
        print(f"❌ ERROR al conectar con la API: {e}")
    except json.JSONDecodeError:
        print(f"❌ ERROR al decodificar la respuesta JSON")
    except Exception as e:
        print(f"❌ ERROR inesperado: {e}")

if __name__ == "__main__":
    main()
