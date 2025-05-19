#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script simple para importar matriz_master.csv directamente.
Utiliza las funciones de import_service para procesar el CSV.
"""
import os
import sys
import csv
import logging
import asyncio
from datetime import datetime
import shutil

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)

# Agregar la ruta raíz al path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Constantes
DB_URL = "postgres://postgres:1234@localhost:5432/masclet_imperi"
UPLOADS_DIR = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'uploads')

async def importar_csv(ruta_archivo):
    """
    Función principal que importa un archivo CSV
    """
    # Comprobar que el archivo existe
    if not os.path.exists(ruta_archivo):
        print(f"ERROR: El archivo {ruta_archivo} no existe")
        return False
    
    # Establecer conexión a la BD
    from tortoise import Tortoise
    print(f"Conectando a la base de datos: {DB_URL}")
    await Tortoise.init(
        db_url=DB_URL,
        modules={
            'models': [
                'app.models.animal', 
                'app.models.import_model'
            ]
        }
    )
    
    try:
        print(f"Procesando archivo: {ruta_archivo}")
        # Asegurarse de que el directorio uploads existe
        os.makedirs(UPLOADS_DIR, exist_ok=True)
        
        # Copiar el archivo a la carpeta uploads
        archivo_destino = os.path.join(UPLOADS_DIR, os.path.basename(ruta_archivo))
        if os.path.abspath(ruta_archivo) != os.path.abspath(archivo_destino):
            shutil.copy2(ruta_archivo, archivo_destino)
        
        # Crear registro de importación
        from app.models.import_model import Import
        from app.models.enums import ImportStatus
        
        # Crear sin usar UUID ni nada raro
        import_obj = await Import.create(
            file_name=os.path.basename(ruta_archivo),
            file_size=os.path.getsize(archivo_destino),
            file_type="text/csv",
            description="Importación directa de matriz_master.csv",
            status=ImportStatus.PROCESSING.value,
            result={}
        )
        
        print(f"Creado registro de importación con ID: {import_obj.id}")
        
        # Ahora importar usando la función process_csv_file
        from app.services.import_service import process_csv_file
        
        resultado = await process_csv_file(
            filename=os.path.basename(ruta_archivo),
            import_id=str(import_obj.id),
            prevent_duplicates=True,
            importar_partos=True
        )
        
        # Actualizar el registro de importación
        import_obj.status = ImportStatus.COMPLETED.value
        import_obj.result = resultado
        import_obj.completed_at = datetime.now()
        await import_obj.save()
        
        # Mostrar resultados
        if resultado.get("success", False):
            print("\n=== RESULTADO DE LA IMPORTACIÓN ===")
            print(f"Animales creados: {resultado['stats'].get('created', 0)}")
            print(f"Animales actualizados: {resultado['stats'].get('updated', 0)}")
            print(f"Errores: {resultado['stats'].get('failed', 0)}")
            print(f"Advertencias: {resultado['stats'].get('warnings', 0)}")
            print(f"Total registros: {resultado['stats'].get('total_records', 0)}")
            print("===================================\n")
            return True
        else:
            print(f"\nERROR: {resultado.get('detail', 'Error desconocido')}")
            return False
    
    except Exception as e:
        import traceback
        print(f"\nERROR CRÍTICO: {str(e)}")
        print(traceback.format_exc())
        return False
    
    finally:
        # Cerrar conexiones
        await Tortoise.close_connections()
        print("Conexiones cerradas")

async def main():
    """Función principal"""
    if len(sys.argv) < 2:
        print("USO: python importar_csv_simple.py <ruta_archivo_csv>")
        print("Ejemplo: python importar_csv_simple.py backend/database/matriz_master.csv")
        return 1
    
    ruta_archivo = sys.argv[1]
    resultado = await importar_csv(ruta_archivo)
    
    if resultado:
        print("\n✅ Importación completada con éxito")
        return 0
    else:
        print("\n❌ Error en la importación")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
