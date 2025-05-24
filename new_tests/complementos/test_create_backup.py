#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para probar la creación de backups manualmente
Autor: Cascade AI
Fecha: 24/05/2025
"""

import requests
import json
import sys
from datetime import datetime

# URL base de la API
API_URL = "http://localhost:8000/api/v1"

def test_create_backup():
    """Prueba la creación de un backup manual"""
    print("=== PRUEBA DE CREACIÓN DE BACKUP MANUAL ===")
    print(f"URL base: {API_URL}")
    print(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("==========================================")
    
    try:
        # Token de autenticación (simulado para la prueba)
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6NDEwMjQ0NDgwMH0.x"
        
        # Opciones para la creación del backup
        options = {
            "include_animals": True,
            "include_births": True,
            "include_config": True,
            "created_by": "test_script",
            "description": f"Backup de prueba creado el {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        }
        
        print(f"Opciones de backup: {json.dumps(options, indent=2)}")
        print(f"URL completa: {API_URL}/backup/create")
        
        # Realizar la petición POST para crear el backup
        response = requests.post(
            f"{API_URL}/backup/create",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            },
            json=options
        )
        
        # Mostrar información de la respuesta
        print(f"\nCódigo de estado: {response.status_code}")
        print(f"Headers de respuesta: {dict(response.headers)}")
        
        # Intentar parsear la respuesta como JSON
        try:
            data = response.json()
            print("\nRespuesta JSON:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
        except:
            print("\nRespuesta no es JSON válido:")
            print(response.text[:500])  # Mostrar primeros 500 caracteres
        
        # Verificar si la petición fue exitosa
        if response.status_code in [200, 201, 202]:
            print("\n✅ BACKUP CREADO CORRECTAMENTE")
            return True
        else:
            print(f"\n❌ ERROR AL CREAR BACKUP: {response.status_code}")
            return False
    
    except Exception as e:
        print(f"\n❌ EXCEPCIÓN: {str(e)}")
        return False

def test_list_backups():
    """Prueba el listado de backups para verificar que el nuevo backup se creó correctamente"""
    print("\n=== VERIFICACIÓN DE LISTADO DE BACKUPS ===")
    
    try:
        # Token de autenticación (simulado para la prueba)
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6NDEwMjQ0NDgwMH0.x"
        
        # Realizar la petición GET para listar los backups
        response = requests.get(
            f"{API_URL}/backup/list",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )
        
        # Mostrar información de la respuesta
        print(f"Código de estado: {response.status_code}")
        
        # Intentar parsear la respuesta como JSON
        try:
            data = response.json()
            print(f"Número de backups encontrados: {len(data)}")
            
            # Mostrar información del último backup
            if data:
                last_backup = data[0]  # Asumimos que el más reciente está primero
                print("\nÚltimo backup:")
                print(f"  Filename: {last_backup.get('filename')}")
                print(f"  Fecha: {last_backup.get('date')}")
                print(f"  Tamaño: {last_backup.get('size')}")
                print(f"  Creado por: {last_backup.get('created_by')}")
        except:
            print("Respuesta no es JSON válido:")
            print(response.text[:500])  # Mostrar primeros 500 caracteres
        
        return response.status_code == 200
    
    except Exception as e:
        print(f"Error al listar backups: {str(e)}")
        return False

if __name__ == "__main__":
    # Probar la creación de backup
    create_success = test_create_backup()
    
    # Si la creación fue exitosa, verificar el listado de backups
    if create_success:
        list_success = test_list_backups()
        
        if list_success:
            print("\n✅ VERIFICACIÓN COMPLETA EXITOSA")
            sys.exit(0)
        else:
            print("\n❌ ERROR EN LA VERIFICACIÓN")
            sys.exit(1)
    else:
        sys.exit(1)
