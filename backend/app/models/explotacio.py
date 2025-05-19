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
    # Identificador técnico (uso interno)
    id = fields.IntField(pk=True)
    
    # Código/identificador de la explotación (ÚNICO IDENTIFICADOR DE NEGOCIO)
    explotacio = fields.CharField(max_length=255, unique=True, null=False)
    
    # Campos de auditoría
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "explotacio"
        
    def __str__(self):
        return f"Explotació: {self.explotacio}"