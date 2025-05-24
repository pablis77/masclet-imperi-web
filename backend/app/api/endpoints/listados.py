from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from tortoise.contrib.fastapi import HTTPNotFoundError
from tortoise.expressions import Q
from app.schemas.listado import (
    ListadoCreate, 
    ListadoUpdate, 
    ListadoResponse, 
    ListadoDetalleResponse,
    ListadoAnimalCreate,
    ExportarListadoConfig,
    ListadoAnimalesUpdate
)
from app.models.listado import Listado, ListadoAnimal
from app.models.animal import Animal
from app.models.user import User as UserModel
from app.core.auth import get_current_user
from app.schemas.user import User as UserSchema
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["listados"],
    responses={404: {"description": "No encontrado"}},
)


@router.post("", response_model=ListadoResponse, status_code=status.HTTP_201_CREATED)
async def crear_listado(
    listado: ListadoCreate,
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Crear un nuevo listado personalizado
    """
    try:
        # Crear el listado
        nuevo_listado = await Listado.create(
            nombre=listado.nombre,
            descripcion=listado.descripcion,
            categoria=listado.categoria,
            is_completed=listado.is_completed
        )
        
        # Intentar establecer relación con el usuario creador
        try:
            user = await UserModel.get(id=current_user.id)
            nuevo_listado.created_by = user
            await nuevo_listado.save()
        except Exception as e:
            logger.warning(f"No se pudo establecer el usuario creador: {str(e)}")
            # Continuamos aunque no se pueda establecer el usuario creador
        
        # Añadir animales si se proporcionaron
        if listado.animales and len(listado.animales) > 0:
            # Verificar que los animales existen
            for animal_id in listado.animales:
                animal = await Animal.filter(id=animal_id).first()
                if not animal:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Animal con ID {animal_id} no encontrado"
                    )
                
                # Añadir relación
                await nuevo_listado.animales.add(animal)
        
        # Obtener conteo de animales
        await nuevo_listado.fetch_related("animales")
        animales_count = await nuevo_listado.animales.all().count()
        
        # Preparar respuesta manual para evitar problemas con relaciones
        response = ListadoResponse(
            id=nuevo_listado.id,
            nombre=nuevo_listado.nombre,
            descripcion=nuevo_listado.descripcion,
            categoria=nuevo_listado.categoria,
            is_completed=nuevo_listado.is_completed,
            created_at=nuevo_listado.created_at,
            updated_at=nuevo_listado.updated_at,
            created_by=current_user.id if hasattr(current_user, 'id') else None,
            animales_count=animales_count
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error al crear listado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear listado: {str(e)}"
        )


@router.get("", response_model=List[ListadoResponse])
async def listar_listados(
    categoria: Optional[str] = None,
    completado: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Obtener todos los listados personalizados con filtros opcionales
    """
    try:
        # Construir consulta base
        query = Q()
        
        # Añadir filtros si se proporcionaron
        if categoria:
            query = query & Q(categoria=categoria)
        
        if completado is not None:
            query = query & Q(is_completed=completado)
        
        # Obtener listados con paginación
        listados = await Listado.filter(query).offset(skip).limit(limit).order_by("-created_at")
        
        # Obtener conteo de animales para cada listado
        resultado = []
        for listado in listados:
            await listado.fetch_related("animales")
            animales_count = await listado.animales.all().count()
            
            # Crear respuesta manual para evitar problemas con relaciones
            listado_response = ListadoResponse(
                id=listado.id,
                nombre=listado.nombre,
                descripcion=listado.descripcion,
                categoria=listado.categoria,
                is_completed=listado.is_completed,
                created_at=listado.created_at,
                updated_at=listado.updated_at,
                created_by=current_user.id if hasattr(current_user, 'id') else None,
                animales_count=animales_count
            )
            resultado.append(listado_response)
        
        return resultado
    
    except Exception as e:
        logger.error(f"Error al listar listados: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al listar listados: {str(e)}"
        )


@router.get("/{listado_id}", response_model=ListadoDetalleResponse)
async def obtener_listado(
    listado_id: int = Path(..., gt=0),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Obtener detalles de un listado específico incluyendo los animales
    """
    try:
        # Buscar el listado
        listado = await Listado.filter(id=listado_id).first()
        if not listado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listado con ID {listado_id} no encontrado"
            )
        
        # Obtener animales relacionados
        await listado.fetch_related("animales")
        animales_raw = await listado.animales.all()
        
        # Obtener la información de estado y observaciones desde los campos correspondientes
        animales = []
        for animal in animales_raw:
            animal_dict = {
                "id": animal.id,
                "nom": animal.nom,
                "explotacio": animal.explotacio,
                "genere": animal.genere,
                "estado": animal.estado,  # Estado del animal (OK/DEF)
                "confirmacion": "NO",  # Valor por defecto para la confirmación en el listado
                "cod": animal.cod,
                "num_serie": animal.num_serie,
                "dob": animal.dob
            }
            
            # Buscar la relación para obtener estado y observaciones
            try:
                listado_animal = await ListadoAnimal.get_or_none(
                    listado_id=listado_id,
                    animal_id=animal.id
                )
                
                if listado_animal:
                    # Usar directamente los campos confirmacion y observaciones
                    animal_dict["confirmacion"] = listado_animal.confirmacion or "NO"
                    animal_dict["observaciones"] = listado_animal.observaciones or ""
                    logger.info(f"Estado del animal {animal.id}: {animal_dict['confirmacion']} (valor en BD: {listado_animal.confirmacion})")
                    # Imprimir el objeto completo para depuración
                    logger.info(f"Datos completos del animal {animal.id}: {animal_dict}")
            except Exception as e:
                logger.warning(f"Error al obtener datos del animal {animal.id}: {str(e)}")
                # En caso de error, usar valores por defecto
                animal_dict["confirmacion"] = "NO"
                animal_dict["observaciones"] = ""
            
            animales.append(animal_dict)
        
        # Preparar respuesta manual para evitar problemas con relaciones
        response = ListadoDetalleResponse(
            id=listado.id,
            nombre=listado.nombre,
            descripcion=listado.descripcion,
            categoria=listado.categoria,
            is_completed=listado.is_completed,
            created_at=listado.created_at,
            updated_at=listado.updated_at,
            created_by=current_user.id if hasattr(current_user, 'id') else None,
            animales_count=len(animales),
            animales=list(animales)
        )
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener listado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener listado: {str(e)}"
        )


@router.put("/{listado_id}", response_model=ListadoResponse)
async def actualizar_listado(
    listado_update: ListadoUpdate,
    listado_id: int = Path(..., gt=0),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Actualizar un listado existente
    """
    try:
        # Buscar el listado
        listado = await Listado.filter(id=listado_id).first()
        if not listado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listado con ID {listado_id} no encontrado"
            )

        # Actualizar campos básicos
        update_data = listado_update.model_dump(exclude_unset=True, exclude={"animales"})
        if update_data:
            await listado.update_from_dict(update_data).save()

        # Actualizar animales si se proporcionaron
        if listado_update.animales is not None:
            # Obtener relaciones actuales
            await listado.fetch_related("animales")

            # Eliminar todas las relaciones existentes
            for animal in await listado.animales.all():
                await listado.animales.remove(animal)

            # Añadir nuevas relaciones
            for animal_id in listado_update.animales:
                animal = await Animal.filter(id=animal_id).first()
                if not animal:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Animal con ID {animal_id} no encontrado"
                    )
                await listado.animales.add(animal)

        # Refrescar listado y obtener conteo
        await listado.refresh_from_db()
        await listado.fetch_related("animales")
        animales_count = await listado.animales.all().count()

        # Preparar respuesta
        response = ListadoResponse(
            id=listado.id,
            nombre=listado.nombre,
            descripcion=listado.descripcion,
            categoria=listado.categoria,
            is_completed=listado.is_completed,
            created_at=listado.created_at,
            updated_at=listado.updated_at,
            created_by=current_user.id if hasattr(current_user, 'id') else None,
            animales_count=animales_count
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al actualizar listado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar listado: {str(e)}"
        )


@router.delete("/{listado_id}", response_model=dict)
async def eliminar_listado(
    listado_id: int = Path(..., gt=0),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Eliminar un listado
    """
    try:
        # Buscar el listado
        listado = await Listado.filter(id=listado_id).first()
        if not listado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listado con ID {listado_id} no encontrado"
            )

        # Eliminar el listado (las relaciones se eliminarán automáticamente por CASCADE)
        await listado.delete()

        return {"mensaje": f"Listado con ID {listado_id} eliminado correctamente"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al eliminar listado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar listado: {str(e)}"
        )


@router.post("/{listado_id}/animals", response_model=ListadoDetalleResponse)
async def agregar_animales_a_listado(
    animal_ids: List[int],
    listado_id: int = Path(..., gt=0),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Añadir animales a un listado existente
    """
    try:
        # Buscar el listado
        listado = await Listado.filter(id=listado_id).first()
        if not listado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listado con ID {listado_id} no encontrado"
            )

        # Obtener relaciones actuales
        await listado.fetch_related("animales")
        animales_actuales = set([animal.id for animal in await listado.animales.all()])

        # Añadir solo animales que no estén ya en el listado
        for animal_id in animal_ids:
            if animal_id not in animales_actuales:
                animal = await Animal.filter(id=animal_id).first()
                if not animal:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Animal con ID {animal_id} no encontrado"
                    )
                await listado.animales.add(animal)

        # Refrescar listado
        await listado.fetch_related("animales")
        animales = await listado.animales.all()

        # Preparar respuesta
        response = ListadoDetalleResponse(
            id=listado.id,
            nombre=listado.nombre,
            descripcion=listado.descripcion,
            categoria=listado.categoria,
            is_completed=listado.is_completed,
            created_at=listado.created_at,
            updated_at=listado.updated_at,
            created_by=current_user.id if hasattr(current_user, 'id') else None,
            animales_count=len(animales),
            animales=list(animales)
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al agregar animales al listado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al agregar animales al listado: {str(e)}"
        )


@router.delete("/{listado_id}/animals/{animal_id}", response_model=ListadoDetalleResponse)
async def quitar_animal_de_listado(
    listado_id: int = Path(..., gt=0),
    animal_id: int = Path(..., gt=0),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Quitar un animal específico de un listado
    """
    try:
        # Buscar el listado
        listado = await Listado.filter(id=listado_id).first()
        if not listado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listado con ID {listado_id} no encontrado"
            )

        # Buscar el animal
        animal = await Animal.filter(id=animal_id).first()
        if not animal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Animal con ID {animal_id} no encontrado"
            )

        # Quitar la relación
        await listado.fetch_related("animales")
        if animal in await listado.animales.all():
            await listado.animales.remove(animal)

        # Refrescar listado
        await listado.fetch_related("animales")
        animales = await listado.animales.all()

        # Preparar respuesta
        response = ListadoDetalleResponse(
            id=listado.id,
            nombre=listado.nombre,
            descripcion=listado.descripcion,
            categoria=listado.categoria,
            is_completed=listado.is_completed,
            created_at=listado.created_at,
            updated_at=listado.updated_at,
            created_by=current_user.id if hasattr(current_user, 'id') else None,
            animales_count=len(animales),
            animales=list(animales)
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al quitar animal del listado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al quitar animal del listado: {str(e)}"
        )


@router.put("/{listado_id}/animales", response_model=dict)
async def actualizar_animales_listado(
    animales_update: ListadoAnimalesUpdate,
    listado_id: int = Path(..., gt=0),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Actualizar el estado y observaciones de los animales en un listado
    """
    try:
        # Verificar que el listado existe
        listado = await Listado.get_or_none(id=listado_id)
        if not listado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listado con ID {listado_id} no encontrado"
            )
        
        # Actualizar cada animal en el listado
        actualizados = 0
        for animal_data in animales_update.animales:
            # Buscar la relación entre el listado y el animal
            listado_animal = await ListadoAnimal.get_or_none(
                listado_id=listado_id,
                animal_id=animal_data.id
            )
            
            if listado_animal:
                # Actualizar directamente los campos confirmacion y observaciones
                listado_animal.confirmacion = animal_data.confirmacion
                listado_animal.observaciones = animal_data.observaciones or ""
                await listado_animal.save()
                actualizados += 1
        
        return {
            "message": f"Se actualizaron {actualizados} animales en el listado",
            "actualizados": actualizados
        }
    
    except Exception as e:
        logger.error(f"Error al actualizar animales del listado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar animales: {str(e)}"
        )


@router.get("/{listado_id}/export-pdf", response_model=dict)
async def exportar_listado_pdf(
    listado_id: int = Path(..., gt=0),
    config: ExportarListadoConfig = Depends(),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Exportar un listado a PDF

    Nota: Esta función es una versión simplificada y no genera realmente el PDF aún.
    """
    try:
        # Buscar el listado
        listado = await Listado.filter(id=listado_id).first()
        if not listado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listado con ID {listado_id} no encontrado"
            )

        # Obtener animales relacionados
        await listado.fetch_related("animales")

        # Por ahora, sólo devolvemos un mensaje de confirmación
        # La implementación real de la generación PDF se hará en otra fase
        return {
            "mensaje": f"Solicitud de exportación a {config.formato.upper()} recibida para listado '{listado.nombre}'",
            "formato": config.formato,
            "orientacion": config.orientacion,
            "incluir_observaciones": config.incluir_observaciones,
            "animales_count": await listado.animales.all().count()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al exportar listado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al exportar listado: {str(e)}"
        )
