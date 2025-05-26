#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test de backup automático - Creación de animales en GUADALAJARA

Este script crea un animal en la explotación GUADALAJARA y verifica que
el backup automático se ha generado correctamente.
"""

import os
import sys
import json
import time
import random
import asyncio
import argparse
from datetime import datetime
from typing import Dict, List, Optional, Tuple

# Añadir ruta del proyecto
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Importar módulos del proyecto
from backend.app.core.config import get_settings
from backend.app.services.backup_service import BackupService
from backend.app.services.scheduled_backup_service import ScheduledBackupService, BackupType

# Importar cliente HTTP
import httpx

# Importar Tortoise ORM
from tortoise import Tortoise, run_async
from tortoise.exceptions import OperationalError

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

# Configuración
API_URL = "http://localhost:8000/api/v1"
ADMIN_USER = "admin"
ADMIN_PASSWORD = "admin123"
EXPLOTACION = "Guadalajara"

# Datos para crear animales aleatorios
NOMBRES_MASCULINOS = ["Pablo", "Carlos", "Juan", "Antonio", "Manuel", "José", "Francisco", "Luis", "Javier", "Miguel"]
NOMBRES_FEMENINOS = ["María", "Carmen", "Lucía", "Ana", "Laura", "Isabel", "Marta", "Cristina", "Elena", "Sofía"]
APELLIDOS = ["Martínez", "Fernández", "García", "López", "Pérez", "González", "Rodríguez", "Gómez", "Moreno", "Ruiz"]

async def login() -> Optional[str]:
    """Iniciar sesión y obtener token"""
    print(f"{Colors.BLUE}Iniciando sesión como {ADMIN_USER}...{Colors.END}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_URL}/auth/login",
                data={"username": ADMIN_USER, "password": ADMIN_PASSWORD}
            )
            
            if response.status_code == 200:
                token = response.json().get("access_token")
                print(f"{Colors.GREEN}✓ Sesión iniciada correctamente{Colors.END}")
                return token
            else:
                print(f"{Colors.RED}✗ Error al iniciar sesión: {response.status_code} - {response.text}{Colors.END}")
                return None
    except Exception as e:
        print(f"{Colors.RED}✗ Error de conexión: {str(e)}{Colors.END}")
        return None

async def crear_animal_aleatorio(token: str) -> Tuple[bool, Optional[Dict]]:
    """Crear un animal aleatorio en la explotación GUADALAJARA"""
    genero = random.choice(["M", "F"])
    
    # Generar datos aleatorios
    nombre = random.choice(NOMBRES_MASCULINOS if genero == "M" else NOMBRES_FEMENINOS)
    origen = random.choice(APELLIDOS)
    
    # Generar fecha de nacimiento aleatoria entre 1970 y 2020
    año = random.randint(1970, 2020)
    mes = random.randint(1, 12)
    dia = random.randint(1, 28)  # Para evitar problemas con meses cortos
    fecha_nacimiento = f"{dia:02d}/{mes:02d}/{año}"
    
    # Generar código aleatorio
    codigo = str(random.randint(1000, 9999))
    
    # Generar número de serie aleatorio
    num_serie = f"ES{random.randint(10000000, 99999999)}"
    
    # Datos del animal
    animal_data = {
        "nom": nombre,
        "genere": genero,
        "explotacio": EXPLOTACION,  # Siempre en GUADALAJARA
        "estado": "OK",
        "dob": fecha_nacimiento,
        "mare": "Emma",
        "pare": "Alfonso",
        "origen": origen,
        "cod": codigo,
        "num_serie": num_serie
    }
    
    # Si es hembra, añadir alletar
    if genero == "F":
        animal_data["alletar"] = str(random.choice([0, 1, 2]))
    
    print(f"{Colors.BLUE}Creando animal:{Colors.END}")
    print(f"  - Nombre: {nombre}")
    print(f"  - Género: {'Macho' if genero == 'M' else 'Hembra'}")
    print(f"  - Explotación: {EXPLOTACION}")
    print(f"  - Fecha nacimiento: {fecha_nacimiento}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_URL}/animals/",
                json=animal_data,
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code in [200, 201]:
                animal_creado = response.json()
                print(f"{Colors.GREEN}✓ Animal creado correctamente con ID: {animal_creado.get('id')}{Colors.END}")
                return True, animal_creado
            else:
                print(f"{Colors.RED}✗ Error al crear animal: {response.status_code} - {response.text}{Colors.END}")
                return False, None
    except Exception as e:
        print(f"{Colors.RED}✗ Error de conexión: {str(e)}{Colors.END}")
        return False, None

async def verificar_backups(token: str) -> bool:
    """Verificar que se ha creado un backup automático tras la creación del animal"""
    print(f"{Colors.BLUE}Esperando a que finalice el proceso de backup (10 segundos)...{Colors.END}")
    await asyncio.sleep(10)  # Esperar a que se complete el backup
    
    print(f"{Colors.BLUE}Verificando backups...{Colors.END}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{API_URL}/backup/list",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code == 200:
                backups = response.json()
                
                if not backups:
                    print(f"{Colors.RED}✗ No se encontraron backups{Colors.END}")
                    return False
                
                # Ordenar backups por fecha, más reciente primero
                backups.sort(key=lambda x: x.get("date", ""), reverse=True)
                
                # Obtener el backup más reciente
                ultimo_backup = backups[0]
                
                print(f"{Colors.GREEN}✓ Último backup encontrado:{Colors.END}")
                print(f"  - Nombre: {ultimo_backup.get('filename')}")
                print(f"  - Fecha: {ultimo_backup.get('date')}")
                print(f"  - Tamaño: {ultimo_backup.get('size')}")
                print(f"  - Tipo: {ultimo_backup.get('backup_type')}")
                print(f"  - Categoría: {ultimo_backup.get('retention_category')}")
                print(f"  - Descripción: {ultimo_backup.get('description')}")
                
                # Verificar que el tipo de backup sea correcto
                tipo_backup = ultimo_backup.get("backup_type")
                if tipo_backup == "animal_created":
                    print(f"{Colors.GREEN}✓ El tipo de backup es correcto: animal_created{Colors.END}")
                    return True
                else:
                    print(f"{Colors.RED}✗ El tipo de backup no es correcto. Esperado: animal_created, Actual: {tipo_backup}{Colors.END}")
                    return False
            else:
                print(f"{Colors.RED}✗ Error al obtener backups: {response.status_code} - {response.text}{Colors.END}")
                return False
    except Exception as e:
        print(f"{Colors.RED}✗ Error de conexión: {str(e)}{Colors.END}")
        return False

async def verificar_historial_backups():
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
        
        # Verificar que todos los elementos tienen retention_category
        errores = []
        for i, entry in enumerate(history):
            if "retention_category" not in entry:
                errores.append(f"Entrada {i}: falta retention_category")
            if "backup_type" not in entry:
                errores.append(f"Entrada {i}: falta backup_type")
        
        if errores:
            print(f"{Colors.RED}✗ Se encontraron errores en el historial:{Colors.END}")
            for error in errores:
                print(f"  - {error}")
            return False
        else:
            print(f"{Colors.GREEN}✓ Todos los elementos del historial tienen retention_category y backup_type{Colors.END}")
            
            # Contar tipos de backup
            tipos = {}
            for entry in history:
                tipo = entry.get("backup_type")
                tipos[tipo] = tipos.get(tipo, 0) + 1
            
            print(f"{Colors.BLUE}Distribución de tipos de backup:{Colors.END}")
            for tipo, cantidad in tipos.items():
                print(f"  - {tipo}: {cantidad}")
            
            return True
    except Exception as e:
        print(f"{Colors.RED}✗ Error al verificar el historial: {str(e)}{Colors.END}")
        return False

async def ejecutar_test():
    """Ejecutar el test completo"""
    print(f"{Colors.BOLD}{Colors.MAGENTA}=== TEST DE BACKUP AUTOMÁTICO ===\n{Colors.END}")
    
    # Paso 1: Iniciar sesión
    token = await login()
    if not token:
        print(f"{Colors.RED}✗ No se pudo iniciar sesión. Abortando test.{Colors.END}")
        return
    
    # Paso 2: Crear animal
    exito, animal = await crear_animal_aleatorio(token)
    if not exito:
        print(f"{Colors.RED}✗ No se pudo crear el animal. Abortando test.{Colors.END}")
        return
    
    # Paso 3: Verificar backups desde la API
    exito_api = await verificar_backups(token)
    
    # Paso 4: Verificar historial de backups desde el archivo
    exito_historial = await verificar_historial_backups()
    
    # Resumen
    print(f"\n{Colors.BOLD}{Colors.MAGENTA}=== RESULTADO DEL TEST ===\n{Colors.END}")
    
    if exito_api and exito_historial:
        print(f"{Colors.BOLD}{Colors.GREEN}✓ TEST EXITOSO: El sistema de backup automático funciona correctamente{Colors.END}")
    else:
        print(f"{Colors.BOLD}{Colors.RED}✗ TEST FALLIDO: Se encontraron problemas en el sistema de backup automático{Colors.END}")
        if not exito_api:
            print(f"{Colors.RED}  - La API no devolvió la información correcta sobre el backup{Colors.END}")
        if not exito_historial:
            print(f"{Colors.RED}  - El archivo de historial de backups contiene errores{Colors.END}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Test de backup automático con creación de animales en GUADALAJARA')
    parser.add_argument('-n', '--num-tests', type=int, default=1, help='Número de tests a ejecutar (default: 1)')
    args = parser.parse_args()
    
    for i in range(args.num_tests):
        if args.num_tests > 1:
            print(f"\n{Colors.BOLD}{Colors.CYAN}=== EJECUCIÓN {i+1} DE {args.num_tests} ===\n{Colors.END}")
        
        # Ejecutar el test
        run_async(ejecutar_test())
        
        if i < args.num_tests - 1:
            # Esperar entre tests
            print(f"{Colors.BLUE}Esperando 5 segundos antes del siguiente test...{Colors.END}")
            time.sleep(5)
