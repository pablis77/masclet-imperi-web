#!/usr/bin/env python
"""
Script para optimizar el servidor Uvicorn según los recursos disponibles.
Genera la configuración óptima de workers y threads para el rendimiento máximo.
"""
import os
import sys
import json
import multiprocessing
import platform
import psutil
from pathlib import Path

# Añadir directorio raíz al path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Directorio para almacenar la configuración
CONFIG_DIR = Path(__file__).parent.parent / "config"
CONFIG_FILE = CONFIG_DIR / "server_config.json"

def get_optimal_workers():
    """
    Calcula el número óptimo de workers según la fórmula:
    workers = (2 x num_cores) + 1
    
    Esta es una fórmula recomendada para servidores Gunicorn/Uvicorn
    """
    num_cores = multiprocessing.cpu_count()
    return (2 * num_cores) + 1

def get_memory_limit_per_worker():
    """
    Calcula el límite de memoria por worker para evitar problemas
    de memoria cuando se escala el servicio.
    """
    # Obtener memoria total en MB
    total_memory_mb = psutil.virtual_memory().total / (1024 * 1024)
    
    # Reservar 20% para el SO y otros procesos
    available_memory = total_memory_mb * 0.8
    
    # Número de workers
    workers = get_optimal_workers()
    
    # Memoria por worker (con un margen de seguridad)
    return int(available_memory / workers * 0.9)

def get_server_config():
    """
    Genera una configuración optimizada para el servidor según los recursos disponibles
    """
    # Número óptimo de workers
    workers = get_optimal_workers()
    
    # Calcular el límite de memoria por worker
    memory_limit_mb = get_memory_limit_per_worker()
    
    # Determinar si estamos en entorno de desarrollo o producción
    is_dev = os.environ.get("ENV", "dev").lower() in ("dev", "development")
    
    # Configuración para Uvicorn
    config = {
        "workers": 1 if is_dev else workers,  # En desarrollo: 1 worker, en producción: óptimo
        "limit_memory_mb": memory_limit_mb,
        "backlog": 2048,  # Aumentar backlog para manejar más conexiones en espera
        "timeout": 60,    # Timeout de 60 segundos para peticiones largas (ej. importaciones)
        "keepalive": 65,  # Keepalive de 65 segundos
        "reload": is_dev, # Habilitar recarga automática solo en desarrollo
        "log_level": "debug" if is_dev else "warning",
        "system_info": {
            "cpu_count": multiprocessing.cpu_count(),
            "total_memory_mb": int(psutil.virtual_memory().total / (1024 * 1024)),
            "platform": platform.system(),
            "python_version": platform.python_version(),
        }
    }
    
    return config

def save_config(config):
    """Guarda la configuración en un archivo JSON"""
    # Crear directorio si no existe
    if not CONFIG_DIR.exists():
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    
    # Guardar configuración
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"Configuración guardada en: {CONFIG_FILE}")

def main():
    """Función principal del script"""
    print("Optimizando configuración del servidor...")
    config = get_server_config()
    
    # Mostrar configuración generada
    print("\n=== CONFIGURACIÓN OPTIMIZADA PARA ESTE SISTEMA ===")
    print(f"Workers: {config['workers']}")
    print(f"Memoria por worker: {config['limit_memory_mb']} MB")
    print(f"Backlog: {config['backlog']}")
    print(f"Timeout: {config['timeout']} segundos")
    print(f"Recarga automática: {'Activada' if config['reload'] else 'Desactivada'}")
    print(f"Nivel de log: {config['log_level']}")
    print("\n=== INFORMACIÓN DEL SISTEMA ===")
    print(f"Plataforma: {config['system_info']['platform']}")
    print(f"Núcleos CPU: {config['system_info']['cpu_count']}")
    print(f"Memoria total: {config['system_info']['total_memory_mb']} MB")
    print(f"Versión Python: {config['system_info']['python_version']}")
    
    # Guardar configuración
    save_config(config)
    
    print("\n=== COMANDOS PARA EJECUCIÓN ===")
    workers_arg = f"--workers {config['workers']}"
    log_level_arg = f"--log-level {config['log_level']}"
    reload_arg = "--reload" if config['reload'] else ""
    
    print(f"\nComando para producción:")
    print(f"uvicorn app.main:app {workers_arg} --log-level warning --host 0.0.0.0 --port 8000")
    
    print(f"\nComando para desarrollo:")
    print(f"uvicorn app.main:app --reload --log-level debug --host 0.0.0.0 --port 8000")
    
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nProceso cancelado por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
