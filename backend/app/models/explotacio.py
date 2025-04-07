"""
Modelo para explotaciones ganaderas.
"""
from tortoise import fields, models

class Explotacio(models.Model):
    """
    NOTA: Modelo de referencia únicamente - NO USADO EN BASE DE DATOS
    La tabla explotacions o explotacio no existe realmente en la base de datos.
    Los datos de explotación se guardan como texto directamente en la tabla animals.
    Este modelo se mantiene como referencia para el código.
    
    IMPORTANTE: Reglas de nomenclatura en el sistema:
    - 'explotacio' es el identificador único y obligatorio que identifica la explotación
    - 'id' es un campo técnico generado automáticamente por la base de datos
    
    Las explotaciones sirven para agrupar animales.
    """
    # Código/identificador de la explotación (es el único nombre/identificador)
    id = fields.IntField(pk=True)
    explotacio = fields.CharField(max_length=255, unique=True)
    
    # Campos de auditoría
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        # Tabla marcada como abstracta para que no se generen migraciones para ella
        abstract = True
        # La tabla real no existe, pero dejamos constancia del nombre previamente usado
        # table = "explotacio"