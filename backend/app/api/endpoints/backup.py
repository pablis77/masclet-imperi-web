from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from typing import List, Optional
import os
import re
import json
import logging
from datetime import datetime

from app.services.backup_service import BackupService, BackupInfo, BackupOptions
from app.api.deps.auth import get_current_user
from app.models.user import User
from app.core.auth import verify_user_role, verify_token
from app.core.config import UserRole

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

router = APIRouter()

# Función auxiliar para formatear tamaños de archivo
def format_size(size_bytes):
    """Convierte tamaño en bytes a formato legible (KB, MB, GB)"""
    if size_bytes == 0:
        return "0 B"
    
    units = ['B', 'KB', 'MB', 'GB', 'TB']
    i = 0
    while size_bytes >= 1024 and i < len(units) - 1:
        size_bytes /= 1024
        i += 1
    
    return f"{size_bytes:.2f} {units[i]}"

@router.get("/list", response_model=List[BackupInfo])
async def list_backups(
    current_user: Optional[User] = Depends(get_current_user)
):
    # Verificar que el usuario tenga el rol adecuado
    # Permitimos acceso a cualquier usuario para fines de desarrollo
    if not current_user:
        raise HTTPException(status_code=401, detail="No estás autenticado")
    
    logger.info(f"Usuario {current_user.username} con rol {current_user.role} accediendo a backups")
    
    # En modo desarrollo, permitimos acceso a cualquier usuario autenticado
    # if not verify_user_role(current_user, [UserRole.ADMIN, UserRole.GERENTE, "Ramon"]):
    #     raise HTTPException(status_code=403, detail="No tienes permisos para ver copias de seguridad")
    """
    Lista todos los backups disponibles.
    """
    # Depuración de usuario y rol
    if current_user:
        logger.info(f"Usuario autenticado: {current_user.username}, Rol: {current_user.role}")
    else:
        logger.info("No hay usuario autenticado en la solicitud")
        
    # Verificar si hay usuario autenticado
    if not current_user:
        logger.warning("Acceso denegado: No hay usuario autenticado")
        raise HTTPException(status_code=401, detail="Autenticación requerida")
    
    # Verificar permisos (solo administradores y Ramon)
    if not verify_user_role(current_user, [UserRole.ADMIN, "Ramon"]):
        logger.warning(f"Acceso denegado: {current_user.username} con rol {current_user.role} no tiene permisos suficientes")
        raise HTTPException(status_code=403, detail="No tienes permisos para ver la lista de backups")
    
    # Crear una lista vacía para devolver por ahora
    backups = []
    
    # Ruta del directorio de backups
    backup_dir = BackupService.BACKUP_DIR
    
    # Verificar si el directorio existe
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir, exist_ok=True)
        return backups
    
    # Expresión regular para extraer la fecha
    pattern = re.compile(r'backup_masclet_imperi_(\d{8}_\d{6})\.sql')
    
    # Cargar el historial de backups para obtener la información adicional
    history_path = os.path.join(backup_dir, "backup_log.json")
    history = []
    
    if os.path.exists(history_path):
        try:
            with open(history_path, "r", encoding="utf-8") as f:
                history = json.load(f)
            logger.info(f"Historial de backups cargado: {len(history)} entradas")
        except Exception as e:
            logger.error(f"Error al cargar historial de backups: {str(e)}")
            # Continuar sin historial
    else:
        logger.info(f"No existe archivo de historial: {history_path}")
    
    # Crear un diccionario con la información del historial para búsqueda rápida
    history_dict = {entry.get("filename"): entry for entry in history} if history else {}
    
    # Listar los archivos en el directorio
    try:
        all_files = os.listdir(backup_dir)
        logger.info(f"Total de archivos encontrados: {len(all_files)}")
        
        for filename in all_files:
            if filename.startswith("backup_masclet_imperi_") and filename.endswith(".sql"):
                file_path = os.path.join(backup_dir, filename)
                logger.info(f"Procesando archivo de backup: {filename}")
                
                # Extraer fecha del nombre
                match = pattern.match(filename)
                if match:
                    date_str = match.group(1)
                    try:
                        date_obj = datetime.strptime(date_str, "%Y%m%d_%H%M%S")
                        formatted_date = date_obj.strftime("%d/%m/%Y %H:%M")
                    except ValueError:
                        formatted_date = "Fecha desconocida"
                else:
                    formatted_date = "Fecha desconocida"
                
                # Obtener tamaño
                size_bytes = os.path.getsize(file_path)
                size = format_size(size_bytes)
                
                # Obtener información adicional del historial si existe
                history_entry = history_dict.get(filename, {})
                
                # Crear objeto de información de backup
                backup_info = BackupInfo(
                    filename=filename,
                    date=formatted_date,
                    size=size,
                    size_bytes=size_bytes,
                    created_by=history_entry.get("created_by", "sistema"),
                    is_complete=True,
                    content_type="SQL",
                    can_restore=True,
                    backup_type=history_entry.get("backup_type", "manual"),
                    description=history_entry.get("description", "")
                )
                
                backups.append(backup_info)
    except Exception as e:
        logger.error(f"Error al listar archivos de backup: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al listar backups: {str(e)}")
    
    # Ordenar por fecha (más recientes primero)
    backups.sort(key=lambda x: x.filename, reverse=True)
    
    return backups

@router.post("/create", response_model=BackupInfo)
async def create_backup(
    options: Optional[BackupOptions] = None,
    background_tasks: BackgroundTasks = None,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Crea un nuevo backup del sistema.
    """
    try:
        # Verificar permisos (solo administradores y Ramon)
        if not verify_user_role(current_user, [UserRole.ADMIN, "Ramon"]):
            raise HTTPException(status_code=403, detail="No tienes permisos para crear backups")
        
        # Si no se proporcionan opciones, usar valores predeterminados
        if options is None:
            options = BackupOptions()
        
        # Establecer el usuario que creó el backup (si está autenticado)
        if current_user:
            options.created_by = current_user.email
        else:
            # Si no hay usuario autenticado, usar un valor predeterminado
            options.created_by = 'sistema'
        
        # Ejecutar backup (en segundo plano si se proporciona background_tasks)
        if background_tasks:
            # Crear backup en segundo plano
            background_tasks.add_task(BackupService.create_backup, options)
            return JSONResponse(
                status_code=202,
                content={"message": "Backup iniciado en segundo plano"}
            )
        else:
            # Crear backup ahora
            backup_info = await BackupService.create_backup(options)
            return backup_info
    except Exception as e:
        logger.error(f"Error al crear backup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/restore/{filename}")
async def restore_backup(
    filename: str,
    background_tasks: BackgroundTasks = None,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Restaura el sistema desde un backup existente.
    """
    try:
        # Verificar permisos (solo administradores pueden restaurar)
        if not verify_user_role(current_user, [UserRole.ADMIN]):
            raise HTTPException(status_code=403, detail="Solo los administradores pueden restaurar backups")
        
        # Verificar que el archivo existe
        backup_path = os.path.join(BackupService.BACKUP_DIR, filename)
        if not os.path.exists(backup_path):
            raise HTTPException(status_code=404, detail=f"El archivo de backup {filename} no existe")
        
        # Restaurar backup (en segundo plano si se proporciona background_tasks)
        if background_tasks:
            # Restaurar en segundo plano
            background_tasks.add_task(BackupService.restore_backup, filename)
            return JSONResponse(
                status_code=202,
                content={"message": f"Restauración desde {filename} iniciada en segundo plano"}
            )
        else:
            # Restaurar ahora
            await BackupService.restore_backup(filename)
            return JSONResponse(
                status_code=200,
                content={"message": f"Sistema restaurado correctamente desde {filename}"}
            )
    except Exception as e:
        logger.error(f"Error al restaurar backup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{filename}")
async def delete_backup(
    filename: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Elimina un backup existente.
    """
    try:
        # Verificar permisos (solo administradores pueden eliminar)
        if not verify_user_role(current_user, [UserRole.ADMIN]):
            raise HTTPException(status_code=403, detail="Solo los administradores pueden eliminar backups")
        
        # Verificar que el archivo existe
        backup_path = os.path.join(BackupService.BACKUP_DIR, filename)
        if not os.path.exists(backup_path):
            raise HTTPException(status_code=404, detail=f"El archivo de backup {filename} no existe")
            
        # Eliminar archivo directamente
        try:
            os.remove(backup_path)
            logger.info(f"Backup eliminado: {filename}")
        except Exception as e:
            logger.error(f"Error al eliminar archivo de backup {filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error al eliminar backup: {str(e)}")
        
        return JSONResponse(
            status_code=200,
            content={"message": f"Backup {filename} eliminado correctamente"}
        )
    except Exception as e:
        logger.error(f"Error al eliminar backup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{filename}")
async def download_backup(
    filename: str,
    token: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Descarga un backup existente.
    """
    try:
        # Si no hay usuario autenticado pero hay token como parámetro URL, intentamos verificar manualmente
        authenticated_user = current_user
        if not authenticated_user and token:
            logger.info(f"No hay usuario autenticado pero se proporcionó token URL: {token[:10]}...")
            try:
                # Verificamos el token y obtenemos el usuario
                payload = verify_token(token)
                if payload and "sub" in payload:
                    username = payload["sub"]
                    authenticated_user = await User.filter(username=username).first()
                    if authenticated_user:
                        logger.info(f"Usuario autenticado mediante token URL: {authenticated_user.username}, Rol: {authenticated_user.role}")
                    else:
                        logger.error(f"Usuario {username} no encontrado en la base de datos")
            except Exception as e:
                logger.error(f"Error al verificar token URL: {str(e)}")
        
        # Verificar permisos (administradores y Ramon pueden descargar)
        logger.info(f"Usuario intentando descargar backup: {authenticated_user.username if authenticated_user else 'No autenticado'}, Rol: {authenticated_user.role if authenticated_user else 'N/A'}")
        allowed_roles = [UserRole.ADMIN, "Ramon"]
        logger.info(f"Roles permitidos: {allowed_roles}")
        
        if not authenticated_user:
            logger.error("Usuario no autenticado intentando descargar backup")
            raise HTTPException(status_code=403, detail="Debes iniciar sesión para descargar backups")
            
        if authenticated_user.role not in allowed_roles:
            logger.error(f"Usuario sin permisos: {authenticated_user.username}, Rol: {authenticated_user.role}")
            raise HTTPException(status_code=403, detail=f"No tienes permisos para descargar backups. Tu rol: {authenticated_user.role}, Roles permitidos: {allowed_roles}")
        
        # Verificar que el archivo existe
        backup_path = os.path.join(BackupService.BACKUP_DIR, filename)
        if not os.path.exists(backup_path):
            raise HTTPException(status_code=404, detail=f"El archivo de backup {filename} no existe")
        
        # Devolver archivo para descarga
        return FileResponse(
            path=backup_path,
            filename=filename,
            media_type="application/octet-stream"
        )
    except Exception as e:
        logger.error(f"Error al descargar backup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
