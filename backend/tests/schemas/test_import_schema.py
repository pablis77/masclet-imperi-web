"""
Tests para schemas de importación
"""
import pytest
from pydantic import ValidationError
from datetime import datetime

from app.schemas.import_schema import (
    ImportStatus, ImportResult, ImportCreate, 
    ImportResponse, ImportListResponse
)


def test_import_status_enum():
    """Test de validación de ImportStatus enum."""
    assert ImportStatus.PENDING == "pending"
    assert ImportStatus.PROCESSING == "processing"
    assert ImportStatus.COMPLETED == "completed"
    assert ImportStatus.FAILED == "failed"
    
    # Verificar que se puede convertir desde string
    assert ImportStatus("pending") == ImportStatus.PENDING
    assert ImportStatus("processing") == ImportStatus.PROCESSING
    assert ImportStatus("completed") == ImportStatus.COMPLETED
    assert ImportStatus("failed") == ImportStatus.FAILED
    
    # Verificar que lanza error con valor inválido
    with pytest.raises(ValueError):
        ImportStatus("invalid_status")


def test_import_result_schema():
    """Test de validación de ImportResult schema."""
    # Caso con valores por defecto
    result = ImportResult()
    assert result.total == 0
    assert result.success == 0
    assert result.errors == 0
    assert result.error_details is None
    
    # Caso con valores personalizados
    data = {
        "total": 100,
        "success": 95,
        "errors": 5,
        "error_details": [
            {"row": 10, "message": "Campo requerido faltante"},
            {"row": 25, "message": "Formato de fecha inválido"}
        ]
    }
    result_custom = ImportResult(**data)
    assert result_custom.total == 100
    assert result_custom.success == 95
    assert result_custom.errors == 5
    assert len(result_custom.error_details) == 2
    assert result_custom.error_details[0]["row"] == 10
    assert result_custom.error_details[1]["message"] == "Formato de fecha inválido"
    
    # Caso con error_details vacío
    result_empty_errors = ImportResult(total=50, success=50, errors=0, error_details=[])
    assert result_empty_errors.total == 50
    assert result_empty_errors.error_details == []


def test_import_create_schema():
    """Test de validación de ImportCreate schema."""
    # Caso con campos mínimos
    data_min = {
        "file_name": "animales.csv",
        "file_size": 1024
    }
    create_min = ImportCreate(**data_min)
    assert create_min.file_name == "animales.csv"
    assert create_min.file_size == 1024
    assert create_min.file_type == "csv"  # Valor por defecto
    assert create_min.description is None
    
    # Caso con todos los campos
    data_full = {
        "file_name": "animales.xlsx",
        "file_size": 2048,
        "file_type": "excel",
        "description": "Importación de animales desde Excel"
    }
    create_full = ImportCreate(**data_full)
    assert create_full.file_name == "animales.xlsx"
    assert create_full.file_size == 2048
    assert create_full.file_type == "excel"
    assert create_full.description == "Importación de animales desde Excel"
    
    # Caso inválido: file_name requerido
    with pytest.raises(ValidationError):
        ImportCreate(file_size=1024)
    
    # Caso inválido: file_size requerido
    with pytest.raises(ValidationError):
        ImportCreate(file_name="test.csv")


def test_import_response_schema():
    """Test de validación de ImportResponse schema."""
    # Fechas para pruebas
    now = datetime.now()
    
    # Caso con campos mínimos
    data_min = {
        "id": 1,
        "file_name": "animales.csv",
        "file_size": 1024,
        "file_type": "csv",
        "status": ImportStatus.PENDING,
        "created_at": now
    }
    response_min = ImportResponse(**data_min)
    assert response_min.id == 1
    assert response_min.file_name == "animales.csv"
    assert response_min.file_size == 1024
    assert response_min.file_type == "csv"
    assert response_min.status == ImportStatus.PENDING
    assert response_min.created_at == now
    assert response_min.updated_at is None
    assert response_min.completed_at is None
    assert response_min.description is None
    assert response_min.result is None
    
    # Caso con todos los campos
    result_data = ImportResult(total=100, success=95, errors=5)
    data_full = {
        "id": 2,
        "file_name": "animales.xlsx",
        "file_size": 2048,
        "file_type": "excel",
        "status": ImportStatus.COMPLETED,
        "created_at": now,
        "updated_at": now,
        "completed_at": now,
        "description": "Importación de animales desde Excel",
        "result": result_data
    }
    response_full = ImportResponse(**data_full)
    assert response_full.id == 2
    assert response_full.file_name == "animales.xlsx"
    assert response_full.file_size == 2048
    assert response_full.file_type == "excel"
    assert response_full.status == ImportStatus.COMPLETED
    assert response_full.created_at == now
    assert response_full.updated_at == now
    assert response_full.completed_at == now
    assert response_full.description == "Importación de animales desde Excel"
    assert response_full.result.total == 100
    assert response_full.result.success == 95
    assert response_full.result.errors == 5
    
    # Caso inválido: id requerido
    with pytest.raises(ValidationError):
        ImportResponse(
            file_name="test.csv",
            file_size=1024,
            file_type="csv",
            status=ImportStatus.PENDING,
            created_at=now
        )
    
    # Caso inválido: status debe ser un ImportStatus válido
    with pytest.raises(ValidationError):
        ImportResponse(
            id=1,
            file_name="test.csv",
            file_size=1024,
            file_type="csv",
            status="invalid_status",
            created_at=now
        )


def test_import_list_response_schema():
    """Test de validación de ImportListResponse schema."""
    # Crear un ImportResponse para la lista
    now = datetime.now()
    import_response = ImportResponse(
        id=1,
        file_name="animales.csv",
        file_size=1024,
        file_type="csv",
        status=ImportStatus.PENDING,
        created_at=now
    )
    
    # Caso válido
    data = {
        "items": [import_response],
        "total": 1,
        "page": 1,
        "size": 10
    }
    list_response = ImportListResponse(**data)
    assert len(list_response.items) == 1
    assert list_response.items[0].id == 1
    assert list_response.items[0].file_name == "animales.csv"
    assert list_response.total == 1
    assert list_response.page == 1
    assert list_response.size == 10
    
    # Caso con lista vacía
    data_empty = {
        "items": [],
        "total": 0,
        "page": 1,
        "size": 10
    }
    list_empty = ImportListResponse(**data_empty)
    assert len(list_empty.items) == 0
    assert list_empty.total == 0
    
    # Caso inválido: items requerido
    with pytest.raises(ValidationError):
        ImportListResponse(total=0, page=1, size=10)
    
    # Caso inválido: total requerido
    with pytest.raises(ValidationError):
        ImportListResponse(items=[], page=1, size=10)
    
    # Caso inválido: page requerido
    with pytest.raises(ValidationError):
        ImportListResponse(items=[], total=0, size=10)
    
    # Caso inválido: size requerido
    with pytest.raises(ValidationError):
        ImportListResponse(items=[], total=0, page=1)
