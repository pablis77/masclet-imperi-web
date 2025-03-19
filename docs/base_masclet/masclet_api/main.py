# app/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from app.models import Animal, User, AnimalCreate, AnimalUpdate
from app.auth import get_current_user, create_access_token
from app.database import DataManager

app = FastAPI(title="Masclet Imperi API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DataManager
data_manager = DataManager()

@app.get("/animals/", response_model=List[Animal])
async def get_animals(
    current_user: User = Depends(get_current_user),
    explotacio: Optional[str] = None,
    estado: Optional[str] = None
):
    """Get all animals with optional filtering"""
    try:
        animals = data_manager.get_all_animals()
        if explotacio:
            animals = [a for a in animals if a.explotacio == explotacio]
        if estado:
            animals = [a for a in animals if a.estado == estado]
        return animals
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/animals/{cod}", response_model=Animal)
async def get_animal(
    cod: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific animal by its code"""
    animal = data_manager.get_animal(cod)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    return animal

@app.post("/animals/", response_model=Animal)
async def create_animal(
    animal: AnimalCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new animal record"""
    if not current_user.can_edit:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    try:
        return data_manager.create_animal(animal)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/animals/{cod}", response_model=Animal)
async def update_animal(
    cod: str,
    animal: AnimalUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update an existing animal record"""
    if not current_user.can_edit:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    try:
        updated_animal = data_manager.update_animal(cod, animal)
        if not updated_animal:
            raise HTTPException(status_code=404, detail="Animal not found")
        return updated_animal
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/stats/explotacio")
async def get_explotacio_stats(
    current_user: User = Depends(get_current_user)
):
    """Get statistics per exploitation"""
    try:
        return data_manager.get_explotacio_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))