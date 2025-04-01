import requests
import json

# Token de autenticación
token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJVc2VyUm9sZS5BRE1JTiIsImV4cCI6MTc0MzQ5MTg2OH0.M8gnVprY-U7kAshHgpUGaSu4rwUl1vq56sx9ZxI5dYE'
headers = {'Authorization': f'Bearer {token}'}

# 1. Obtener el detalle completo de las explotaciones
print("\n=== DETALLE COMPLETO DE EXPLOTACIONES ===")
explotacions_url = 'http://localhost:8000/api/v1/explotacions/'
explotacions_response = requests.get(explotacions_url, headers=headers)

if explotacions_response.status_code == 200:
    explotaciones = explotacions_response.json()
    print(f"Total explotaciones: {len(explotaciones)}")
    
    # Mostrar detalles en formato simple
    for e in explotaciones:
        print(f"ID: {e.get('id')}, Nom: {e.get('nom')}, Explotacio: {e.get('explotacio')}, Activa: {e.get('activa', True)}")
    
    # Mostrar el primer registro completo para ver todos los campos disponibles
    if explotaciones:
        print("\nEjemplo de registro completo (primera explotación):")
        print(json.dumps(explotaciones[0], indent=2))
else:
    print(f"Error al obtener explotaciones: {explotacions_response.status_code}")
    print(explotacions_response.text)

# 2. Obtener los primeros animales para ver cómo están relacionados con explotaciones
print("\n=== MUESTRA DE ANIMALES CON VALOR DE EXPLOTACIÓN ===")
animals_url = 'http://localhost:8000/api/v1/animals/?limit=2'
animals_response = requests.get(animals_url, headers=headers)

if animals_response.status_code == 200:
    animals_data = animals_response.json()
    print(f"Muestra de animales: {len(animals_data) if isinstance(animals_data, list) else 'formato no esperado'}")
    
    # Imprimir la estructura de datos para depuración
    print(f"Tipo de datos recibido: {type(animals_data)}")
    if isinstance(animals_data, list) and len(animals_data) > 0:
        print(f"Primer elemento: {type(animals_data[0])}")
        print(f"Contenido: {animals_data[0]}")
        
        # Mostrar detalles de los animales
        for i, animal_data in enumerate(animals_data):
            print(f"\nAnimal #{i+1}:")
            
            # Manejar diferentes formatos de respuesta
            if isinstance(animal_data, str):
                print(f"Datos en formato string: {animal_data}")
            elif isinstance(animal_data, dict):
                animal_info = {
                    'id': animal_data.get('id', 'N/A'),
                    'nom': animal_data.get('nom', 'N/A'),
                    'explotacio': animal_data.get('explotacio', 'N/A')
                }
                print(f"ID: {animal_info['id']}")
                print(f"Nom: {animal_info['nom']}")
                print(f"Explotacio: {animal_info['explotacio']}")
                
                if 'explotacio' in animal_data:
                    print("- Campo 'explotacio' presente (CORRECTO)")
                elif 'explotaci' in animal_data: 
                    print("- Campo 'explotaci' presente (INCORRECTO)")
    else:
        print("No se obtuvieron animales en formato lista")
        print(f"Datos recibidos: {animals_data}")
else:
    print(f"Error al obtener animales: {animals_response.status_code}")
    print(animals_response.text)

# 3. Probar filtrado directo por nombre de explotación
print("\n=== PRUEBA DE FILTRADO DIRECTO POR NOMBRE DE EXPLOTACIÓN ===")
# Intentamos con 'Gurans', 'Madrid' y 'Guadalajara' como mencionaste
for explotacion_nombre in ['Gurans', 'Madrid', 'Guadalajara']:
    filtered_url = f'http://localhost:8000/api/v1/animals/?explotacio={explotacion_nombre}'
    filtered_response = requests.get(filtered_url, headers=headers)
    
    if filtered_response.status_code == 200:
        animales_filtrados = filtered_response.json()
        print(f"Animales en explotación '{explotacion_nombre}': {len(animales_filtrados)}")
        if animales_filtrados:
            print(f"Ejemplo: Animal ID {animales_filtrados[0].get('id')}, Nombre: {animales_filtrados[0].get('nom')}")
    else:
        print(f"Error al filtrar por '{explotacion_nombre}': {filtered_response.status_code}")
