from typing import Dict, List
from datetime import date
from tortoise.transactions import in_transaction
from app.models.animal import Animal, Part  # Importamos Part desde animal.py
from app.models.explotacio import Explotacio  # Importamos el modelo Explotacio
from fastapi import HTTPException
import asyncio
from tortoise import Tortoise
from app.core.config import get_settings
from app.core.date_utils import DateConverter  # Importamos DateConverter para manejar fechas

# Función para asegurar que hay una conexión a la base de datos
async def ensure_connection():
    if not Tortoise._inited:
        # Si no hay conexión, reconectar usando host.docker.internal
        settings = get_settings()
        db_url = settings.database_url.replace("localhost", "host.docker.internal").replace("postgresql://", "postgres://")
        await Tortoise.init(
            db_url=db_url,
            modules={"models": ["app.models.animal", "app.models.user", "app.models.explotacio", "aerich.models"]}
        )

async def import_animal_with_partos(data: dict) -> Animal:
    """
    Importa un animal y sus partos desde el CSV.
    Args:
        data (dict): Datos del animal y posible parto
    Returns:
        Animal: Instancia del animal creado/actualizado
    Raises:
        HTTPException: Si hay errores de validación
    """
    try:
        # Asegurar que hay conexión a la base de datos
        await ensure_connection()
        
        # Usar transacción para asegurar consistencia
        async with in_transaction():
            # Normalizar las claves del diccionario para hacerlas case-insensitive
            normalized_data = {}
            for key, value in data.items():
                normalized_data[key.lower()] = value
            
            # Validar género (solo si es macho y tiene parto/alletar)
            genere_value = normalized_data.get('genere', '').upper()
            if genere_value in ['M', 'MASCLE', 'MACHO', 'MALE'] and (normalized_data.get('part') or normalized_data.get('alletar')):
                raise HTTPException(
                    status_code=400,
                    detail="Los machos no pueden tener partos ni amamantar"
                )

            # Procesamos la explotación: simplemente obtenemos el nombre
            explotacio_nom = None
            explotacio_keys = ['explotacio', 'explotación', 'explotacion']
            
            for key in explotacio_keys:
                if key in data:
                    explotacio_nom = data.pop(key)
                    break
                if key.lower() in normalized_data:
                    explotacio_nom = normalized_data.get(key.lower())
                    # Eliminar la clave original del diccionario data
                    for original_key in list(data.keys()):  # Usar list() para evitar errores de modificación durante iteración
                        if original_key.lower() == key.lower():
                            data.pop(original_key)
                            break
                    break
            
            if not explotacio_nom:
                explotacio_nom = "Explotación por defecto"  # Valor por defecto si no se especifica
            
            # Ya no necesitamos buscar o crear el objeto Explotacio
            # Solo usamos el nombre como un string

            # Preparar datos del animal (excluir campos de parto)
            # Lista de posibles claves para los campos de parto
            parto_keys = ['part', 'parto', 'fecha de parto']
            genere_keys = ['genere_t', 'generet', 'genere_fill', 'generefill', 'generet', 'generef', 'genere_cria', 'generecria']
            estado_keys = ['estado_t', 'estadot', 'estat_t', 'estatt', 'estat_fill', 'estatfill', 'estado_cria', 'estadocria', 'estado_fill', 'estadofill']
            
            # Crear una lista de todas las posibles claves a excluir
            exclude_keys = []
            exclude_keys.extend(parto_keys)
            exclude_keys.extend(genere_keys)
            exclude_keys.extend(estado_keys)
            
            # Añadir versiones en mayúsculas y minúsculas
            all_exclude_keys = []
            for key in exclude_keys:
                all_exclude_keys.append(key)
                all_exclude_keys.append(key.lower())
                all_exclude_keys.append(key.upper())
                all_exclude_keys.append(key.capitalize())
            
            # Crear un nuevo diccionario con los campos normalizados para el animal
            animal_data = {}
            
            # Mapear campos del CSV a campos del modelo
            field_mappings = {
                'nom': ['nom', 'nombre', 'name'],
                'num_serie': ['num serie', 'numserie', 'num_serie', 'numero serie', 'numero_serie'],
                'dob': ['dob', 'fecha nacimiento', 'fecha_nacimiento', 'nacimiento', 'birth'],
                'genere': ['genere', 'genero', 'sexo', 'gender'],
                'estado': ['estado', 'estat', 'status', 'state'],
                'alletar': ['alletar', 'amamantar', 'lactancia'],
                'mare': ['mare', 'madre', 'mother'],
                'pare': ['pare', 'padre', 'father'],
                'quadra': ['quadra', 'cuadra', 'stable'],
                'cod': ['cod', 'codigo', 'code']
            }
            
            # Procesar cada campo según el mapeo
            for model_field, possible_keys in field_mappings.items():
                for key in possible_keys:
                    # Buscar en el diccionario normalizado
                    if key in normalized_data:
                        animal_data[model_field] = normalized_data[key]
                        break
                    # También buscar en el diccionario original para claves no normalizadas
                    for original_key in data:
                        if original_key.lower() == key:
                            animal_data[model_field] = data[original_key]
                            break
            
            # Buscar o crear animal
            animal = await get_or_create_animal(animal_data, explotacio_nom)

            # Procesar parto si existe
            has_parto = False
            parto_date = None
            
            # Buscar fecha de parto en cualquiera de las claves posibles
            for key in parto_keys:
                if key in data and data[key]:
                    has_parto = True
                    parto_date = data[key]
                    break
                if key.lower() in normalized_data and normalized_data[key.lower()]:
                    has_parto = True
                    parto_date = normalized_data[key.lower()]
                    break
            
            if has_parto and parto_date:
                # Validar que existan los datos necesarios para el parto
                genere_cria = None
                estado_cria = 'OK'  # Valor por defecto
                
                # Buscar género de la cría en cualquiera de las claves posibles
                for key in genere_keys:
                    if key in data and data[key]:
                        genere_cria = data[key]
                        break
                    if key.lower() in normalized_data and normalized_data[key.lower()]:
                        genere_cria = normalized_data[key.lower()]
                        break
                
                # Buscar estado de la cría en cualquiera de las claves posibles
                for key in estado_keys:
                    if key in data and data[key]:
                        estado_cria = data[key]
                        break
                    if key.lower() in normalized_data and normalized_data[key.lower()]:
                        estado_cria = normalized_data[key.lower()]
                        break
                
                # Si no se especifica el género de la cría, usar un valor por defecto
                if not genere_cria:
                    genere_cria = 'F'  # Valor por defecto (Femenino)
                
                # Normalizar el género de la cría
                if isinstance(genere_cria, str):
                    genere_cria_upper = genere_cria.upper()
                    if genere_cria_upper in ['M', 'MASCLE', 'MACHO', 'MALE']:
                        genere_cria = 'M'
                    else:
                        genere_cria = 'F'
                
                # Normalizar el estado de la cría
                if isinstance(estado_cria, str):
                    estado_cria_upper = estado_cria.upper()
                    if estado_cria_upper in ['DEF', 'DEFUNCION', 'MUERTO', 'DEAD']:
                        estado_cria = 'DEF'
                    else:
                        estado_cria = 'OK'
                
                await add_parto(animal, {
                    'fecha': parto_date,
                    'genere_cria': genere_cria,
                    'estado_cria': estado_cria
                })

            return animal

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error importando animal: {str(e)}"
        )

async def get_or_create_animal(data: Dict, explotacio: str = None) -> Animal:
    """
    Busca o crea un animal por num_serie o nom
    
    Args:
        data: Datos del animal
        explotacio: Nombre de la explotación a la que pertenece el animal
    
    Returns:
        Animal: Instancia del animal creado o actualizado
    """
    existing_animal = None
    
    # Crear una copia de los datos para no modificar el original
    clean_data = {}
    
    # Limpiar y normalizar los datos
    for key, value in data.items():
        # Convertir valores vacíos a None
        if isinstance(value, str) and value.strip() == '':
            clean_data[key] = None
        else:
            clean_data[key] = value
    
    # Procesar campos de fecha (dob)
    if 'dob' in clean_data and clean_data['dob']:
        try:
            # Intentar convertir la fecha usando DateConverter
            clean_data['dob'] = DateConverter.parse_date(clean_data['dob'])
        except ValueError:
            # Si hay un error, establecer como None
            clean_data['dob'] = None
    
    # Buscar por num_serie si está disponible
    if clean_data.get('num_serie'):
        existing_animal = await Animal.filter(num_serie=clean_data['num_serie']).first()
    
    # Si no se encuentra por num_serie, buscar por nom
    if not existing_animal and clean_data.get('nom'):
        existing_animal = await Animal.filter(nom=clean_data['nom']).first()
    
    if existing_animal:
        # Actualizar datos si es necesario
        for key, value in clean_data.items():
            if hasattr(existing_animal, key):
                setattr(existing_animal, key, value)
        
        # Actualizar la explotación si se proporciona una nueva
        if explotacio:
            existing_animal.explotacio = explotacio
        
        await existing_animal.save()
        
        return existing_animal
    
    # Establecer valores por defecto para campos requeridos que faltan
    if 'nom' not in clean_data or clean_data['nom'] is None:
        # Si no hay nombre, usar un valor por defecto basado en otros campos
        if clean_data.get('cod'):
            clean_data['nom'] = f"Animal-{clean_data['cod']}"
        elif clean_data.get('num_serie'):
            clean_data['nom'] = f"Animal-{clean_data['num_serie']}"
        else:
            # Generar un nombre aleatorio si no hay otros identificadores
            import uuid
            clean_data['nom'] = f"Animal-{str(uuid.uuid4())[:8]}"
    
    # Establecer valores por defecto para otros campos requeridos
    if 'genere' not in clean_data or clean_data['genere'] is None:
        clean_data['genere'] = 'F'  # Valor por defecto
    
    if 'estado' not in clean_data or clean_data['estado'] is None:
        clean_data['estado'] = 'OK'  # Valor por defecto
    
    # Manejar el campo alletar de forma más robusta
    # Si el campo existe, intentar convertirlo a uno de los tres estados posibles
    if 'alletar' in clean_data:
        # Añadir registro de depuración para ver el valor original
        print(f"DEBUG - Valor original de alletar: '{clean_data['alletar']}', tipo: {type(clean_data['alletar'])}")
        
        # Si es None o cadena vacía, establecer a NO_ALLETAR por defecto
        if clean_data['alletar'] is None or (isinstance(clean_data['alletar'], str) and clean_data['alletar'].strip() == ''):
            clean_data['alletar'] = "NO"
        else:
            # Convertir a string y normalizar
            alletar_value = str(clean_data['alletar']).upper().strip()
            
            # Mapear valores a los tres estados posibles
            if alletar_value in ['NO', 'FALSE', '0', 'N', 'NONE']:
                clean_data['alletar'] = "NO"
            elif alletar_value in ['1', 'ONE', 'UNO', 'UN', 'YES', 'TRUE', 'Y', 'SI', 'SÍ']:
                clean_data['alletar'] = "1"
            elif alletar_value in ['2', 'TWO', 'DOS']:
                clean_data['alletar'] = "2"
            else:
                # Si no se reconoce el valor, establecer a NO_ALLETAR por defecto
                clean_data['alletar'] = "NO"
    
    # Normalizar enumeraciones
    if 'genere' in clean_data and clean_data['genere']:
        genere_value = str(clean_data['genere']).upper()
        if genere_value in ['M', 'MASCLE', 'MACHO', 'MALE']:
            clean_data['genere'] = 'M'
        else:
            clean_data['genere'] = 'F'  # Por defecto femenino
    
    if 'estado' in clean_data and clean_data['estado']:
        estado_value = str(clean_data['estado']).upper()
        if estado_value in ['DEF', 'DEFUNCION', 'MUERTO', 'DEAD']:
            clean_data['estado'] = 'DEF'
        else:
            clean_data['estado'] = 'OK'
    
    try:
        # Eliminar campos que podrían no existir en la base de datos
        # para evitar errores de "columna no existe"
        safe_data = {k: v for k, v in clean_data.items() if k not in ['genere_t', 'estado_t']}
        
        # Crear el animal con la explotación proporcionada
        if explotacio:
            # Asignar la explotación directamente como string
            safe_data['explotacio'] = explotacio
            animal_obj = await Animal.create(**safe_data)
            return animal_obj
        else:
            # Si no se proporciona explotación, usar un valor por defecto
            safe_data['explotacio'] = "Explotación por defecto"
            animal_obj = await Animal.create(**safe_data)
            return animal_obj
    except Exception as e:
        # Si hay un error al crear el animal, proporcionar más detalles
        error_msg = str(e)
        if "nom" in error_msg and "None" in error_msg:
            raise ValueError("El campo 'nom' es obligatorio y no puede ser nulo")
        elif "genere" in error_msg:
            raise ValueError("El campo 'genere' debe ser 'M' o 'F'")
        elif "estado" in error_msg:
            raise ValueError("El campo 'estado' debe ser 'OK' o 'DEF'")
        elif "alletar" in error_msg:
            raise ValueError("El campo 'alletar' debe ser uno de los tres estados posibles")
        else:
            raise ValueError(f"Error al crear el animal: {error_msg}")

async def add_parto(animal: Animal, parto_data: Dict) -> Part:
    """
    Registra un parto para el animal.
    """
    try:
        # Calcular número de parto usando el modelo Part:
        num_partos = await Part.filter(animal=animal).count()

        # Procesar la fecha del parto usando DateConverter
        fecha_parto = None
        if 'fecha' in parto_data and parto_data['fecha']:
            try:
                fecha_parto = DateConverter.parse_date(parto_data['fecha'])
            except ValueError:
                # Si hay un error, usar la fecha actual
                from datetime import datetime
                fecha_parto = datetime.now().date()
        else:
            # Si no hay fecha, usar la fecha actual
            from datetime import datetime
            fecha_parto = datetime.now().date()

        # Crear el parto usando los datos proporcionados.
        # Asegurarse que el campo usado para la FK es 'animal'
        parto_instance = await Part.create(
            animal=animal,
            numero_part=num_partos + 1,  # Incrementar el número de parto
            data=fecha_parto,
            genere_fill=parto_data['genere_cria'],
            estat_fill=parto_data.get('estado_cria', 'OK')
        )
        
        return parto_instance
    except Exception as e:
        # Capturar el error específico de columna no existente
        error_msg = str(e)
        if "no existe la columna" in error_msg and ("estat_fill" in error_msg or "genere_fill" in error_msg):
            # Intentar con el nombre de columna alternativo
            try:
                parto_instance = await Part.create(
                    animal=animal,
                    numero_part=num_partos + 1,
                    data=parto_data['fecha'],
                    genere_fill=parto_data['genere_cria'],
                    estat_fill=parto_data.get('estado_cria', 'OK')
                )
                return parto_instance
            except Exception as inner_e:
                raise ValueError(f"Error al crear parto (segundo intento): {str(inner_e)}")
        else:
            raise ValueError(f"Error al crear parto: {error_msg}")