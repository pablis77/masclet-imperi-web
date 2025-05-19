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

async def import_animal_with_partos(data: Dict) -> Animal:
    """
    Importa un animal con sus partos asociados desde una fila de CSV.
    
    Args:
        data: Diccionario con los datos del animal y potencialmente de sus partos.
        
    Returns:
        Animal: El animal creado o actualizado.
    """
    
    try:
        # Normalizar los nombres de los campos (sin espacios, minúsculas)
        normalized_data = {}
        for key, value in data.items():
            if key:  # Solo procesar claves no vacías
                normalized_key = key.strip().lower()
                # Normalizar valor
                normalized_value = value.strip() if isinstance(value, str) else value
                normalized_data[normalized_key] = normalized_value
        
        # Preparar datos para crear el animal
        animal_data = {}
        parto_data = {}
        has_parto_data = False
        
        # Campos básicos del animal que son obligatorios
        required_fields = ['nom', 'genere', 'estado']
        for field in required_fields:
            if field in normalized_data and normalized_data[field]:
                animal_data[field] = normalized_data[field]
        
        # Verificar si todos los campos obligatorios están presentes
        for field in required_fields:
            if field not in animal_data or not animal_data[field]:
                raise ValueError(f"Campo obligatorio '{field}' no encontrado o vacío")
        
        # Normalizar el género del animal
        if 'genere' in animal_data:
            genere_value = animal_data['genere'].upper() if isinstance(animal_data['genere'], str) else animal_data['genere']
            if genere_value in ['M', 'MASCLE', 'MACHO', 'MALE']:
                animal_data['genere'] = 'M'
            elif genere_value in ['F', 'FEMELLA', 'HEMBRA', 'FEMALE']:
                animal_data['genere'] = 'F'
            else:
                raise ValueError(f"Valor de género no válido: {animal_data['genere']}")
        
        # Normalizar el estado
        if 'estado' in animal_data:
            estado_value = animal_data['estado'].upper() if isinstance(animal_data['estado'], str) else animal_data['estado']
            if estado_value in ['OK', 'VIVO', 'ALIVE']:
                animal_data['estado'] = 'OK'
            elif estado_value in ['DEF', 'MUERTO', 'DEFUNCION', 'DEAD']:
                animal_data['estado'] = 'DEF'
            else:
                animal_data['estado'] = 'OK'  # Valor por defecto
        
        # Campos opcionales del animal
        optional_fields = ['pare', 'mare', 'quadra', 'cod', 'num_serie', 'causa_baixa', 'data_baixa', 'explotacio']
        for field in optional_fields:
            if field in normalized_data and normalized_data[field]:
                animal_data[field] = normalized_data[field]
                
        # Proceso especial para la fecha de nacimiento (dob)
        if 'dob' in normalized_data and normalized_data['dob']:
            try:
                # Intentar el parser normal primero
                fecha_nacimiento = DateConverter.parse_date(normalized_data['dob'])
                animal_data['dob'] = fecha_nacimiento
                print(f"DEBUG - Fecha de nacimiento parseada: {fecha_nacimiento} de original: {normalized_data['dob']}")
            except Exception as date_error:
                print(f"ADVERTENCIA - Primer intento de parsear fecha de nacimiento falló: {str(date_error)}")
                # Si falla, intentar un enfoque específico para formato DD/MM/YYYY
                try:
                    fecha_str = normalized_data['dob'].strip()
                    # Asumir formato DD/MM/YYYY con cualquier separador
                    separadores = ['/', '-', '.']
                    sep = None
                    for s in separadores:
                        if s in fecha_str:
                            sep = s
                            break
                            
                    if sep:
                        partes = fecha_str.split(sep)
                        if len(partes) == 3:
                            # Asumir DD/MM/YYYY
                            dia = int(partes[0])
                            mes = int(partes[1])
                            anio = int(partes[2])
                            
                            from datetime import date
                            fecha_nacimiento = date(anio, mes, dia)
                            animal_data['dob'] = fecha_nacimiento
                            print(f"DEBUG - Fecha de nacimiento parseada manualmente: {fecha_nacimiento} de original: {normalized_data['dob']}")
                        else:
                            print(f"ERROR - Formato de fecha de nacimiento incorrecto (no tiene 3 partes): {fecha_str}")
                            # No incluir la fecha en los datos del animal
                            if 'dob' in animal_data:
                                del animal_data['dob']
                    else:
                        print(f"ERROR - No se identificó separador en la fecha de nacimiento: {fecha_str}")
                        # No incluir la fecha en los datos del animal
                        if 'dob' in animal_data:
                            del animal_data['dob']
                except Exception as manual_error:
                    print(f"ERROR en import_animal_with_partos: {str(manual_error)}")
                    # No incluir la fecha en los datos del animal
                    if 'dob' in animal_data:
                        del animal_data['dob']
        
        # Obtener explotación si está presente
        explotacio_nom = None
        if 'explotacio' in normalized_data and normalized_data['explotacio']:
            explotacio_nom = normalized_data['explotacio']
            
        # --- REGLA DE NEGOCIO PARA ALLETAR ---
        # REGLA: Los machos SIEMPRE tienen alletar="0", sin excepciones
        if animal_data['genere'] == 'M':
            animal_data['alletar'] = '0'
            print(f"DEBUG_ALLETAR - Es MACHO: {animal_data.get('nom')}, forzando alletar=0")
        else:
            # Para hembras, usar el valor del CSV si es válido
            alletar_value = None
            
            # Buscar valor en diferentes posibles claves (considerando mayúsculas/minúsculas)
            for key in ['alletar', 'Alletar', 'ALLETAR']:
                if key in normalized_data and normalized_data[key]:
                    alletar_value = normalized_data[key]
                    print(f"DEBUG_ALLETAR - Encontrado valor en normalized_data[{key}]: {alletar_value}")
                    break
                elif key in data and data[key]:
                    alletar_value = data[key]
                    print(f"DEBUG_ALLETAR - Encontrado valor en data[{key}]: {alletar_value}")
                    break
            
            # Normalizar valor de alletar para hembras (permitiendo 0, 1, 2)
            if alletar_value is not None:
                alletar_str = str(alletar_value).strip()
                print(f"DEBUG_ALLETAR - Normalizando alletar para hembra: {animal_data.get('nom')}, valor: {alletar_str}")
                if alletar_str in ['0', '1', '2']:
                    animal_data['alletar'] = alletar_str
                    print(f"DEBUG_ALLETAR - Valor válido para hembra: {alletar_str}")
                else:
                    # Si no es un valor válido, usar 0 por defecto
                    animal_data['alletar'] = '0'
                    print(f"DEBUG_ALLETAR - Valor no válido para hembra: {alletar_str}, usando 0")
            else:
                # Si no se proporciona, valor por defecto
                animal_data['alletar'] = '0'
                print(f"DEBUG_ALLETAR - No se encontró valor de alletar para hembra: {animal_data.get('nom')}, usando 0")
        
        # Marcar que ya procesamos alletar 
        animal_data['_alletar_processed'] = True
        
        # --- RESOLUCIÓN DEFINITIVA PARA PARTOS ---
        # Detectar y procesar datos de parto
        parto_keys = ['part', 'fecha_parto', 'fecha_part', 'date_part']
        genere_keys = ['generet', 'genere_t', 'genere_ternero', 'GenereT']
        estado_keys = ['estadot', 'estado_t', 'estado_ternero', 'EstadoT']
        
        print(f"DEBUG_PARTO - Buscando datos de parto para animal: {animal_data.get('nom')}")
        
        # Primero buscar la fecha de parto
        for key in parto_keys:
            if key in normalized_data and normalized_data[key]:
                has_parto_data = True
                parto_data['part'] = normalized_data[key]
                print(f"DEBUG_PARTO - Encontrada fecha de parto en clave '{key}': {normalized_data[key]}")
                break
        
        # Si hay fecha de parto, buscar también el género y estado de la cría
        if has_parto_data:
            print(f"DEBUG_PARTO - Datos de parto encontrados, buscando género y estado de la cría")
            # Buscar género de la cría
            genere_found = False
            for key in genere_keys:
                if key in normalized_data and normalized_data[key]:
                    parto_data['GenereT'] = normalized_data[key]
                    print(f"DEBUG_PARTO - Encontrado género de cría en clave '{key}': {normalized_data[key]}")
                    genere_found = True
                    break
            
            if not genere_found:
                # Usar valor por defecto
                parto_data['GenereT'] = 'F'
                print(f"DEBUG_PARTO - No se encontró género de cría, usando valor por defecto: F")
            
            # Buscar estado de la cría
            estado_found = False
            for key in estado_keys:
                if key in normalized_data and normalized_data[key]:
                    parto_data['EstadoT'] = normalized_data[key]
                    print(f"DEBUG_PARTO - Encontrado estado de cría en clave '{key}': {normalized_data[key]}")
                    estado_found = True
                    break
            
            if not estado_found:
                # Usar valor por defecto
                parto_data['EstadoT'] = 'OK'
                print(f"DEBUG_PARTO - No se encontró estado de cría, usando valor por defecto: OK")
        
        # Normalizar formato de parto si existe
        if has_parto_data:
            # Valores por defecto para campos obligatorios del parto
            if 'GenereT' not in parto_data or not parto_data['GenereT']:
                parto_data['GenereT'] = 'F'  # Valor por defecto
            
            if 'EstadoT' not in parto_data or not parto_data['EstadoT']:
                parto_data['EstadoT'] = 'OK'  # Valor por defecto
            
            # Normalizar género de la cría
            if 'GenereT' in parto_data:
                genere_value = parto_data['GenereT'].upper() if isinstance(parto_data['GenereT'], str) else parto_data['GenereT']
                if genere_value in ['M', 'MASCLE', 'MACHO', 'MALE']:
                    parto_data['GenereT'] = 'M'
                elif genere_value in ['F', 'FEMELLA', 'HEMBRA', 'FEMALE', 'ESFORRADA', 'ESFORRADO']:
                    # Tratamos 'esforrada' como 'F' siguiendo la nueva especificación
                    parto_data['GenereT'] = 'F'
                else:
                    parto_data['GenereT'] = 'F'  # Valor por defecto
            
            # Normalizar estado de la cría
            if 'EstadoT' in parto_data:
                estado_value = parto_data['EstadoT'].upper() if isinstance(parto_data['EstadoT'], str) else parto_data['EstadoT']
                if estado_value in ['DEF', 'MUERTO', 'DEFUNCION', 'DEAD']:
                    parto_data['EstadoT'] = 'DEF'
                else:
                    parto_data['EstadoT'] = 'OK'
                
        # Usar transacción para asegurar consistencia
        async with in_transaction():
            # Buscar o crear animal
            animal = await get_or_create_animal(
                animal_data, 
                explotacio_nom, 
                normalized_data
            )
            
            # Si es una hembra y hay datos de parto, registrarlo
            if animal.genere == 'F' and has_parto_data and 'part' in parto_data and parto_data['part']:
                try:
                    # Verificar que el animal sea hembra
                    if animal.genere != 'F':
                        print(f"ERROR - No se puede crear parto para un macho: {animal.nom}")
                        return animal
                    
                    # Recordar que parto_data ya fue construido anteriormente con todos los datos
                    print(f"DEBUG_PARTO - Creando parto para hembra: {animal.nom} con datos: {parto_data}")
                    
                    # Procesar la fecha del parto - Versión robusta para CSV
                    fecha_parto = None
                    
                    if parto_data.get('part'):
                        try:
                            # Intentar el parser normal primero
                            fecha_parto = DateConverter.parse_date(parto_data['part'])
                            print(f"DEBUG_PARTO - Fecha de parto parseada: {fecha_parto} de original: {parto_data['part']}")
                        except Exception as date_error:
                            print(f"ADVERTENCIA - Primer intento de parsear fecha de parto falló: {str(date_error)}")
                            # Si falla, intentar un enfoque específico para formato DD/MM/YYYY
                            try:
                                fecha_str = parto_data['part'].strip()
                                # Asumir formato DD/MM/YYYY con cualquier separador
                                separadores = ['/', '-', '.']
                                sep = None
                                for s in separadores:
                                    if s in fecha_str:
                                        sep = s
                                        break
                                        
                                if sep:
                                    partes = fecha_str.split(sep)
                                    if len(partes) == 3:
                                        # Asumir DD/MM/YYYY
                                        dia = int(partes[0])
                                        mes = int(partes[1])
                                        anio = int(partes[2])
                                        
                                        from datetime import date
                                        fecha_parto = date(anio, mes, dia)
                                        print(f"DEBUG_PARTO - Fecha de parto parseada manualmente: {fecha_parto} de original: {parto_data['part']}")
                                    else:
                                        print(f"ERROR - Formato de fecha incorrecto (no tiene 3 partes): {fecha_str}")
                                        return animal
                                else:
                                    print(f"ERROR - No se identificó separador en la fecha: {fecha_str}")
                                    return animal
                            except Exception as manual_error:
                                print(f"ERROR - Error al parsear fecha de parto manualmente: {str(manual_error)}")
                                return animal
                    else:
                        print("ERROR - No hay fecha de parto válida")
                        return animal
            
                        # Crear el parto directamente en la base de datos
                    # Calcular número de parto
                    try:
                        num_partos = await Part.filter(animal_id=animal.id).count()
                    except Exception as filter_error:
                        print(f"ERROR - No se pudo obtener número de partos: {str(filter_error)}")
                        num_partos = 0
                    
                    # Comprobar si ya existe un parto con la misma fecha
                    existing_parto = None
                    try:
                        existing_parto = await Part.filter(animal_id=animal.id, part=fecha_parto).first()
                    except Exception as filter_error:
                        print(f"ERROR - No se pudo verificar parto existente: {str(filter_error)}")
                    
                    if existing_parto:
                        print(f"DEBUG_PARTO - Actualizando parto existente para {animal.nom} con fecha {fecha_parto}")
                        existing_parto.GenereT = parto_data.get('GenereT', 'F')
                        existing_parto.EstadoT = parto_data.get('EstadoT', 'OK')
                        await existing_parto.save()
                    else:
                        print(f"DEBUG_PARTO - Creando nuevo parto para {animal.nom} con fecha {fecha_parto}")
                        # Crear parto nuevo directamente con animal_id
                        try:
                            parto = await Part.create(
                                animal_id=animal.id,  # Usar ID directo en lugar de relación
                                part=fecha_parto,
                                GenereT=parto_data.get('GenereT', 'F'),
                                EstadoT=parto_data.get('EstadoT', 'OK'),
                                numero_part=num_partos + 1
                            )
                            print(f"DEBUG_PARTO - Parto creado con éxito con ID: {parto.id}")
                            
                            # IMPORTANTE: Respetamos el valor de alletar que viene en el CSV
                            # y no lo modificamos automáticamente al crear un parto
                            print(f"DEBUG_ALLETAR - Creando parto para {animal.nom}. Manteniendo alletar={animal.alletar} según CSV")
                            
                            # Verificación adicional para confirmar que se respeta el valor
                            animal_after_update = await Animal.get(id=animal.id)
                            print(f"DEBUG_ALLETAR - Valor de alletar después de crear parto: {animal_after_update.alletar}")
                        except Exception as create_error:
                            print(f"ERROR - Error al crear el parto: {str(create_error)}")
                
                except Exception as parto_error:
                    print(f"ERROR - Excepción al crear parto: {str(parto_error)}")
                    # Continuar con el proceso aunque falle el parto
        
        return animal
            
    except Exception as e:
        print(f"ERROR en import_animal_with_partos: {str(e)}")
        raise ValueError(f"Error al importar animal: {str(e)}")

async def get_or_create_animal(data: Dict, explotacio: str = None, original_data: Dict = None) -> Animal:
    """
    Busca un animal por su identficador único o lo crea si no existe.
    Se intenta buscar primero por num_serie, luego por cod, y finalmente por nom+explotacio.
    Args:
        data (Dict): Datos del animal
        explotacio (str, optional): Nombre de la explotación. Por defecto None.
        original_data (Dict, optional): Datos originales sin procesar. Por defecto None.
    Returns:
        Animal: Instancia del animal encontrado o creado
    """
    # DEPURACIÓN: Mostrar datos de entrada completos
    print(f"DEBUG_ALLETAR - Datos de entrada en get_or_create_animal: {data}")
    if 'alletar' in data:
        print(f"DEBUG_ALLETAR - Valor de alletar en los datos de entrada: {data['alletar']}")
    if 'nom' in data:
        print(f"DEBUG_ALLETAR - Procesando animal con nombre: {data['nom']}")
    if 'genere' in data:
        print(f"DEBUG_ALLETAR - Género del animal en datos de entrada: {data['genere']}")
    # Datos limpios para crear/actualizar animal
    clean_data = {}
    
    # Copiar solo campos válidos del modelo Animal
    valid_fields = [
        'nom', 'genere', 'estado', 'alletar', 'pare', 'mare', 'quadra', 
        'cod', 'num_serie', 'dob', 'observacions', 'causa_baixa', 'data_baixa'
    ]
    
    for field in valid_fields:
        if field in data and data[field] is not None:
            clean_data[field] = data[field]
            if field == 'alletar':
                print(f"DEBUG_ALLETAR - Copiando campo alletar con valor: {data[field]} a clean_data")
    
    # IMPORTANTE: Asegurar que los machos siempre tienen alletar="0"
    if 'genere' in clean_data and clean_data['genere'].upper() == 'M':
        print(f"DEBUG_ALLETAR - Animal {clean_data.get('nom', 'desconocido')} es MACHO, valor alletar antes: {clean_data.get('alletar', 'no definido')}")
        clean_data['alletar'] = '0'
        print(f"DEBUG_ALLETAR - Forzando alletar=0 para macho: {clean_data.get('nom', 'desconocido')}")
    
    # IMPORTANTE: No usar la tabla Explotacio ya que no existe en la BD
    # En lugar de eso, guardar directamente el valor en el campo explotacio del animal
    if explotacio:
        # Añadir el valor de explotacio directamente en los datos del animal
        clean_data['explotacio'] = explotacio
        print(f"DEBUG - Guardando explotacio directamente en el animal: {explotacio}")
    
    # Buscar animal existente por diferentes criterios únicos
    existing_animal = None
    
    # 1. Buscar por número de serie (si está presente)
    if 'num_serie' in clean_data and clean_data['num_serie']:
        existing_animal = await Animal.get_or_none(num_serie=clean_data['num_serie'])
        if existing_animal:
            print(f"DEBUG - Animal encontrado por num_serie: {existing_animal.nom}")
    
    # 2. Si no se encuentra por num_serie, buscar por código (si está presente)
    if not existing_animal and 'cod' in clean_data and clean_data['cod']:
        existing_animal = await Animal.get_or_none(cod=clean_data['cod'])
        if existing_animal:
            print(f"DEBUG - Animal encontrado por cod: {existing_animal.nom}")
    
    # 3. Si no se encuentra por num_serie ni por cod, buscar por nombre y explotación
    if not existing_animal and 'nom' in clean_data and clean_data['nom']:
        query = {"nom": clean_data['nom']}
        if explotacio:
            # Explotacio ya no es una relación, es un campo de texto directo
            query["explotacio"] = explotacio
        
        existing_animal = await Animal.get_or_none(**query)
        if existing_animal:
            print(f"DEBUG - Animal encontrado por nom+explotacio: {existing_animal.nom}")
    
    # Si existe, actualizar sus datos
    if existing_animal:
        print(f"DEBUG_ALLETAR - Animal existente encontrado: {existing_animal.nom}, género: {existing_animal.genere}, alletar actual: {existing_animal.alletar}")
        
        # Si el animal es macho, SIEMPRE forzar alletar="0" antes de cualquier operación
        if existing_animal.genere == 'M':
            print(f"DEBUG_ALLETAR - Animal {existing_animal.nom} es MACHO, valor alletar antes de forzar: {existing_animal.alletar}")
            existing_animal.alletar = '0'
            print(f"DEBUG_ALLETAR - Forzando alletar=0 para macho existente: {existing_animal.nom}")
        
        # Actualizar los campos con los nuevos valores
        # Excepto alletar para machos, que ya está establecido a "0"
        for key, value in clean_data.items():
            if hasattr(existing_animal, key):
                # IMPORTANTE: Para alletar, hay que mantener las reglas de negocio
                if key == 'alletar':
                    print(f"DEBUG_ALLETAR - Procesando campo alletar para {existing_animal.nom}")
                    print(f"DEBUG_ALLETAR - Género del animal: {existing_animal.genere}")
                    print(f"DEBUG_ALLETAR - Valor actual de alletar: {existing_animal.alletar}")
                    print(f"DEBUG_ALLETAR - Valor de alletar en CSV: {value}")
                    
                    if existing_animal.genere == 'M':
                        # Los machos siempre tienen alletar=0, ya establecido arriba
                        print(f"DEBUG_ALLETAR - Animal es macho, ignorando valor del CSV")
                        pass
                    elif existing_animal.genere == 'F':
                        # Las hembras conservan el valor específico del CSV
                        print(f"DEBUG_ALLETAR - Animal es hembra, procesando valor del CSV")
                        if value in ['0', '1', '2']:
                            # Para todas las hembras, usar exactamente el valor del CSV
                            print(f"DEBUG_ALLETAR - Valor válido en CSV ({value}), actualizando alletar de {existing_animal.alletar} a {value}")
                            existing_animal.alletar = value
                            print(f"DEBUG_ALLETAR - Actualizado alletar a {value} para hembra {existing_animal.nom}")
                        else:
                            print(f"DEBUG_ALLETAR - Valor no válido en CSV ({value}), manteniendo valor actual {existing_animal.alletar}")
                    
                    print(f"DEBUG_ALLETAR - Después de procesar, alletar = {existing_animal.alletar}")
                else:
                    # Para otros campos, actualizar normalmente si no son None
                    if value is not None:
                        setattr(existing_animal, key, value)
        
        # Actualizar la explotación si se proporciona una nueva
        if explotacio:
            existing_animal.explotacio = explotacio
        
        print(f"DEBUG_ALLETAR - Antes de guardar: {existing_animal.nom}, alletar = {existing_animal.alletar}")
        await existing_animal.save()
        print(f"DEBUG_ALLETAR - Después de guardar: {existing_animal.nom}, alletar = {existing_animal.alletar}")
        
        # Verificar que el animal se guardó correctamente consultándolo de nuevo
        verificacion = await Animal.get(id=existing_animal.id)
        print(f"DEBUG_ALLETAR - VERIFICACIÓN DE BD: {verificacion.nom}, alletar = {verificacion.alletar}")
        
        # DOBLE VERIFICACIÓN para machos: asegurarse de que alletar sea "0" después de guardar
        if existing_animal.genere == 'M' and existing_animal.alletar != '0':
            print(f"DEBUG_ALLETAR - ¡ALERTA! Macho con alletar != 0 después de guardar: {existing_animal.alletar}")
            existing_animal.alletar = '0'
            await existing_animal.save()
            print(f"DEBUG_ALLETAR - VERIFICACIÓN FINAL: Forzando alletar=0 para macho: {existing_animal.nom}")
        
        # Para hembras, verificar que se guardó correctamente el valor de alletar
        if existing_animal.genere == 'F':
            print(f"DEBUG_ALLETAR - VERIFICACIÓN FINAL HEMBRA: {existing_animal.nom}, alletar = {existing_animal.alletar}")
        
        return existing_animal
    
    # Si no existe, crear nuevo animal
    else:
        # Verificar que tengamos al menos nombre y explotación
        if 'nom' not in clean_data or not clean_data['nom']:
            raise ValueError("Campo obligatorio 'nom' no encontrado o vacío")
        
        # Si no tiene algunos campos obligatorios, añadirlos con valores por defecto
        if 'estado' not in clean_data or not clean_data['estado']:
            clean_data['estado'] = 'OK'  # Por defecto, animal activo
        
        if 'genere' not in clean_data or not clean_data['genere']:
            clean_data['genere'] = 'F'  # Por defecto, animal hembra
        
        # Para machos, siempre forzar alletar="0"
        if clean_data['genere'].upper() == 'M':
            clean_data['alletar'] = '0'
            print(f"DEBUG - Comprobación final: forzando alletar=0 para nuevo macho")
        # Para hembras, asegurar que el alletar del CSV se use correctamente
        elif clean_data['genere'].upper() == 'F' and 'alletar' in clean_data and clean_data['alletar'] in ['0', '1', '2']:
            print(f"DEBUG - Usando valor del CSV alletar={clean_data['alletar']} para nueva hembra {clean_data['nom']}")
            # No es necesario hacer nada, el valor ya está en clean_data
        
        # Crear el animal con los datos proporcionados
        try:
            animal = await Animal.create(**clean_data)
        except Exception as e:
            raise
        
        # Log correcto según el género del animal
        if animal.genere == 'M':
            print(f"DEBUG - POST-CREACIÓN: Verificando alletar=0 para macho: {animal.nom}")
            # Verificación final de que alletar sea 0 para machos
            if animal.alletar != '0':
                animal.alletar = '0'
                await animal.save()
                print(f"DEBUG - POST-CREACIÓN: Corregido alletar a 0 para macho: {animal.nom}")
        else:
            print(f"DEBUG - POST-CREACIÓN: Verificando alletar para hembra: {animal.nom}, valor: {animal.alletar}")
        
        return animal

async def add_parto(animal: Animal, parto_data: Dict) -> Part:
    """
    Registra un parto para el animal.
    """
    try:
        # Verificar que el animal es hembra
        if animal.genere != 'F':
            raise ValueError("Solo las hembras pueden tener partos")

        # Calcular número de parto usando el modelo Part:
        num_partos = await Part.filter(animal_id=animal.id).count()

        # Procesar la fecha del parto - Versión robusta para CSV
        fecha_parto = None
        if 'part' in parto_data and parto_data['part']:
            try:
                # Intentar el parser normal primero
                fecha_parto = DateConverter.parse_date(parto_data['part'])
                print(f"DEBUG - Fecha de parto parseada: {fecha_parto} de original: {parto_data['part']}")
            except Exception as date_error:
                print(f"ADVERTENCIA - Primer intento de parsear fecha de parto falló: {str(date_error)}")
                # Si falla, intentar un enfoque específico para formato DD/MM/YYYY
                try:
                    fecha_str = parto_data['part'].strip()
                    # Asumir formato DD/MM/YYYY con cualquier separador
                    separadores = ['/', '-', '.']
                    sep = None
                    for s in separadores:
                        if s in fecha_str:
                            sep = s
                            break
                            
                    if sep:
                        partes = fecha_str.split(sep)
                        if len(partes) == 3:
                            # Asumir DD/MM/YYYY
                            dia = int(partes[0])
                            mes = int(partes[1])
                            anio = int(partes[2])
                            
                            from datetime import date
                            fecha_parto = date(anio, mes, dia)
                            print(f"DEBUG - Fecha de parto parseada manualmente: {fecha_parto} de original: {parto_data['part']}")
                        else:
                            print(f"ERROR - Formato de fecha incorrecto (no tiene 3 partes): {fecha_str}")
                            # Usar fecha actual como respaldo
                            from datetime import datetime
                    else:
                        print(f"ERROR - No se identificó separador en la fecha: {fecha_str}")
                        # Usar fecha actual como respaldo
                        from datetime import datetime
                except Exception as manual_error:
                    print(f"ERROR - Error al parsear fecha de parto manualmente: {str(manual_error)}")
                    # Usar fecha actual como respaldo
                    from datetime import datetime
                fecha_parto = datetime.now().date()
                print(f"DEBUG - Usando fecha actual como fallback: {fecha_parto}")
        else:
            # Si no hay fecha, usar la fecha actual
            from datetime import datetime
            fecha_parto = datetime.now().date()
            print(f"DEBUG - Usando fecha actual por defecto: {fecha_parto}")
        
        # Asegurarse de que GenereT y EstadoT tienen valores válidos
        if 'GenereT' not in parto_data or parto_data.get('GenereT') is None or parto_data.get('GenereT') == '':
            parto_data['GenereT'] = 'F'  # Valor por defecto si no está presente
            print(f"DEBUG - Asignando valor por defecto a GenereT en add_parto: F")
            
        if 'EstadoT' not in parto_data or parto_data.get('EstadoT') is None or parto_data.get('EstadoT') == '':
            parto_data['EstadoT'] = 'OK'  # Valor por defecto si no está presente
            print(f"DEBUG - Asignando valor por defecto a EstadoT en add_parto: OK")

        # Imprimir claramente lo que estamos intentando hacer
        print(f"DEBUG - Creando parto para animal ID {animal.id}, fecha: {fecha_parto}, GenereT: {parto_data.get('GenereT')}")
        
        # IMPORTANTE: Verificar si ya existe un parto con la misma fecha para este animal
        existing_parto = await Part.filter(animal_id=animal.id, part=fecha_parto).first()
        if existing_parto:
            print(f"DEBUG - Ya existe un parto para este animal con fecha {fecha_parto}, actualizando en lugar de crear nuevo")
            existing_parto.GenereT = parto_data.get('GenereT', 'F') 
            existing_parto.EstadoT = parto_data.get('EstadoT', 'OK')
            await existing_parto.save()
            print(f"DEBUG - Parto actualizado con ID: {existing_parto.id}")
            return existing_parto
        
        # Crear el parto usando in_transaction para garantizar la atomicidad
        try:
            async with in_transaction():
                parto_instance = await Part.create(
                    animal_id=animal.id,  # Usar directamente el ID en lugar del objeto
                    numero_part=num_partos + 1,  # Incrementar el número de parto
                    part=fecha_parto,
                    GenereT=parto_data.get('GenereT', 'F'),
                    EstadoT=parto_data.get('EstadoT', 'OK')
                )
                
                # Verificar que el parto se haya creado correctamente
                print(f"DEBUG - Parto creado correctamente con ID: {parto_instance.id}")
                
                # Comprobar cuántos partos tiene ahora el animal
                partos_count = await Part.filter(animal_id=animal.id).count()
                print(f"DEBUG - El animal ahora tiene {partos_count} partos registrados")
                
                # VERIFICACIÓN: Buscar el parto recién creado
                verificacion = await Part.get_or_none(id=parto_instance.id)
                if verificacion:
                    print(f"DEBUG - Verificación exitosa: el parto existe en la base de datos")
                else:
                    print(f"ERROR - El parto no se creó correctamente en la base de datos")
            
            return parto_instance
        except Exception as e:
            print(f"ERROR - No se pudo crear el parto: {str(e)}")
            # Intentar nuevamente con menos campos
            async with in_transaction():
                parto_instance = await Part.create(
                    animal_id=animal.id,
                    numero_part=num_partos + 1,
                    part=fecha_parto,
                    GenereT='F',  # Valor por defecto simplificado
                    EstadoT='OK'  # Valor por defecto simplificado
                )
                print(f"DEBUG - Parto creado en segundo intento con ID: {parto_instance.id}")
                return parto_instance
            
    except Exception as e:
        # Capturar el error específico de columna no existente
        error_msg = str(e)
        print(f"ERROR - Excepción al crear parto: {error_msg}")
        
        # Intento final con campos mínimos
        try:
            async with in_transaction():
                # Comprobar si el animal realmente existe
                animal_exists = await Animal.exists(id=animal.id)
                if not animal_exists:
                    print(f"ERROR - El animal con ID {animal.id} no existe en la base de datos")
                    raise ValueError(f"Error al crear parto: el animal con ID {animal.id} no existe")
                
                # Crear parto con campos mínimos
                parto_instance = await Part.create(
                    animal_id=animal.id,
                    numero_part=1,  # Valor por defecto
                    part=fecha_parto,
                    GenereT='F',  # Asegurarse de que este campo no sea null
                    EstadoT='OK'   # Asegurarse de que este campo no sea null
                )
                return parto_instance
        except Exception as final_e:
            final_msg = str(final_e)
            print(f"ERROR - Fallo en último intento: {final_msg}")
            raise ValueError(f"Error al crear parto: {final_msg}")