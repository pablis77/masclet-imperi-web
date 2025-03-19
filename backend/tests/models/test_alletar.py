"""
Tests para la funcionalidad de alletar (amamantamiento).
"""
import pytest
import logging
from app.models.animal import Animal
from app.models.explotacio import Explotacio

logger = logging.getLogger(__name__)

@pytest.mark.asyncio
async def test_alletar_states():
    """Test para verificar los estados de alletar."""
    try:
        # Crear explotación
        explotacio = await Explotacio.create(nom="Test Alletar", activa=True)
        
        # Crear tres vacas con diferentes estados de alletar
        vaca_sin_alletar = await Animal.create(
            nom="Vaca-No-Amamanta",
            explotacio=explotacio,
            genere="F",
            estado="OK",
            alletar=0  # No amamanta
        )
        
        vaca_un_ternero = await Animal.create(
            nom="Vaca-Un-Ternero",
            explotacio=explotacio,
            genere="F",
            estado="OK",
            alletar=1  # Un ternero
        )
        
        vaca_dos_terneros = await Animal.create(
            nom="Vaca-Dos-Terneros",
            explotacio=explotacio,
            genere="F",
            estado="OK",
            alletar=2  # Dos terneros
        )
        
        # Verificaciones
        assert vaca_sin_alletar.alletar == 0
        assert vaca_un_ternero.alletar == 1
        assert vaca_dos_terneros.alletar == 2
        
        logger.info("Test de estados de alletar completado exitosamente")
        
    except Exception as e:
        logger.error(f"Error en test de estados de alletar: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_alletar_only_for_females():
    """Test para verificar que alletar solo aplica a vacas (hembras)."""
    try:
        # Crear explotación
        explotacio = await Explotacio.create(nom="Test Alletar Genero", activa=True)
        
        # Intentar crear un toro con alletar = 1 (no debería permitirlo)
        with pytest.raises(Exception) as excinfo:
            toro_con_alletar = await Animal.create(
                nom="Toro-Con-Alletar",
                explotacio=explotacio,
                genere="M",
                estado="OK",
                alletar=1  # Esto debería fallar
            )
        
        logger.info(f"Validación correcta: Error al asignar alletar a toro: {str(excinfo.value)}")
        
        # Crear un toro sin alletar (debería funcionar)
        toro_sin_alletar = await Animal.create(
            nom="Toro-Sin-Alletar",
            explotacio=explotacio,
            genere="M",
            estado="OK",
            alletar=0  # Usar el valor por defecto (NO_ALLETAR) en lugar de None
        )
        
        logger.info("Test de alletar para género completado exitosamente")
        
    except Exception as e:
        logger.error(f"Error en test de alletar para género: {str(e)}")
        raise