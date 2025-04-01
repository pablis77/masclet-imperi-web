import requests
import json

# Token de autenticación
token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJVc2VyUm9sZS5BRE1JTiIsImV4cCI6MTc0MzQ5MTg2OH0.M8gnVprY-U7kAshHgpUGaSu4rwUl1vq56sx9ZxI5dYE'
headers = {'Authorization': f'Bearer {token}'}

# 1. Primero, obtener todas las explotaciones y mostrar sus campos
print("\n=== DATOS COMPLETOS DE EXPLOTACIONES ===")
explotacions_url = 'http://localhost:8000/api/v1/explotacions/'
explotacions_response = requests.get(explotacions_url, headers=headers)

if explotacions_response.status_code == 200:
    explotaciones = explotacions_response.json()
    print(f"Total explotaciones: {len(explotaciones)}")
    for e in explotaciones:
        print(f"ID: {e.get('id')}, Campos completos:")
        print(json.dumps(e, indent=2))
else:
    print(f"Error al obtener explotaciones: {explotacions_response.status_code}")
    print(explotacions_response.text)

# 2. Ahora, obtener todos los animales y ver cómo están relacionados con explotaciones
print("\n=== REFERENCIAS A EXPLOTACIONES EN ANIMALES ===")
animales_url = 'http://localhost:8000/api/v1/animals/'
animales_response = requests.get(animales_url, headers=headers)

if animales_response.status_code == 200:
    animales = animales_response.json()
    print(f"Total animales: {len(animales)}")
    
    # Contar animales por valor de explotación
    explotaciones_count = {}
    for a in animales[:20]:  # Ver solo los primeros 20 para no saturar la salida
        explotacion_valor = a.get('explotacio')
        if explotacion_valor:
            if explotacion_valor not in explotaciones_count:
                explotaciones_count[explotacion_valor] = 0
            explotaciones_count[explotacion_valor] += 1
        print(f"Animal ID: {a.get('id')}, Explotación: {explotacion_valor}")
    
    print("\nDistribución de animales por explotación:")
    for explotacion, count in explotaciones_count.items():
        print(f"Explotación: {explotacion}, Animales: {count}")
else:
    print(f"Error al obtener animales: {animales_response.status_code}")
    print(animales_response.text)
