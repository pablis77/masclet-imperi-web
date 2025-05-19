"""
Tests con datos reales del sistema.
"""
import pytest
import logging
from app.models.animal import Animal
from app.models.explotacio import Explotacio
from typing import List

logger = logging.getLogger(__name__)

@pytest.mark.asyncio
async def test_create_reference_bull():
    """Test creación del toro de referencia."""
    # Crear explotación Gurans
    try:
        logger.info("Creando explotación Gurans...")
        explotacio = await Explotacio.create(nom="Gurans", activa=True)
        logger.info(f"Explotación creada: {explotacio.id} - {explotacio.nom}")

        # Crear toro de referencia
        logger.info("Creando toro de referencia...")
        bull = await Animal.create(
            nom="Toro-01",
            explotacio=explotacio,  # Pasamos el objeto completo
            genere="M",
            estado="OK",
            cod="TORO-01",
            num_serie="ES123456789"
        )
        logger.info(f"Toro creado: {bull.id} - {bull.nom}")
        
        assert bull.genere == "M"
        assert bull.estado == "OK"
        assert bull.explotacio.nom == "Gurans"  # Verificamos a través del objeto
        logger.info("Test completado exitosamente")
        
    except Exception as e:
        logger.error(f"Error en test: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_create_reference_cow():
    """Test creación de la vaca de referencia."""
    try:
        # Primero crear la explotación
        explotacio = await Explotacio.create(nom="Gurans", activa=True)
        logger.info(f"Explotación creada: {explotacio.id}")

        cow = await Animal.create(
            nom="Vaca-01", 
            explotacio=explotacio,  # Pasamos el objeto completo
            genere="F",
            estado="OK",
            alletar=True,
            cod="VACA-01"
        )
        logger.info(f"Vaca creada: {cow.id}")
        
        assert cow.genere == "F"
        assert cow.alletar == True
        assert cow.explotacio.nom == "Gurans"  # Verificamos a través del objeto

    except Exception as e:
        logger.error(f"Error en test: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_list_gurans_animals():
    """Test listado de animales de Gurans."""
    try:
        # Intentar obtener la explotación si existe
        explotacio = await Explotacio.get_or_none(nom="Gurans")
        if not explotacio:
            logger.info("Creando nueva explotación Gurans...")
            explotacio = await Explotacio.create(nom="Gurans", activa=True)
        else:
            logger.info(f"Usando explotación existente: {explotacio.id}")
        
        logger.info(f"Usando explotación: {explotacio.id} - {explotacio.nom}")
        
        # Crear algunos animales para prueba
        bull = await Animal.create(
            nom="Toro-Test",
            explotacio=explotacio,
            genere="M",
            estado="OK"
        )
        
        cow = await Animal.create(
            nom="Vaca-Test",
            explotacio=explotacio,
            genere="F",
            estado="OK"
        )
        
        # Ahora buscar los animales
        animals = await Animal.filter(explotacio=explotacio).all()
        logger.info(f"Animales encontrados: {len(animals)}")
        
        assert len(animals) >= 2
        has_male = any(a.genere == "M" for a in animals)
        has_female = any(a.genere == "F" for a in animals)
        
        assert has_male and has_female
        logger.info("Test de listado completado exitosamente")

    except Exception as e:
        logger.error(f"Error en test de listado: {str(e)}")
        raise
