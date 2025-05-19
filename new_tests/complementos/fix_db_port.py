"""
Script para corregir problemas con la configuración del puerto de la base de datos.
Este script modifica directamente el archivo backend/.env asegurando que DB_PORT tenga el valor correcto.
"""
import os
import re
import shutil
from datetime import datetime

def backup_env_file(env_path):
    """Crear una copia de respaldo del archivo .env"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{env_path}.bak_{timestamp}"
    shutil.copy2(env_path, backup_path)
    print(f"Backup creado en: {backup_path}")
    return backup_path

def ensure_db_port(env_path, port="5433"):
    """Asegurar que DB_PORT tenga el valor correcto en el archivo .env"""
    if not os.path.exists(env_path):
        print(f"¡Error! No se encontró el archivo: {env_path}")
        return False
    
    # Crear backup
    backup_env_file(env_path)
    
    # Leer el contenido actual
    with open(env_path, 'r') as f:
        content = f.read()
    
    # Verificar si existe la variable DB_PORT
    if re.search(r'^DB_PORT=', content, re.MULTILINE):
        # Reemplazar la línea existente
        new_content = re.sub(r'^DB_PORT=.*$', f'DB_PORT={port}', content, flags=re.MULTILINE)
        print(f"Reemplazando configuración existente de DB_PORT en {env_path}")
    else:
        # Agregar la variable al final
        new_content = content
        if not new_content.endswith('\n'):
            new_content += '\n'
        new_content += f'DB_PORT={port}\n'
        print(f"Agregando configuración de DB_PORT={port} a {env_path}")
    
    # Escribir el nuevo contenido
    with open(env_path, 'w') as f:
        f.write(new_content)
    
    print(f"Archivo {env_path} actualizado correctamente.")
    return True

def ensure_postgresql_url(env_path, host="localhost", port="5433", db="masclet_imperi", user="postgres", password="1234"):
    """Asegurar que DATABASE_URL tenga el valor correcto en el archivo .env"""
    if not os.path.exists(env_path):
        print(f"¡Error! No se encontró el archivo: {env_path}")
        return False
    
    url = f"postgresql://{user}:{password}@{host}:{port}/{db}"
    
    # Leer el contenido actual
    with open(env_path, 'r') as f:
        content = f.read()
    
    # Verificar si existe la variable DATABASE_URL
    if re.search(r'^DATABASE_URL=', content, re.MULTILINE):
        # Reemplazar la línea existente
        new_content = re.sub(r'^DATABASE_URL=.*$', f'DATABASE_URL={url}', content, flags=re.MULTILINE)
        print(f"Reemplazando configuración existente de DATABASE_URL en {env_path}")
    else:
        # Agregar la variable al final
        new_content = content
        if not new_content.endswith('\n'):
            new_content += '\n'
        new_content += f'DATABASE_URL={url}\n'
        print(f"Agregando configuración de DATABASE_URL={url} a {env_path}")
    
    # Escribir el nuevo contenido
    with open(env_path, 'w') as f:
        f.write(new_content)
    
    print(f"Archivo {env_path} actualizado correctamente con DATABASE_URL.")
    return True

def show_env_db_config(env_path):
    """Mostrar la configuración actual de la base de datos en el archivo .env"""
    if not os.path.exists(env_path):
        print(f"¡Error! No se encontró el archivo: {env_path}")
        return
    
    print(f"\nConfiguración actual en {env_path}:")
    with open(env_path, 'r') as f:
        for line in f:
            if any(param in line for param in ["DB_PORT", "DATABASE_URL", "POSTGRES_"]):
                print(f"  {line.strip()}")

def fix_all_env_files():
    """Corregir la configuración en todos los archivos .env relevantes"""
    # Rutas a los archivos .env
    root_env = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    backend_env = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend', '.env')
    docker_env = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend', 'docker', '.env')
    
    # Mostrar configuración actual
    print("=== CONFIGURACIÓN ACTUAL ===")
    for env_file in [root_env, backend_env, docker_env]:
        if os.path.exists(env_file):
            show_env_db_config(env_file)
    
    # Preguntar al usuario qué archivos corregir
    print("\n=== ACTUALIZACIÓN DE ARCHIVOS .ENV ===")
    print("Seleccione qué archivos desea actualizar:")
    print("1. Todos los archivos .env")
    print("2. Solo backend/.env (recomendado)")
    print("3. Solo root/.env")
    print("4. Solo backend/docker/.env")
    print("5. Salir sin hacer cambios")
    
    choice = input("Ingrese su elección (1-5): ")
    
    if choice == "1":
        files_to_update = [f for f in [root_env, backend_env, docker_env] if os.path.exists(f)]
    elif choice == "2":
        files_to_update = [backend_env] if os.path.exists(backend_env) else []
    elif choice == "3":
        files_to_update = [root_env] if os.path.exists(root_env) else []
    elif choice == "4":
        files_to_update = [docker_env] if os.path.exists(docker_env) else []
    else:
        print("Saliendo sin hacer cambios.")
        return
    
    # Actualizar los archivos seleccionados
    for env_file in files_to_update:
        print(f"\nActualizando {env_file}...")
        ensure_db_port(env_file, "5433")
        ensure_postgresql_url(env_file)
    
    # Mostrar configuración actualizada
    print("\n=== CONFIGURACIÓN ACTUALIZADA ===")
    for env_file in files_to_update:
        show_env_db_config(env_file)
    
    print("\n¡Completado! Para que los cambios surtan efecto, reinicie el servidor.")

if __name__ == "__main__":
    fix_all_env_files()
