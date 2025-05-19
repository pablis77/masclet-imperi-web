"""
Script para mejorar el registro de historial en los endpoints de animales
sin romper la compatibilidad existente.
"""
import sys
import os
import logging
import asyncio
import shutil
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Directorios y archivos
BASE_PATH = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENDPOINTS_PATH = os.path.join(BASE_PATH, "backend", "app", "api", "endpoints", "animals.py")

def crear_backup(file_path):
    """Crear una copia de seguridad de un archivo antes de modificarlo"""
    if os.path.exists(file_path):
        backup_name = f"{file_path}.bak.{datetime.now().strftime('%Y%m%d%H%M%S')}"
        shutil.copy2(file_path, backup_name)
        logger.info(f"Backup creado: {backup_name}")
        return True
    return False

def actualizar_trigger_backup(content):
    """
    Busca y actualiza la función trigger_backup_after_change
    para que acepte historyID como parámetro sin romper la compatibilidad.
    """
    # Patrón para encontrar la firma de la función
    old_signature = "async def trigger_backup_after_change(background_tasks: BackgroundTasks, action: str, animal_nom: str):"
    new_signature = "async def trigger_backup_after_change(background_tasks: BackgroundTasks, action: str, animal_nom: str, history_id: str = None):"
    
    # Solo actualizar si encontramos la firma exacta
    if old_signature in content:
        logger.info("Actualizando la función trigger_backup_after_change...")
        content = content.replace(old_signature, new_signature)
        
        # También actualizar la parte donde se determina el script a utilizar
        old_script_detection = """        # Obtener la ruta base del proyecto (2 niveles arriba de app/api/endpoints)
        base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        script_path = os.path.join(base_path, "new_tests", "complementos", "backup_programado.ps1")
        if os.path.exists(script_path):
            # En Windows, ejecutamos el script de PowerShell con el parámetro -AfterChange
            try:
                cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", script_path, "-AfterChange"]
                background_tasks.add_task(lambda: subprocess.run(cmd, capture_output=True))"""
                
        new_script_detection = """        # Obtener la ruta base del proyecto (2 niveles arriba de app/api/endpoints)
        base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        
        # Verificar si existe un script de backup mejorado
        backup_with_history_path = os.path.join(base_path, "new_tests", "complementos", "backup_with_history.ps1")
        legacy_script_path = os.path.join(base_path, "new_tests", "complementos", "backup_programado.ps1")
        
        if os.path.exists(backup_with_history_path):
            # Preferir el script mejorado con soporte para historial
            try:
                cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", backup_with_history_path, "-AfterChange"]
                # Añadir ID del historial si existe
                if history_id:
                    cmd.extend(["-HistoryId", str(history_id)])
                background_tasks.add_task(lambda: subprocess.run(cmd, capture_output=True))"""
        
        if old_script_detection in content:
            content = content.replace(old_script_detection, new_script_detection)
    else:
        logger.warning("No se encontró la función trigger_backup_after_change con el formato esperado")
    
    return content

def actualizar_create_animal(content):
    """
    Mejora la función create_animal para usar ambos formatos
    de historial (antiguo y nuevo) por compatibilidad.
    """
    # Buscar la sección donde se crea el historial
    marker_before = "# Registrar la creación en el historial"
    marker_after = "# Disparar backup automático tras la creación"
    
    if marker_before in content and marker_after in content:
        start_idx = content.find(marker_before)
        end_idx = content.find(marker_after, start_idx)
        
        if start_idx >= 0 and end_idx >= 0:
            current_code = content[start_idx:end_idx]
            logger.info("Actualizando la función create_animal...")
            
            # Código mejorado que registra en ambos formatos (compatibilidad)
            new_code = """        # Registrar la creación en el historial
        # Registrar en formato compatible con sistema antiguo y nuevo
        history_record = await AnimalHistory.create(
            animal=new_animal,
            # Campos para el nuevo sistema
            action="CREATE",
            user=current_user.email if current_user else "sistema",
            description=f"Creación del animal {new_animal.nom}",
            timestamp=datetime.now(),
            changes=animal_data,
            # Campos para mantener compatibilidad con sistema antiguo
            usuario=current_user.email if current_user else "sistema",
            cambio=f"Creación del animal {new_animal.nom}",
            campo="create",
            valor_anterior=None,
            valor_nuevo=new_animal.nom
        )
        
"""
            content = content.replace(content[start_idx:end_idx], new_code)
            
            # También actualizar la llamada a trigger_backup_after_change para pasar el history_id
            old_backup_call = "await trigger_backup_after_change(background_tasks, \"creación\", new_animal.nom)"
            new_backup_call = "await trigger_backup_after_change(background_tasks, \"creación\", new_animal.nom, str(history_record.id))"
            
            if old_backup_call in content:
                content = content.replace(old_backup_call, new_backup_call)
        else:
            logger.warning("No se encontró la sección esperada en create_animal")
    else:
        logger.warning("No se encontraron los marcadores en create_animal")
    
    return content

def actualizar_update_animal_patch(content):
    """
    Mejora el registro de historial en la función update_animal_patch
    manteniendo compatibilidad con el sistema existente.
    """
    # Buscar la sección donde se registra el historial en update_animal_patch
    old_history_code = """            # Registrar en historial
            await AnimalHistory.create(
                animal=animal,
                usuario=current_user.username,
                cambio=descripcion,
                campo=campo,
                valor_anterior=str(valor_anterior) if valor_anterior is not None else None,
                valor_nuevo=str(nuevo_valor) if nuevo_valor is not None else None
            )"""
    
    new_history_code = """            # Registrar en historial (formato compatible con ambos sistemas)
            history_record = await AnimalHistory.create(
                animal=animal,
                # Campos nuevos
                action="UPDATE",
                user=current_user.username if hasattr(current_user, 'username') else current_user.email,
                description=descripcion,
                field=campo,
                old_value=str(valor_anterior) if valor_anterior is not None else None,
                new_value=str(nuevo_valor) if nuevo_valor is not None else None,
                timestamp=datetime.now(),
                # Campos antiguos para mantener compatibilidad
                usuario=current_user.username if hasattr(current_user, 'username') else current_user.email,
                cambio=descripcion,
                campo=campo,
                valor_anterior=str(valor_anterior) if valor_anterior is not None else None,
                valor_nuevo=str(nuevo_valor) if nuevo_valor is not None else None
            )"""
    
    if old_history_code in content:
        logger.info("Actualizando registro de historial en update_animal_patch...")
        content = content.replace(old_history_code, new_history_code)
        
        # También actualizar la llamada a trigger_backup_after_change
        old_backup_call = "await trigger_backup_after_change(background_tasks, \"modificación (PATCH)\", animal.nom)"
        new_backup_call = "await trigger_backup_after_change(background_tasks, \"modificación (PATCH)\", animal.nom, str(history_record.id))"
        
        if old_backup_call in content:
            content = content.replace(old_backup_call, new_backup_call)
    else:
        logger.warning("No se encontró el código esperado en update_animal_patch")
    
    return content

def actualizar_delete_animal(content):
    """
    Mejora la función delete_animal para registrar la eliminación
    en el historial antes de eliminar el animal.
    """
    # Buscar la función delete_animal
    delete_start = "@router.delete(\"/{animal_id}\", status_code=204)\nasync def delete_animal"
    
    if delete_start in content:
        # Encontrar la línea donde se elimina el animal
        delete_line = "await animal.delete()"
        
        if delete_line in content:
            # Ubicar dónde insertar el código del historial
            start_idx = content.find(delete_start)
            delete_idx = content.find(delete_line, start_idx)
            
            if delete_idx > start_idx:
                # Verificar que la función acepta current_user
                if "current_user: User = Depends(get_current_user)" not in content[start_idx:delete_idx]:
                    logger.info("Actualizando la firma de delete_animal...")
                    old_signature = "async def delete_animal(animal_id: int) -> None:"
                    new_signature = "async def delete_animal(animal_id: int, background_tasks: BackgroundTasks = None, current_user: User = Depends(get_current_user)) -> None:"
                    content = content.replace(old_signature, new_signature)
                
                # Insertar código para registrar en el historial
                logger.info("Añadiendo registro de historial en delete_animal...")
                history_code = """        # Guardar información del animal antes de eliminarlo
        animal_info = await animal.to_dict(include_partos=False)
        animal_name = animal.nom
        
        # Registrar la eliminación en el historial
        history_record = await AnimalHistory.create(
            animal=animal,
            # Campos nuevos
            action="DELETE",
            user=current_user.email if current_user else "sistema",
            description=f"Eliminación del animal {animal.nom}",
            timestamp=datetime.now(),
            changes=animal_info,
            # Campos antiguos para mantener compatibilidad
            usuario=current_user.email if current_user else "sistema",
            cambio=f"Eliminación del animal {animal.nom}",
            campo="delete",
            valor_anterior=animal.nom,
            valor_nuevo=None
        )
        
        # Disparar backup automático antes de eliminar
        if background_tasks:
            await trigger_backup_after_change(background_tasks, "eliminación", animal_name, str(history_record.id))
        
"""
                content = content.replace(f"        {delete_line}", f"{history_code}        {delete_line}")
        else:
            logger.warning("No se encontró la línea de eliminación en delete_animal")
    else:
        logger.warning("No se encontró la función delete_animal")
    
    return content

def actualizar_imports(content):
    """Añade los imports necesarios si no están presentes"""
    # Verificar que datetime está importado
    if "from datetime import datetime" not in content:
        # Encontrar sección de imports
        import_section = "from datetime import"
        if import_section in content:
            # Ya hay imports de datetime, añadir datetime
            new_import = "from datetime import date, datetime"
            content = content.replace("from datetime import date", new_import)
        else:
            # Añadir import de datetime
            import_line = "from datetime import datetime"
            first_import = "from fastapi import"
            if first_import in content:
                content = content.replace(first_import, f"{import_line}\n{first_import}")
    
    return content

def main():
    """Función principal"""
    logger.info("=== MEJORANDO EL REGISTRO DE HISTORIAL DE CAMBIOS ===")
    
    # 1. Crear backup del archivo original
    if not crear_backup(ENDPOINTS_PATH):
        logger.error(f"No se pudo crear backup de {ENDPOINTS_PATH}")
        return
    
    try:
        # 2. Leer el contenido actual
        with open(ENDPOINTS_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 3. Actualizar los imports
        content = actualizar_imports(content)
        
        # 4. Actualizar la función trigger_backup_after_change
        content = actualizar_trigger_backup(content)
        
        # 5. Actualizar create_animal
        content = actualizar_create_animal(content)
        
        # 6. Actualizar update_animal_patch
        content = actualizar_update_animal_patch(content)
        
        # 7. Actualizar delete_animal
        content = actualizar_delete_animal(content)
        
        # 8. Guardar los cambios
        with open(ENDPOINTS_PATH, 'w', encoding='utf-8') as f:
            f.write(content)
        
        logger.info("✅ Modificaciones aplicadas correctamente")
        logger.info("El sistema ahora registra el historial en ambos formatos para mantener compatibilidad")
        logger.info("Se ha creado un backup del archivo original por seguridad")
        
    except Exception as e:
        logger.error(f"Error al procesar el archivo: {str(e)}")

if __name__ == "__main__":
    main()
