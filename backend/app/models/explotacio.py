"""
Modelo para explotaciones ganaderas.
"""
from tortoise import fields, models

class Explotacio(models.Model):
    """
    Modelo de explotación ganadera.
    
    IMPORTANTE: Reglas de nomenclatura en el sistema:
    - 'explotacio' es el identificador único y obligatorio que identifica la explotación
    - 'id' es un campo técnico generado automáticamente por la base de datos
    
    Las explotaciones sirven para agrupar animales.
    """
    # Código/identificador de la explotación (es el único nombre/identificador)
    explotacio = fields.CharField(max_length=255)
    
    # Campos de auditoría
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "explotacions"