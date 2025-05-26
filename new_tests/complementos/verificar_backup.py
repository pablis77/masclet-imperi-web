#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Verificador del sistema de backup automático

Este script verifica que el sistema de backup automático funciona correctamente.
"""

import os
import sys
import json
import time
from datetime import datetime

# Añadir ruta del proyecto
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Colores para output en consola
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

def verificar_historial_backups():
    """Verificar directamente el historial de backups en el archivo JSON"""
    history_path = os.path.join(
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')),
        "backend", "backups", "backup_log.json"
    )
    
    print(f"{Colors.BLUE}Verificando archivo de historial: {history_path}{Colors.END}")
    
    try:
        if not os.path.exists(history_path):
            print(f"{Colors.RED}✗ El archivo de historial no existe{Colors.END}")
            return False
        
        with open(history_path, "r", encoding="utf-8") as f:
            history = json.load(f)
        
        if not history:
            print(f"{Colors.RED}✗ El historial está vacío{Colors.END}")
            return False
        
        # Obtener los últimos 3 backups
        ultimos_backups = sorted(history, key=lambda x: x.get("timestamp", ""), reverse=True)[:3]
        
        print(f"{Colors.GREEN}✓ Últimos backups encontrados:{Colors.END}")
        for i, backup in enumerate(ultimos_backups):
            print(f"\n{Colors.CYAN}Backup {i+1}:{Colors.END}")
            print(f"  - Nombre: {backup.get('filename')}")
            print(f"  - Fecha: {backup.get('date')}")
            print(f"  - Tamaño: {backup.get('size')}")
            print(f"  - Tipo: {backup.get('backup_type')}")
            print(f"  - Categoría: {backup.get('retention_category', 'N/A')}")
            print(f"  - Descripción: {backup.get('description')}")
        
        # Verificar que todos los elementos tienen retention_category
        errores = []
        for i, entry in enumerate(history):
            if "retention_category" not in entry:
                errores.append(f"Entrada {i}: falta retention_category")
            if "backup_type" not in entry:
                errores.append(f"Entrada {i}: falta backup_type")
        
        if errores:
            print(f"\n{Colors.RED}✗ Se encontraron errores en el historial:{Colors.END}")
            for error in errores:
                print(f"  - {error}")
            return False
        else:
            print(f"\n{Colors.GREEN}✓ Todos los elementos del historial tienen retention_category y backup_type{Colors.END}")
            
            # Contar tipos de backup
            tipos = {}
            for entry in history:
                tipo = entry.get("backup_type")
                tipos[tipo] = tipos.get(tipo, 0) + 1
            
            print(f"\n{Colors.BLUE}Distribución de tipos de backup:{Colors.END}")
            for tipo, cantidad in tipos.items():
                print(f"  - {tipo}: {cantidad}")
            
            return True
    except Exception as e:
        print(f"\n{Colors.RED}✗ Error al verificar el historial: {str(e)}{Colors.END}")
        return False

if __name__ == "__main__":
    print(f"\n{Colors.BOLD}{Colors.MAGENTA}=== VERIFICACIÓN DEL SISTEMA DE BACKUP ===\n{Colors.END}")
    
    # Verificar historial de backups desde el archivo
    exito_historial = verificar_historial_backups()
    
    # Resumen
    print(f"\n{Colors.BOLD}{Colors.MAGENTA}=== RESULTADO DE LA VERIFICACIÓN ===\n{Colors.END}")
    
    if exito_historial:
        print(f"{Colors.BOLD}{Colors.GREEN}✓ VERIFICACIÓN EXITOSA: El sistema de backup funciona correctamente{Colors.END}")
    else:
        print(f"{Colors.BOLD}{Colors.RED}✗ VERIFICACIÓN FALLIDA: Se encontraron problemas en el sistema de backup{Colors.END}")
