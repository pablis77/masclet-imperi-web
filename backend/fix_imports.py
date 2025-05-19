"""
Script para corregir las importaciones de Part en los archivos de prueba.
Este script reemplaza todas las importaciones de 'from app.models.parto import Part'
por 'from app.models.animal import Part' en el directorio especificado.
"""
import os
import re
import sys

def fix_imports(directory_path):
    """
    Corrige las importaciones de Part en todos los archivos .py del directorio.
    
    Args:
        directory_path: Ruta al directorio donde se buscarán los archivos.
    """
    pattern = re.compile(r'from app\.models\.parto import Part')
    replacement = 'from app.models.animal import Part'
    
    # Contar archivos modificados
    modified_files = 0
    
    # Recorrer todos los archivos y subdirectorios
    for root, dirs, files in os.walk(directory_path):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                
                # Leer el contenido del archivo
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Verificar si contiene el patrón a reemplazar
                if pattern.search(content):
                    # Realizar el reemplazo
                    modified_content = pattern.sub(replacement, content)
                    
                    # Escribir el contenido modificado
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(modified_content)
                    
                    print(f"Corregido: {file_path}")
                    modified_files += 1
    
    print(f"\nTotal de archivos modificados: {modified_files}")

if __name__ == "__main__":
    # Verificar argumentos
    if len(sys.argv) != 2:
        print("Uso: python fix_imports.py <directorio>")
        sys.exit(1)
    
    directory_path = sys.argv[1]
    
    # Verificar que el directorio existe
    if not os.path.isdir(directory_path):
        print(f"Error: El directorio {directory_path} no existe.")
        sys.exit(1)
    
    print(f"Corrigiendo importaciones en {directory_path}...")
    fix_imports(directory_path)
    print("Proceso completado.")
