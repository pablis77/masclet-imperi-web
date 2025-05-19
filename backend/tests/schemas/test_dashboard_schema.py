"""
Tests para schemas de Dashboard
"""
import pytest
from pydantic import ValidationError
from datetime import date

from app.schemas.dashboard import (
    AnimalStats, PartoStats, DashboardResponse, DashboardExplotacioResponse
)


def test_animal_stats_schema():
    """Test de validación de AnimalStats schema."""
    # Caso válido con todos los campos
    data = {
        "total": 100,
        "machos": 40,
        "hembras": 60,
        "ratio_m_h": 0.67,
        "por_estado": {"OK": 90, "DEF": 10}
    }
    schema = AnimalStats(**data)
    assert schema.total == 100
    assert schema.machos == 40
    assert schema.hembras == 60
    assert schema.ratio_m_h == 0.67
    assert schema.por_estado["OK"] == 90
    assert schema.por_estado["DEF"] == 10
    
    # Caso inválido: total requerido
    with pytest.raises(ValidationError):
        AnimalStats(machos=40, hembras=60, ratio_m_h=0.67, por_estado={"OK": 90, "DEF": 10})
    
    # Caso inválido: machos requerido
    with pytest.raises(ValidationError):
        AnimalStats(total=100, hembras=60, ratio_m_h=0.67, por_estado={"OK": 90, "DEF": 10})
    
    # Caso inválido: hembras requerido
    with pytest.raises(ValidationError):
        AnimalStats(total=100, machos=40, ratio_m_h=0.67, por_estado={"OK": 90, "DEF": 10})
    
    # Caso inválido: ratio_m_h requerido
    with pytest.raises(ValidationError):
        AnimalStats(total=100, machos=40, hembras=60, por_estado={"OK": 90, "DEF": 10})
    
    # Caso inválido: por_estado requerido
    with pytest.raises(ValidationError):
        AnimalStats(total=100, machos=40, hembras=60, ratio_m_h=0.67)


def test_parto_stats_schema():
    """Test de validación de PartoStats schema."""
    # Caso válido con todos los campos
    data = {
        "total": 50,
        "ultimo_mes": 5,
        "ultimo_año": 30,
        "promedio_mensual": 2.5,
        "por_mes": {"01": 2, "02": 3, "03": 5, "04": 4}
    }
    schema = PartoStats(**data)
    assert schema.total == 50
    assert schema.ultimo_mes == 5
    assert schema.ultimo_año == 30
    assert schema.promedio_mensual == 2.5
    assert schema.por_mes["01"] == 2
    assert schema.por_mes["04"] == 4
    
    # Caso inválido: total requerido
    with pytest.raises(ValidationError):
        PartoStats(ultimo_mes=5, ultimo_año=30, promedio_mensual=2.5, por_mes={"01": 2})
    
    # Caso inválido: ultimo_mes requerido
    with pytest.raises(ValidationError):
        PartoStats(total=50, ultimo_año=30, promedio_mensual=2.5, por_mes={"01": 2})
    
    # Caso inválido: ultimo_año requerido
    with pytest.raises(ValidationError):
        PartoStats(total=50, ultimo_mes=5, promedio_mensual=2.5, por_mes={"01": 2})
    
    # Caso inválido: promedio_mensual requerido
    with pytest.raises(ValidationError):
        PartoStats(total=50, ultimo_mes=5, ultimo_año=30, por_mes={"01": 2})
    
    # Caso inválido: por_mes requerido
    with pytest.raises(ValidationError):
        PartoStats(total=50, ultimo_mes=5, ultimo_año=30, promedio_mensual=2.5)


def test_dashboard_response_schema():
    """Test de validación de DashboardResponse schema."""
    # Caso válido con campos mínimos
    animal_stats = {
        "total": 100,
        "machos": 40,
        "hembras": 60,
        "ratio_m_h": 0.67,
        "por_estado": {"OK": 90, "DEF": 10}
    }
    parto_stats = {
        "total": 50,
        "ultimo_mes": 5,
        "ultimo_año": 30,
        "promedio_mensual": 2.5,
        "por_mes": {"01": 2, "02": 3, "03": 5, "04": 4}
    }
    data = {
        "animales": animal_stats,
        "partos": parto_stats
    }
    schema = DashboardResponse(**data)
    assert schema.animales.total == 100
    assert schema.partos.total == 50
    assert schema.explotacio_id is None
    assert schema.periodo is None
    
    # Caso válido con todos los campos
    data_completo = {
        "animales": animal_stats,
        "partos": parto_stats,
        "explotacio_id": 1,
        "periodo": {"inicio": date(2022, 1, 1), "fin": date(2022, 12, 31)}
    }
    schema_completo = DashboardResponse(**data_completo)
    assert schema_completo.animales.total == 100
    assert schema_completo.partos.total == 50
    assert schema_completo.explotacio_id == 1
    assert schema_completo.periodo["inicio"] == date(2022, 1, 1)
    assert schema_completo.periodo["fin"] == date(2022, 12, 31)
    
    # Caso inválido: animales requerido
    with pytest.raises(ValidationError):
        DashboardResponse(partos=parto_stats)
    
    # Caso inválido: partos requerido
    with pytest.raises(ValidationError):
        DashboardResponse(animales=animal_stats)


def test_dashboard_explotacio_response_schema():
    """Test de validación de DashboardExplotacioResponse schema."""
    # Caso válido con campos mínimos
    animal_stats = {
        "total": 100,
        "machos": 40,
        "hembras": 60,
        "ratio_m_h": 0.67,
        "por_estado": {"OK": 90, "DEF": 10}
    }
    parto_stats = {
        "total": 50,
        "ultimo_mes": 5,
        "ultimo_año": 30,
        "promedio_mensual": 2.5,
        "por_mes": {"01": 2, "02": 3, "03": 5, "04": 4}
    }
    data = {
        "explotacio_id": 1,
        "nombre_explotacio": "Granja Test",
        "animales": animal_stats,
        "partos": parto_stats
    }
    schema = DashboardExplotacioResponse(**data)
    assert schema.explotacio_id == 1
    assert schema.nombre_explotacio == "Granja Test"
    assert schema.animales.total == 100
    assert schema.partos.total == 50
    assert schema.periodo is None
    
    # Caso válido con todos los campos
    data_completo = {
        "explotacio_id": 1,
        "nombre_explotacio": "Granja Test",
        "animales": animal_stats,
        "partos": parto_stats,
        "periodo": {"inicio": date(2022, 1, 1), "fin": date(2022, 12, 31)}
    }
    schema_completo = DashboardExplotacioResponse(**data_completo)
    assert schema_completo.explotacio_id == 1
    assert schema_completo.nombre_explotacio == "Granja Test"
    assert schema_completo.animales.total == 100
    assert schema_completo.partos.total == 50
    assert schema_completo.periodo["inicio"] == date(2022, 1, 1)
    assert schema_completo.periodo["fin"] == date(2022, 12, 31)
    
    # Caso inválido: explotacio_id requerido
    with pytest.raises(ValidationError):
        DashboardExplotacioResponse(
            nombre_explotacio="Granja Test",
            animales=animal_stats,
            partos=parto_stats
        )
    
    # Caso inválido: nombre_explotacio requerido
    with pytest.raises(ValidationError):
        DashboardExplotacioResponse(
            explotacio_id=1,
            animales=animal_stats,
            partos=parto_stats
        )
    
    # Caso inválido: animales requerido
    with pytest.raises(ValidationError):
        DashboardExplotacioResponse(
            explotacio_id=1,
            nombre_explotacio="Granja Test",
            partos=parto_stats
        )
    
    # Caso inválido: partos requerido
    with pytest.raises(ValidationError):
        DashboardExplotacioResponse(
            explotacio_id=1,
            nombre_explotacio="Granja Test",
            animales=animal_stats
        )
