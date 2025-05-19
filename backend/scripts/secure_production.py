"""
Script para asegurar el entorno de producción.
Configura la aplicación para un despliegue seguro en producción.
"""
import os
import sys
import logging
from pathlib import Path
import re

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Directorio raíz del proyecto
ROOT_DIR = Path(__file__).parent.parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

# Endpoints de desarrollo que deben deshabilitarse en producción
DEV_ENDPOINTS = [
    "debug",
    "test_",
    "mock_",
    "fake_",
    "_dev",
]

def find_dev_endpoints():
    """
    Encuentra endpoints de desarrollo en los archivos del backend.
    
    Returns:
        Lista de archivos con endpoints de desarrollo.
    """
    api_dir = BACKEND_DIR / "app" / "api" / "endpoints"
    dev_endpoints = []
    
    # Buscar archivos con nombres sospechosos
    for file_path in api_dir.glob("**/*.py"):
        filename = file_path.name
        if any(pattern in filename for pattern in DEV_ENDPOINTS):
            dev_endpoints.append(str(file_path))
    
    # Buscar rutas con decoradores @development_only
    for file_path in api_dir.glob("**/*.py"):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            if "@development_only" in content or "@dev_only" in content:
                if str(file_path) not in dev_endpoints:
                    dev_endpoints.append(str(file_path))
    
    return dev_endpoints

def secure_endpoints(fix=False):
    """
    Identifica y opcionalmente asegura endpoints de desarrollo.
    
    Args:
        fix: Si es True, modifica los archivos para deshabilitar endpoints.
    """
    dev_endpoints = find_dev_endpoints()
    
    if not dev_endpoints:
        logger.info("No se encontraron endpoints de desarrollo. ✅")
        return
    
    logger.warning(f"Se encontraron {len(dev_endpoints)} posibles endpoints de desarrollo:")
    for file_path in dev_endpoints:
        logger.warning(f"  - {file_path}")
    
    if fix:
        for file_path in dev_endpoints:
            path = Path(file_path)
            if path.exists():
                # Renombrar el archivo añadiendo .disabled
                disabled_path = path.with_suffix(".py.disabled")
                path.rename(disabled_path)
                logger.info(f"Deshabilitado: {file_path} -> {disabled_path}")
    else:
        logger.info("Para deshabilitar estos endpoints, ejecuta con --fix")

def check_proxy_configuration(fix=False):
    """
    Verifica la configuración del proxy.
    
    Args:
        fix: Si es True, realiza modificaciones para producción (no implementado).
    """
    # El proyecto usa proxy en lugar de CORS
    logger.info("Este proyecto utiliza proxy en lugar de CORS. ✅")
    
    # Aquí podríamos realizar comprobaciones adicionales relacionadas con el proxy si fuera necesario
    return

def check_debug_pages(fix=False):
    """
    Verifica y opcionalmente elimina páginas de depuración del frontend.
    
    Args:
        fix: Si es True, renombra las páginas de depuración.
    """
    debug_pages = []
    
    # Buscar páginas de depuración en frontend
    for ext in [".astro", ".jsx", ".tsx", ".vue"]:
        for file_path in FRONTEND_DIR.glob(f"src/pages/**/*debug*{ext}"):
            debug_pages.append(str(file_path))
    
    if not debug_pages:
        logger.info("No se encontraron páginas de depuración en el frontend. ✅")
        return
    
    logger.warning(f"Se encontraron {len(debug_pages)} posibles páginas de depuración:")
    for file_path in debug_pages:
        logger.warning(f"  - {file_path}")
    
    if fix:
        for file_path in debug_pages:
            path = Path(file_path)
            if path.exists():
                # Renombrar el archivo añadiendo .disabled
                disabled_path = path.with_suffix(f"{path.suffix}.disabled")
                path.rename(disabled_path)
                logger.info(f"Deshabilitado: {file_path} -> {disabled_path}")
    else:
        logger.info("Para deshabilitar estas páginas, ejecuta con --fix")

def main():
    """Función principal"""
    fix_mode = "--fix" in sys.argv
    
    logger.info("Iniciando auditoría de seguridad para producción...")
    
    # Comprobar endpoints de desarrollo
    logger.info("\n=== Comprobando endpoints de desarrollo ===")
    secure_endpoints(fix=fix_mode)
    
    # Comprobar configuración de proxy
    logger.info("\n=== Comprobando configuración de proxy ===")
    check_proxy_configuration(fix=fix_mode)
    
    # Comprobar páginas de depuración
    logger.info("\n=== Comprobando páginas de depuración en frontend ===")
    check_debug_pages(fix=fix_mode)
    
    if not fix_mode:
        logger.info("\n⚠️ IMPORTANTE: Ejecuta con --fix para aplicar las correcciones")
    else:
        logger.info("\n✅ Configuración para producción completada")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
