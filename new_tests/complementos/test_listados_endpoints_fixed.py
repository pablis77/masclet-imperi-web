"""
Script para probar los endpoints de listados personalizados

Este script verifica que los endpoints de listados estén funcionando correctamente
antes de comenzar a desarrollar el frontend.
"""
import requests
import json
import sys
from datetime import datetime

# Configuración
BASE_URL = "http://localhost:8000/api/v1"
USERNAME = "admin"
PASSWORD = "admin123"

# Colores para la terminal
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

def obtener_token():
    """Obtener token de autenticación"""
    print(f"{YELLOW}Obteniendo token de autenticación...{RESET}")
    
    url = f"{BASE_URL}/auth/login"
    data = {
        "username": USERNAME,
        "password": PASSWORD,
        "grant_type": "password"
    }
    
    try:
        # Usar form-data para OAuth2
        response = requests.post(url, data=data)
        response.raise_for_status()
        token = response.json().get("access_token")
        print(f"{GREEN}Token obtenido correctamente{RESET}")
        return token
    except requests.exceptions.RequestException as e:
        print(f"{RED}Error al obtener token: {str(e)}{RESET}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"{RED}Detalles: {e.response.text}{RESET}")
        sys.exit(1)

def realizar_pruebas(token):
    """Realizar pruebas en los endpoints de listados"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Variables para almacenar información entre pruebas
    listado_id = None
    animal_ids = []
    
    # Test 1: Crear un listado nuevo
    print(f"\n{BLUE}=== Test 1: Crear un listado nuevo ==={RESET}")
    url = f"{BASE_URL}/listados"
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    data = {
        "nombre": f"Listado de prueba {timestamp}",
        "descripcion": "Listado creado mediante script de prueba",
        "categoria": "Vacunación",
        "animales": []  # Sin animales inicialmente
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        listado = response.json()
        listado_id = listado.get("id")
        print(f"{GREEN}Listado creado correctamente con ID: {listado_id}{RESET}")
        print(f"{GREEN}Datos del listado:{RESET}")
        print(json.dumps(listado, indent=2))
    except requests.exceptions.RequestException as e:
        print(f"{RED}Error al crear listado: {str(e)}{RESET}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"{RED}Detalles: {e.response.text}{RESET}")
    
    # Test 2: Obtener todos los listados
    print(f"\n{BLUE}=== Test 2: Obtener todos los listados ==={RESET}")
    url = f"{BASE_URL}/listados"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        listados = response.json()
        print(f"{GREEN}Se obtuvieron {len(listados)} listados{RESET}")
        
        # Mostrar los 3 primeros listados
        for idx, listado in enumerate(listados[:3]):
            print(f"{GREEN}Listado {idx+1}: {listado.get('nombre')} (ID: {listado.get('id')}){RESET}")
    except requests.exceptions.RequestException as e:
        print(f"{RED}Error al obtener listados: {str(e)}{RESET}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"{RED}Detalles: {e.response.text}{RESET}")
    
    # Test 3: Obtener animales para añadir al listado
    print(f"\n{BLUE}=== Test 3: Obtener animales para añadir al listado ==={RESET}")
    
    # Usamos directamente el endpoint de animales - la URL correcta para obtener todos
    url = f"{BASE_URL}/animals?limit=100"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        response_data = response.json()
        
        # Imprimir para depuración
        print(f"{YELLOW}Tipo de datos recibido: {type(response_data)}{RESET}")
        
        # Manejar diferentes posibles formatos de respuesta
        if isinstance(response_data, list):
            animales = response_data
            print(f"{YELLOW}Respuesta recibida como lista directa{RESET}")
        elif isinstance(response_data, dict) and 'results' in response_data:
            animales = response_data.get('results', [])
            print(f"{YELLOW}Respuesta recibida como objeto paginado{RESET}")
        else:
            # Intento adicional: verificar si hay una estructura diferente
            try:
                # Intentar serializar para ver el contenido
                print(f"{YELLOW}Contenido de la respuesta: {json.dumps(response_data)[:100]}...{RESET}")
                animales = list(response_data.values()) if isinstance(response_data, dict) else []
            except:
                animales = []
                print(f"{RED}No se pudo interpretar la respuesta del servidor{RESET}")
        
        print(f"{GREEN}Se obtuvieron {len(animales)} animales{RESET}")
        
        # Si aún no hay animales, realizar otra consulta sin paginación
        if len(animales) < 3:
            print(f"{YELLOW}Realizando consulta adicional sin paginación{RESET}")
            url_alt = f"{BASE_URL}/animals"
            resp_alt = requests.get(url_alt, headers=headers)
            if resp_alt.status_code == 200:
                try:
                    animales_alt = resp_alt.json()
                    if isinstance(animales_alt, list) and len(animales_alt) > 0:
                        animales = animales_alt
                        print(f"{GREEN}Consulta alternativa exitosa: {len(animales)} animales{RESET}")
                except:
                    pass
        
        # Seleccionar hasta 3 animales para añadir al listado
        animal_ids = []
        if len(animales) > 0:
            # Asegúrate de que estamos iterando correctamente
            max_animales = min(3, len(animales))
            for i in range(max_animales):
                animal = animales[i]
                # Verificar si el animal tiene un ID
                if isinstance(animal, dict) and "id" in animal:
                    animal_id = animal.get("id")
                    animal_ids.append(animal_id)
                    print(f"{GREEN}Animal seleccionado: {animal.get('nom', 'Sin nombre')} (ID: {animal_id}){RESET}")
                else:
                    print(f"{YELLOW}Animal sin ID válido: {animal}{RESET}")
        else:
            print(f"{RED}No se obtuvieron animales de la API{RESET}")
            # Como no podemos continuar sin animales, crear IDs ficticios para testing
            animal_ids = [1, 2, 3]
            print(f"{YELLOW}Usando IDs de prueba: {animal_ids}{RESET}")
        
        if not animal_ids:
            print(f"{YELLOW}No hay animales disponibles para añadir al listado{RESET}")
    except requests.exceptions.RequestException as e:
        print(f"{RED}Error al obtener animales: {str(e)}{RESET}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"{RED}Detalles: {e.response.text}{RESET}")
    
    # Test 4: Actualizar listado para añadir animales
    print(f"\n{BLUE}=== Test 4: Actualizar listado para añadir animales ==={RESET}")
    # Saltar esta prueba si no tenemos un ID de listado válido
    if not listado_id:
        print(f"{YELLOW}Omitiendo prueba: No hay ID de listado disponible{RESET}")
    elif not animal_ids:
        print(f"{YELLOW}Omitiendo prueba: No hay animales disponibles{RESET}")
    else:
        url = f"{BASE_URL}/listados/{listado_id}"
        
        data = {
            "animales": animal_ids
        }
        
        try:
            response = requests.put(url, headers=headers, json=data)
            response.raise_for_status()
            listado_actualizado = response.json()
            print(f"{GREEN}Listado actualizado correctamente{RESET}")
            print(f"{GREEN}Animales añadidos: {listado_actualizado.get('animales_count')}{RESET}")
        except requests.exceptions.RequestException as e:
            print(f"{RED}Error al actualizar listado: {str(e)}{RESET}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"{RED}Detalles: {e.response.text}{RESET}")
    
    # Test 5: Obtener detalle del listado con sus animales
    print(f"\n{BLUE}=== Test 5: Obtener detalle del listado con sus animales ==={RESET}")
    # Saltar esta prueba si no tenemos un ID de listado válido
    if not listado_id:
        print(f"{YELLOW}Omitiendo prueba: No hay ID de listado disponible{RESET}")
    else:
        url = f"{BASE_URL}/listados/{listado_id}"
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            listado_detalle = response.json()
            print(f"{GREEN}Detalle del listado obtenido correctamente{RESET}")
            print(f"{GREEN}Nombre: {listado_detalle.get('nombre')}{RESET}")
            print(f"{GREEN}Descripción: {listado_detalle.get('descripcion')}{RESET}")
            print(f"{GREEN}Categoría: {listado_detalle.get('categoria')}{RESET}")
            print(f"{GREEN}Animales ({len(listado_detalle.get('animales', []))}):{RESET}")
            
            for idx, animal in enumerate(listado_detalle.get('animales', [])[:5]):
                print(f"{GREEN} - {animal.get('nom')} (ID: {animal.get('id')}){RESET}")
        except requests.exceptions.RequestException as e:
            print(f"{RED}Error al obtener detalle del listado: {str(e)}{RESET}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"{RED}Detalles: {e.response.text}{RESET}")
    
    # Test 6: Probar endpoint de exportación a PDF
    print(f"\n{BLUE}=== Test 6: Probar endpoint de exportación a PDF ==={RESET}")
    # Saltar esta prueba si no tenemos un ID de listado válido
    if not listado_id:
        print(f"{YELLOW}Omitiendo prueba: No hay ID de listado disponible{RESET}")
    else:
        url = f"{BASE_URL}/listados/{listado_id}/export-pdf?formato=pdf&orientacion=landscape&incluir_observaciones=true"
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            resultado = response.json()
            print(f"{GREEN}Solicitud de exportación procesada correctamente{RESET}")
            print(f"{GREEN}Respuesta:{RESET}")
            print(json.dumps(resultado, indent=2))
        except requests.exceptions.RequestException as e:
            print(f"{RED}Error al exportar a PDF: {str(e)}{RESET}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"{RED}Detalles: {e.response.text}{RESET}")
    
    # Test 7: Eliminar el listado creado
    print(f"\n{BLUE}=== Test 7: Eliminar el listado creado ==={RESET}")
    # Saltar esta prueba si no tenemos un ID de listado válido
    if not listado_id:
        print(f"{YELLOW}Omitiendo prueba: No hay ID de listado disponible{RESET}")
    else:
        url = f"{BASE_URL}/listados/{listado_id}"
        
        try:
            response = requests.delete(url, headers=headers)
            response.raise_for_status()
            resultado = response.json()
            print(f"{GREEN}Listado eliminado correctamente{RESET}")
            print(f"{GREEN}Mensaje: {resultado.get('mensaje')}{RESET}")
        except requests.exceptions.RequestException as e:
            print(f"{RED}Error al eliminar listado: {str(e)}{RESET}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"{RED}Detalles: {e.response.text}{RESET}")

if __name__ == "__main__":
    print(f"{BLUE}=== PRUEBA DE ENDPOINTS DE LISTADOS PERSONALIZADOS ==={RESET}")
    token = obtener_token()
    
    realizar_pruebas(token)
    
    print(f"\n{BLUE}=== PRUEBAS COMPLETADAS ==={RESET}")
    print(f"{GREEN}Todas las pruebas han sido ejecutadas.{RESET}")
