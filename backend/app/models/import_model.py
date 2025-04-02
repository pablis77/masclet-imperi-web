from tortoise import fields
from tortoise.contrib.pydantic import pydantic_model_creator
from typing import Dict, Any, Optional

from app.models.base import BaseModel
from app.models.enums import ImportStatus


class Import(BaseModel):
    """
    Modelo para almacenar el historial de importaciones
    """
    id = fields.IntField(pk=True)
    file_name = fields.CharField(max_length=255)
    file_size = fields.IntField()
    file_type = fields.CharField(max_length=50)
    description = fields.CharField(max_length=255, null=True)
    status = fields.CharField(max_length=20, default=ImportStatus.PENDING.value)
    result = fields.JSONField(default={})
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    completed_at = fields.DatetimeField(null=True)

    class Meta:
        table = "imports"

    def __str__(self):
        return f"Import(id={self.id}, file={self.file_name}, status={self.status})"
