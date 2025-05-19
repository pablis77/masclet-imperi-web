"""
Endpoints administrativos
"""
from fastapi import APIRouter, HTTPException
import sys
import os
import asyncio
import logging
import importlib.util

# Configurar el router
admin_router = APIRouter(
    tags=["admin"],
    responses={404: {"description": "No encontrado"}},
)

logger = logging.getLogger(__name__)

# Endpoint principal
@admin_router.post("/reset-database")
# Endpoint alternativo para compatibilidad
@admin_router.post("/admin/reset-database")
async def reset_database_endpoint():
    """
    Reinicia la base de datos eliminando todos los registros
    Solo para desarrollo y testing
    """
    try:
        # Cargar directamente las funciones del script original
        current_dir = os.path.dirname(os.path.realpath(__file__))
        project_root = os.path.abspath(os.path.join(current_dir, "../../../.."))
        script_path = os.path.join(project_root, "new_tests", "complementos", "reset_database.py")
        
        logger.info(f"Usando script de reinicio: {script_path}")
        
        # Importar dinámicamente el módulo reset_database.py
        spec = importlib.util.spec_from_file_location("reset_database", script_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        # Obtener la función reset_database del módulo
        reset_func = module.reset_database
        
        # Ejecutar la función reset_database
        await reset_func()
        
        return {"success": True, "message": "Base de datos reiniciada correctamente"}
            
    except Exception as e:
        logger.error(f"Error al reiniciar la base de datos: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error al reiniciar la base de datos: {str(e)}")
