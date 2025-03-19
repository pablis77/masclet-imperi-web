from fastapi import HTTPException, status
from tortoise import fields, models
from tortoise.contrib.pydantic import pydantic_model_creator
import pandas as pd
from typing import List, Optional
from datetime import datetime
import os

class AnimalDB(models.Model):
    """Modelo Tortoise ORM para Animal"""
    id = fields.IntField(pk=True)
    alletar = fields.CharField(max_length=50, null=True)
    explotacio = fields.CharField(max_length=100)
    nom = fields.CharField(max_length=100)
    genere = fields.CharField(max_length=50)
    pare = fields.CharField(max_length=100, null=True)
    mare = fields.CharField(max_length=100, null=True)
    quadra = fields.CharField(max_length=50, null=True)
    cod = fields.CharField(max_length=50, unique=True)
    num_serie = fields.CharField(max_length=50, null=True)
    dob = fields.DateField(null=True)
    estado = fields.CharField(max_length=50)
    part = fields.DateField(null=True)
    genere_t = fields.CharField(max_length=50, null=True)
    estado_t = fields.CharField(max_length=50, null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "animals"

    def __str__(self):
        return f"{self.nom} ({self.cod})"

class DataService:
    """Servicio de datos para Masclet API"""
    @staticmethod
    async def get_all_animals() -> List[Animal]:
        return await AnimalDB.all()

    @staticmethod
    async def get_animal(cod: str) -> Optional[Animal]:
        return await AnimalDB.get_or_none(cod=cod)

    @staticmethod
    async def create_animal(animal: AnimalCreate) -> Animal:
        # Verificar duplicados
        if await AnimalDB.exists(cod=animal.cod):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Animal with this code already exists"
            )
        
        # Crear animal
        animal_dict = animal.dict()
        db_animal = await AnimalDB.create(**animal_dict)
        return db_animal

    @staticmethod
    async def update_animal(cod: str, animal: AnimalUpdate) -> Optional[Animal]:
        # Encontrar animal
        db_animal = await AnimalDB.get_or_none(cod=cod)
        if not db_animal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Animal not found"
            )
        
        # Actualizar campos
        update_dict = {k: v for k, v in animal.dict().items() if v is not None}
        await db_animal.update_from_dict(update_dict).save()
        return await AnimalDB.get(cod=cod)

    @staticmethod
    async def get_explotacio_stats():
        """Obtener estadísticas por explotación"""
        stats = {}
        animals = await AnimalDB.all()
        df = pd.DataFrame([animal.__dict__ for animal in animals])
        
        for explotacio in df['explotacio'].unique():
            explotacio_df = df[df['explotacio'] == explotacio]
            stats[explotacio] = {
                'total': len(explotacio_df),
                'by_gender': explotacio_df['genere'].value_counts().to_dict(),
                'by_status': explotacio_df['estado'].value_counts().to_dict()
            }
        return stats

    @staticmethod
    async def import_from_csv(file_path: str):
        """Importar datos desde CSV"""
        # Implementar importación con validación y backup
        pass

    @staticmethod
    async def export_to_csv(file_path: str):
        """Exportar datos a CSV"""
        # Implementar exportación
        pass