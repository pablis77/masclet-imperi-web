from app.models.icons import IconPath, ImagePath
from pathlib import Path
import os

def print_asset_paths():
    """Muestra las rutas completas de todos los assets"""
    base_path = Path("c:/Proyectos/claude/masclet-imperi-web/frontend/public")
    
    print("\nRutas de los assets:")
    print("===================")
    
    # Iconos
    print(f"\nIconos:")
    print(f"Toro: {base_path / IconPath.BULL.lstrip('/')}")
    print(f"Favicon: {base_path / IconPath.FAVICON.lstrip('/')}")
    
    # Imágenes
    print(f"\nImágenes:")
    print(f"No Password: {base_path / ImagePath.NO_PASSWORD.lstrip('/')}")
    print(f"Logo Principal: {base_path / ImagePath.LOGO_MAIN.lstrip('/')}")
    print(f"Logo Pequeño: {base_path / ImagePath.LOGO_SMALL.lstrip('/')}")

def debug_file_info(path: Path):
    """Muestra información detallada del archivo"""
    print(f"\nDebug info para: {path}")
    print(f"Ruta absoluta: {path.absolute()}")
    print(f"¿Existe?: {path.exists()}")
    print(f"¿Es archivo?: {path.is_file() if path.exists() else 'N/A'}")
    print(f"Contenido del directorio:")
    parent = path.parent
    if parent.exists():
        for item in parent.iterdir():
            print(f"  - {item.name}")

def verify_file(path: Path, description: str):
    """Verifica si un archivo existe y muestra información útil"""
    exists = path.exists()
    print(f"\nVerificando {description}:")
    print(f"Ruta: {path}")
    print(f"¿Existe?: {exists}")
    
    if not exists:
        debug_file_info(path)
    
    return exists

def test_assets_exist():
    """Verifica que existan todos los assets necesarios"""
    base_path = Path("c:/Proyectos/claude/masclet-imperi-web/frontend/public")
    
    # Verificar que el directorio base existe
    assert base_path.exists(), f"El directorio base no existe: {base_path}"
    
    print_asset_paths()  # Mostrar rutas antes del test
    
    # Verificar cada archivo individualmente
    bull_path = base_path / IconPath.BULL.lstrip('/')
    favicon_path = base_path / "favico.ico"  # Cambiado para usar el nombre correcto
    nopass_path = base_path / ImagePath.NO_PASSWORD.lstrip('/')
    logo_main_path = base_path / ImagePath.LOGO_MAIN.lstrip('/')
    logo_small_path = base_path / ImagePath.LOGO_SMALL.lstrip('/')
    
    # Verificar cada archivo
    assert verify_file(bull_path, "Icono del toro"), f"Falta el archivo: {bull_path}"
    assert verify_file(favicon_path, "Favicon"), f"Falta el archivo: {favicon_path}"
    assert verify_file(nopass_path, "Imagen no_password"), f"Falta el archivo: {nopass_path}"
    assert verify_file(logo_main_path, "Logo principal"), f"Falta el archivo: {logo_main_path}"
    assert verify_file(logo_small_path, "Logo pequeño"), f"Falta el archivo: {logo_small_path}"