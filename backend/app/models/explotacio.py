"""
Modelo para explotaciones ganaderas.
"""
from tortoise import fields, models

class Explotacio(models.Model):
    """Modelo de explotación ganadera."""
    nom = fields.CharField(max_length=255)
    activa = fields.BooleanField(default=True)
    explotacio = fields.CharField(max_length=255, null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "explotacions"