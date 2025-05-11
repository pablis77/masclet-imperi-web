"""
Endpoints para la gestión de partos de forma independiente
Este módulo proporciona acceso directo a los partos sin necesidad de especificar
un animal en la URL, facilitando las pruebas y el acceso a los datos de partos.
"""
from fastapi import APIRouter, HTTPException, Query, Depends, status
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
import logging
from tortoise.expressions import Q
from tortoise.functions import Function

from app.core.auth import get_current_user, verify_user_role
from app.core.config import UserRole
from app.core.date_utils import DateConverter

from app.models.animal import Animal, Part, Genere, Estado, EstadoAlletar
from app.schemas.parto import (
    PartoCreate,
    PartoUpdate,
    PartoResponse,
    PartosListResponse
)
from app.core.date_utils import DateConverter

router = APIRouter()
logger = logging.getLogger(__name__)

async def validate_animal(animal_nom: str, check_female: bool = True) -> Animal:
    """Valida que existe el animal y opcionalmente que sea hembra"""
    animal = await Animal.get_or_none(nom=animal_nom)
    if not animal:
        raise HTTPException(
            status_code=404,
            detail=f"Animal con nombre {animal_nom} no encontrado"
        )
        
    if check_female and animal.genere != Genere.FEMELLA:
        raise HTTPException(
            status_code=400,
            detail=f"El animal {animal_nom} no es una hembra y no puede tener partos"
        )
        
    if animal.estado == Estado.DEF:
        raise HTTPException(
            status_code=400,
            detail="No se pueden registrar partos de un animal dado de baja"
        )
        
    return animal

def validate_parto_date(parto_date_str: str, animal_dob: date = None) -> date:
    """Valida la fecha del parto"""
    try:
        parto_date = DateConverter.parse_date(parto_date_str)
        hoy = datetime.now().date()
        
        # Validar que no sea fecha futura
        if parto_date > hoy:
            raise HTTPException(
                status_code=400,
                detail="La fecha del parto no puede ser futura"
            )
            
        # Validar que el animal tenga edad suficiente
        if animal_dob:
            # Asumimos que necesita al menos 15 meses para tener un parto
            edad_minima = animal_dob + timedelta(days=15*30)
            if parto_date < edad_minima:
                raise HTTPException(
                    status_code=400,
                    detail="El animal es demasiado joven para tener partos en esta fecha"
                )
                
        return parto_date
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("", response_model=PartoResponse, status_code=201)
async def create_parto(parto_data: PartoCreate) -> dict:
    """Registrar un nuevo parto"""
    try:
        # Obtener el animal por ID
        animal = await Animal.get_or_none(id=parto_data.animal_id)
        if not animal:
            raise HTTPException(status_code=404, detail=f"Animal con ID {parto_data.animal_id} no encontrado")
        
        # Verificar que sea hembra (usando el valor de texto de la enumeración)
        animal_genere = animal.genere
        # Para asegurar la comparación correcta independientemente de si es str o Enum
        if isinstance(animal_genere, Genere):
            animal_genere = animal_genere.value
        if animal_genere != "F":
            raise HTTPException(status_code=400, 
                                detail=f"El animal {animal.id} ({animal.nom}) no es hembra y no puede tener partos")
        
        # Validar fecha del parto
        if animal.dob:
            validate_parto_date(parto_data.part, animal.dob)
        
        # Contar partos existentes para asignar número secuencial automáticamente
        num_partos = await Part.filter(animal_id=animal.id).count()
        
        # Crear nuevo parto
        parto = await Part.create(
            animal_id=animal.id,
            part=DateConverter.to_db_format(parto_data.part),
            GenereT=parto_data.GenereT,
            EstadoT=parto_data.EstadoT,
            numero_part=num_partos + 1,
            observacions=parto_data.observacions
        )
        
        # Actualizar estado de amamantamiento si es necesario
        if animal.alletar is None or animal.alletar == 0:
            animal.alletar = 1
            await animal.save()
        
        return {
            "status": "success",
            "data": await parto.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando parto: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{parto_id}", response_model=PartoResponse)
async def get_parto(parto_id: int) -> dict:
    """Obtener detalles de un parto específico"""
    try:
        # Buscar parto por ID
        parto = await Part.get_or_none(id=parto_id)
        if not parto:
            raise HTTPException(
                status_code=404,
                detail=f"Parto {parto_id} no encontrado"
            )
            
        return {
            "status": "success",
            "data": await parto.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recuperando parto {parto_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{parto_id}", response_model=PartoResponse)
async def update_parto(parto_id: int, parto_data: PartoUpdate, current_user = Depends(get_current_user)) -> dict:
    """
    Actualizar parcialmente un parto existente
    
    Args:
        parto_id: ID del parto
        parto_data: Datos de actualización
        current_user: Usuario actual
    
    Returns:
        Parto actualizado
    """
    try:
        # Usar conexión directa a la base de datos para evitar problemas con ORM
        conn = Part._meta.db
        
        # 1. Primero, verificar que el parto existe
        query_verify = f"""SELECT id, animal_id, part, \"GenereT\", \"EstadoT\", observacions, numero_part, created_at, updated_at 
                      FROM part WHERE id = {parto_id}"""
        result = await conn.execute_query(query_verify)
        
        if not result[1] or len(result[1]) == 0:
            raise HTTPException(status_code=404, detail=f"Parto con ID {parto_id} no encontrado")
        
        # Obtener el primer (y único) resultado
        parto_data_db = result[1][0]
        animal_id = parto_data_db[1]  # El índice 1 es animal_id según la consulta
        
        # 2. Obtener el animal asociado al parto
        query_animal = f"""SELECT id, nom, genere, dob FROM animal WHERE id = {animal_id}"""
        animal_result = await conn.execute_query(query_animal)
        
        if not animal_result[1] or len(animal_result[1]) == 0:
            raise HTTPException(status_code=404, detail=f"Animal con ID {animal_id} no encontrado")
        
        animal_db = animal_result[1][0]
        animal_genere = animal_db[2]
        animal_dob = animal_db[3]
        animal_nom = animal_db[1]
        
        # Verificar que el animal es hembra
        if animal_genere != 'F':
            raise HTTPException(
                status_code=400, 
                detail="Solo los animales hembra pueden tener registros de partos"
            )
            
        # Preparar los campos para actualizar
        campos_actualizados = []
        valores_actualizados = []
        
        # Si se proporciona fecha, validar y convertir
        if parto_data.part:
            try:
                # Validar que la fecha del parto es posterior a la fecha de nacimiento
                if animal_dob:
                    fecha_parto = DateConverter.parse_date(parto_data.part)
                    if isinstance(animal_dob, str):
                        animal_dob = DateConverter.parse_date(animal_dob)
                    
                    if fecha_parto < animal_dob:
                        raise HTTPException(
                            status_code=400,
                            detail="La fecha del parto no puede ser anterior a la fecha de nacimiento del animal"
                        )
                
                fecha_valida = DateConverter.parse_date(parto_data.part)
                campos_actualizados.append("part")
                valores_actualizados.append(f"'{fecha_valida}'")
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Formato de fecha inválido: {str(e)}")
        
        # Género de la cría
        if parto_data.GenereT is not None:
            # Obtener solo el valor real del enum (M o F)
            if hasattr(parto_data.GenereT, 'value'):
                # Si es un objeto Enum, extraer su valor
                genere_value = parto_data.GenereT.value
            else:
                # Si ya es un string, validarlo
                genere_value = str(parto_data.GenereT)
                
            # Validar que sea un valor permitido
            if genere_value not in ["M", "F"]:
                genere_value = "F"
                logger.warning(f"Valor de GenereT no válido: {parto_data.GenereT}. Usando 'F' por defecto.")
            
            campos_actualizados.append("\"GenereT\"")
            valores_actualizados.append(f"'{genere_value}'")
        
        # Estado de la cría
        if parto_data.EstadoT is not None:
            # Obtener solo el valor real del enum (OK o DEF)
            if hasattr(parto_data.EstadoT, 'value'):
                # Si es un objeto Enum, extraer su valor
                estado_value = parto_data.EstadoT.value
            else:
                # Si ya es un string, validarlo
                estado_value = str(parto_data.EstadoT)
                
            # Validar que sea un valor permitido
            if estado_value not in ["OK", "DEF"]:
                estado_value = "OK"
                logger.warning(f"Valor de EstadoT no válido: {parto_data.EstadoT}. Usando 'OK' por defecto.")
                
            campos_actualizados.append("\"EstadoT\"")
            valores_actualizados.append(f"'{estado_value}'")
        
        # Observaciones
        if parto_data.observacions is not None:
            # Comprobar si la columna observacions existe en la tabla
            try:
                campos_actualizados.append("observacions")
                # Escapar comillas simples en las observaciones
                obs_escapado = parto_data.observacions.replace("'", "''")
                # Limitar longitud para evitar errores
                obs_escapado = obs_escapado[:255]  # Limitar a 255 caracteres por seguridad
                valores_actualizados.append(f"'{obs_escapado}'")
            except Exception as e:
                logger.warning(f"Error al procesar observaciones: {str(e)}")
                # No incluir este campo si hay algún problema
        
        # Fecha de actualización
        campos_actualizados.append("updated_at")
        valores_actualizados.append("CURRENT_TIMESTAMP")
        
        # Si no hay campos para actualizar, no hacemos nada
        if not campos_actualizados:
            raise HTTPException(status_code=400, detail="No se proporcionaron campos para actualizar")
        
        # Construir la consulta de actualización
        sets = [f"{campo} = {valor}" for campo, valor in zip(campos_actualizados, valores_actualizados)]
        update_query = f"UPDATE part SET {', '.join(sets)} WHERE id = {parto_id}"
        
        # Ejecutar la actualización
        await conn.execute_query(update_query)
        
        # Obtener el parto actualizado
        query_get_updated = f"""SELECT id, animal_id, part, \"GenereT\", \"EstadoT\", observacions, numero_part, created_at, updated_at 
                           FROM part WHERE id = {parto_id}"""
        updated_result = await conn.execute_query(query_get_updated)
        
        if not updated_result[1] or len(updated_result[1]) == 0:
            raise HTTPException(status_code=500, detail="Error al recuperar el parto actualizado")
        
        updated_parto = updated_result[1][0]
        
        # Formatear las fechas
        fecha_part = updated_parto[2]
        fecha_formateada = None
        if fecha_part:
            if isinstance(fecha_part, date):
                fecha_formateada = fecha_part.strftime("%d/%m/%Y")
            else:
                try:
                    fecha_dt = datetime.strptime(str(fecha_part), "%Y-%m-%d")
                    fecha_formateada = fecha_dt.strftime("%d/%m/%Y")
                except ValueError:
                    fecha_formateada = str(fecha_part)
        
        # Formatear fechas de created_at y updated_at
        created_at = datetime.now().strftime("%d/%m/%Y") 
        updated_at = datetime.now().strftime("%d/%m/%Y")
        
        if len(updated_parto) > 7 and updated_parto[7]:
            if isinstance(updated_parto[7], datetime):
                created_at = updated_parto[7].strftime("%d/%m/%Y")
            else:
                created_at = str(updated_parto[7])
                
        if len(updated_parto) > 8 and updated_parto[8]:
            if isinstance(updated_parto[8], datetime):
                updated_at = updated_parto[8].strftime("%d/%m/%Y")
            else:
                updated_at = str(updated_parto[8])
        
        # Preparar la respuesta
        parto_dict = {
            "id": updated_parto[0],
            "animal_id": updated_parto[1],
            "part": fecha_formateada,
            "GenereT": updated_parto[3],
            "EstadoT": updated_parto[4],
            "observacions": updated_parto[5],
            "numero_part": updated_parto[6],
            "created_at": created_at,
            "updated_at": updated_at
        }
        
        # Registrar la acción
        logger.info(f"Parto {parto_id} actualizado para el animal {animal_id} ({animal_nom})")
        
        return PartoResponse(
            status="success",
            message="Parto actualizado correctamente",
            data=parto_dict
        )
        
    except HTTPException:
        # Re-lanzar excepciones HTTP que ya hemos generado
        raise
    except Exception as e:
        logger.error(f"Error al actualizar parto: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al actualizar el parto: {str(e)}")

@router.get("", response_model=PartosListResponse)
async def list_partos(
    animal_id: Optional[int] = None,
    animal_nom: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    GenereT: Optional[str] = None,
    EstadoT: Optional[str] = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    sort: Optional[str] = "part",
    order: Optional[str] = "desc"
) -> dict:
    """
    Obtiene un listado de partos con filtros opcionales.
    
    - **animal_id**: Filtrar por ID del animal
    - **animal_nom**: Filtrar por nombre del animal (madre) - Mantenido por retrocompatibilidad
    - **year**: Filtrar por año
    - **month**: Filtrar por mes
    - **start_date**: Fecha inicial (DD/MM/YYYY)
    - **end_date**: Fecha final (DD/MM/YYYY)
    - **GenereT**: Filtrar por género del ternero (M/F)
    - **EstadoT**: Filtrar por estado del ternero (OK/MUERTO)
    - **offset**: Número de registros a saltar (paginación)
    - **limit**: Número máximo de registros a devolver
    - **sort**: Campo por el que ordenar (part, numero_part)
    - **order**: Orden (asc, desc)
    """
    # Construir query base
    query = Part.all().prefetch_related("animal")
    
    # Aplicar filtros
    if animal_id:
        query = query.filter(animal_id=animal_id)
    elif animal_nom:
        animal = await Animal.get_or_none(nom=animal_nom)
        if not animal:
            raise HTTPException(
                status_code=404,
                detail=f"Animal con nombre {animal_nom} no encontrado"
            )
        query = query.filter(animal_id=animal.id)
    
    # Filtros de fecha
    date_filters = Q()
    
    if year:
        start_of_year = date(year, 1, 1)
        end_of_year = date(year, 12, 31)
        date_filters &= Q(part__gte=start_of_year, part__lte=end_of_year)
    
    if month:
        if year:
            start_date_month = date(year, month, 1)
            end_date_month = date(year, month + 1, 1) - timedelta(days=1) if month < 12 else date(year, 12, 31)
            date_filters &= Q(part__gte=start_date_month, part__lte=end_date_month)
    
    if start_date:
        try:
            fecha_inicio = DateConverter.parse_date(start_date)
            date_filters &= Q(part__gte=fecha_inicio)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Formato de fecha inicial inválido. Use DD/MM/YYYY"
            )
    
    if end_date:
        try:
            fecha_fin = DateConverter.parse_date(end_date)
            date_filters &= Q(part__lte=fecha_fin)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Formato de fecha final inválido. Use DD/MM/YYYY"
            )
    
    if date_filters:
        query = query.filter(date_filters)
    
    # Filtros adicionales
    if GenereT:
        query = query.filter(GenereT=GenereT)
    
    if EstadoT:
        query = query.filter(EstadoT=EstadoT)
    
    # Contar total de registros (para paginación)
    total = await query.count()
    
    # Aplicar ordenación
    if sort and sort in ["part", "numero_part", "created_at"]:
        query = query.order_by(sort if order == "asc" else f"-{sort}")
    
    # Aplicar paginación
    query = query.offset(offset).limit(limit)
    
    # Ejecutar consulta
    partos = await query
    
    # Formatear resultados
    results = []
    for parto in partos:
        results.append({
            "id": parto.id,
            "animal_id": parto.animal.id,
            "animal_nom": parto.animal.nom,  
            "part": parto.part.strftime("%d/%m/%Y"),  
            "GenereT": parto.GenereT,  
            "EstadoT": parto.EstadoT,  
            "numero_part": parto.numero_part,
            "created_at": parto.created_at.strftime("%d/%m/%Y %H:%M:%S") if parto.created_at else None
        })
    
    return {
        "status": "success",
        "data": {
            "total": total,
            "offset": offset,
            "limit": limit,
            "items": results
        }
    }

@router.delete("/{parto_id}", response_model=PartoResponse)
async def delete_parto(parto_id: int, current_user = Depends(get_current_user)):
    """
    Eliminar un parto de forma permanente.
    
    ⚠️ RESTRICCIÓN: Esta funcionalidad está restringida SOLO a usuarios con rol de administrador
    y debe usarse únicamente en casos excepcionales como registros duplicados.
    
    Args:
        parto_id: ID del parto a eliminar
        current_user: Usuario actual (debe ser administrador)
    
    Returns:
        El parto eliminado
    
    Raises:
        HTTPException: Si el usuario no es administrador o si el parto no existe
    """
    # Verificar que el usuario es administrador
    if not verify_user_role(current_user, [UserRole.ADMIN]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden eliminar partos"
        )
    
    # Usar conexión directa a la base de datos para evitar problemas con ORM
    conn = Part._meta.db
    
    try:
        # 1. Primero, verificar que el parto existe y obtener sus datos
        query_verify = f"""SELECT p.id, p.animal_id, p.part, p."GenereT", p."EstadoT", p.observacions, p.numero_part, a.nom, p.created_at, p.updated_at 
                      FROM part p 
                      LEFT JOIN animal a ON p.animal_id = a.id
                      WHERE p.id = {parto_id}"""
        result = await conn.execute_query(query_verify)
        
        if not result[1] or len(result[1]) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parto con ID {parto_id} no encontrado"
            )
        
        # Obtener el primer (y único) resultado
        parto_data = result[1][0]
        animal_id = parto_data[1]  # El índice 1 es animal_id según la consulta
        animal_nombre = parto_data[7] if parto_data[7] else "Desconocido"  # El índice 7 es a.nom
        
        # Preparar datos del parto para devolver
        fecha_part = parto_data[2]
        fecha_formateada = None
        if fecha_part:
            if isinstance(fecha_part, date):
                fecha_formateada = fecha_part.strftime("%d/%m/%Y")
            else:
                try:
                    fecha_dt = datetime.strptime(str(fecha_part), "%Y-%m-%d")
                    fecha_formateada = fecha_dt.strftime("%d/%m/%Y")
                except ValueError:
                    # Si hay algún error, devolver la fecha tal cual
                    fecha_formateada = str(fecha_part)
        
        # Formatear fechas de created_at y updated_at (índices 8 y 9)
        created_at = datetime.now().strftime("%d/%m/%Y") 
        updated_at = datetime.now().strftime("%d/%m/%Y")
        
        if len(parto_data) > 8 and parto_data[8]:
            if isinstance(parto_data[8], datetime):
                created_at = parto_data[8].strftime("%d/%m/%Y")
            else:
                created_at = str(parto_data[8])
                
        if len(parto_data) > 9 and parto_data[9]:
            if isinstance(parto_data[9], datetime):
                updated_at = parto_data[9].strftime("%d/%m/%Y")
            else:
                updated_at = str(parto_data[9])
        
        parto_dict = {
            "id": parto_data[0],
            "animal_id": animal_id,
            "part": fecha_formateada,
            "GenereT": parto_data[3],
            "EstadoT": parto_data[4],
            "observacions": parto_data[5],
            "numero_part": parto_data[6],
            "created_at": created_at,
            "updated_at": updated_at
        }
        
        # 2. Ejecutar la eliminación directamente con SQL
        query_delete = f"DELETE FROM part WHERE id = {parto_id}"
        await conn.execute_query(query_delete)
        
        # Registrar la acción en logs
        logger.warning(
            f"PARTO ELIMINADO (endpoint standalone, SQL directo) - ID: {parto_id}, Animal: {animal_id} ({animal_nombre}) - "
            f"Usuario: {current_user.username} (ID: {current_user.id})"
        )
        
        return {
            "status": "success",
            "message": f"Parto ID {parto_id} eliminado correctamente",
            "data": parto_dict
        }
        
    except HTTPException:
        # Re-lanzar excepciones HTTP que ya hemos generado
        raise
    except Exception as e:
        logger.error(f"Error al eliminar parto (endpoint standalone): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el parto: {str(e)}"
        )
