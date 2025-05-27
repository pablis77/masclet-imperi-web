#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para actualizar los permisos de backup según la documentación.
Este script modifica el archivo de endpoints de backup para asegurar que:
1. Ramon pueda ver la lista de backups (ya implementado)
2. Ramon pueda crear backups (ya implementado)
3. Solo los administradores puedan restaurar backups (ya implementado)
4. Solo los administradores puedan eliminar backups (ya implementado)
5. Ramon pueda descargar backups (esto necesita ser corregido)
"""

import os
import re
import shutil
from datetime import datetime

# Ruta al archivo de backup endpoints
BACKUP_FILE = os.path.join('backend', 'app', 'api', 'endpoints', 'backup.py')

def main():
    print(f"Actualizando permisos de backup en: {BACKUP_FILE}")
    
    # Verificar que el archivo existe
    if not os.path.exists(BACKUP_FILE):
        print(f"Error: No se encontró el archivo {BACKUP_FILE}")
        return False
    
    # Crear backup del archivo original
    backup_path = f"{BACKUP_FILE}.bak_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    shutil.copy2(BACKUP_FILE, backup_path)
    print(f"Backup creado en: {backup_path}")
    
    # Leer el contenido del archivo
    with open(BACKUP_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar y reemplazar la sección de permisos para la descarga de backups
    download_pattern = r'@router\.get\("/download/\{filename\}"\)[^@]+?try:[^#]+?# Verificar permisos[^\n]+\n\s+if not verify_user_role\(current_user, \[UserRole\.ADMIN\]\):[^#]+?\n\s+raise HTTPException\([^)]+?\)'
    
    download_replacement = '''@router.get("/download/{filename}")
async def download_backup(
    filename: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Descarga un backup existente.
    """
    try:
        # Verificar permisos (administradores y Ramon pueden descargar)
        if not verify_user_role(current_user, [UserRole.ADMIN, "Ramon"]):
            raise HTTPException(status_code=403, detail="No tienes permisos para descargar backups")'''
    
    # Aplicar reemplazo
    new_content = re.sub(download_pattern, download_replacement, content, flags=re.DOTALL)
    
    # Guardar el archivo modificado
    with open(BACKUP_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Permisos de backup actualizados correctamente.")
    print("Ramon ahora puede descargar backups, pero solo los administradores pueden restaurarlos o eliminarlos.")
    return True

if __name__ == "__main__":
    main()
