from tortoise import fields, models
from datetime import datetime

class AnimalHistory(models.Model):
    id = fields.IntField(pk=True)
    animal_id = fields.IntField()
    field_name = fields.CharField(max_length=50)
    old_value = fields.CharField(max_length=255)
    new_value = fields.CharField(max_length=255)
    changed_at = fields.DatetimeField(auto_now_add=True)
    changed_by = fields.CharField(max_length=50)  # Para cuando tengamos usuarios

    class Meta:
        table = "animal_history"