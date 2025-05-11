import logging
from fastapi import APIRouter, HTTPException
from app.models.animal import Animal, Part
# Nota: No requerimos autenticación para diagnóstico (solo en desarrollo)

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/partos-debug")
async def get_partos_debug():
    """
    Endpoint de diagnóstico para obtener todos los partos sin filtros.
    """
    try:
        # Obtener todos los partos directamente
        partos = await Part.all()
        
        # Convertir a lista de diccionarios para la respuesta
        result = []
        for parto in partos:
            animal = await parto.animal.get()
            result.append({
                "id": parto.id,
                "animal_id": parto.animal_id,
                "animal_nom": animal.nom if animal else "N/A",
                "part": str(parto.part) if parto.part else None,
                "GenereT": parto.GenereT,
                "EstadoT": parto.EstadoT,
                "numero_part": parto.numero_part,
                "created_at": str(parto.created_at) if parto.created_at else None,
            })
        
        return {
            "total_partos": len(result),
            "partos": result
        }
    except Exception as e:
        logger.error(f"Error en get_partos_debug: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/dashboard-debug")
async def get_dashboard_debug():
    """
    Endpoint de diagnóstico para obtener estadísticas simples del dashboard.
    """
    try:
        # Contar animales y partos
        total_animales = await Animal.all().count()
        total_machos = await Animal.filter(genere="M").count()
        total_hembras = await Animal.filter(genere="F").count()
        total_partos = await Part.all().count()
        
        # Estadísticas básicas
        return {
            "total_animales": total_animales,
            "total_machos": total_machos,
            "total_hembras": total_hembras,
            "total_partos": total_partos,
            "partos_por_genero": {
                "M": await Part.filter(GenereT="M").count(),
                "F": await Part.filter(GenereT="F").count(),
                "esforrada": await Part.filter(GenereT="esforrada").count()
            },
            "partos_por_estado": {
                "OK": await Part.filter(EstadoT="OK").count(),
                "DEF": await Part.filter(EstadoT="DEF").count()
            }
        }
    except Exception as e:
        logger.error(f"Error en get_dashboard_debug: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
