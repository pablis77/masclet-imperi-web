# routers/animals.py
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import date
from ..models import Animal, AnimalCreate, AnimalUpdate
from ..services.database import DataService
from ..services.auth import get_current_user

router = APIRouter(prefix="/animals", tags=["animals"])

@router.get("/", response_model=List[Animal])
async def get_animals(
    explotacio: Optional[str] = Query(None, description="Filtrar por explotación"),
    alletar: Optional[str] = Query(None, description="Filtrar por estado de amamantamiento"),
    genere: Optional[str] = Query(None, description="Filtrar por género"),
    current_user: User = Depends(get_current_user)
):
    """Obtener lista de animales con filtros opcionales"""
    return await DataService.get_all_animals(
        explotacio=explotacio,
        alletar=alletar,
        genere=genere
    )

@router.post("/", response_model=Animal)
async def create_animal(
    animal: AnimalCreate,
    current_user: User = Depends(get_current_user)
):
    """Crear un nuevo animal"""
    if not current_user.can_edit:
        raise HTTPException(status_code=403, detail="No tiene permisos de edición")
    return await DataService.create_animal(animal)

@router.get("/{animal_id}", response_model=Animal)
async def get_animal(
    animal_id: str,
    current_user: User = Depends(get_current_user)
):
    """Obtener un animal por su ID"""
    animal = await DataService.get_animal(animal_id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    return animal

@router.put("/{animal_id}", response_model=Animal)
async def update_animal(
    animal_id: str,
    animal: AnimalUpdate,
    current_user: User = Depends(get_current_user)
):
    """Actualizar un animal existente"""
    if not current_user.can_edit:
        raise HTTPException(status_code=403, detail="No tiene permisos de edición")
    
    updated_animal = await DataService.update_animal(animal_id, animal)
    if not updated_animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    return updated_animal

@router.delete("/{animal_id}")
async def delete_animal(
    animal_id: str,
    current_user: User = Depends(get_current_user)
):
    """Eliminar un animal"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Se requieren permisos de administrador")
    
    success = await DataService.delete_animal(animal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    return {"message": "Animal eliminado correctamente"}

# routers/dashboard.py
from fastapi import APIRouter, Depends
from ..services.database import DataService
from ..services.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats/explotacion")
async def get_explotacion_stats(
    current_user: User = Depends(get_current_user)
):
    """Obtener estadísticas por explotación"""
    return await DataService.get_explotacio_stats()

@router.get("/stats/genero")
async def get_gender_stats(
    current_user: User = Depends(get_current_user)
):
    """Obtener estadísticas por género"""
    return await DataService.get_gender_stats()

@router.get("/stats/alletar")
async def get_alletar_stats(
    current_user: User = Depends(get_current_user)
):
    """Obtener estadísticas de amamantamiento"""
    return await DataService.get_alletar_stats()

# routers/default.py
from fastapi import APIRouter
from ..services.health import check_health

router = APIRouter()

@router.get("/health")
async def health_check():
    """Verificar estado del servicio"""
    return await check_health()

# main.py
from fastapi import FastAPI
from .routers import animals, dashboard, default
from .services.database import init_db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Masclet Imperi API",
    description="API para la gestión de animales del Masclet Imperi",
    version="0.1.0",
    openapi_tags=[
        {"name": "animals", "description": "Operaciones con animales"},
        {"name": "dashboard", "description": "Estadísticas y métricas"},
    ]
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configura según tus necesidades
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(animals.router)
app.include_router(dashboard.router)
app.include_router(default.router)

@app.on_event("startup")
async def startup_event():
    """Inicializar la base de datos al arrancar"""
    await init_db()