#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para probar la programación de backups automáticos
Autor: Cascade AI
Fecha: 24/05/2025
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# URL base de la API
API_URL = "http://localhost:8000/api/v1"

def test_schedule_automatic_backup():
    """Prueba la programación de un backup automático"""
    print("=== PRUEBA DE PROGRAMACIÓN DE BACKUP AUTOMÁTICO ===")
    print(f"URL base: {API_URL}")
    print(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=================================================")
    
    try:
        # Token de autenticación (simulado para la prueba)
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6NDEwMjQ0NDgwMH0.x"
        
        # Calcular la próxima ejecución (5 minutos en el futuro para la prueba)
        next_execution = (datetime.now() + timedelta(minutes=5)).strftime('%Y-%m-%d %H:%M:%S')
        
        # Opciones para la programación del backup automático
        options = {
            "schedule_type": "daily",
            "next_execution": next_execution,
            "include_animals": True,
            "include_births": True,
            "include_config": True,
            "retention_days": 7,
            "description": "Backup automático diario"
        }
        
        print(f"Opciones de backup automático: {json.dumps(options, indent=2)}")
        print(f"URL completa: {API_URL}/backup/schedule")
        
        # Realizar la petición POST para programar el backup automático
        response = requests.post(
            f"{API_URL}/backup/schedule",
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
            print("\n✅ BACKUP AUTOMÁTICO PROGRAMADO CORRECTAMENTE")
            return True
        else:
            print(f"\n❌ ERROR AL PROGRAMAR BACKUP AUTOMÁTICO: {response.status_code}")
            return False
    
    except Exception as e:
        print(f"\n❌ EXCEPCIÓN: {str(e)}")
        return False

def test_list_scheduled_backups():
    """Prueba el listado de backups programados"""
    print("\n=== VERIFICACIÓN DE BACKUPS PROGRAMADOS ===")
    
    try:
        # Token de autenticación (simulado para la prueba)
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6NDEwMjQ0NDgwMH0.x"
        
        # Realizar la petición GET para listar los backups programados
        response = requests.get(
            f"{API_URL}/backup/scheduled",
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
            print(f"Número de backups programados: {len(data)}")
            
            # Mostrar información de los backups programados
            if data:
                for i, schedule in enumerate(data):
                    print(f"\nBackup programado #{i+1}:")
                    print(f"  ID: {schedule.get('id')}")
                    print(f"  Tipo: {schedule.get('schedule_type')}")
                    print(f"  Próxima ejecución: {schedule.get('next_execution')}")
                    print(f"  Descripción: {schedule.get('description')}")
        except Exception as e:
            print(f"Error al parsear JSON: {str(e)}")
            print("Respuesta no es JSON válido:")
            print(response.text[:500])  # Mostrar primeros 500 caracteres
        
        return response.status_code == 200
    
    except Exception as e:
        print(f"Error al listar backups programados: {str(e)}")
        return False

if __name__ == "__main__":
    # Probar la programación de backup automático
    schedule_success = test_schedule_automatic_backup()
    
    # Si la programación fue exitosa, verificar el listado de backups programados
    if schedule_success:
        list_success = test_list_scheduled_backups()
        
        if list_success:
            print("\n✅ VERIFICACIÓN COMPLETA EXITOSA")
            sys.exit(0)
        else:
            print("\n❌ ERROR EN LA VERIFICACIÓN")
            sys.exit(1)
    else:
        sys.exit(1)
