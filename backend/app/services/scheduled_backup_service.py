from datetime import datetime, timedelta
import os
import json
import logging
import asyncio
import re
from typing import List, Dict, Optional, Tuple
from pydantic import BaseModel
from fastapi import BackgroundTasks
from enum import Enum

from app.services.backup_service import BackupService, BackupOptions, BackupInfo

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class BackupType(str, Enum):
    """Tipos de backup programados"""
    DAILY = "daily"       # Backup diario (2:00 AM)
    ANIMAL_CREATED = "animal_created"  # Cuando se crea un animal
    ANIMAL_UPDATED = "animal_updated"  # Cuando se modifica un animal
    IMPORT = "import"     # Después de una importación
    MANUAL = "manual"     # Backup manual (desde la interfaz)

class BackupRetentionPolicy(BaseModel):
    """Política de retención de backups"""
    daily_count: int = 7      # Número de backups diarios a mantener
    weekly_count: int = 7     # Número de backups semanales a mantener
    max_total: int = 30       # Máximo total de backups en caso extremo

class BackupHistoryEntry(BaseModel):
    """Entrada en el historial de backups"""
    filename: str
    date: str
    timestamp: str
    backup_type: BackupType
    size: str
    size_bytes: int
    created_by: str
    retention_category: str = "daily"  # daily, weekly, monthly
    description: str = ""
    reference_id: Optional[str] = None  # ID de referencia (ej: ID del animal)

class ScheduledBackupService:
    """Servicio para gestionar backups programados y automáticos"""
    
    # Directorio donde se guardan los metadatos del historial
    BACKUP_HISTORY_FILE = os.path.join(BackupService.BACKUP_DIR, "backup_log.json")
    
    # Política de retención predeterminada
    DEFAULT_RETENTION_POLICY = BackupRetentionPolicy()
    
    @classmethod
    async def initialize(cls):
        """Inicializa el servicio de backup programado"""
        # Asegurar que existe el archivo de historial
        if not os.path.exists(cls.BACKUP_HISTORY_FILE):
            # Crear archivo de historial vacío
            await cls._save_backup_history([])
        
        logger.info("Servicio de backups programados inicializado")
    
    @classmethod
    async def _load_backup_history(cls) -> List[Dict]:
        """Carga el historial de backups"""
        if not os.path.exists(cls.BACKUP_HISTORY_FILE):
            return []
        
        try:
            with open(cls.BACKUP_HISTORY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error al cargar historial de backups: {str(e)}")
            return []
    
    @classmethod
    async def _save_backup_history(cls, history: List[Dict]):
        """Guarda el historial de backups"""
        # Asegurar que existe el directorio
        os.makedirs(os.path.dirname(cls.BACKUP_HISTORY_FILE), exist_ok=True)
        
        try:
            with open(cls.BACKUP_HISTORY_FILE, 'w', encoding='utf-8') as f:
                json.dump(history, f, indent=4, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error al guardar historial de backups: {str(e)}")
    
    @classmethod
    async def trigger_backup(cls, 
                            backup_type: BackupType, 
                            description: str = None,
                            reference_id: str = None,
                            created_by: str = "sistema") -> BackupInfo:
        """
        Activa la creación de un backup
        
        Args:
            backup_type: Tipo de backup a crear
            description: Descripción del backup
            reference_id: ID de referencia (ej: ID del animal)
            created_by: Usuario o sistema que inició el backup
            
        Returns:
            Información del backup creado
        """
        # Generar descripción predeterminada si no se proporciona
        if description is None:
            now = datetime.now().strftime("%d/%m/%Y %H:%M")
            if backup_type == BackupType.DAILY:
                description = f"Backup diario programado del {now}"
            elif backup_type == BackupType.ANIMAL_CREATED:
                description = f"Backup automático tras creación de animal [{reference_id}] - {now}"
            elif backup_type == BackupType.ANIMAL_UPDATED:
                description = f"Backup automático tras modificación de animal [{reference_id}] - {now}"
            elif backup_type == BackupType.IMPORT:
                description = f"Backup automático tras importación de datos - {now}"
            else:
                description = f"Backup manual - {now}"
        
        # Crear opciones de backup
        options = BackupOptions(
            include_animals=True,
            include_births=True,
            include_config=True,
            created_by=created_by,
            description=description,
            backup_type=str(backup_type.value)  # Pasamos el tipo de backup como string
        )
        
        # Crear el backup
        logger.info(f"Iniciando backup de tipo {backup_type}: {description}")
        backup_info = await BackupService.create_backup(options)
        
        # Establecer el tipo de backup y descripción en el objeto BackupInfo
        backup_info.backup_type = str(backup_type.value)
        backup_info.description = description
        
        # Añadir al historial
        await cls._add_to_history(backup_info, backup_type, description, reference_id)
        
        # Aplicar política de retención
        await cls.apply_retention_policy()
        
        return backup_info
    
    @classmethod
    async def _add_to_history(cls, 
                             backup_info: BackupInfo, 
                             backup_type: BackupType,
                             description: str,
                             reference_id: Optional[str] = None):
        """Añade un backup al historial"""
        try:
            # Cargar historial actual
            history = await cls._load_backup_history()
            
            # Validar que backup_info tenga todos los campos necesarios
            if not backup_info.filename:
                logger.warning("Nombre de archivo de backup vacío, usando valor por defecto")
                backup_info.filename = f"backup_masclet_imperi_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
            
            if not backup_info.date:
                logger.warning("Fecha de backup vacía, usando fecha actual")
                backup_info.date = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
            
            # Determinar categoría de retención (siempre debe tener un valor)
            retention_category = "daily"  # Valor predeterminado que SIEMPRE existirá
            
            # Validar y asignar categoría en base al tipo de backup
            if backup_type == BackupType.DAILY:
                # Si es sábado, lo marcamos como backup semanal
                current_date = datetime.now()
                if current_date.weekday() == 5:  # 5 es sábado
                    retention_category = "weekly"
            elif backup_type == BackupType.ANIMAL_CREATED or backup_type == BackupType.ANIMAL_UPDATED:
                retention_category = "daily"
            elif backup_type == BackupType.IMPORT:
                retention_category = "weekly"  # Los backups de importación son más importantes
            elif backup_type == BackupType.MANUAL:
                retention_category = "manual"  # Categoría especial para backups manuales
            else:
                # Para cualquier otro tipo no contemplado, usar daily como fallback
                logger.warning(f"Tipo de backup {backup_type} no reconocido, usando 'daily' como categoría de retención")
                retention_category = "daily"
            
            # Verificar que retention_category tiene un valor
            if not retention_category:
                logger.warning("retention_category vacía, estableciendo a 'daily'")
                retention_category = "daily"
            
            # Extraer timestamp del nombre del archivo
            pattern = re.compile(r'backup_masclet_imperi_(\d{8}_\d{6})\.sql')
            match = pattern.match(backup_info.filename)
            timestamp = ""
            if match:
                timestamp = match.group(1)
            else:
                logger.warning(f"No se pudo extraer timestamp del nombre de archivo: {backup_info.filename}")
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Asegurar que el valor de backup_type.value se convierte correctamente a string
            try:
                backup_type_str = str(backup_type.value)
            except Exception as e:
                logger.warning(f"Error al convertir backup_type a string: {e}, usando 'manual'")
                backup_type_str = "manual"
            
            # Crear entrada en el historial con valores por defecto para campos obligatorios
            history_entry = {
                "filename": backup_info.filename,
                "date": backup_info.date or datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
                "timestamp": timestamp,
                "backup_type": backup_type_str,
                "size": backup_info.size or "0 KB",
                "size_bytes": backup_info.size_bytes or 0,
                "created_by": backup_info.created_by or "sistema",
                "retention_category": retention_category,  # Ya garantizamos que tiene valor
                "description": description or f"Backup del {datetime.now().strftime('%d/%m/%Y %H:%M')}",
                "reference_id": reference_id
            }
            
            # Verificar la estructura antes de guardar
            logger.info(f"Añadiendo entrada al historial: {history_entry}")
            
            # Añadir al historial
            history.append(history_entry)
            
            # Guardar historial actualizado
            await cls._save_backup_history(history)
            logger.info(f"Backup añadido al historial exitosamente: {backup_info.filename}")
        except Exception as e:
            import traceback
            logger.error(f"Error al añadir backup al historial: {str(e)}")
            logger.error(f"Traza del error: {traceback.format_exc()}")
            logger.error(f"Datos del backup: filename={backup_info.filename if hasattr(backup_info, 'filename') else 'N/A'}, type={backup_type.value if hasattr(backup_type, 'value') else 'N/A'}")
            # Re-lanzamos la excepción para que sea manejada por el llamador
            raise
    
    @classmethod
    async def apply_retention_policy(cls, policy: BackupRetentionPolicy = None):
        """
        Aplica la política de retención para mantener el número adecuado de backups
        """
        if policy is None:
            policy = cls.DEFAULT_RETENTION_POLICY
        
        # Cargar historial actual
        history = await cls._load_backup_history()
        
        # Verificar y reparar el historial si hay entradas sin retention_category
        repaired = False
        for entry in history:
            if "retention_category" not in entry:
                # Asignar una categoría basada en el tipo de backup si está disponible
                if "backup_type" in entry:
                    backup_type = entry.get("backup_type", "manual")
                    if backup_type == "daily":
                        entry["retention_category"] = "daily"
                    elif backup_type in ["animal_created", "animal_updated"]:
                        entry["retention_category"] = "daily"
                    elif backup_type == "import":
                        entry["retention_category"] = "weekly"
                    elif backup_type == "manual":
                        entry["retention_category"] = "manual"
                    else:
                        entry["retention_category"] = "daily"  # Default
                else:
                    # Si no hay tipo de backup, usar daily como predeterminado
                    entry["retention_category"] = "daily"
                repaired = True
                logger.warning(f"Reparada entrada de backup sin categoría de retención: {entry['filename']}")
        
        # Guardar historial reparado si fue necesario
        if repaired:
            await cls._save_backup_history(history)
            logger.info("Historial de backups reparado y guardado")
        
        # Ahora podemos procesar el historial con seguridad
        # Separar por categoría de retención con manejo seguro de claves
        daily_backups = []
        weekly_backups = []
        manual_backups = []
        other_backups = []
        
        for b in history:
            category = b.get("retention_category", "daily")  # Valor predeterminado si no existe
            if category == "daily":
                daily_backups.append(b)
            elif category == "weekly":
                weekly_backups.append(b)
            elif category == "manual":
                manual_backups.append(b)
            else:
                other_backups.append(b)
        
        # Ordenar por fecha (más reciente primero) con manejo seguro de errores
        try:
            daily_backups = sorted(daily_backups, key=lambda x: x.get("timestamp", ""), reverse=True)
            weekly_backups = sorted(weekly_backups, key=lambda x: x.get("timestamp", ""), reverse=True)
        except Exception as e:
            logger.error(f"Error al ordenar backups: {str(e)}")
            # En caso de error, mantener el orden original
        
        # Aplicar política de retención
        daily_to_keep = daily_backups[:policy.daily_count]
        weekly_to_keep = weekly_backups[:policy.weekly_count]
        
        # Determinar backups a eliminar
        daily_to_delete = daily_backups[policy.daily_count:]
        weekly_to_delete = weekly_backups[policy.weekly_count:]
        
        # Eliminar backups excedentes
        for backup in daily_to_delete + weekly_to_delete:
            filename = backup.get("filename")
            if not filename:
                logger.warning("Entrada de backup sin nombre de archivo, ignorando")
                continue
                
            backup_path = os.path.join(BackupService.BACKUP_DIR, filename)
            
            try:
                if os.path.exists(backup_path):
                    os.unlink(backup_path)
                    logger.info(f"Backup antiguo eliminado: {filename}")
                else:
                    logger.warning(f"No se pudo encontrar el archivo de backup: {filename}")
            except Exception as e:
                logger.error(f"Error al eliminar backup {filename}: {str(e)}")
                
        # Actualizar historial (conservar solo los backups que no han sido eliminados)
        updated_history = daily_to_keep + weekly_to_keep + manual_backups + other_backups
        
        # Guardar historial actualizado
        await cls._save_backup_history(updated_history)
        logger.info(f"Historial actualizado: {len(updated_history)} backups conservados, {len(daily_to_delete) + len(weekly_to_delete)} eliminados")
        
        return {
            "daily_kept": len(daily_to_keep),
            "weekly_kept": len(weekly_to_keep),
            "manual_kept": len(manual_backups),
            "other_kept": len(other_backups),
            "daily_deleted": len(daily_to_delete),
            "weekly_deleted": len(weekly_to_delete),
            "total_kept": len(updated_history)
        }
    
    @classmethod
    async def get_backup_history(cls) -> List[BackupHistoryEntry]:
        """Obtiene el historial de backups"""
        # Cargar historial
        history = await cls._load_backup_history()
        
        # Convertir a objetos Pydantic
        history_entries = []
        for entry in history:
            history_entries.append(BackupHistoryEntry(**entry))
        
        # Ordenar por fecha (más reciente primero)
        return sorted(history_entries, key=lambda x: x.timestamp, reverse=True)
    
    @classmethod
    async def schedule_daily_backup(cls, background_tasks: BackgroundTasks):
        """Programa un backup diario"""
        # Calculamos cuánto tiempo queda hasta las 2:00 AM
        now = datetime.now()
        target_time = now.replace(hour=2, minute=0, second=0, microsecond=0)
        
        # Si ya pasó la hora, programamos para mañana
        if now >= target_time:
            target_time = target_time + timedelta(days=1)
        
        # Calculamos segundos hasta la hora programada
        seconds_until_target = (target_time - now).total_seconds()
        
        # Programar tarea
        async def _scheduled_task():
            await asyncio.sleep(seconds_until_target)
            await cls.trigger_backup(
                backup_type=BackupType.DAILY,
                description=f"Backup diario programado ({target_time.strftime('%d/%m/%Y')})"
            )
        
        background_tasks.add_task(_scheduled_task)
        logger.info(f"Backup diario programado para {target_time.strftime('%d/%m/%Y %H:%M')}")
    
    @classmethod
    async def trigger_backup_after_animal_change(cls, 
                                               background_tasks: BackgroundTasks, 
                                               action: str, 
                                               animal_id: str,
                                               animal_nom: str):
        """
        Ejecuta un backup automático tras modificaciones importantes en fichas de animales
        """
        logger.info(f"Programando backup automático tras {action} del animal {animal_nom}")
        
        # Determinar tipo de backup según la acción
        backup_type = BackupType.ANIMAL_CREATED if action == "creación" else BackupType.ANIMAL_UPDATED
        
        # Crear descripción
        description = f"Backup tras {action} del animal {animal_nom} (ID: {animal_id})"
        
        # Ejecutar backup en segundo plano
        async def _execute_backup():
            try:
                logger.info(f"Ejecutando backup tras {action} del animal {animal_nom} (ID: {animal_id})")
                await cls.trigger_backup(
                    backup_type=backup_type,
                    description=description,
                    reference_id=animal_id,
                    created_by="sistema"
                )
                logger.info(f"Backup tras {action} completado con éxito")
            except Exception as e:
                import traceback
                logger.error(f"Error en backup tras {action}: {str(e)}")
                logger.error(f"Traza del error: {traceback.format_exc()}")
                logger.error(f"Detalles: tipo={backup_type}, descripción={description}, ID={animal_id}")
        
        # Añadir tarea en segundo plano
        background_tasks.add_task(_execute_backup)
    
    @classmethod
    async def trigger_backup_after_import(cls, 
                                        background_tasks: BackgroundTasks, 
                                        import_id: str,
                                        import_description: str):
        """
        Ejecuta un backup automático tras una importación de datos
        """
        logger.info(f"Programando backup automático tras importación #{import_id}")
        
        # Crear descripción
        description = f"Backup tras importación #{import_id}: {import_description}"
        
        # Ejecutar backup en segundo plano
        async def _execute_backup():
            try:
                await cls.trigger_backup(
                    backup_type=BackupType.IMPORT,
                    description=description,
                    reference_id=import_id,
                    created_by="sistema"
                )
                logger.info("Backup tras importación completado con éxito")
            except Exception as e:
                logger.error(f"Error en backup tras importación: {str(e)}")
        
        # Añadir tarea en segundo plano
        background_tasks.add_task(_execute_backup)
