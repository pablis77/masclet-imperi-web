"""
Schemas para respuestas estándar
"""
from typing import List, Generic, TypeVar, Optional, Dict, Any
from pydantic import BaseModel

T = TypeVar('T')

class ListResponse(BaseModel, Generic[T]):
    """Respuesta para listados paginados"""
    items: List[T]
    total: int
    offset: int
    limit: int

class StandardResponse(BaseModel, Generic[T]):
    """Respuesta estándar de la API"""
    success: bool
    message: str
    data: Optional[T] = None