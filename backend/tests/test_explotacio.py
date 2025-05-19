"""
Tests para el modelo Explotacio.
"""
import pytest
from app.models.explotacio import Explotacio

pytestmark = pytest.mark.asyncio

async def test_crear_explotacio(test_app):
    """Verifica la creación básica de una explotación"""
    explotacion = await Explotacio.create(
        nom="Test Farm",
        ubicacio="Test Location",
        activa=True
    )
    assert explotacion.id is not None
    assert explotacion.nom == "Test Farm"
    assert explotacion.ubicacio == "Test Location"
    assert explotacion.activa is True

async def test_recuperar_explotacio(test_app, test_explotacio):
    """Verifica la recuperación de una explotación existente"""
    recuperada = await Explotacio.get(id=test_explotacio.id)
    assert recuperada.id == test_explotacio.id
    assert recuperada.nom == test_explotacio.nom
    assert recuperada.ubicacio == test_explotacio.ubicacio

async def test_actualizar_explotacio(test_app, test_explotacio):
    """Verifica la actualización de una explotación"""
    test_explotacio.ubicacio = "Nueva Ubicación"
    await test_explotacio.save()
    
    actualizada = await Explotacio.get(id=test_explotacio.id)
    assert actualizada.ubicacio == "Nueva Ubicación"

async def test_desactivar_explotacio(test_app, test_explotacio):
    """Verifica la desactivación de una explotación"""
    test_explotacio.activa = False
    await test_explotacio.save()
    
    desactivada = await Explotacio.get(id=test_explotacio.id)
    assert desactivada.activa is False