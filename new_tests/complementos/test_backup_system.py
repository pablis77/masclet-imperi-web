#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para probar el sistema de backups sin usar la documentación de la API
Autor: Cascade AI
Fecha: 26/05/2025
"""

import sys
import os
import requests
import json
import time
from datetime import datetime

# Añadir el directorio raíz del proyecto al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# URL base de la API
API_URL = "http://localhost:8000/api/v1"

# Token de autenticación (necesitarás obtener uno válido)
TOKEN = None

def login():
    """Inicia sesión y obtiene un token de autenticación"""
    global TOKEN
    
    print("=== INICIANDO SESIÓN ===")
    
    # Datos de inicio de sesión en formato de formulario
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        # Enviar los datos como un formulario, no como JSON
        response = requests.post(
            f"{API_URL}/auth/login", 
            data=login_data,  # Usar data en lugar de json
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        response.raise_for_status()
        
        data = response.json()
        TOKEN = data.get("access_token")
        
        if TOKEN:
            print("✅ Sesión iniciada correctamente")
            return True
        else:
            print("❌ No se pudo obtener el token de autenticación")
            return False
    except Exception as e:
        print(f"❌ Error al iniciar sesión: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print(f"  - Código de estado: {e.response.status_code}")
            try:
                error_detail = e.response.json()
                print(f"  - Detalle: {error_detail}")
            except:
                print(f"  - Respuesta: {e.response.text}")
        return False

def get_backups_list():
    """Obtiene la lista de backups disponibles"""
    print("\n=== OBTENIENDO LISTA DE BACKUPS ===")
    
    headers = {
        "Authorization": f"Bearer {TOKEN}"
    }
    
    try:
        response = requests.get(f"{API_URL}/backup/list", headers=headers)
        response.raise_for_status()
        
        backups = response.json()
        print(f"✅ Se encontraron {len(backups)} backups")
        
        for i, backup in enumerate(backups, 1):
            print(f"  {i}. {backup['filename']} - {backup['date']} - {backup['size']}")
        
        return backups
    except Exception as e:
        print(f"❌ Error al obtener la lista de backups: {str(e)}")
        return []

def create_backup():
    """Crea un nuevo backup"""
    print("\n=== CREANDO NUEVO BACKUP ===")
    
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    
    options = {
        "include_animals": True,
        "include_births": True,
        "include_config": True,
        "created_by": "test_script",
        "description": "Backup creado por script de prueba"
    }
    
    try:
        print(f"Enviando solicitud POST a {API_URL}/backup/create")
        print(f"Headers: {headers}")
        print(f"Datos: {options}")
        
        response = requests.post(f"{API_URL}/backup/create", headers=headers, json=options)
        
        print(f"Código de estado: {response.status_code}")
        print(f"Encabezados de respuesta: {response.headers}")
        
        # Intentar obtener el contenido de la respuesta
        try:
            content = response.json()
            print(f"Contenido de la respuesta (JSON): {content}")
        except Exception as json_error:
            print(f"No se pudo parsear la respuesta como JSON: {str(json_error)}")
            print(f"Contenido de la respuesta (texto): {response.text}")
            content = {}
        
        response.raise_for_status()
        
        # Verificar si la respuesta contiene los campos esperados
        if 'filename' not in content:
            print("\u26a0️ La respuesta no contiene el campo 'filename'")
            print(f"Campos disponibles: {list(content.keys()) if isinstance(content, dict) else 'Ninguno'}")
            return content
        
        backup_info = content
        print(f"✅ Backup creado exitosamente: {backup_info['filename']}")
        print(f"  - Fecha: {backup_info.get('date', 'No disponible')}")
        print(f"  - Tamaño: {backup_info.get('size', 'No disponible')}")
        
        return backup_info
    except Exception as e:
        print(f"❌ Error al crear backup: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print(f"  - Código de estado: {e.response.status_code}")
            try:
                error_detail = e.response.json()
                print(f"  - Detalle: {error_detail}")
            except:
                print(f"  - Respuesta: {e.response.text}")
        return None

def delete_backup(filename):
    """Elimina un backup existente"""
    print(f"\n=== ELIMINANDO BACKUP: {filename} ===")
    
    headers = {
        "Authorization": f"Bearer {TOKEN}"
    }
    
    try:
        response = requests.delete(f"{API_URL}/backup/delete/{filename}", headers=headers)
        response.raise_for_status()
        
        result = response.json()
        if result.get("success", False):
            print(f"✅ Backup eliminado exitosamente: {filename}")
        else:
            print(f"❌ No se pudo eliminar el backup: {filename}")
        
        return result.get("success", False)
    except Exception as e:
        print(f"❌ Error al eliminar backup: {str(e)}")
        return False

def main():
    """Función principal"""
    print("=== PRUEBA DEL SISTEMA DE BACKUPS ===")
    print(f"API URL: {API_URL}")
    print(f"Fecha y hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    
    # Iniciar sesión
    if not login():
        print("❌ No se pudo iniciar sesión. Abortando pruebas.")
        return
    
    # Obtener lista de backups inicial
    initial_backups = get_backups_list()
    
    # Crear un nuevo backup
    new_backup = create_backup()
    
    if new_backup:
        # Esperar un momento para que el backup se complete
        print("\nEsperando 3 segundos...")
        time.sleep(3)
        
        # Obtener lista de backups actualizada
        updated_backups = get_backups_list()
        
        # Verificar que el nuevo backup aparece en la lista
        found = False
        for backup in updated_backups:
            if backup["filename"] == new_backup["filename"]:
                found = True
                break
        
        if found:
            print("\n✅ El nuevo backup aparece correctamente en la lista")
        else:
            print("\n❌ El nuevo backup no aparece en la lista")
        
        # Eliminar el backup creado para limpiar
        if input("\n¿Desea eliminar el backup creado? (s/n): ").lower() == "s":
            delete_backup(new_backup["filename"])
    
    print("\n=== PRUEBA COMPLETADA ===")

if __name__ == "__main__":
    main()
