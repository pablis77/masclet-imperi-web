#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para probar el endpoint de backup directamente
Autor: Cascade AI
Fecha: 24/05/2025
"""

import requests
import json
import sys
import os
from datetime import datetime

# URL base de la API (usamos LocalTunnel para pruebas externas)
API_URL = "https://api-masclet-imperi.loca.lt/api/v1"

def test_list_backups():
    """Prueba el endpoint de listado de backups"""
    print("Probando endpoint de listado de backups...")
    
    try:
        # Obtener token de autenticación (simulado para la prueba)
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcyMDAwMDAwMH0.signature"
        
        # Realizar la petición
        response = requests.get(
            f"{API_URL}/backup/list",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )
        
        # Mostrar información de la respuesta
        print(f"Código de estado: {response.status_code}")
        print(f"Encabezados: {response.headers}")
        
        # Intentar parsear la respuesta como JSON
        try:
            data = response.json()
            print("Respuesta JSON:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
        except:
            print("Respuesta no es JSON válido:")
            print(response.text[:500])  # Mostrar primeros 500 caracteres
        
        return response.status_code == 200
    
    except Exception as e:
        print(f"Error al probar el endpoint: {str(e)}")
        return False

def test_create_backup():
    """Prueba el endpoint de creación de backups"""
    print("Probando endpoint de creación de backups...")
    
    try:
        # Obtener token de autenticación (simulado para la prueba)
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcyMDAwMDAwMH0.signature"
        
        # Datos para la creación del backup
        data = {
            "include_animals": True,
            "include_births": True,
            "include_config": True,
            "created_by": "test_script",
            "description": "Backup de prueba desde script"
        }
        
        # Realizar la petición
        response = requests.post(
            f"{API_URL}/backup/create",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            },
            json=data
        )
        
        # Mostrar información de la respuesta
        print(f"Código de estado: {response.status_code}")
        print(f"Encabezados: {response.headers}")
        
        # Intentar parsear la respuesta como JSON
        try:
            data = response.json()
            print("Respuesta JSON:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
        except:
            print("Respuesta no es JSON válido:")
            print(response.text[:500])  # Mostrar primeros 500 caracteres
        
        return response.status_code in [200, 201, 202]
    
    except Exception as e:
        print(f"Error al probar el endpoint: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== PRUEBA DE API DE BACKUP ===")
    print(f"URL base: {API_URL}")
    print(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("============================")
    
    # Probar listado de backups
    list_success = test_list_backups()
    print(f"Resultado de listado: {'✅ OK' if list_success else '❌ FALLO'}")
    
    print("\n")
    
    # Probar creación de backup
    create_success = test_create_backup()
    print(f"Resultado de creación: {'✅ OK' if create_success else '❌ FALLO'}")
    
    # Resultado global
    if list_success and create_success:
        print("\n✅ TODAS LAS PRUEBAS PASARON CORRECTAMENTE")
        sys.exit(0)
    else:
        print("\n❌ ALGUNAS PRUEBAS FALLARON")
        sys.exit(1)
