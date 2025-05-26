#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script simplificado para probar el sistema de backups
Autor: Cascade AI
Fecha: 26/05/2025
"""

import sys
import os
import requests
import json
import time
from datetime import datetime

# URL base de la API
API_URL = "http://localhost:8000/api/v1"

def main():
    """Función principal"""
    print("=== PRUEBA SIMPLE DEL SISTEMA DE BACKUPS ===")
    print(f"API URL: {API_URL}")
    print(f"Fecha y hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    
    # 1. Iniciar sesión
    print("\n1. Iniciando sesión...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        login_response = requests.post(
            f"{API_URL}/auth/login", 
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        login_response.raise_for_status()
        token_data = login_response.json()
        token = token_data.get("access_token")
        print(f"✅ Sesión iniciada correctamente. Token: {token[:10]}...")
    except Exception as e:
        print(f"❌ Error al iniciar sesión: {str(e)}")
        return
    
    # 2. Obtener lista de backups
    print("\n2. Obteniendo lista de backups...")
    try:
        backups_response = requests.get(
            f"{API_URL}/backup/list",
            headers={"Authorization": f"Bearer {token}"}
        )
        backups_response.raise_for_status()
        backups = backups_response.json()
        print(f"✅ Se encontraron {len(backups)} backups")
        for i, backup in enumerate(backups[:5], 1):  # Mostrar solo los primeros 5
            print(f"  {i}. {backup.get('filename', 'N/A')} - {backup.get('date', 'N/A')} - {backup.get('size', 'N/A')}")
    except Exception as e:
        print(f"❌ Error al obtener la lista de backups: {str(e)}")
    
    # 3. Crear un nuevo backup
    print("\n3. Creando un nuevo backup...")
    try:
        create_response = requests.post(
            f"{API_URL}/backup/create",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={
                "include_animals": True,
                "include_births": True,
                "include_config": True,
                "created_by": "test_script",
                "description": "Backup de prueba"
            }
        )
        
        # Mostrar información de la respuesta para depuración
        print(f"Código de estado: {create_response.status_code}")
        print(f"Encabezados de respuesta: {dict(create_response.headers)}")
        
        try:
            response_json = create_response.json()
            print(f"Respuesta JSON: {response_json}")
        except:
            print(f"Respuesta texto: {create_response.text}")
        
        create_response.raise_for_status()
        print("✅ Backup creado correctamente")
    except Exception as e:
        print(f"❌ Error al crear backup: {str(e)}")
    
    print("\n=== PRUEBA COMPLETADA ===")

if __name__ == "__main__":
    main()
