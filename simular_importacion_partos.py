#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para simular la importación de partos desde un CSV y verificar
la lógica de autoincremento de numero_part y la asociación de animal_id.
"""

import requests
import json
from datetime import datetime

# Configuración
BASE_URL = "http://localhost:8000/api/v1"
MARTA_ID = 446  # ID de Marta (ya lo tenemos identificado)

# Obtener token
credentials = {
    "username": "admin",
    "password": "admin123"
}
auth_response = requests.post(
    f"{BASE_URL}/auth/login",
    data=credentials,
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)

if auth_response.status_code != 200:
    print(f"Error de autenticación: {auth_response.status_code} - {auth_response.text}")
    exit(1)

token = auth_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 1. Consultar los partos existentes de Marta para ver su número de partos actual
partos_response = requests.get(f"{BASE_URL}/animals/{MARTA_ID}/partos", headers=headers)

if partos_response.status_code != 200:
    print(f"Error al obtener partos: {partos_response.status_code} - {partos_response.text}")
    exit(1)

partos_data = partos_response.json()
if isinstance(partos_data, list):
    partos_list = partos_data
elif isinstance(partos_data, dict) and "data" in partos_data and isinstance(partos_data["data"], list):
    partos_list = partos_data["data"]
else:
    # Intentar cualquier otra estructura
    if "data" in partos_data and "items" in partos_data["data"]:
        partos_list = partos_data["data"]["items"]
    else:
        partos_list = []

print(f"\n=== PARTOS ACTUALES DE MARTA ({len(partos_list)}) ===")
for idx, parto in enumerate(partos_list, 1):
    print(f"{idx}. ID: {parto.get('id')}, Número: {parto.get('numero_part')}, Fecha: {parto.get('part')}")

# Obtener el número de parto más alto si existe
ultimo_numero = 0
for parto in partos_list:
    numero = parto.get("numero_part")
    if numero and isinstance(numero, int) and numero > ultimo_numero:
        ultimo_numero = numero

print(f"\nÚltimo número de parto encontrado: {ultimo_numero}")

# 2. Simular una importación CSV que no incluye numero_part, animal_id ni id
# Este sería el caso real en importaciones
datos_simulados_csv = [
    {"part": "10/01/2020", "GenereT": "F", "EstadoT": "OK", "observacions": "Importado CSV 1"},
    {"part": "15/03/2021", "GenereT": "M", "EstadoT": "OK", "observacions": "Importado CSV 2"}
]

print("\n=== SIMULANDO IMPORTACIÓN CSV (sin numero_part ni animal_id) ===")
resultados_importacion = []

for idx, dato in enumerate(datos_simulados_csv, 1):
    print(f"\nIntentando importar dato {idx}: {dato}")

    # CASO 1: Enviar sin animal_id y sin numero_part
    # Esto debería fallar con un error 422 si el backend no está preparado para calcular automáticamente
    parto_data = dato.copy()  # Datos exactamente como vendrían del CSV
    
    print("Caso 1: Sin campos adicionales...")
    response1 = requests.post(f"{BASE_URL}/animals/{MARTA_ID}/partos", headers=headers, json=parto_data)
    print(f"  Respuesta: {response1.status_code}")
    if response1.status_code >= 400:
        print(f"  Error: {response1.text}")
    else:
        print(f"  Éxito: {json.dumps(response1.json(), indent=2)}")
        resultados_importacion.append(("Caso 1", response1.json()))

    # CASO 2: Añadir animal_id pero no numero_part
    # El backend debería calcular automáticamente el numero_part
    parto_data = dato.copy()
    parto_data["animal_id"] = MARTA_ID
    
    print("Caso 2: Con animal_id pero sin numero_part...")
    response2 = requests.post(f"{BASE_URL}/animals/{MARTA_ID}/partos", headers=headers, json=parto_data)
    print(f"  Respuesta: {response2.status_code}")
    if response2.status_code >= 400:
        print(f"  Error: {response2.text}")
    else:
        print(f"  Éxito: {json.dumps(response2.json(), indent=2)}")
        resultados_importacion.append(("Caso 2", response2.json()))

    # CASO 3: Añadir numero_part pero no animal_id
    # El backend debería asociar correctamente el animal_id de la URL
    parto_data = dato.copy()
    parto_data["numero_part"] = ultimo_numero + idx
    
    print("Caso 3: Con numero_part pero sin animal_id...")
    response3 = requests.post(f"{BASE_URL}/animals/{MARTA_ID}/partos", headers=headers, json=parto_data)
    print(f"  Respuesta: {response3.status_code}")
    if response3.status_code >= 400:
        print(f"  Error: {response3.text}")
    else:
        print(f"  Éxito: {json.dumps(response3.json(), indent=2)}")
        resultados_importacion.append(("Caso 3", response3.json()))

    # CASO 4: Añadir tanto animal_id como numero_part
    # Este es el caso "completo" que debería funcionar siempre
    parto_data = dato.copy()
    parto_data["animal_id"] = MARTA_ID
    parto_data["numero_part"] = ultimo_numero + idx * 10  # Usar un número muy distinto para diferenciar
    
    print("Caso 4: Con animal_id y numero_part...")
    response4 = requests.post(f"{BASE_URL}/animals/{MARTA_ID}/partos", headers=headers, json=parto_data)
    print(f"  Respuesta: {response4.status_code}")
    if response4.status_code >= 400:
        print(f"  Error: {response4.text}")
    else:
        print(f"  Éxito: {json.dumps(response4.json(), indent=2)}")
        resultados_importacion.append(("Caso 4", response4.json()))

# 3. Mostrar resumen de resultados
print("\n=== RESUMEN DE IMPORTACIÓN ===")
print(f"Se realizaron {len(resultados_importacion)} intentos exitosos de importación")

for caso, resultado in resultados_importacion:
    print(f"\n{caso}:")
    print(f"  ID: {resultado.get('id')}")
    print(f"  Animal ID: {resultado.get('animal_id')}")
    print(f"  Número de parto: {resultado.get('numero_part')}")
    print(f"  Fecha: {resultado.get('part')}")
    print(f"  Observaciones: {resultado.get('observacions')}")

print("\n=== RECOMENDACIONES PARA EL BACKEND ===")
print("Para que la API sea consistente y robusta para importaciones CSV, el backend debería:")
print("1. Extraer el animal_id de la URL si no está presente en el payload")
print("2. Calcular automáticamente el numero_part si no está presente, basado en el historial del animal")
print("3. Validar que el animal_id en el payload coincida con el de la URL (si ambos están presentes)")
print("4. Generar el ID del parto automáticamente (campo autoincremental en la base de datos)")

# Preguntar si se deben eliminar los partos de prueba
respuesta = input("\n¿Quieres eliminar los partos de prueba creados? (s/n): ")
if respuesta.lower() == "s":
    print("\nEliminando partos de prueba...")
    for caso, resultado in resultados_importacion:
        if "id" in resultado:
            parto_id = resultado["id"]
            print(f"Eliminando parto ID {parto_id}...")
            delete_response = requests.delete(f"{BASE_URL}/partos/{parto_id}", headers=headers)
            print(f"  Respuesta: {delete_response.status_code}")
    print("Limpieza completada.")
