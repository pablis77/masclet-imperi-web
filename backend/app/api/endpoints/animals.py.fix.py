"""
Endpoints para la gestión de animales
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Request, Response, Body, BackgroundTasks
from pydantic import ValidationError
from tortoise.exceptions import DoesNotExist
from tortoise.expressions import Q
from typing import List, Optional, Dict, Any
import json
from datetime import datetime
import logging
import os
import re

from app.api.deps import get_current_user
from app.models.animal import Animal, AnimalHistory, Genere, Estado, EstadoAlletar, Part
from app.models.user import User
from app.schemas import animal as schemas
from app.utils.date_converter import DateConverter

# Configurar el logger
logger = logging.getLogger(__name__)

router = APIRouter()

async def trigger_backup_after_change(background_tasks: BackgroundTasks, action: str, animal_nom: str, history_id: str = None):
    """
    Ejecuta un backup automático tras modificaciones importantes en fichas de animales
    """
    logger.info(f"Programando backup automático tras {action} del animal {animal_nom}")
    
    # Verificar si el script de backup está disponible
    script_path = None
    for posible_ruta in [
        os.path.join(os.getcwd(), "backend", "scripts", "backup.py"),
        os.path.join(os.getcwd(), "backend", "scripts", "backup", "backup.py"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "scripts", "backup.py"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "scripts", "backup", "backup.py"),
    ]:
        if os.path.isfile(posible_ruta):
            script_path = posible_ruta
            break
    
    if not script_path:
        logger.warning("No se encontró ningún script de backup disponible")
        return
    
    try:
        # Importar dinámicamente el script de backup
        import importlib.util
        import sys
        
        # Normalizar la ruta para obtener el módulo
        module_name = os.path.basename(script_path).replace(".py", "")
        if os.path.dirname(script_path).endswith("backup"):
            module_name = f"backup.{module_name}"
        
        # Cargar el módulo
        spec = importlib.util.spec_from_file_location(module_name, script_path)
        backup_module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = backup_module
        spec.loader.exec_module(backup_module)
        
        if hasattr(backup_module, "ejecutar_backup"):
            # Ejecutar el backup en segundo plano
            background_tasks.add_task(backup_module.ejecutar_backup)
            logger.info(f"Backup programado tras {action} del animal {animal_nom}")
        else:
            logger.warning(f"El script de backup encontrado no contiene la función 'ejecutar_backup'")
    except Exception as e:
        logger.error(f"Error al programar backup automático: {str(e)}")


@router.post("/animals", response_model=schemas.AnimalResponse)
async def create_animal(
    animal_data: dict = Body(...),
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user)
):
    """
    Crear un nuevo animal
    """
    try:
        # Si los datos vienen con ID, lo eliminamos para que Tortoise asigne uno automáticamente
        if "id" in animal_data:
            del animal_data["id"]
        
        # Procesar fecha de nacimiento si está presente
        if 'dob' in animal_data and animal_data['dob']:
            try:
                animal_data["dob"] = DateConverter.to_db_format(animal_data['dob'])
            except ValueError as e:
                logger.error(f"Error al convertir fecha 'dob': {e}")
                raise HTTPException(status_code=400, detail=str(e))
        
        # Validación especial para alletar
        if animal_data.get("genere") == Genere.MASCLE.value and animal_data.get("alletar") != EstadoAlletar.NO_ALLETAR.value:
            raise HTTPException(
                status_code=422,
                detail=f"Los machos solo pueden tener estado de amamantamiento '{EstadoAlletar.NO_ALLETAR.value}' (sin amamantar)"
            )
        
        # Crear el nuevo animal
        new_animal = await Animal.create(**animal_data)
        
        # Registrar la creación en el historial
        try:
            history_record = await AnimalHistory.create(
                animal=new_animal,
                usuario=current_user.username,
                cambio=f"Creación del animal {new_animal.nom}",
                campo="creacion",
                valor_anterior=None,
                valor_nuevo=new_animal.nom,
                
                # Campos del nuevo formato extendido
                action="CREATE",
                timestamp=datetime.now(),
                field="creacion",
                description=f"Creación del animal {new_animal.nom}",
                old_value=None,
                new_value=new_animal.nom,
                changes=json.dumps({"creacion": animal_data})
            )
        except Exception as e:
            logger.error(f"Error al registrar historial de creación: {e}")
            # Continuar con el flujo principal aunque el historial falle
        
        # Disparar backup automático tras la creación
        if background_tasks:
            await trigger_backup_after_change(background_tasks, "creación", new_animal.nom)
        
        return {
            "status": "success",
            "data": await new_animal.to_dict()
        }
        
    except ValidationError as e:
        logger.error(f"Error de validación: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error creando animal: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error interno al crear animal: {str(e)}"
        )


@router.get("/animals/{animal_id}", response_model=schemas.AnimalResponse)
async def get_animal(animal_id: int):
    """
    Obtener detalles de un animal
    """
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(
            status_code=404,
            detail=f"Animal con ID {animal_id} no encontrado"
        )
    
    # Devolver datos del animal convertidos a diccionario para incluir relaciones
    return {
        "status": "success",
        "data": await animal.to_dict()
    }


@router.get("/animals/{animal_id}/history", response_model=schemas.AnimalHistoryResponse)
async def get_animal_history(
    animal_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Obtener el historial de cambios de un animal
    """
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(
            status_code=404,
            detail=f"Animal con ID {animal_id} no encontrado"
        )
    
    # Obtener el historial del animal
    history = await AnimalHistory.filter(animal_id=animal_id).order_by("-timestamp").all()
    history_data = []
    
    for item in history:
        history_data.append({
            "id": item.id,
            "usuario": item.usuario,
            "cambio": item.cambio,
            "campo": item.campo,
            "valor_anterior": item.valor_anterior,
            "valor_nuevo": item.valor_nuevo,
            "timestamp": item.timestamp.strftime("%d/%m/%Y %H:%M:%S") if item.timestamp else None,
            "action": item.action,
            "description": item.description
        })
    
    return {
        "status": "success",
        "data": history_data
    }


@router.get("/animals", response_model=schemas.AnimalListResponse)
async def list_animals(
    explotacio: Optional[str] = None,  
    genere: Optional[str] = None,
    estado: Optional[str] = None,
    alletar: Optional[str] = None,
    mare: Optional[str] = None,
    pare: Optional[str] = None,
    origen: Optional[str] = None,
    search: Optional[str] = None,
    num_serie: Optional[str] = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """
    Listar animales con filtros opcionales
    """
    # Construir el filtro base
    filters = Q()
    
    # Aplicar filtros si están presentes
    if explotacio:
        filters = filters & Q(explotacio=explotacio)
    
    if genere:
        filters = filters & Q(genere=genere)
    
    if estado:
        filters = filters & Q(estado=estado)
    
    if alletar is not None:
        filters = filters & Q(alletar=alletar)
    
    if mare:
        filters = filters & Q(mare=mare)
    
    if pare:
        filters = filters & Q(pare=pare)
    
    if origen:
        filters = filters & Q(origen=origen)
        
    if num_serie:
        filters = filters & Q(num_serie=num_serie)
    
    # Si hay un término de búsqueda, buscar en varios campos
    if search:
        search_filters = (
            Q(nom__icontains=search) | 
            Q(explotacio__icontains=search) |
            Q(origen__icontains=search) |
            Q(mare__icontains=search) |
            Q(pare__icontains=search) |
            Q(num_serie__icontains=search)
        )
        filters = filters & search_filters
    
    # Obtener el total de animales que coinciden con el filtro
    total_count = await Animal.filter(filters).count()
    
    # Obtener los animales paginados
    animals = await Animal.filter(filters).offset(offset).limit(limit).all()
    
    # Convertir animales a diccionarios
    animals_data = []
    for animal in animals:
        animals_data.append(await animal.to_dict())
    
    return {
        "status": "success",
        "total": total_count,
        "offset": offset,
        "limit": limit,
        "data": animals_data
    }


@router.patch("/animals/{animal_id}", response_model=schemas.AnimalResponse)
async def update_animal_patch(
    animal_id: int,
    animal_data: schemas.AnimalUpdate,
    request: Request,
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
):
    """
    Actualizar parcialmente un animal por ID (método PATCH)
    """
    # Verificar que el animal existe
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(
            status_code=404,
            detail=f"Animal con ID {animal_id} no encontrado"
        )
    
    # Log para depuración detallada
    logger.info(f"Recibida solicitud PATCH para animal ID {animal_id}")
    logger.info(f"Datos recibidos (raw): {animal_data}")
    
    try:
        # Obtener datos directamente del request en lugar de depender de Pydantic
        request_data = await request.json()
        logger.info(f"Datos recibidos directamente del request: {request_data}")
        
        # Procesar todos los campos en la solicitud PATCH, incluyendo null (que indica borrar)
        raw_data = {}
        for field, value in request_data.items():
            # Incluimos todos los campos, incluso los null, ya que un null explícito
            # es una instrucción para borrar el valor actual
            raw_data[field] = value
        
        logger.info(f"Datos procesados para actualización (dict): {raw_data}")
        logger.info(f"Campos a actualizar: {list(raw_data.keys())}")
    except Exception as e:
        # Si hay error leyendo el JSON, usar los datos de Pydantic como fallback
        logger.warning(f"No se pudo leer JSON del request: {str(e)}. Usando datos de Pydantic.")
        try:
            # Intentar acceder a _json usando __dict__
            if hasattr(animal_data, '__dict__'):
                raw_data = {k: v for k, v in animal_data.__dict__.items() 
                           if not k.startswith('_') and v is not None}
            else:
                raw_data = {k: getattr(animal_data, k) for k in animal_data.__fields__
                          if getattr(animal_data, k) is not None}
            logger.info(f"Datos desde Pydantic: {raw_data}")
        except Exception as e2:
            logger.error(f"Error al procesar datos de animal: {str(e2)}")
            raw_data = {}
            # Extraer manualmente los campos más importantes
            if hasattr(animal_data, 'mare'):
                raw_data['mare'] = animal_data.mare
    
    # Si no hay datos para actualizar, devolver el animal sin cambios
    if not raw_data:
        logger.warning(f"No se recibieron campos para actualizar el animal {animal_id}")
        return {
            "status": "success",
            "data": await animal.to_dict()
        }
    
    # Guardar valores anteriores para el historial
    valores_anteriores = {}
    
    try:
        # Procesar fecha de nacimiento si está presente
        if 'dob' in raw_data and raw_data['dob']:
            try:
                raw_data["dob"] = DateConverter.to_db_format(raw_data['dob'])
                logger.info(f"Campo 'dob' convertido: {raw_data['dob']} -> {raw_data['dob']}")
            except ValueError as e:
                logger.error(f"Error al convertir fecha 'dob': {e}")
                raise HTTPException(status_code=400, detail=str(e))
        
        # Validación especial para alletar
        if "alletar" in raw_data and raw_data["alletar"] is not None:
            # Si es macho, solo puede ser "0"
            if animal.genere == Genere.MASCLE.value and raw_data["alletar"] != EstadoAlletar.NO_ALLETAR.value:
                raise HTTPException(
                    status_code=422,
                    detail=f"Los machos solo pueden tener estado de amamantamiento '{EstadoAlletar.NO_ALLETAR.value}' (sin amamantar)"
                )
        
        # Guardar valores anteriores para todos los campos que se van a actualizar
        for campo in raw_data.keys():
            if hasattr(animal, campo):
                valores_anteriores[campo] = getattr(animal, campo)
        
        # FASE 1: Actualización directa usando el método update() de Tortoise ORM
        # Esto actualiza sólo los campos enviados sin validar los demás
        await Animal.filter(id=animal_id).update(**raw_data)
        
        # Recargar el animal para tener los datos actualizados
        animal = await Animal.get(id=animal_id)
        
        # FASE 2: Registrar los cambios en el historial (No debe afectar a la fase 1)
        logger.info(f"Iniciando registro de historial para {len(raw_data)} campos actualizados")
        for campo, nuevo_valor in raw_data.items():
            try:
                logger.info(f"Procesando historial para campo: {campo} = {nuevo_valor}")
                valor_anterior = valores_anteriores.get(campo)
                
                # Convertir fechas a formato legible
                if campo == 'dob' and valor_anterior:
                    valor_anterior = valor_anterior.strftime("%d/%m/%Y") if hasattr(valor_anterior, 'strftime') else str(valor_anterior)
                if campo == 'dob' and nuevo_valor:
                    nuevo_valor = nuevo_valor.strftime("%d/%m/%Y") if hasattr(nuevo_valor, 'strftime') else str(nuevo_valor)
                    
                # Crear descripción del cambio
                if campo == 'estado':
                    descripcion = f"Actualización de estado: {valor_anterior} → {nuevo_valor}"
                elif campo == 'alletar':
                    descripcion = f"Cambio de estado de amamantamiento: {valor_anterior} → {nuevo_valor}"
                elif campo == 'origen':
                    descripcion = f"Cambio de cuadra: {valor_anterior} → {nuevo_valor}"
                else:
                    descripcion = f"Actualización de {campo}"
                
                # Si la descripción está vacía, usar un valor predeterminado
                if not descripcion:
                    descripcion = "Actualización sin detalles"
                    
                # Registrar en historial con compatibilidad para ambos formatos
                # (antiguo y nuevo esquema extendido)
                cambios_json = {campo: {"anterior": str(valor_anterior) if valor_anterior is not None else None, 
                                    "nuevo": str(nuevo_valor) if nuevo_valor is not None else None}}
                
                try:
                    logger.info(f"Creando registro de historial para campo {campo}")
                    history_record = await AnimalHistory.create(
                        # Campos del formato antiguo
                        animal=animal,
                        usuario=current_user.username,
                        cambio=descripcion,
                        campo=campo,
                        valor_anterior=str(valor_anterior) if valor_anterior is not None else None,
                        valor_nuevo=str(nuevo_valor) if nuevo_valor is not None else None,
                        
                        # Campos del nuevo formato extendido
                        action="UPDATE",
                        timestamp=datetime.now(),
                        field=campo,
                        description=descripcion,
                        old_value=str(valor_anterior) if valor_anterior is not None else None,
                        new_value=str(nuevo_valor) if nuevo_valor is not None else None,
                        changes=json.dumps(cambios_json)
                    )
                    logger.info(f"✅ Registro de historial creado con ID: {history_record.id if history_record else 'desconocido'}")
                except Exception as e_db:
                    logger.error(f"❌ Error al crear registro en la base de datos: {str(e_db)}")
            except Exception as e:
                logger.error(f"❌ Error general al procesar el campo {campo}: {str(e)}")
                # No interrumpimos el flujo principal si hay error en el historial
        
        # Disparar backup automático tras la modificación
        if background_tasks and len(raw_data) > 0:
            await trigger_backup_after_change(background_tasks, "modificación (PATCH)", animal.nom)
            logger.info(f"Programando backup automático tras modificación (PATCH) del animal {animal.nom}")
        
        # Devolver el animal actualizado
        return {
            "status": "success",
            "data": await animal.to_dict()
        }
        
    except HTTPException as e:
        # Re-lanzar excepciones HTTP para que FastAPI las maneje correctamente
        raise
    except ValidationError as e:
        logger.error(f"Error de validación: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error actualizando animal {animal_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error interno al actualizar animal: {str(e)}"
        )


@router.put("/animals/{animal_id}", response_model=schemas.AnimalResponse)
async def update_animal(
    animal_id: int, 
    animal_data: schemas.AnimalUpdate,
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar un animal por ID
    """
    # Verificar que el animal existe
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(
            status_code=404,
            detail=f"Animal con ID {animal_id} no encontrado"
        )
    
    try:
        # Convertir a diccionario para actualización
        update_data = {}
        for key, value in animal_data.dict(exclude_unset=True).items():
            # Si el valor es None, ignorarlo para no sobrescribir con NULL
            if value is not None or key in animal_data.__fields_set__:
                update_data[key] = value
        
        # Procesar fecha de nacimiento si está presente
        if 'dob' in update_data and update_data['dob']:
            try:
                update_data["dob"] = DateConverter.to_db_format(update_data['dob'])
            except ValueError as e:
                logger.error(f"Error al convertir fecha 'dob': {e}")
                raise HTTPException(status_code=400, detail=str(e))
        
        # Validación especial para alletar
        if "alletar" in update_data and update_data["alletar"] is not None:
            # Si es macho, solo puede ser "0"
            if animal.genere == Genere.MASCLE.value and update_data["alletar"] != EstadoAlletar.NO_ALLETAR.value:
                raise HTTPException(
                    status_code=422,
                    detail=f"Los machos solo pueden tener estado de amamantamiento '{EstadoAlletar.NO_ALLETAR.value}' (sin amamantar)"
                )
        
        # Guardar valores anteriores para el historial
        valores_anteriores = {}
        for campo in update_data.keys():
            if hasattr(animal, campo):
                valores_anteriores[campo] = getattr(animal, campo)
        
        # Actualizar el animal
        await Animal.filter(id=animal_id).update(**update_data)
        
        # Recargar el animal para tener los datos actualizados
        animal = await Animal.get(id=animal_id)
        
        # Registrar los cambios en el historial
        try:
            for campo, nuevo_valor in update_data.items():
                valor_anterior = valores_anteriores.get(campo)
                
                # Convertir fechas a formato legible
                if campo == 'dob' and valor_anterior:
                    valor_anterior = valor_anterior.strftime("%d/%m/%Y") if hasattr(valor_anterior, 'strftime') else str(valor_anterior)
                if campo == 'dob' and nuevo_valor:
                    nuevo_valor = nuevo_valor.strftime("%d/%m/%Y") if hasattr(nuevo_valor, 'strftime') else str(nuevo_valor)
                
                # Crear descripción del cambio
                if campo == 'estado':
                    descripcion = f"Actualización de estado: {valor_anterior} → {nuevo_valor}"
                elif campo == 'alletar':
                    descripcion = f"Cambio de estado de amamantamiento: {valor_anterior} → {nuevo_valor}"
                elif campo == 'origen':
                    descripcion = f"Cambio de cuadra: {valor_anterior} → {nuevo_valor}"
                else:
                    descripcion = f"Actualización de {campo}"
                
                # Registrar en historial con compatibilidad para ambos formatos
                cambios_json = {campo: {"anterior": str(valor_anterior) if valor_anterior is not None else None, 
                                     "nuevo": str(nuevo_valor) if nuevo_valor is not None else None}}
                
                try:
                    await AnimalHistory.create(
                        # Campos del formato antiguo
                        animal=animal,
                        usuario=current_user.username,
                        cambio=descripcion,
                        campo=campo,
                        valor_anterior=str(valor_anterior) if valor_anterior is not None else None,
                        valor_nuevo=str(nuevo_valor) if nuevo_valor is not None else None,
                        
                        # Campos del nuevo formato extendido
                        action="UPDATE",
                        timestamp=datetime.now(),
                        field=campo,
                        description=descripcion,
                        old_value=str(valor_anterior) if valor_anterior is not None else None,
                        new_value=str(nuevo_valor) if nuevo_valor is not None else None,
                        changes=json.dumps(cambios_json)
                    )
                except Exception as e:
                    logger.error(f"Error al crear registro de historial: {e}")
                    # Continuar con el flujo si hay error en el historial
        except Exception as e:
            logger.error(f"Error general en el registro de historial: {e}")
            # No lanzamos la excepción para no afectar la operación principal
        
        # Disparar backup automático tras la modificación
        if background_tasks and len(update_data) > 0:
            await trigger_backup_after_change(background_tasks, "modificación", animal.nom)
        
        return {
            "status": "success",
            "data": await animal.to_dict()
        }
    
    except ValidationError as e:
        logger.error(f"Error de validación: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error actualizando animal {animal_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error interno al actualizar animal: {str(e)}"
        )


@router.delete("/animals/{animal_id}", response_model=schemas.BaseResponse)
async def delete_animal(animal_id: int):
    """
    Eliminar un animal
    """
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(
            status_code=404,
            detail=f"Animal con ID {animal_id} no encontrado"
        )
    
    # Eliminar el animal
    await animal.delete()
    
    return {
        "status": "success",
        "message": f"Animal con ID {animal_id} eliminado correctamente"
    }


@router.get("/animals/{animal_id}/history", response_model=schemas.AnimalHistoryResponse)
async def get_animal_history(
    animal_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Obtener el historial de cambios de un animal
    """
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(
            status_code=404,
            detail=f"Animal con ID {animal_id} no encontrado"
        )
    
    # Obtener el historial del animal
    history = await AnimalHistory.filter(animal_id=animal_id).order_by("-timestamp").all()
    history_data = []
    
    for item in history:
        history_data.append({
            "id": item.id,
            "usuario": item.usuario,
            "cambio": item.cambio,
            "campo": item.campo,
            "valor_anterior": item.valor_anterior,
            "valor_nuevo": item.valor_nuevo,
            "timestamp": item.timestamp.strftime("%d/%m/%Y %H:%M:%S") if item.timestamp else None,
            "action": item.action,
            "description": item.description
        })
    
    return {
        "status": "success",
        "data": history_data
    }


@router.get("/animals/{animal_id}/parts", response_model=schemas.AnimalPartsResponse)
async def get_animal_parts(animal_id: int):
    """
    Obtener los partos de un animal.
    Solo las hembras pueden tener partos.
    """
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(
            status_code=404,
            detail=f"Animal con ID {animal_id} no encontrado"
        )
    
    # Verificar que sea una hembra
    if animal.genere != Genere.FEMELLA.value:
        return {
            "status": "success",
            "data": []  # Un macho no tiene partos
        }
    
    # Obtener los partos del animal
    parts = await Part.filter(animal_id=animal_id).order_by("-part").all()
    parts_data = []
    
    for part in parts:
        parts_data.append({
            "id": part.id,
            "animal_id": part.animal_id,
            "part": part.part.strftime("%d/%m/%Y") if part.part else None,
            "genere_t": part.genere_t,
            "estado_t": part.estado_t
        })
    
    return {
        "status": "success",
        "data": parts_data
    }
