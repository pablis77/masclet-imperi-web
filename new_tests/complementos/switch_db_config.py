#!/usr/bin/env python3
"""
Script para cambiar la configuración de la base de datos.
Permite cambiar entre la base de datos local y el contenedor Docker.
"""
import os
import sys
import argparse
import shutil
from dotenv import load_dotenv

# Agregar directorio raíz al path
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(root_path)

def backup_env_file():
    """Crea una copia de seguridad del archivo .env actual"""
    env_path = os.path.join(root_path, 'backend', '.env')
    backup_path = os.path.join(root_path, 'backend', '.env.backup')
    
    # Crear copia de seguridad si no existe
    if os.path.exists(env_path) and not os.path.exists(backup_path):
        print(f"Creando copia de seguridad del archivo .env en {backup_path}")
        shutil.copy2(env_path, backup_path)
    else:
        print(f"Ya existe una copia de seguridad en {backup_path} o no se encontró el archivo .env")

def switch_to_container():
    """Cambia la configuración para usar el contenedor Docker (puerto 5433)"""
    env_path = os.path.join(root_path, 'backend', '.env')
    
    # Cargar variables actuales
    load_dotenv(env_path)
    
    # Leer el archivo .env
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    # Modificar la línea del puerto
    updated_lines = []
    for line in lines:
        if line.startswith('DB_PORT='):
            updated_lines.append('DB_PORT=5433\n')
        elif line.startswith('DATABASE_URL='):
            # Actualizar la URL de la base de datos
            db_user = os.getenv('POSTGRES_USER', 'postgres')
            db_pass = os.getenv('POSTGRES_PASSWORD', '1234')
            db_name = os.getenv('POSTGRES_DB', 'masclet_imperi')
            updated_lines.append(f'DATABASE_URL=postgresql://{db_user}:{db_pass}@localhost:5433/{db_name}\n')
        else:
            updated_lines.append(line)
    
    # Escribir el archivo actualizado
    with open(env_path, 'w') as f:
        f.writelines(updated_lines)
    
    print(f"Configuración cambiada para usar el contenedor Docker (puerto 5433)")

def switch_to_local():
    """Cambia la configuración para usar la base de datos local (puerto 5432)"""
    env_path = os.path.join(root_path, 'backend', '.env')
    
    # Cargar variables actuales
    load_dotenv(env_path)
    
    # Leer el archivo .env
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    # Modificar la línea del puerto
    updated_lines = []
    for line in lines:
        if line.startswith('DB_PORT='):
            updated_lines.append('DB_PORT=5432\n')
        elif line.startswith('DATABASE_URL='):
            # Actualizar la URL de la base de datos
            db_user = os.getenv('POSTGRES_USER', 'postgres')
            db_pass = os.getenv('POSTGRES_PASSWORD', '1234')
            db_name = os.getenv('POSTGRES_DB', 'masclet_imperi')
            updated_lines.append(f'DATABASE_URL=postgresql://{db_user}:{db_pass}@localhost:5432/{db_name}\n')
        else:
            updated_lines.append(line)
    
    # Escribir el archivo actualizado
    with open(env_path, 'w') as f:
        f.writelines(updated_lines)
    
    print(f"Configuración cambiada para usar la base de datos local (puerto 5432)")

def show_current_config():
    """Muestra la configuración actual de la base de datos"""
    env_path = os.path.join(root_path, 'backend', '.env')
    
    # Cargar variables actuales
    load_dotenv(env_path)
    
    # Obtener configuración
    db_port = os.getenv('DB_PORT', '5432')
    db_url = os.getenv('DATABASE_URL', '')
    
    print(f"\nConfiguración actual:")
    print(f"----------------------------------")
    print(f"Puerto: {db_port}")
    print(f"URL: {db_url}")
    
    if db_port == '5433':
        print(f"Usando: CONTENEDOR DOCKER")
    elif db_port == '5432':
        print(f"Usando: BASE DE DATOS LOCAL")
    else:
        print(f"Usando: CONFIGURACIÓN PERSONALIZADA")
    print(f"----------------------------------\n")

def restore_backup():
    """Restaura la copia de seguridad del archivo .env"""
    env_path = os.path.join(root_path, 'backend', '.env')
    backup_path = os.path.join(root_path, 'backend', '.env.backup')
    
    if os.path.exists(backup_path):
        print(f"Restaurando copia de seguridad desde {backup_path}")
        shutil.copy2(backup_path, env_path)
        print(f"Copia de seguridad restaurada correctamente")
    else:
        print(f"No se encontró ninguna copia de seguridad en {backup_path}")

def main():
    # Configurar parser de argumentos
    parser = argparse.ArgumentParser(description="Cambia la configuración de la base de datos")
    
    # Opciones mutuamente excluyentes
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--container", action="store_true", help="Usar el contenedor Docker (puerto 5433)")
    group.add_argument("--local", action="store_true", help="Usar la base de datos local (puerto 5432)")
    group.add_argument("--show", action="store_true", help="Mostrar configuración actual")
    group.add_argument("--backup", action="store_true", help="Crear copia de seguridad del archivo .env")
    group.add_argument("--restore", action="store_true", help="Restaurar copia de seguridad del archivo .env")
    
    args = parser.parse_args()
    
    try:
        # Ejecutar acción según los argumentos
        if args.container:
            backup_env_file()  # Hacer backup antes de cambiar
            switch_to_container()
        elif args.local:
            backup_env_file()  # Hacer backup antes de cambiar
            switch_to_local()
        elif args.show:
            show_current_config()
        elif args.backup:
            backup_env_file()
        elif args.restore:
            restore_backup()
        
        # Mostrar configuración actual después de cambiar
        if args.container or args.local or args.restore:
            show_current_config()
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
