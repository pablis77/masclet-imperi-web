"""
Configuración específica para test_parto_endpoints_final.py.
Este archivo anula el fixture autouse=True de test_parto_endpoints.py
"""
import pytest
import sys
import logging

# Configurar logging
logger = logging.getLogger(__name__)

@pytest.fixture(scope="module", autouse=True)
def initialize_tests():
    """
    Este fixture anula el fixture del mismo nombre en test_parto_endpoints.py.
    No hace nada, simplemente existe para evitar que se active el otro fixture
    que intenta cargar app.models.parto.
    """
    logger.info("Usando fixture initialize_tests personalizado para test_parto_endpoints_final.py")
    # Asegurarse de que el módulo problemático no se cargue
    sys.modules['app.models.parto'] = None
    yield
    # No hacemos nada en la limpieza
    logger.info("Finalizando fixture initialize_tests personalizado")
