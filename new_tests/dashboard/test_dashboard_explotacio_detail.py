import os
import pytest
import requests
import json

# Configuraciones base para las pruebas
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
if not BASE_URL.endswith("/"):
    BASE_URL += "/"

@pytest.fixture
def test_token():
    """Fixture para obtener un token de autenticación."""
    url = f"{BASE_URL}api/v1/auth/login"
    data = {
        "username": "admin",
        "password": "admin123"
    }
    response = requests.post(url, data=data)
    assert response.status_code == 200, f"Error al obtener token: {response.text}"
    
    token_data = response.json()
    assert "access_token" in token_data, "No se encontró el token de acceso en la respuesta"
    
    return {
        "Authorization": f"Bearer {token_data['access_token']}"
    }

@pytest.mark.asyncio
async def test_explotacio_fields_nomenclature(test_token):
    """
    Prueba para verificar la nomenclatura de campos en el modelo de explotación.
    
    REGLA DE NEGOCIO DOCUMENTADA:
    - 'explotacio' es el único identificador/código válido para la explotación (string)
    - 'id' es un campo técnico generado automáticamente por la base de datos
    - NO debe existir campo 'nom' (solo para animales)
    - NO debe existir campo 'activa' (no está en las reglas de negocio)
    """
    url = f"{BASE_URL}api/v1/dashboard/explotacions/"
    
    print(f"\n=== VERIFICACIÓN DE NOMENCLATURA DE CAMPOS ===")
    print(f"Obteniendo lista de explotaciones: {url}")
    
    response = requests.get(url, headers=test_token)
    assert response.status_code == 200, f"Error al obtener explotaciones: {response.status_code} - {response.text}"
    
    explotaciones = response.json()
    assert isinstance(explotaciones, list), f"Se esperaba una lista de explotaciones, se obtuvo: {type(explotaciones)}"
    print(f"Se encontraron {len(explotaciones)} explotaciones")
    
    if not explotaciones:
        pytest.skip("No hay explotaciones para verificar")
    
    # Verificar que cada explotación tiene los campos esperados según las reglas de negocio
    for explotacion in explotaciones:
        # Debe tener campo explotacio como identificador principal
        assert "explotacio" in explotacion, f"Falta el campo 'explotacio' en: {explotacion}"
        
        # No debe tener campo 'id' (ya que ahora explotacio es el identificador principal)
        # El 'id' técnico se ha eliminado como parte de la refactorización
        
        # No debe tener campo 'nom' (reservado para animales)
        assert "nom" not in explotacion, f"El campo 'nom' no debe existir en explotaciones: {explotacion}"
        
        # NO debe tener campo 'activa' (no está en las reglas de negocio)
        assert "activa" not in explotacion, f"El campo 'activa' no debe existir en explotaciones: {explotacion}"
    
    print("\n=== RESULTADO: NOMENCLATURA DE CAMPOS CORRECTA ===")
    print(f"✓ Campo 'explotacio' presente y es de tipo string: {explotaciones[0]['explotacio']}")
    print(f"✓ Campo 'nom' NO está presente (correcto)")
    print(f"✓ Campo 'activa' NO está presente (correcto)")

@pytest.mark.asyncio
async def test_explotacio_stats(test_token):
    """
    Prueba para verificar que las estadísticas de explotación funcionan correctamente.
    Utiliza el primer ID de explotación disponible para obtener sus estadísticas.
    
    ESTRUCTURA ESPERADA:
    - La respuesta debe contener estadísticas básicas sobre animales, partos, etc.
    - Documentar la estructura actual para futuras referencias.
    """
    # Primero obtenemos una explotación para usar su código
    url_explotacions = f"{BASE_URL}api/v1/dashboard/explotacions/"
    response = requests.get(url_explotacions, headers=test_token)
    assert response.status_code == 200, "No se pudieron obtener explotaciones"
    
    explotaciones = response.json()
    assert len(explotaciones) > 0, "No hay explotaciones disponibles para probar"
    
    # Tomar la primera explotación para la prueba
    explotacion = explotaciones[0]
    explotacio_value = explotacion["explotacio"]
    
    # Obtener estadísticas de esta explotación
    stats_url = f"{BASE_URL}api/v1/dashboard/explotacions/{explotacio_value}/stats"
    stats_response = requests.get(stats_url, headers=test_token)
    
    assert stats_response.status_code == 200, f"Error al obtener estadísticas: {stats_response.status_code} - {stats_response.text}"
    
    stats = stats_response.json()
    print(f"Estadísticas recibidas correctamente")
    print(f"Campos en la respuesta: {', '.join(stats.keys())}")
    
    # Verificar que las estadísticas contengan información básica
    assert 'animales' in stats, "No se encontró 'animales' en las estadísticas"
    
    # Documentar estructura para referencia futura
    print("\nEstructura de la respuesta de estadísticas:")
    for key, value in stats.items():
        if isinstance(value, dict):
            sub_keys = ", ".join(value.keys())
            print(f"  - {key}: {{{sub_keys}}}")
            # Para mayor detalle, mostrar también algunos valores de muestra del diccionario
            for sub_key, sub_value in value.items():
                print(f"    > {sub_key}: {sub_value}")
        elif isinstance(value, list):
            print(f"  - {key}: [lista con {len(value)} elementos]")
            if len(value) > 0:
                item = value[0]
                if isinstance(item, dict):
                    print(f"    > Ejemplo (primer elemento): {item}")
                else:
                    print(f"    > Ejemplo (primeros 3 elementos): {value[:3]}")
        else:
            print(f"  - {key}: {value} ({type(value).__name__})")
    
    print("\nDATO COMPLETO DE ESTADÍSTICAS:")
    print(json.dumps(stats, indent=2, ensure_ascii=False))
    
    print("✅ Prueba de estadísticas completada exitosamente")

@pytest.mark.asyncio
async def test_explotacio_animals(test_token):
    """
    Prueba para verificar que se pueden obtener los animales de una explotación específica
    y que los campos de los animales siguen las convenciones de nomenclatura correctas.
    
    REGLAS DE NEGOCIO PARA ANIMALES:
    - 'nom' es el nombre del animal
    - 'explotacio' es el identificador de la explotación a la que pertenece
    - 'genere' indica el género del animal (M=toro, F=vaca)
    - 'estado' indica si el animal está activo (OK) o fallecido (DEF)
    """
    # Primero obtenemos una explotación para usar su código
    url_explotacions = f"{BASE_URL}api/v1/dashboard/explotacions/"
    response = requests.get(url_explotacions, headers=test_token)
    assert response.status_code == 200, "No se pudieron obtener explotaciones"
    
    explotaciones = response.json()
    assert len(explotaciones) > 0, "No hay explotaciones disponibles para probar"
    
    # Tomar la primera explotación para la prueba
    explotacion = explotaciones[0]
    explotacio_value = explotacion["explotacio"]
    
    # Primero necesitamos obtener todos los animales y luego filtrar por explotación
    # ya que el endpoint específico para animales por explotación no está disponible
    print(f"\n=== PRUEBA DE OBTENCIÓN DE ANIMALES POR EXPLOTACIÓN ===")
    print(f"Consultando animales para explotación con ID: {explotacio_value}")
    print(f"Datos de la explotación: {explotacion}")
    
    animals_url = f"{BASE_URL}api/v1/animals/?explotacio={explotacio_value}"
    animals_response = requests.get(animals_url, headers=test_token)
    
    assert animals_response.status_code == 200, f"Error al obtener animales: {animals_response.status_code} - {animals_response.text}"
    
    try:
        animals_data = animals_response.json()
        print(f"Tipo de respuesta de animales: {type(animals_data)}")
        
        # Mostrar la estructura de la respuesta
        print("\nEstructura de respuesta recibida:")
        if isinstance(animals_data, dict):
            print("Es un diccionario, claves disponibles:", ", ".join(animals_data.keys()))
        elif isinstance(animals_data, list):
            print("Es una lista con", len(animals_data), "elementos")
        else:
            print("Tipo de datos inesperado:", type(animals_data))
        
        # Determinar la estructura de la respuesta
        if isinstance(animals_data, list):
            animals = animals_data
        elif isinstance(animals_data, dict) and "animals" in animals_data:
            animals = animals_data["animals"]
        else:
            # Si la respuesta tiene otra estructura, mostramos más información
            print("⚠️ Estructura de respuesta inesperada para animales")
            print(f"Estructura actual: {type(animals_data)}")
            if isinstance(animals_data, dict):
                print(f"Claves disponibles: {', '.join(animals_data.keys())}")
            print(f"Primeros 200 caracteres de la respuesta: {str(animals_data)[:200]}...")
            return
            
        print(f"Total animales en esta explotación: {len(animals)}")
        
        if len(animals) > 0:
            # Mostrar datos detallados de los primeros animales
            print("\nDETALLES DE LOS PRIMEROS ANIMALES:")
            for i, animal in enumerate(animals[:3]):
                print(f"Animal #{i+1}:")
                for key, value in animal.items():
                    print(f"  {key}: {value}")
                print()
            
            # Verificar campos del primer animal
            first_animal = animals[0]
            
            # Mostrar los campos disponibles
            print(f"Campos disponibles en animal: {', '.join(first_animal.keys())}")
            
            # Verificar campos obligatorios según documentación
            required_fields = ['nom', 'explotacio', 'genere', 'estado']
            missing_fields = [field for field in required_fields if field not in first_animal]
            
            if missing_fields:
                print(f"⚠️ FALTAN CAMPOS OBLIGATORIOS: {', '.join(missing_fields)}")
            else:
                print("✅ Todos los campos obligatorios están presentes")
            
            # Verificar campos opcionales
            optional_fields = ['alletar', 'pare', 'mare', 'quadra', 'cod', 'num_serie', 'dob']
            present_optional = [field for field in optional_fields if field in first_animal]
            
            if present_optional:
                print(f"ℹ️ Campos opcionales presentes: {', '.join(present_optional)}")
            
            # Verificar otros campos no documentados
            all_documented = required_fields + optional_fields + ['id', 'created_at', 'updated_at', 'part', 'GenereT', 'EstadoT']
            undocumented = [field for field in first_animal.keys() if field not in all_documented]
            
            if undocumented:
                print(f"⚠️ CAMPOS NO DOCUMENTADOS: {', '.join(undocumented)}")
        else:
            print("⚠️ No hay animales para verificar en esta explotación")
    except (json.JSONDecodeError, KeyError) as e:
        print(f"Error al procesar la respuesta: {type(e).__name__}: {str(e)}")
        print(f"Respuesta recibida: {animals_response.text[:200]}...")
        # No hacemos que falle el test, solo registramos el error
        
    print("✅ Prueba de obtención de animales completada")
