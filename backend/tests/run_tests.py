import pytest
import logging
from pathlib import Path
import sys
import os

# Configuración básica del directorio
BACKEND_DIR = Path(__file__).parent.parent.absolute()
os.chdir(BACKEND_DIR)

# Log sencillo pero efectivo
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

def main():
    """Ejecutar tests por niveles"""
    logger.info("🚀 Ejecutando tests...")
    
    # Nivel 1: Unit tests
    result_unit = pytest.main([
        "tests/unit",
        "-v",
        "-s",
        "--tb=short"
    ])
    
    if result_unit != 0:
        logger.error("❌ Fallos en unit tests")
        return
        
    # Nivel 2: Integration tests
    result_integration = pytest.main([
        "tests/integration",
        "-v",
        "-s",
        "--tb=short"
    ])
    
    if result_integration != 0:
        logger.error("❌ Fallos en integration tests")
        return
        
    logger.info("✅ Tests completados exitosamente")

if __name__ == "__main__":
    main()