#!/usr/bin/env python
"""
Script para actualizar el campo 'mare' de un animal por su NOMBRE (no por ID).
Este script es una solución directa y simple para actualizar el campo 'mare'
sin tener que lidiar con las inconsistencias del frontend.
"""

import sys
import json
import requests
from getpass import getpass

# Configuración
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"
AUTH_URL = f"{API_URL}/auth/login"
ANIMALS_URL = f"{API_URL}/animals/"
SEARCH_URL = f"{API_URL}/animals/?search="

def login(username, password):
    """Obtiene un token JWT para autenticación."""
    try:
        # Importante: enviar como JSON, no como form-data
        response = requests.post(AUTH_URL, json={"username": username, "password": password})
        response.raise_for_status()
        return response.json()["access_token"]
    except requests.exceptions.RequestException as e:
        print(f"Error de autenticación: {e}")
        if response.text:
            print(f"Respuesta del servidor: {response.text}")
        sys.exit(1)

def buscar_animal_por_nombre(token, nombre):
    """Busca un animal por su nombre."""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Realizar búsqueda por nombre
        search_response = requests.get(
            f"{SEARCH_URL}{nombre}",
            headers=headers
        )
        search_response.raise_for_status()
        
        # Extraer resultados de la búsqueda
        search_data = search_response.json()
        
        if "data" in search_data and "items" in search_data["data"]:
            items = search_data["data"]["items"]
        elif "items" in search_data:
            items = search_data["items"]
        else:
            print(f"Formato de respuesta inesperado: {search_data}")
            return None
        
        # Filtrar por coincidencia exacta de nombre
        animales = [a for a in items if a["nom"].lower() == nombre.lower()]
        
        if not animales:
            print(f"No se encontró ningún animal con el nombre '{nombre}'")
            # Mostrar animales similares
            if items:
                print("Animales encontrados con nombres similares:")
                for a in items[:5]:  # Mostrar hasta 5 resultados
                    print(f"  - {a['nom']} (ID: {a['id']})")
            return None
        
        if len(animales) > 1:
            print(f"Se encontraron {len(animales)} animales con el nombre '{nombre}'")
            print("Por favor, seleccione uno:")
            for i, a in enumerate(animales):
                print(f"{i+1}. {a['nom']} (ID: {a['id']}, Explotación: {a['explotacio']})")
            
            seleccion = int(input("Seleccione un número: ")) - 1
            return animales[seleccion]
        
        return animales[0]
    
    except requests.exceptions.RequestException as e:
        print(f"Error al buscar animal: {e}")
        if search_response.text:
            print(f"Respuesta del servidor: {search_response.text}")
        return None

def actualizar_mare(token, animal_id, nuevo_valor_mare):
    """Actualiza el campo 'mare' de un animal usando PATCH."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Preparar datos para la actualización (solo el campo mare)
    update_data = {
        "mare": nuevo_valor_mare if nuevo_valor_mare else None
    }
    
    try:
        # Realizar petición PATCH
        response = requests.patch(
            f"{ANIMALS_URL}{animal_id}",
            headers=headers,
            json=update_data
        )
        response.raise_for_status()
        
        print(f"✅ Campo 'mare' actualizado correctamente para el animal ID {animal_id}")
        return response.json()
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Error al actualizar animal: {e}")
        if response.text:
            print(f"Respuesta del servidor: {response.text}")
        return None

def mostrar_animal(animal):
    """Muestra la información de un animal de forma legible."""
    if not animal:
        return
    
    print("\n=== INFORMACIÓN DEL ANIMAL ===")
    print(f"Nombre: {animal.get('nom', 'N/A')}")
    print(f"ID: {animal.get('id', 'N/A')}")
    print(f"Explotación: {animal.get('explotacio', 'N/A')}")
    print(f"Género: {animal.get('genere', 'N/A')}")
    print(f"Estado: {animal.get('estado', 'N/A')}")
    print(f"Madre: {animal.get('mare', 'N/A')}")
    print(f"Padre: {animal.get('pare', 'N/A')}")
    print(f"Fecha de nacimiento: {animal.get('dob', 'N/A')}")
    print(f"Código: {animal.get('cod', 'N/A')}")
    print(f"Número de serie: {animal.get('num_serie', 'N/A')}")
    print(f"Amamantando: {animal.get('alletar', 'N/A')}")
    print("============================\n")

def main():
    # Obtener credenciales (valores predeterminados para facilitar pruebas)
    username = input("Usuario [admin]: ") or "admin"
    password = getpass("Contraseña [admin123]: ") or "admin123"
    
    # Iniciar sesión
    print("Iniciando sesión...")
    token = login(username, password)
    print("✅ Sesión iniciada correctamente")
    
    # Buscar animal por nombre
    nombre_animal = input("Nombre del animal a actualizar: ")
    animal = buscar_animal_por_nombre(token, nombre_animal)
    
    if not animal:
        print("❌ No se pudo continuar sin un animal válido")
        sys.exit(1)
    
    # Mostrar información actual del animal
    print("\nInformación actual del animal:")
    mostrar_animal(animal)
    
    # Solicitar nuevo valor para mare
    valor_actual = animal.get('mare', 'N/A')
    print(f"Valor actual de 'mare': {valor_actual}")
    nuevo_valor = input("Nuevo valor para 'mare' (dejar vacío para NULL): ")
    
    # Confirmar actualización
    confirmacion = input(f"¿Confirmar actualización de 'mare' a '{nuevo_valor or 'NULL'}' para {animal['nom']}? (s/n): ")
    if confirmacion.lower() != 's':
        print("Operación cancelada")
        sys.exit(0)
    
    # Actualizar mare
    resultado = actualizar_mare(token, animal['id'], nuevo_valor)
    
    if resultado:
        # Buscar animal actualizado para verificar cambios
        print("\nVerificando cambios...")
        animal_actualizado = buscar_animal_por_nombre(token, nombre_animal)
        
        if animal_actualizado:
            print("Información actualizada del animal:")
            mostrar_animal(animal_actualizado)
    
    print("Fin del script")

if __name__ == "__main__":
    main()
