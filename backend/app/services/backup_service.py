from datetime import datetime
import os
import json
from typing import List
from app.models.animal import Animal
from fastapi import APIRouter

router = APIRouter()

@router.get("/animals/search")
@router.get("/animals/{id}")
@router.get("/explotacions/{explotacio}")
@router.post("/animals")
@router.put("/animals/{id}")
@router.post("/imports/csv")
@router.post("/auth/login")
@router.get("/users/me/permissions")

class BackupService:
    MAX_BACKUPS = 4
    
    @staticmethod
    async def create_backup() -> str:
        """Crea un backup de los datos actuales"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"backup_{timestamp}.json"
        
        # Obtener todos los animales con sus relaciones
        animals = await Animal.all().prefetch_related('partos')
        data = [await animal.to_dict() for animal in animals]
        
        # Asegurar que existe el directorio de backups
        if not os.path.exists('backups'):
            os.makedirs('backups', exist_ok=True)
        
        # Guardar backup
        backup_path = os.path.join('backups', filename)
        with open(backup_path, 'w') as f:
            json.dump(data, f)
            
        # Mantener solo los últimos 4 backups
        await BackupService.rotate_backups()
        
        return filename

    @staticmethod
    async def rotate_backups():
        """Mantiene solo los últimos 4 backups"""
        backups = sorted([f for f in os.listdir('backups') if f.startswith('backup_')])
        while len(backups) > BackupService.MAX_BACKUPS:
            os.remove(os.path.join('backups', backups.pop(0)))