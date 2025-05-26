"""
Servicio de programación de tareas periódicas para el sistema
"""
import asyncio
import logging
import schedule
import threading
import time
from datetime import datetime
from fastapi import BackgroundTasks

from app.services.scheduled_backup_service import ScheduledBackupService, BackupType

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class SchedulerService:
    """Servicio para programar tareas periódicas"""
    
    # Indica si el programador está en ejecución
    _running = False
    _thread = None
    
    @classmethod
    def start(cls):
        """Inicia el programador de tareas"""
        if cls._running:
            logger.warning("El programador de tareas ya está en ejecución")
            return
        
        # Configurar tareas programadas
        cls._configure_scheduled_tasks()
        
        # Iniciar hilo para ejecutar el programador
        cls._thread = threading.Thread(target=cls._run_scheduler, daemon=True)
        cls._thread.start()
        cls._running = True
        
        logger.info("Programador de tareas iniciado")
    
    @classmethod
    def _configure_scheduled_tasks(cls):
        """Configura las tareas programadas"""
        # Backup diario a las 2:00 AM
        schedule.every().day.at("02:00").do(cls._execute_daily_backup)
        logger.info("Tarea programada: Backup diario a las 02:00 AM")
    
    @classmethod
    def _run_scheduler(cls):
        """Ejecuta el programador de tareas en un bucle"""
        logger.info("Hilo del programador de tareas iniciado")
        while True:
            schedule.run_pending()
            time.sleep(60)  # Comprobar cada minuto
    
    @classmethod
    def _execute_daily_backup(cls):
        """Ejecuta el backup diario programado"""
        logger.info("Ejecutando backup diario programado")
        
        try:
            # Crear una tarea en el bucle de eventos principal
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Ejecutar el backup
            backup_info = loop.run_until_complete(
                ScheduledBackupService.trigger_backup(
                    backup_type=BackupType.DAILY,
                    description=f"Backup diario programado ({datetime.now().strftime('%d/%m/%Y')})"
                )
            )
            
            logger.info(f"Backup diario programado completado: {backup_info.filename}")
            return True
        except Exception as e:
            logger.error(f"Error al ejecutar backup diario programado: {str(e)}")
            return False
        finally:
            loop.close()
    
    @classmethod
    def stop(cls):
        """Detiene el programador de tareas"""
        if not cls._running:
            logger.warning("El programador de tareas no está en ejecución")
            return
        
        # No podemos detener el hilo directamente, pero podemos 
        # marcar que no está en ejecución
        cls._running = False
        logger.info("Programador de tareas detenido")
        
        # Eliminar todas las tareas programadas
        schedule.clear()
