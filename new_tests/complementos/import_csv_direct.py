"""
Script para importar animales desde un archivo CSV directamente usando el servicio de importación.
Este script evita problemas con el proxy y la interfaz web.
"""
import sys
import os
import asyncio
import logging
from pathlib import Path
from datetime import datetime

# Configurar rutas para importar desde el proyecto
ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.append(str(ROOT_DIR))

# Importar módulos necesarios del proyecto
from backend.app.services.import_service import import_animal_with_partos
from backend.app.database.session import init_db, close_db
from backend.app.models.import_model import Import
from backend.app.models.user import User
from backend.app.core.config import UserRole

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

async def import_csv_file(csv_path):
    """
    Importa un archivo CSV directamente usando el servicio de importación.
    """
    logger.info(f"Iniciando importación del archivo: {csv_path}")
    
    # Inicializar la conexión a la base de datos
    await init_db()
    
    try:
        # Obtener o crear un usuario administrador
        admin_user = await User.filter(role=UserRole.ADMIN).first()
        if not admin_user:
            admin_user = await User.create(
                username="admin",
                email="admin@example.com",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # admin123
                role=UserRole.ADMIN,
                nombre="Administrador",
                apellidos="Sistema"
            )
            logger.info("Se ha creado un usuario administrador para la importación")
        
        # Leer el contenido del archivo
        with open(csv_path, 'rb') as f:
            content = f.read()
            
        # Intentar decodificar con UTF-8 primero
        try:
            csv_text = content.decode("utf-8-sig")  # Con BOM
        except UnicodeDecodeError:
            # Intentar con latin-1 si UTF-8 falla
            csv_text = content.decode("latin-1")
        
        # Crear registro de importación
        import_record = await Import.create(
            user_id=admin_user.id,
            description=f"Importación directa de {os.path.basename(csv_path)}",
            file_name=os.path.basename(csv_path),
            file_path=str(csv_path),
            file_size=len(content),
            file_type="text/csv",
            status="processing",
            errors=[],
            total_rows=0,
            imported_rows=0
        )
        
        # Llamar al servicio de importación
        result = await import_animal_with_partos(csv_text, import_record.id)
        
        # Actualizar el registro de importación
        await Import.filter(id=import_record.id).update(
            status="completed" if result["success"] else "failed",
            errors=result.get("errors", []),
            total_rows=result.get("total_processed", 0),
            imported_rows=result.get("total_imported", 0)
        )
        
        # Mostrar resumen
        logger.info(f"Importación completada con estado: {result['success']}")
        logger.info(f"Registros procesados: {result.get('total_processed', 0)}")
        logger.info(f"Registros importados: {result.get('total_imported', 0)}")
        
        if not result["success"]:
            logger.error(f"Errores durante la importación: {result.get('errors', [])}")
        
        return result
    
    except Exception as e:
        logger.error(f"Error durante la importación: {str(e)}", exc_info=True)
        return {
            "success": False,
            "message": f"Error: {str(e)}",
            "total_processed": 0,
            "total_imported": 0,
            "errors": [str(e)]
        }
    
    finally:
        # Cerrar la conexión a la base de datos
        await close_db()

async def main():
    """
    Función principal del script.
    """
    if len(sys.argv) < 2:
        logger.error("Se requiere la ruta al archivo CSV como argumento")
        logger.info("Uso: python import_csv_direct.py <ruta_al_archivo.csv>")
        return
    
    csv_path = sys.argv[1]
    if not os.path.exists(csv_path):
        logger.error(f"El archivo {csv_path} no existe")
        return
    
    await import_csv_file(csv_path)

if __name__ == "__main__":
    asyncio.run(main())
