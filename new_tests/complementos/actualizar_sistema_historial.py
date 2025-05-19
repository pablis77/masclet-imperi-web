"""
Script para actualizar el sistema de historial de cambios en animales
y conectarlo con el sistema de backup.
"""
import os
import sys
import logging
import re
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Rutas a los archivos principales
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ANIMAL_MODEL_PATH = os.path.join(BASE_DIR, "backend", "app", "models", "animal.py")
ANIMAL_ENDPOINTS_PATH = os.path.join(BASE_DIR, "backend", "app", "api", "endpoints", "animals.py")

def update_animal_history_model():
    """Actualiza el modelo AnimalHistory para usar nombres de campos estandarizados"""
    logger.info("Actualizando modelo AnimalHistory...")
    
    if not os.path.exists(ANIMAL_MODEL_PATH):
        logger.error(f"No se encuentra el archivo {ANIMAL_MODEL_PATH}")
        return False
    
    with open(ANIMAL_MODEL_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Patrón para encontrar la clase AnimalHistory
    pattern = r'class AnimalHistory\(models\.Model\):.*?class'
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        logger.error("No se encontró la clase AnimalHistory en el modelo")
        return False
    
    animal_history_class = match.group(0)[:-5]  # Eliminar la última palabra 'class'
    
    # Crear nueva definición de clase
    new_class = """class AnimalHistory(models.Model):
    \"\"\"Modelo para registrar el historial de cambios en animales\"\"\"
    id = fields.IntField(pk=True)
    animal = fields.ForeignKeyField(
        "models.Animal", related_name="history_records", on_delete=fields.CASCADE
    )
    # Acciones estándares: CREATE, UPDATE, DELETE
    action = fields.CharField(max_length=20)
    # Quién realizó los cambios
    user = fields.CharField(max_length=100)
    # Fecha y hora del cambio
    timestamp = fields.DatetimeField(auto_now_add=True)
    # Campo específico modificado (si aplica)
    field = fields.CharField(max_length=50, null=True)
    # Descripción del cambio
    description = fields.TextField()
    # Valores anteriores y nuevos (como JSON)
    old_value = fields.TextField(null=True)
    new_value = fields.TextField(null=True)
    # Datos completos del cambio (como JSON, útil para CREATE)
    changes = fields.JSONField(null=True)
    
    class Meta:
        \"\"\"Metadatos del modelo\"\"\"
        table = "animal_history"
        ordering = ["-timestamp", "-id"]
    
    async def to_dict(self) -> dict:
        \"\"\"Convierte el modelo a diccionario\"\"\"
        return {
            "id": self.id,
            "animal_id": self.animal_id,
            "action": self.action,
            "user": self.user,
            "timestamp": self.timestamp.strftime("%d/%m/%Y %H:%M:%S") if self.timestamp else None,
            "field": self.field,
            "description": self.description,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "changes": self.changes
        }

class"""
    
    # Reemplazar la clase en el contenido
    new_content = content.replace(animal_history_class, new_class)
    
    # Guardar el archivo actualizado
    with open(ANIMAL_MODEL_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    logger.info("Modelo AnimalHistory actualizado correctamente.")
    return True

def update_create_animal_function():
    """Actualiza la función create_animal para usar el nuevo modelo de historial"""
    logger.info("Actualizando función create_animal...")
    
    if not os.path.exists(ANIMAL_ENDPOINTS_PATH):
        logger.error(f"No se encuentra el archivo {ANIMAL_ENDPOINTS_PATH}")
        return False
    
    with open(ANIMAL_ENDPOINTS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar y reemplazar la creación del historial en la función create_animal
    old_pattern = r'await AnimalHistory\.create\(\s*animal=new_animal,\s*action="CREATE",[^)]*\)\s*# Disparar backup'
    
    new_code = """        history_record = await AnimalHistory.create(
            animal=new_animal,
            action="CREATE",
            user=current_user.email if current_user else "sistema",
            description=f"Creación del animal {new_animal.nom}",
            changes=animal_data
        )
        
        # Disparar backup"""
    
    new_content = re.sub(old_pattern, new_code, content, flags=re.DOTALL)
    
    # Actualizar la llamada a trigger_backup_after_change
    old_backup_pattern = r'await trigger_backup_after_change\(background_tasks, "creación", new_animal\.nom\)'
    new_backup_code = 'await trigger_backup_after_change(background_tasks, "creación", new_animal.nom, str(history_record.id))'
    
    new_content = new_content.replace(old_backup_pattern, new_backup_code)
    
    # Guardar el archivo actualizado
    with open(ANIMAL_ENDPOINTS_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    logger.info("Función create_animal actualizada correctamente.")
    return True

def update_patch_function():
    """Actualiza la función update_animal_patch para usar el nuevo modelo de historial"""
    logger.info("Actualizando función update_animal_patch...")
    
    if not os.path.exists(ANIMAL_ENDPOINTS_PATH):
        logger.error(f"No se encuentra el archivo {ANIMAL_ENDPOINTS_PATH}")
        return False
    
    with open(ANIMAL_ENDPOINTS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar y reemplazar el registro del historial en la función update_animal_patch
    old_pattern = r'# Registrar en historial\s*await AnimalHistory\.create\(\s*animal=animal,\s*usuario=[^,]*,\s*cambio=[^,]*,\s*campo=[^,]*,\s*valor_anterior=[^,]*,\s*valor_nuevo=[^)]*\s*\)'
    
    new_code = """            # Registrar en historial
            history_record = await AnimalHistory.create(
                animal=animal,
                action="UPDATE",
                user=current_user.username if hasattr(current_user, 'username') else current_user.email,
                description=descripcion,
                field=campo,
                old_value=str(valor_anterior) if valor_anterior is not None else None,
                new_value=str(nuevo_valor) if nuevo_valor is not None else None
            )"""
    
    new_content = re.sub(old_pattern, new_code, content, flags=re.DOTALL)
    
    # Actualizar la llamada a trigger_backup_after_change en PATCH
    old_backup_pattern = r'await trigger_backup_after_change\(background_tasks, "modificación \(PATCH\)", animal\.nom\)'
    new_backup_code = 'await trigger_backup_after_change(background_tasks, "modificación (PATCH)", animal.nom, str(history_record.id))'
    
    new_content = new_content.replace(old_backup_pattern, new_backup_code)
    
    # Guardar el archivo actualizado
    with open(ANIMAL_ENDPOINTS_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    logger.info("Función update_animal_patch actualizada correctamente.")
    return True

def update_put_function():
    """Actualiza la función update_animal (PUT) para usar el nuevo modelo de historial"""
    logger.info("Actualizando función update_animal (PUT)...")
    
    if not os.path.exists(ANIMAL_ENDPOINTS_PATH):
        logger.error(f"No se encuentra el archivo {ANIMAL_ENDPOINTS_PATH}")
        return False
    
    with open(ANIMAL_ENDPOINTS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar y reemplazar el registro del historial en la función update_animal
    old_pattern = r'# Registrar en historial\s*for campo, nuevo_valor in raw_data\.items\(\):\s*valor_anterior = valores_anteriores\.get\(campo\)[^}]*\s*\)\s*\n\s*# Devolver el animal'
    
    new_code = """        # Registrar en historial
        last_history_record = None
        for campo, nuevo_valor in raw_data.items():
            valor_anterior = valores_anteriores.get(campo)
            
            # Convertir fechas a formato legible
            if campo == 'dob' and valor_anterior:
                valor_anterior = valor_anterior.strftime("%d/%m/%Y") if hasattr(valor_anterior, 'strftime') else str(valor_anterior)
            if campo == 'dob' and nuevo_valor:
                nuevo_valor = nuevo_valor.strftime("%d/%m/%Y") if hasattr(nuevo_valor, 'strftime') else str(nuevo_valor)
                
            # Crear descripción del cambio
            if campo == 'estado':
                descripcion = f"Actualización de estado: {valor_anterior} → {nuevo_valor}"
            elif campo == 'alletar':
                descripcion = f"Cambio de estado de amamantamiento: {valor_anterior} → {nuevo_valor}"
            elif campo == 'quadra':
                descripcion = f"Cambio de cuadra: {valor_anterior} → {nuevo_valor}"
            else:
                descripcion = f"Actualización de {campo}"
                
            # Registrar en historial
            last_history_record = await AnimalHistory.create(
                animal=animal,
                action="UPDATE",
                user=current_user.username if hasattr(current_user, 'username') else current_user.email,
                description=descripcion,
                field=campo,
                old_value=str(valor_anterior) if valor_anterior is not None else None,
                new_value=str(nuevo_valor) if nuevo_valor is not None else None
            )
            
        # Disparar backup automático tras la modificación
        if background_tasks and len(raw_data) > 0 and last_history_record:
            await trigger_backup_after_change(background_tasks, "modificación (PUT)", animal.nom, str(last_history_record.id))
    
        # Devolver el animal"""
    
    new_content = re.sub(old_pattern, new_code, content, flags=re.DOTALL)
    
    # Guardar el archivo actualizado
    with open(ANIMAL_ENDPOINTS_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    logger.info("Función update_animal (PUT) actualizada correctamente.")
    return True

def update_delete_function():
    """Actualiza la función delete_animal para registrar la eliminación en el historial"""
    logger.info("Actualizando función delete_animal...")
    
    if not os.path.exists(ANIMAL_ENDPOINTS_PATH):
        logger.error(f"No se encuentra el archivo {ANIMAL_ENDPOINTS_PATH}")
        return False
    
    with open(ANIMAL_ENDPOINTS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar el patrón de la función delete_animal
    delete_pattern = r'@router\.delete\("/{animal_id}", status_code=204\)\nasync def delete_animal\(animal_id: int\) -> None:.*?return None'
    
    # Nueva función delete_animal
    new_delete_function = """@router.delete("/{animal_id}", status_code=204)
async def delete_animal(
    animal_id: int,
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user)
) -> None:
    """Eliminar un animal"""
    try:
        # Verificar que el usuario tiene permisos para eliminar animales
        await check_permissions(current_user, Action.BORRAR)
        
        animal = await Animal.get_or_none(id=animal_id)
        if not animal:
            raise HTTPException(
                status_code=404,
                detail=f"Animal {animal_id} no encontrado"
            )
        
        # Guardar información del animal antes de eliminarlo
        animal_info = await animal.to_dict(include_partos=False)
        animal_name = animal.nom
        
        # Registrar la eliminación en el historial
        history_record = await AnimalHistory.create(
            animal=animal,
            action="DELETE",
            user=current_user.email if current_user else "sistema",
            description=f"Eliminación del animal {animal.nom}",
            changes=animal_info
        )
        
        # Disparar backup automático antes de eliminar
        if background_tasks:
            await trigger_backup_after_change(background_tasks, "eliminación", animal_name, str(history_record.id))
            
        await animal.delete()
        return None"""
    
    # Reemplazar la función delete_animal
    new_content = re.sub(delete_pattern, new_delete_function, content, flags=re.DOTALL)
    
    # Guardar el archivo actualizado
    with open(ANIMAL_ENDPOINTS_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    logger.info("Función delete_animal actualizada correctamente.")
    return True

def main():
    """Función principal"""
    logger.info("=== ACTUALIZANDO SISTEMA DE HISTORIAL DE CAMBIOS ===")
    logger.info(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. Actualizar modelo AnimalHistory
    if update_animal_history_model():
        logger.info("✓ Modelo AnimalHistory actualizado correctamente")
    else:
        logger.error("✗ Error al actualizar el modelo AnimalHistory")
    
    # 2. Actualizar función create_animal
    if update_create_animal_function():
        logger.info("✓ Función create_animal actualizada correctamente")
    else:
        logger.error("✗ Error al actualizar la función create_animal")
    
    # 3. Actualizar función update_animal_patch
    if update_patch_function():
        logger.info("✓ Función update_animal_patch actualizada correctamente")
    else:
        logger.error("✗ Error al actualizar la función update_animal_patch")
    
    # 4. Actualizar función update_animal (PUT)
    if update_put_function():
        logger.info("✓ Función update_animal (PUT) actualizada correctamente")
    else:
        logger.error("✗ Error al actualizar la función update_animal (PUT)")
    
    # 5. Actualizar función delete_animal
    if update_delete_function():
        logger.info("✓ Función delete_animal actualizada correctamente")
    else:
        logger.error("✗ Error al actualizar la función delete_animal")
    
    logger.info("=== ACTUALIZACIÓN COMPLETADA ===")
    logger.info("Ahora el sistema registra correctamente el historial de cambios y lo conecta con el sistema de backup.")

if __name__ == "__main__":
    main()
