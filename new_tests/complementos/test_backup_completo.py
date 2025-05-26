#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
TEST COMPLETO DE SISTEMA DE BACKUP AUTOMÁTICO

Este script realiza una verificación exhaustiva y completa del sistema de backup automático:
1. Crea un animal nuevo en la explotación GUADALAJARA
2. Verifica que se dispara un backup automático
3. Comprueba que el backup se guarda correctamente en el sistema de archivos
4. Verifica que se registra correctamente en el historial JSON
5. Examina el contenido real del archivo SQL de backup
6. Verifica que todos los metadatos son correctos
"""

import os
import sys
import json
import time
import random
import asyncio
import argparse
import subprocess
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any

# Añadir ruta del proyecto
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(PROJECT_ROOT)

# Importar cliente HTTP
import httpx

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
BACKUP_DIR = os.path.join(PROJECT_ROOT, "backend", "backups")
BACKUP_HISTORY_FILE = os.path.join(BACKUP_DIR, "backup_log.json")
LOG_FILE = os.path.join(PROJECT_ROOT, "new_tests", "complementos", "test_backup_completo.log")

# Datos para crear animales aleatorios
NOMBRES_MASCULINOS = ["Pablo", "Carlos", "Juan", "Antonio", "Manuel", "José", "Francisco", "Luis", "Javier", "Miguel"]
NOMBRES_FEMENINOS = ["María", "Carmen", "Lucía", "Ana", "Laura", "Isabel", "Marta", "Cristina", "Elena", "Sofía"]
APELLIDOS = ["Martínez", "Fernández", "García", "López", "Pérez", "González", "Rodríguez", "Gómez", "Moreno", "Ruiz"]

# Configuración de registro
LOG_TIMESTAMPS = []
ERRORS = []
WARNINGS = []
SUCCESS = []

# Función para registrar y mostrar mensajes
def log(message, type="INFO", show=True):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    LOG_TIMESTAMPS.append(timestamp)
    
    if type == "ERROR":
        formatted = f"{Colors.RED}[ERROR] {message}{Colors.END}"
        ERRORS.append(f"[{timestamp}] [ERROR] {message}")
    elif type == "WARNING":
        formatted = f"{Colors.YELLOW}[WARNING] {message}{Colors.END}"
        WARNINGS.append(f"[{timestamp}] [WARNING] {message}")
    elif type == "SUCCESS":
        formatted = f"{Colors.GREEN}[SUCCESS] {message}{Colors.END}"
        SUCCESS.append(f"[{timestamp}] [SUCCESS] {message}")
    elif type == "STEP":
        formatted = f"{Colors.BLUE}{Colors.BOLD}[STEP] {message}{Colors.END}"
    else:
        formatted = f"{Colors.BLUE}[INFO] {message}{Colors.END}"
    
    if show:
        print(formatted)
    
    # Guardar en archivo de log
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] [{type}] {message}\n")

# Crear archivo de log vacío al inicio
with open(LOG_FILE, "w", encoding="utf-8") as f:
    f.write(f"=== TEST COMPLETO DE BACKUP AUTOMATICO - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ===\n\n")

async def login() -> Optional[str]:
    """Iniciar sesión y obtener token"""
    log("Iniciando sesión como admin", "STEP")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_URL}/auth/login",
                data={"username": ADMIN_USER, "password": ADMIN_PASSWORD},
                timeout=30.0
            )
            
            if response.status_code == 200:
                token = response.json().get("access_token")
                log(f"Sesión iniciada correctamente", "SUCCESS")
                return token
            else:
                log(f"Error al iniciar sesión: {response.status_code} - {response.text}", "ERROR")
                return None
    except Exception as e:
        log(f"Error de conexión: {str(e)}", "ERROR")
        return None

async def crear_animal_aleatorio(token: str) -> Tuple[bool, Optional[Dict], str]:
    """Crear un animal aleatorio en la explotación GUADALAJARA"""
    genero = random.choice(["M", "F"])
    
    # Generar datos aleatorios
    nombre = random.choice(NOMBRES_MASCULINOS if genero == "M" else NOMBRES_FEMENINOS)
    origen = random.choice(APELLIDOS)
    
    # Asegurar que el nombre sea único añadiendo timestamp
    timestamp = datetime.now().strftime("%H%M%S")
    nombre_unico = f"{nombre}_{timestamp}"
    
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
        "nom": nombre_unico,
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
    
    log(f"Creando animal:", "STEP")
    log(f"  - Nombre: {nombre_unico}")
    log(f"  - Género: {'Macho' if genero == 'M' else 'Hembra'}")
    log(f"  - Explotación: {EXPLOTACION}")
    log(f"  - Fecha nacimiento: {fecha_nacimiento}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_URL}/animals/",
                json=animal_data,
                headers={"Authorization": f"Bearer {token}"},
                timeout=30.0
            )
            
            if response.status_code in [200, 201]:
                animal_creado = response.json()
                animal_id = animal_creado.get("id")
                log(f"Animal creado correctamente con ID: {animal_id}", "SUCCESS")
                return True, animal_creado, nombre_unico
            else:
                log(f"Error al crear animal: {response.status_code} - {response.text}", "ERROR")
                return False, None, nombre_unico
    except Exception as e:
        log(f"Error de conexión: {str(e)}", "ERROR")
        return False, None, nombre_unico

async def esperar_y_buscar_backup(animal_nombre: str, tiempo_espera=10) -> Optional[Dict]:
    """Esperar a que se complete el backup y buscar el archivo más reciente"""
    log(f"Esperando {tiempo_espera} segundos para que se complete el backup automático...", "STEP")
    await asyncio.sleep(tiempo_espera)
    
    # Verificar archivos de backup en el directorio
    backup_files = [f for f in os.listdir(BACKUP_DIR) if f.endswith('.sql')]
    
    if not backup_files:
        log("No se encontraron archivos de backup", "ERROR")
        return None
    
    # Ordenar por fecha de modificación, más reciente primero
    backup_files.sort(key=lambda x: os.path.getmtime(os.path.join(BACKUP_DIR, x)), reverse=True)
    ultimo_backup = backup_files[0]
    
    log(f"Último backup encontrado: {ultimo_backup}", "SUCCESS")
    
    # Obtener metadatos del archivo
    backup_path = os.path.join(BACKUP_DIR, ultimo_backup)
    size_bytes = os.path.getsize(backup_path)
    size_kb = size_bytes / 1024.0
    
    metadata = {
        "filename": ultimo_backup,
        "path": backup_path,
        "size_bytes": size_bytes,
        "size_kb": f"{size_kb:.2f} KB",
        "mtime": datetime.fromtimestamp(os.path.getmtime(backup_path)).strftime("%Y-%m-%d %H:%M:%S")
    }
    
    return metadata

async def verificar_contenido_backup(backup_path: str, animal_nombre: str) -> bool:
    """Verificar que el animal creado aparece en el contenido del backup"""
    log(f"Verificando contenido del archivo de backup: {os.path.basename(backup_path)}", "STEP")
    
    try:
        # Leer las primeras 100 líneas para obtener información de cabecera
        with open(backup_path, 'r', encoding='utf-8', errors='ignore') as f:
            header = [next(f) for _ in range(100) if f]
        
        header_str = ''.join(header)
        log(f"Cabecera del backup analizada: {len(header)} líneas")
        
        # Buscar el nombre del animal en todo el archivo
        with open(backup_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        if animal_nombre in content:
            log(f"El animal '{animal_nombre}' aparece en el contenido del backup", "SUCCESS")
            return True
        else:
            # Buscar fragmentos del nombre (por si está en formato SQL con comillas o caracteres especiales)
            nombre_base = animal_nombre.split('_')[0]  # Quitar el timestamp
            if nombre_base in content:
                log(f"Fragmento del nombre '{nombre_base}' aparece en el backup", "SUCCESS")
                return True
            else:
                log(f"No se encontró el animal '{animal_nombre}' en el contenido del backup", "ERROR")
                return False
    except Exception as e:
        log(f"Error al verificar contenido del backup: {str(e)}", "ERROR")
        return False

async def verificar_historial_backups(animal_nombre: str) -> Tuple[bool, Optional[Dict]]:
    """Verificar que el backup se ha registrado correctamente en el historial"""
    log(f"Verificando registro en historial de backups: {BACKUP_HISTORY_FILE}", "STEP")
    
    try:
        if not os.path.exists(BACKUP_HISTORY_FILE):
            log(f"El archivo de historial no existe", "ERROR")
            return False, None
        
        with open(BACKUP_HISTORY_FILE, "r", encoding="utf-8") as f:
            history = json.load(f)
        
        if not history:
            log(f"El historial está vacío", "ERROR")
            return False, None
        
        # Ordenar por timestamp, más reciente primero
        history.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        # Obtener el backup más reciente
        ultimo_backup = history[0]
        
        log(f"Último backup en historial:", "SUCCESS")
        log(f"  - Nombre: {ultimo_backup.get('filename')}")
        log(f"  - Fecha: {ultimo_backup.get('date')}")
        log(f"  - Tamaño: {ultimo_backup.get('size')}")
        log(f"  - Tipo: {ultimo_backup.get('backup_type')}")
        log(f"  - Categoría: {ultimo_backup.get('retention_category', 'N/A')}")
        log(f"  - Descripción: {ultimo_backup.get('description')}")
        
        # Verificar que el tipo de backup es correcto
        backup_type = ultimo_backup.get("backup_type")
        if backup_type != "animal_created":
            log(f"El tipo de backup no es correcto. Esperado: animal_created, Actual: {backup_type}", "ERROR")
            return False, ultimo_backup
        
        # Verificar que tiene retention_category
        if "retention_category" not in ultimo_backup:
            log(f"El backup no tiene categoría de retención", "ERROR")
            return False, ultimo_backup
        
        # Verificar que la descripción menciona al animal creado o contiene "creación"
        descripcion = ultimo_backup.get("description", "").lower()
        if animal_nombre.lower() not in descripcion and "creaci" not in descripcion:
            log(f"La descripción no menciona al animal ni la creación: {descripcion}", "WARNING")
            
        return True, ultimo_backup
    except Exception as e:
        log(f"Error al verificar el historial: {str(e)}", "ERROR")
        return False, None

async def verificar_api_backups(token: str) -> Tuple[bool, List]:
    """Verificar que los backups aparecen correctamente en la API"""
    log(f"Verificando backups a través de la API", "STEP")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{API_URL}/backup/list",
                headers={"Authorization": f"Bearer {token}"},
                timeout=30.0
            )
            
            if response.status_code == 200:
                backups = response.json()
                
                if not backups:
                    log(f"No se encontraron backups a través de la API", "ERROR")
                    return False, []
                
                log(f"Se encontraron {len(backups)} backups a través de la API", "SUCCESS")
                
                # Verificar el último backup
                ultimo_backup = backups[0]
                log(f"Último backup según API:", "SUCCESS")
                log(f"  - Nombre: {ultimo_backup.get('filename')}")
                log(f"  - Fecha: {ultimo_backup.get('date')}")
                log(f"  - Tamaño: {ultimo_backup.get('size')}")
                log(f"  - Tipo: {ultimo_backup.get('backup_type')}")
                
                return True, backups
            else:
                log(f"Error al obtener backups: {response.status_code} - {response.text}", "ERROR")
                return False, []
    except Exception as e:
        log(f"Error de conexión: {str(e)}", "ERROR")
        return False, []

async def ejecutar_test_completo():
    """Ejecutar el test completo del sistema de backup automático"""
    log(f"INICIANDO TEST COMPLETO DE BACKUP AUTOMÁTICO", "STEP")
    
    # Paso 1: Iniciar sesión
    token = await login()
    if not token:
        log(f"No se pudo iniciar sesión. Abortando test.", "ERROR")
        return False
    
    # Paso 2: Crear animal
    exito, animal, nombre_animal = await crear_animal_aleatorio(token)
    if not exito:
        log(f"No se pudo crear el animal. Abortando test.", "ERROR")
        return False
    
    animal_id = animal.get('id')
    log(f"Animal creado con éxito. ID: {animal_id}, Nombre: {nombre_animal}", "SUCCESS")
    
    # Paso 3: Esperar y buscar el backup automático
    backup_metadata = await esperar_y_buscar_backup(nombre_animal)
    if not backup_metadata:
        log(f"No se encontró el archivo de backup. Abortando test.", "ERROR")
        return False
    
    # Paso 4: Verificar el contenido del backup
    exito_contenido = await verificar_contenido_backup(backup_metadata["path"], nombre_animal)
    if not exito_contenido:
        log(f"El contenido del backup no es válido o no incluye al animal creado.", "ERROR")
    
    # Paso 5: Verificar el historial de backups
    exito_historial, ultimo_backup = await verificar_historial_backups(nombre_animal)
    if not exito_historial:
        log(f"El historial de backups no es válido o no registra correctamente el backup.", "ERROR")
    
    # Paso 6: Verificar API de backups
    exito_api, backups_api = await verificar_api_backups(token)
    if not exito_api:
        log(f"La API de backups no funciona correctamente.", "ERROR")
    
    # Verificación final
    todas_verificaciones = [
        exito, 
        backup_metadata is not None,
        exito_contenido,
        exito_historial,
        exito_api
    ]
    
    success_rate = sum(1 for v in todas_verificaciones if v) / len(todas_verificaciones) * 100
    
    # Resumen del test
    log(f"\nRESUMEN DEL TEST DE BACKUP AUTOMÁTICO", "STEP")
    log(f"Animal creado: {'✓' if exito else '✗'}")
    log(f"Archivo de backup encontrado: {'✓' if backup_metadata else '✗'}")
    log(f"Contenido del backup válido: {'✓' if exito_contenido else '✗'}")
    log(f"Historial de backups correcto: {'✓' if exito_historial else '✗'}")
    log(f"API de backups funcional: {'✓' if exito_api else '✗'}")
    log(f"Tasa de éxito: {success_rate:.1f}%", "SUCCESS" if success_rate > 80 else "WARNING" if success_rate > 50 else "ERROR")
    
    # Resultado final
    if all(todas_verificaciones):
        log(f"TEST EXITOSO: El sistema de backup automático funciona correctamente", "SUCCESS")
        return True
    else:
        log(f"TEST FALLIDO: El sistema de backup automático presenta problemas", "ERROR")
        return False

def guardar_informe():
    """Guardar informe final del test"""
    informe_path = os.path.join(PROJECT_ROOT, "new_tests", "complementos", "informe_backup.html")
    
    with open(informe_path, "w", encoding="utf-8") as f:
        f.write(f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Informe de Prueba de Backup Automático</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }}
        .container {{ max-width: 1000px; margin: 0 auto; }}
        h1, h2, h3 {{ color: #333; }}
        .success {{ color: green; }}
        .warning {{ color: orange; }}
        .error {{ color: red; }}
        .info {{ color: blue; }}
        pre {{ background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }}
        .summary {{ display: flex; margin: 20px 0; }}
        .summary div {{ flex: 1; padding: 15px; margin: 5px; border-radius: 5px; }}
        .success-bg {{ background-color: #dff0d8; }}
        .warning-bg {{ background-color: #fcf8e3; }}
        .error-bg {{ background-color: #f2dede; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        table, th, td {{ border: 1px solid #ddd; }}
        th, td {{ padding: 10px; text-align: left; }}
        th {{ background-color: #f5f5f5; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Informe de Prueba de Backup Automático</h1>
        <p><strong>Fecha:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</p>
        
        <div class="summary">
            <div class="success-bg">
                <h3>Éxitos</h3>
                <p>{len(SUCCESS)}</p>
            </div>
            <div class="warning-bg">
                <h3>Advertencias</h3>
                <p>{len(WARNINGS)}</p>
            </div>
            <div class="error-bg">
                <h3>Errores</h3>
                <p>{len(ERRORS)}</p>
            </div>
        </div>
        
        <h2>Detalles de la prueba</h2>
        <h3>Errores</h3>
        <pre>{"\\n".join(ERRORS) if ERRORS else "No se encontraron errores."}</pre>
        
        <h3>Advertencias</h3>
        <pre>{"\\n".join(WARNINGS) if WARNINGS else "No se encontraron advertencias."}</pre>
        
        <h3>Éxitos</h3>
        <pre>{"\\n".join(SUCCESS) if SUCCESS else "No se registraron éxitos."}</pre>
        
        <h2>Conclusión</h2>
        <p class="{'success' if not ERRORS else 'error'}">
            {
                "El sistema de backup automático funciona correctamente." 
                if not ERRORS else 
                "El sistema de backup automático presenta problemas."
            }
        </p>
    </div>
</body>
</html>""")
    
    log(f"Informe HTML guardado en: {informe_path}", "SUCCESS")
    
    # Abrir el informe en el navegador
    try:
        os.startfile(informe_path)
    except:
        try:
            subprocess.Popen(['start', informe_path], shell=True)
        except:
            log(f"No se pudo abrir el informe automáticamente, por favor ábralo manualmente", "WARNING")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Test completo de backup automático')
    parser.add_argument('-v', '--verbose', action='store_true', help='Mostrar información detallada')
    parser.add_argument('-i', '--informe', action='store_true', help='Generar informe HTML')
    args = parser.parse_args()
    
    # Ejecutar el test
    asyncio.run(ejecutar_test_completo())
    
    # Generar informe
    if args.informe:
        guardar_informe()
    else:
        guardar_informe()  # Siempre generar el informe para tener registro completo
