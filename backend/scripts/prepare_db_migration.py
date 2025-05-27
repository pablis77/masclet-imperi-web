"""
Script para preparar las migraciones de la base de datos para producción.

Este script genera los archivos de migración necesarios para inicializar
la base de datos en un entorno de producción desde cero.
"""
import asyncio
import logging
import os
import sys
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Agregar el directorio raíz al path para importar los módulos de la aplicación
sys.path.append(str(Path(__file__).parent.parent))

try:
    from tortoise import Tortoise
    from aerich import Command
except ImportError:
    logger.error("Por favor, instala las dependencias requeridas: pip install tortoise-orm aerich")
    sys.exit(1)

# Configuración de la base de datos
from app.core.config import settings

async def init_migration():
    """Inicializa las migraciones para la base de datos"""
    logger.info("Preparando migraciones para producción...")
    
    # Configurar el comando de Aerich
    command = Command(
        tortoise_config={
            'connections': {
                'default': settings.database_url
            },
            'apps': {
                'models': {
                    'models': [
                        'app.models.animal',
                        'app.models.user',
                        'app.models.import_model',
                        'aerich.models'
                    ],
                    'default_connection': 'default',
                }
            }
        },
        location=str(Path(__file__).parent.parent / "migrations"),
        app="models"
    )
    
    try:
        # Verificar si ya existe la configuración de migración
        await command.init()
        logger.info("Configuración de migración inicializada correctamente")
        
        # Crear la primera migración
        await command.migrate(name="initial")
        logger.info("Migración inicial creada correctamente")
        
    except Exception as e:
        logger.error(f"Error al inicializar las migraciones: {str(e)}")
        raise
        
    logger.info("¡Migraciones preparadas correctamente!")
    logger.info("Archivos de migración guardados en: backend/migrations/")

async def create_superuser():
    """Crear usuario administrador por defecto para producción"""
    try:
        # Inicializar Tortoise ORM
        await Tortoise.init(
            db_url=settings.database_url,
            modules={'models': [
                'app.models.animal',
                'app.models.user',
                'app.models.import_model'
            ]}
        )
        
        # Importar el modelo User
        from app.models.user import User
        from app.core.auth import get_password_hash
        
        # Verificar si ya existe un superusuario
        admin = await User.filter(is_superuser=True).first()
        
        if not admin:
            # Crear nuevo superusuario con credenciales fijas para demostración (admin/admin123)
            admin_username = "admin"
            admin_password = "admin123"  # Credencial fija para demostración
            
            admin = User(
                username=admin_username,
                email="admin@mascletimperi.com",
                full_name="Administrador",
                password_hash=get_password_hash(admin_password),
                is_active=True,
                is_superuser=True
            )
            
            await admin.save()
            logger.info("Usuario administrador creado correctamente para producción")
            logger.info(f"Username: {admin_username}")
            logger.info(f"Contraseña: {admin_password}")
            logger.info("IMPORTANTE: Solo hay perfil administrador para demostración al cliente")
        else:
            # Si ya existe, asegurarse de que tenga las credenciales correctas
            admin_password = "admin123"
            admin.username = "admin"
            admin.email = "admin@mascletimperi.com"
            admin.full_name = "Administrador"
            admin.password_hash = get_password_hash(admin_password)
            admin.is_active = True
            admin.is_superuser = True
            await admin.save()
            logger.info("Superusuario existente actualizado con credenciales fijas")
            logger.info("Username: admin")
            logger.info(f"Contraseña: {admin_password}")
            
    except Exception as e:
        logger.error(f"Error al crear el superusuario: {str(e)}")
        raise
    finally:
        # Cerrar conexiones
        await Tortoise.close_connections()

async def main():
    """Función principal"""
    try:
        # Inicializar esquema de migraciones
        await init_migration()
        
        # Crear superusuario para producción
        await create_superuser()
        
        logger.info("Base de datos preparada para producción correctamente")
        return 0
    except Exception as e:
        logger.error(f"Error en el proceso de preparación de la base de datos: {str(e)}")
        return 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        logger.info("Proceso interrumpido por el usuario")
        sys.exit(130)
    except Exception as e:
        logger.critical(f"Error no controlado: {str(e)}")
        sys.exit(1)
