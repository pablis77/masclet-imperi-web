from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import date

class AnimalStats(BaseModel):
    """Estadísticas básicas de animales"""
    total: int
    machos: int
    hembras: int
    ratio_m_h: float
    por_estado: Dict[str, int]
    por_alletar: Optional[Dict[str, int]] = None
    por_quadra: Optional[Dict[str, int]] = None
    edades: Optional[Dict[str, int]] = None
    
class PartoStats(BaseModel):
    """Estadísticas de partos"""
    total: int
    ultimo_mes: int
    ultimo_año: int
    promedio_mensual: float
    por_mes: Dict[str, int]
    por_genero_cria: Optional[Dict[str, int]] = None
    tasa_supervivencia: Optional[float] = None
    distribucion_anual: Optional[Dict[str, int]] = None
    
class ExplotacioStats(BaseModel):
    """Estadísticas de explotaciones"""
    total: int
    activas: int
    inactivas: int
    por_provincia: Optional[Dict[str, int]] = None
    ranking_partos: Optional[List[Dict[str, Any]]] = None
    ranking_animales: Optional[List[Dict[str, Any]]] = None
    
class ComparativaStats(BaseModel):
    """Estadísticas comparativas temporales"""
    mes_actual_vs_anterior: Optional[Dict[str, float]] = None
    año_actual_vs_anterior: Optional[Dict[str, float]] = None
    tendencia_partos: Optional[Dict[str, Any]] = None
    tendencia_animales: Optional[Dict[str, Any]] = None
    
class DashboardResponse(BaseModel):
    """Respuesta completa del dashboard"""
    animales: AnimalStats
    partos: PartoStats
    explotaciones: Optional[ExplotacioStats] = None
    comparativas: Optional[ComparativaStats] = None
    explotacio: Optional[str] = None
    nombre_explotacio: Optional[str] = None
    periodo: Optional[Dict[str, date]] = None
    
class DashboardExplotacioResponse(BaseModel):
    """Respuesta de dashboard para una explotación específica"""
    explotacio: str
    nombre_explotacio: str
    animales: AnimalStats
    partos: PartoStats
    comparativas: Optional[ComparativaStats] = None
    periodo: Optional[Dict[str, date]] = None

class PartosResponse(BaseModel):
    """Respuesta detallada para el análisis de partos"""
    total: int
    por_mes: Dict[str, int]
    por_genero_cria: Dict[str, int]
    tasa_supervivencia: float
    distribucion_anual: Dict[str, int]
    tendencia: Dict[str, float]
    por_animal: Optional[List[Dict[str, Any]]] = None
    ultimo_mes: int
    ultimo_año: int
    promedio_mensual: float
    explotacio: Optional[str] = None
    periodo: Optional[Dict[str, date]] = None

class CombinedDashboardResponse(BaseModel):
    """Respuesta combinada de todas las estadísticas"""
    animales: AnimalStats
    partos: PartoStats
    explotaciones: Optional[ExplotacioStats] = None
    comparativas: ComparativaStats
    por_quadra: Dict[str, Dict[str, Any]]
    rendimiento_partos: Dict[str, float]
    tendencias: Dict[str, Dict[str, float]]
    explotacio: Optional[str] = None
    nombre_explotacio: Optional[str] = None
    periodo: Dict[str, date]
