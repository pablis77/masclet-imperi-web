#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script simplificado que importa directamente el archivo matriz_master.csv.
"""
import os
import sys
import asyncio
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Agregar la ruta al path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Constantes
DB_URL = "postgres://postgres:1234@localhost:5432/masclet_imperi"
# Archivo de importación principal
MATRIZ_MASTER = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'backend', 'database', 'matriz_master.csv')

async def main():
    """Función principal"""
    # Inicializar Tortoise ORM
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
        # Importar el archivo matriz_master.csv directamente
        from app.services.import_service import process_csv_file
        
        # Ejecutar la importación
        print(f"Importando archivo: {MATRIZ_MASTER}")
        
        resultado = await process_csv_file(
            filename=MATRIZ_MASTER,
            import_id="1",  # ID simple
            prevent_duplicates=True,
            importar_partos=True
        )
        
        # Mostrar resultados
        if resultado.get("success", False):
            print("\n=== RESULTADO DE LA IMPORTACIÓN ===")
            print(f"Animales creados: {resultado['stats']['created']}")
            print(f"Animales actualizados: {resultado['stats']['updated']}")
            print(f"Errores: {resultado['stats']['failed']}")
            print(f"Advertencias: {resultado['stats']['warnings']}")
            print(f"Total registros: {resultado['stats'].get('total_records', 0)}")
            print("===================================\n")
            return 0
        else:
            print(f"\nERROR: {resultado.get('detail', 'Error desconocido')}")
            return 1
            
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        traceback.print_exc()
        return 1
        
    finally:
        # Cerrar conexiones
        await Tortoise.close_connections()

if __name__ == "__main__":
    codigo_salida = asyncio.run(main())
    sys.exit(codigo_salida)
