from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Query
from typing import List, Optional, Dict, Union
from datetime import datetime
import pandas as pd
import io
from app.models import Animal, Estat, Genere, Part  # 👈 Cambio de Parto a Part
from app.models.animal_history import AnimalHistory
from app.schemas.animal import (
    AnimalCreate, 
    AnimalUpdate, 
    AnimalResponse, 
    AnimalDetail, 
    ExplotacioResponse, 
    AnimalListItem
)
from app.core.messages import APIMessage, MessageType, MessageResponse
from app.core.config import Settings

router = APIRouter()

@router.post("/animals", response_model=Dict, status_code=status.HTTP_201_CREATED)
async def create_animal(animal: AnimalCreate) -> MessageResponse:
    """Crea un nuevo animal (Nueva Ficha)"""
    try:
        new_animal = await Animal.create(**animal.dict())
        return MessageResponse(
            type=MessageType.SUCCESS,
            message="Animal creado correctamente",
            data={"animal": new_animal},
            duration=3000,
            position="bottom-center"
        )
    except Exception as e:
        return MessageResponse(
            type=MessageType.ERROR,
            message=f"Error: {str(e)}",
            duration=5000,  # Errores visibles más tiempo
            position="bottom-center"
        )

@router.get("/animals", 
    response_model=List[dict],
    operation_id="get_animals_list"  # ID único
)
async def get_animals_list(
    explotacio: Optional[str] = None,
    estado: Optional[str] = None,
    alletar: Optional[bool] = None,
    with_stats: bool = False
):
    """Lista de animales con filtros y estadísticas opcionales"""
    query = Animal.all().prefetch_related('parts')
    
    # Aplicar filtros
    if explotacio:
        query = query.filter(explotacio=explotacio)
    if estado:
        query = query.filter(estado=estado)
    if alletar is not None:
        query = query.filter(alletar=alletar)

    animals = await query

    # Calcular estadísticas si se solicitan
    stats = None
    if with_stats:
        stats = {
            "total": len(animals),
            "adultos": len([a for a in animals if not a.alletar]),
            "crias": len([a for a in animals if a.alletar]),
            "por_genero": {
                "M": len([a for a in animals if a.genere == Genere.MASCLE]),
                "F": len([a for a in animals if a.genere == Genere.FEMELLA])
            }
        }

    return {
        "animals": [{
            "alletar": "si" if a.alletar else "no",
            "explotacio": a.explotacio,
            "nom": a.nom,
            "genere": a.genere,
            "cod": a.cod,
            "estado": a.estado,
            "parts": [
                {
                    "fecha": p.data.strftime('%d/%m/%Y'),
                    "genere_fill": p.genere_fill,
                    "estat_fill": p.estat_fill
                } for p in a.parts
            ]
        } for a in animals],
        "stats": stats
    }

@router.get("/animals/{animal_id}", 
    response_model=AnimalResponse,
    operation_id="get_animal_detail"  # ID único
)
async def get_animal_detail(animal_id: int):
    """Obtiene detalles completos de un animal incluyendo partos"""
    animal = await Animal.get_or_none(id=animal_id).prefetch_related('parts')
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    
    # Incluir información de partos y amamantamiento
    return {
        **animal.dict(),
        "num_partos": len(animal.parts),
        "ultimo_parto": animal.parts[-1] if animal.parts else None,
        "estado_alletar": {
            "alletar": animal.alletar,
             "fecha_inicio": animal.parts[-1].data if animal.parts else None,
            "cria_actual": {
                "genere": animal.parts[-1].genere_fill if animal.parts else None,
                "estat": animal.parts[-1].estat_fill if animal.parts else None
            } if animal.parts else None
        } if animal.alletar else None
    }

@router.get("/animals/{animal_id}", response_model=AnimalResponse)
async def get_animal(animal_id: int):
    """Obtiene detalles de un animal específico"""
    animal = await Animal.get_or_none(id=animal_id).prefetch_related('partos')
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    return animal

@router.put("/animals/{animal_id}", response_model=AnimalResponse)
async def update_animal(animal_id: int, animal_data: AnimalUpdate):
    """Actualiza un animal y registra el histórico"""
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    
    # Guardar datos antiguos
    old_data = await animal.to_dict()
    
    # Actualizar
    await animal.update_from_dict(animal_data.dict(exclude_unset=True))
    await animal.save()
    
    # Registrar cambios
    new_data = await animal.to_dict()
    for field, new_value in new_data.items():
        if field in old_data and old_data[field] != new_value:
            await AnimalHistory.create(
                animal_id=animal_id,
                field_name=field,
                old_value=str(old_data[field]),
                new_value=str(new_value)
            )
    
    return animal

@router.delete("/animals/{animal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_animal(animal_id: int):
    """Elimina un animal (solo admin)"""
    deleted = await Animal.filter(id=animal_id).delete()
    if not deleted:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    return {"message": "Animal eliminado correctamente"}

@router.get("/animals/{animal_id}/history")
async def get_animal_history(animal_id: int):
    """Obtiene el histórico de cambios de un animal"""
    history = await AnimalHistory.filter(animal_id=animal_id).order_by("-changed_at")
    return history

@router.get("/animals/search")
async def search_animals(
    nom: str = None, 
    explotacio: str = None
):
    """Búsqueda de animales por nombre o explotación"""
    if nom:
        return await get_animal_details(nom)
    elif explotacio:
        return await get_explotacion_animals(explotacio)
    raise HTTPException(status_code=400, detail="Se requiere nom o explotacio")

@router.get("/animals/{animal_id}/full")
async def get_animal_details(animal_id: int):
    """Obtiene detalles completos de un animal incluyendo partos"""
    animal = await Animal.get_or_none(id=animal_id).prefetch_related('partos')
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    return animal

@router.get("/animals/{nom}")
async def get_animal_details(nom: str):
    """Obtiene ficha completa de un animal"""
    animal = await Animal.get_or_none(nom=nom).prefetch_related('partos')
    if not animal:
        raise HTTPException(status_code=404, detail="Fitxa no trobada")
    
    return {
        "general": {
            "explotacio": animal.explotacio,
            "nom": animal.nom,
            "genere": animal.genere,
            "pare": animal.pare,
            "mare": animal.mare,
            "quadra": animal.quadra,
            "cod": animal.cod,
            "num_serie": animal.num_serie,
            "dob": animal.dob,
            "estado": animal.estado,
            "alletar": animal.alletar
        },
        "partos": [{
            "fecha": parto.fecha,
            "genere": parto.genere,
            "estado": parto.estado
        } for parto in animal.partos]
    }

@router.get("/explotacions/{explotacio}", response_model=Dict)
async def get_explotacion_details(explotacio: str):
    """
    Obtiene lista de explotación con formato:
    Llista d'explotació: NOMBRE
    (toros/vacas/terneros)
    """
    stats = await Animal.get_explotacion_stats(explotacio)
    animales = await Animal.get_explotacion_list(explotacio)
    
    return {
        "titulo": f"Llista d'explotació: {explotacio.upper()}",
        "stats": stats["stats_string"],
        "timestamp": datetime.now().strftime("%H:%M %d/%m/%Y"),
        "animales": animales,
        "totales": stats["desglose"]
    }

@router.get("/explotacions/{explotacio}/pdf")
async def generate_explotacion_pdf(explotacio: str):
    """Genera PDF de la explotación"""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
    
    data = await get_explotacion_details(explotacio)
    # TODO: Implementar generación PDF similar a la original

@router.get("/animals/{id}", response_model=Union[AnimalResponse, MessageResponse])
async def get_animal(id: int):
    """Obtiene detalles de un animal por ID"""
    animal = await Animal.get_or_none(id=id).prefetch_related('partos')
    if not animal:
        return MessageResponse(
            message="Animal no trobat",
            type=MessageType.ERROR,
            status_code=404
        )
    return animal

@router.get("/animals/by-name/{nom}", response_model=AnimalDetail)
async def get_animal_by_name(nom: str):
    """Obtiene ficha completa de un animal por nombre"""
    animal = await Animal.get_or_none(nom=nom).prefetch_related('partos')
    if not animal:
        raise HTTPException(
            status_code=404, 
            detail="Fitxa no trobada"
        )
    return AnimalDetail.from_orm(animal)

@router.get("/explotacions/{explotacio}", response_model=ExplotacioResponse)
async def get_explotacion_details(explotacio: str):
    """Obtiene lista y estadísticas de una explotación"""
    animales = await Animal.filter(explotacio=explotacio).prefetch_related('partos')
    
    stats = {
        "machos": len([a for a in animales if a.genere == Genere.M and a.estado != Estat.DEF]),
        "hembras": len([a for a in animales if a.genere == Genere.F and a.estado != Estat.DEF]),
        "terneros": len([a for a in animales if a.alletar and a.estado != Estat.DEF]),
        "fecha": datetime.now().strftime("%H:%M %d/%m/%Y")
    }
    
    return ExplotacioResponse(
        stats=stats,
        animales=[{
            "nom": animal.nom,
            "cod": animal.cod,
            "dob": animal.dob,
            "genere": animal.genere,
            "estado": animal.estado,
            "alletar": animal.alletar,
            "num_partos": len(await animal.partos)
        } for animal in animales]
    )

@router.get("/stats/explotacio")
async def get_explotacio_stats():
    """
    Réplica mejorada de las estadísticas del Excel:
    - Stats por explotación
    - Conteos por género/estado
    - Información de partos
    """
    stats = {}
    
    # Get unique explotacions
    explotacions = await Animal.all().distinct().values_list('explotacio', flat=True)
    
    for explotacio in explotacions:
        animals = await Animal.filter(explotacio=explotacio)
        total_parts = await Part.filter(animal__explotacio=explotacio).count()
        
        stats[explotacio] = {
            "total": len(animals),
            "by_gender": {
                "M": await Animal.filter(explotacio=explotacio, genere="M").count(),
                "F": await Animal.filter(explotacio=explotacio, genere="F").count()
            },
            "by_status": {
                "OK": await Animal.filter(explotacio=explotacio, estado="OK").count(),
                "DEF": await Animal.filter(explotacio=explotacio, estado="DEF").count()
            },
            "total_parts": total_parts
        }
    
    return stats

@router.get("/", response_model=List[AnimalResponse])
async def get_animals():
    """Obtener todos los animales"""
    animals = await Animal.all()
    return [AnimalResponse.model_validate(animal) for animal in animals]

@router.post("/", response_model=AnimalResponse)
async def create_animal(animal: AnimalCreate):
    return await Animal.create(**animal.model_dump())

@router.post("/imports/")
async def import_csv(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(
        io.StringIO(contents.decode('iso-8859-1')),
        sep=';',
        na_filter=False
    )
    
    for _, row in df.iterrows():
        await Animal.create(
            alletar=row["Alletar"].lower() == "si" if row["Alletar"] else None,
            explotacio=row["explotació"],
            nom=row["NOM"],
            genere=Genere.FEMELLA if row["Genere"] == "F" else Genere.MASCLE,
            pare=row["Pare"] or None,
            mare=row["Mare"] or None,
            quadra=row["Quadra"] if row["Quadra"] != "n/a" else None,
            cod=str(row["COD"]).strip(),
            num_serie=row["Nº Serie"] or None,
            dob=parse_date(row["DOB"]),
            estado=Estat.OK if row["Estado"] == "OK" else Estat.FALLECIDO
        )

@router.get("/animals")
async def get_animals(
    explotacio: Optional[str] = None,
    estado: Optional[str] = None,
    alletar: Optional[bool] = None
):
    """
    Endpoint principal que replica exactamente la vista del Excel.
    Sin florituras, directo al grano 👌
    """
    query = Animal.all()
    
    # Filtros que ya usaban
    if explotacio:
        query = query.filter(explotacio=explotacio)
    if estado:
        query = query.filter(estado=estado)
    if alletar is not None:
        query = query.filter(alletar=alletar)

    animals = await query.prefetch_related('parts')
    
    # Formato igual que el Excel
    return [{
        "Alletar": "si" if a.alletar else "no",
        "explotació": a.explotacio,
        "NOM": a.nom,
        "Genere": a.genere,
        "COD": a.cod,
        "Estado": a.estado,
        "parts": [
            f"{p.data.strftime('%d/%m/%Y')} - {p.genere_fill}"
            for p in a.parts
        ]
    } for a in animals]

@router.get("/explotacio")
async def get_explotacions():
    """Lista simple de explotaciones como usaban antes"""
    return await Animal.all().distinct().values_list('explotacio', flat=True)

@router.get("/{animal_id}", response_model=AnimalResponse)
async def get_animal(animal_id: int):
    """Obtener un animal por ID"""
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    return AnimalResponse.model_validate(animal)

@router.get("/search/", response_model=List[AnimalResponse])
async def search_animals(q: str):
    """Buscar animales por nombre"""
    animals = await Animal.filter(nom__icontains=q)
    return [AnimalResponse.model_validate(animal) for animal in animals]

@router.get("/{animal_id}/parts", response_model=List[dict])
async def get_animal_parts(animal_id: int):
    """Obtener partos de un animal"""
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    return await Part.filter(animal_id=animal_id)

@router.get("/search", response_model=List[AnimalResponse])
async def search_animals(
    q: str = Query(None, description="Término de búsqueda"),
    field: str = Query("nom", description="Campo de búsqueda: nom, explotacio, cod")
) -> List[AnimalResponse]:
    """Búsqueda flexible de animales"""
    if not q:
        return []
    
    filters = {}
    if field == "nom":
        filters["nom__icontains"] = q
    elif field == "explotacio":
        filters["explotacio__icontains"] = q
    elif field == "cod":
        filters["cod__icontains"] = q
    else:
        raise HTTPException(400, f"Campo de búsqueda '{field}' no válido")

    animals = await Animal.filter(**filters)
    return [AnimalResponse.model_validate(a) for a in animals]

@router.get("/search")
async def search_animals(q: str):
    """Búsqueda de animales por nombre"""
    try:
        animals = await Animal.filter(nom__icontains=q)
        return [
            {
                "id": a.id,
                "nom": a.nom,
                "genere": a.genere,
                "estado": a.estado,
                "explotacio": a.explotacio
            }
            for a in animals
        ]
    except Exception as e:
        logger.error(f"Error en búsqueda: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error en búsqueda: {str(e)}"
        )