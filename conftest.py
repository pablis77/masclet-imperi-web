"""
Configuración global para pytest.
"""
import pytest

def pytest_collect_file(parent, file_path):
    """
    Esta función determina qué archivos pytest intentará recolectar como pruebas.
    Excluimos explícitamente los archivos .txt para evitar que sean interpretados como archivos de prueba.
    """
    # Si el archivo es un .txt, indicamos explícitamente que lo ignore
    if file_path.suffix == ".txt":
        return None

    # Para otros archivos, dejamos que pytest use su comportamiento predeterminado
    return None  # Dejar que pytest decida para otros archivos
