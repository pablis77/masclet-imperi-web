from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class ImportStatus(str, Enum):
    """Estado de una importación"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    COMPLETED_ERR = "completed_err"

class ImportResult(BaseModel):
    """Resultado de una importación"""
    total: int = 0
    success: int = 0
    errors: int = 0
    error_details: Optional[List[Dict[str, Any]]] = None

class ImportCreate(BaseModel):
    """Datos para crear una importación"""
    file_name: str
    file_size: int
    file_type: str = "csv"
    description: Optional[str] = None

class ImportResponse(BaseModel):
    """Respuesta de una importación"""
    id: int
    file_name: str
    file_size: int
    file_type: str
    status: ImportStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    description: Optional[str] = None
    result: Optional[ImportResult] = None

class ImportListResponse(BaseModel):
    """Lista paginada de importaciones"""
    items: List[ImportResponse]
    total: int
    page: int
    size: int
