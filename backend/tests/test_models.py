"""
Modelos utilizados para testing
"""
from datetime import datetime, date
from tortoise import fields, Model
from app.core.date_utils import DateField

class TestModel(Model):
    """Modelo de prueba para DateField"""
    id = fields.IntField(pk=True)
    date = fields.DateField()  # Campo fecha estándar
    
    class Meta:
        table = "test_dates"
        app = "test_models"

class TestDateFieldModel(Model):
    """Modelo específico para probar nuestro DateField personalizado"""
    id = fields.IntField(pk=True)
    date = DateField()  # Campo fecha personalizado
    created_at = fields.DatetimeField(auto_now_add=True)  # Campo timestamp automático
    updated_at = fields.DatetimeField(auto_now=True)  # Campo timestamp automático
    
    class Meta:
        table = "test_custom_dates"
        app = "test_models"

    def __str__(self):
        return f"TestDate(id={self.id}, date={self.date})"