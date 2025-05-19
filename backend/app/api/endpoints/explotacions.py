"""
Endpoints para gestionar explotaciones ganaderas.
"""
from typing import List, Optional, Dict, Any
import logging
from fastapi import APIRouter, HTTPException, Query, Depends
from tortoise.expressions import Q
from tortoise.functions import Count

# Importamos el modelo Animal en lugar de Explotacio ya que la tabla explotacio no existe realmente
from app.models.animal import Animal
# Importación de esquemas - Estos deben existir o necesitamos crearlos
from pydantic import BaseModel
from typing import Optional as OptionalType

# Definir los esquemas aquí ya que no tenemos un archivo schemas/explotacio.py
class ExplotacioBase(BaseModel):
    explotacio: str

class ExplotacioCreate(ExplotacioBase):
    pass

class ExplotacioUpdate(ExplotacioBase):
    explotacio: OptionalType[str] = None

class ExplotacioResponse(ExplotacioBase):
    id: int
    
    class Config:
        from_attributes = True
from app.core.auth import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=dict)
async def create_explotacio(explotacio: ExplotacioCreate) -> dict:
    """
    No se pueden crear explotaciones directamente ya que no existe un modelo Explotacio.
    Las explotaciones se crean indirectamente al crear animales con nuevas explotaciones.
    
    Este endpoint está incluido para mantener compatibilidad con la API pero devuelve un mensaje informativo.
    """
    # Verificar si ya existe un animal con esa explotación
    existing = await Animal.filter(explotacio=explotacio.explotacio).first()
    
    return {
        "status": "info",
        "message": "Las explotaciones se crean automáticamente al crear animales",
        "data": {
            "explotacio": explotacio.explotacio,
            "exists": existing is not None
        }
    }

@router.get("/", response_model=dict)
async def list_explotacions(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user)
) -> dict:
    """Lista todas las explotaciones con opciones de búsqueda y paginación."""
    try:
        # Calcular el offset basado en la página (para mantener compatibilidad con el frontend)
        offset = (page - 1) * limit
        
        # Obtener explotaciones desde el modelo Animal
        query = Animal.all().values('explotacio')
        
        # Aplicar filtro de búsqueda si existe
        if search:
            # Logging para depuración
            logger.info(f"Buscando explotaciones que coincidan con: '{search}'")
            # Búsqueda por el campo explotacio
            query = query.filter(Q(explotacio__icontains=search))
        
        # Ejecutar la consulta para obtener explotaciones
        all_animals_explotacions = await query
        
        # Obtener valores únicos usando un conjunto (set)
        unique_explotacions = set()
        for item in all_animals_explotacions:
            explotacio = item.get('explotacio')
            if explotacio:  # Verificar que no sea None o vacío
                unique_explotacions.add(explotacio)
        
        # Convertir de nuevo a lista para poder ordenar y paginar
        all_explotacions = [{'explotacio': exp} for exp in sorted(unique_explotacions)]
        total = len(all_explotacions)
        
        # Paginar los resultados manualmente (ya que estamos trabajando con valores distintos)
        paginated_explotacions = all_explotacions[offset:offset+limit]
        
        # Para cada explotación, obtener información adicional como conteo de animales
        explotacions_data = []
        for exp_data in paginated_explotacions:
            explotacio = exp_data['explotacio']
            if not explotacio:  # Omitir explotaciones vacías
                continue
                
            # Contar animales en esta explotación
            animal_count = await Animal.filter(explotacio=explotacio).count()
            
            # Crear datos de explotación
            explotacions_data.append({
                "explotacio": explotacio,
                "animal_count": animal_count
            })
        
        # Construir respuesta en formato estándar (igual que el endpoint animals)
        result = {
            "status": "success",
            "data": {
                "items": explotacions_data,
                "total": total,
                "page": page,
                "limit": limit,
                "pages": (total + limit - 1) // limit  # Calcular número total de páginas
            }
        }
        
        return result
    except Exception as e:
        logger.error(f"Error listando explotaciones: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{explotacio}", response_model=dict)
async def get_explotacio(explotacio: str) -> dict:
    """
    Obtiene información detallada de una explotación por su identificador único.
    """
    try:
        # Verificar que la explotación existe (buscando animales con esa explotación)
        animals = await Animal.filter(explotacio=explotacio)
        if not animals:
            raise HTTPException(status_code=404, detail=f"Explotación '{explotacio}' no encontrada")
        
        # Contar animales por género
        machos = len([a for a in animals if a.genere == 'M'])
        hembras = len([a for a in animals if a.genere == 'F'])
        
        # Obtener información de la explotación
        result = {
            "status": "success",
            "data": {
                "explotacio": explotacio,
                "total_animales": len(animals),
                "machos": machos,
                "hembras": hembras,
                # Agregar más estadísticas si se necesitan
            }
        }
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo explotación {explotacio}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{explotacio}", response_model=dict)
async def update_explotacio(
    explotacio: str, 
    explotacio_update: ExplotacioUpdate
) -> dict:
    """
    Actualiza el identificador de una explotación, lo que implica actualizar
    todos los animales que pertenecen a esa explotación.
    """
    # Verificar que la explotación existe
    animals = await Animal.filter(explotacio=explotacio)
    if not animals:
        raise HTTPException(status_code=404, detail=f"Explotación '{explotacio}' no encontrada")
    
    # Si se proporciona una nueva explotación, actualizar todos los animales
    if explotacio_update.explotacio and explotacio_update.explotacio != explotacio:
        new_explotacio = explotacio_update.explotacio
        
        # Actualizar todos los animales con la nueva explotación
        for animal in animals:
            animal.explotacio = new_explotacio
            await animal.save()
        
        return {
            "status": "success",
            "message": f"Explotación '{explotacio}' actualizada a '{new_explotacio}'",
            "data": {
                "previous_explotacio": explotacio,
                "new_explotacio": new_explotacio,
                "animals_updated": len(animals)
            }
        }
    
    return {
        "status": "info",
        "message": "No se realizaron cambios",
        "data": {
            "explotacio": explotacio
        }
    }

@router.delete("/{explotacio}", response_model=dict)
async def delete_explotacio(explotacio: str) -> dict:
    """
    Las explotaciones no se pueden eliminar directamente porque no existe una tabla separada.
    Este endpoint está incluido para mantener compatibilidad con la API pero devuelve un mensaje informativo.
    """
    # Verificar que la explotación existe
    animals = await Animal.filter(explotacio=explotacio)
    if not animals:
        raise HTTPException(status_code=404, detail=f"Explotación '{explotacio}' no encontrada")
    
    return {
        "status": "info",
        "message": "Las explotaciones no se pueden eliminar directamente ya que están vinculadas a animales",
        "data": {
            "explotacio": explotacio,
            "animals_count": len(animals)
        }
    }