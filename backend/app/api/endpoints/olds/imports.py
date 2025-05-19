# backend/app/api/endpoints/imports.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from io import StringIO
import logging
from datetime import datetime
from tortoise.transactions import in_transaction
from typing import List, Dict, Any, Optional
import asyncpg  # AÑADIR ESTA LÍNEA

from app.models.animal import Animal
from app.models.parto import Part

router = APIRouter()
logger = logging.getLogger(__name__)

# NUEVAS FUNCIONES AUXILIARES PARA FLEXIBILIDAD

def generate_placeholder_value(field_name: str, row_index: int) -> str:
    """Genera un valor de reemplazo claramente identificable para campos faltantes"""
    return f"[AUTO_{field_name.upper()}_{row_index}]"

def process_date_value(date_str: str, row_index: int) -> Optional[str]:
    """
    Procesa una fecha con máxima flexibilidad.
    Si no puede interpretarse, retorna un marcador especial.
    """
    if not date_str:
        return None
    
    # Intentar varios formatos de fecha
    for date_format in ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d', '%d.%m.%Y']:
        try:
            date_obj = datetime.strptime(date_str, date_format)
            return date_obj.strftime('%Y-%m-%d')  # Formato ISO para BD
        except ValueError:
            continue
    
    # Si llegamos aquí, no pudimos interpretar la fecha
    logger.warning(f"Fecha no reconocida ({date_str}) en fila {row_index}")
    return "1900-01-01"  # Fecha marcador para revisión posterior

@router.post("/preview")
async def preview_import(file: UploadFile = File(...)):
    """Vista previa de importación CSV"""
    try:
        logger.debug(f"Procesando archivo: {file.filename}")
        
        # Leer contenido
        content = await file.read()
        
        # Intentar decodificar con diferentes encodings
        text_content = None
        for encoding in ['utf-8', 'latin-1', 'windows-1252']:
            try:
                text_content = content.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
                
        if text_content is None:
            return JSONResponse(
                status_code=400, 
                content={
                    "message": "No se pudo decodificar el archivo CSV",
                    "type": "error",
                    "data": None
                }
            )
        
        # Procesar CSV con máxima flexibilidad
        df = pd.read_csv(
            StringIO(text_content),
            sep=';',
            dtype=str,
            na_values=['', 'NaN', 'nan', '#N/A', 'NA', 'NULL'],
            keep_default_na=True
        )
        
        # Reemplazar NaN con None/null
        df = df.replace({np.nan: None})
        
        # NUEVO: Verificar y mostrar alertas sobre fechas potencialmente problemáticas
        date_validation = {}
        if 'DOB' in df.columns:
            valid_dates = 0
            invalid_dates = []
            
            for idx, val in enumerate(df['DOB']):
                if val and process_date_value(val, idx+2) == "1900-01-01":
                    invalid_dates.append({"row": idx+2, "value": val})
                elif val:
                    valid_dates += 1
                    
            date_validation = {
                "valid_dates": valid_dates,
                "invalid_dates": len(invalid_dates),
                "examples": invalid_dates[:3]  # Solo mostrar los primeros 3 ejemplos
            }
        
        # Preparar respuesta
        preview_data = {
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "preview_rows": df.head(2).to_dict('records'),
            "date_validation": date_validation
        }
        
        return JSONResponse(
            content={
                "message": "Vista previa del CSV generada correctamente",
                "type": "success",
                "data": preview_data
            }
        )
        
    except Exception as e:
        logger.error(f"Error procesando archivo: {str(e)}")
        return JSONResponse(
            status_code=400,
            content={
                "message": f"Error procesando archivo: {str(e)}",
                "type": "error",
                "data": None
            }
        )

@router.post("/import/csv")
async def import_csv(file: UploadFile = File(...)):
    """Importa datos desde un archivo CSV con máxima flexibilidad de codificación"""
    try:
        content = await file.read()
        
        # Intento con múltiples codificaciones
        encodings = ['utf-8-sig', 'latin1', 'cp1252', 'iso-8859-1', 'utf-16']
        content_str = None
        
        for encoding in encodings:
            try:
                content_str = content.decode(encoding)
                logger.info(f"CSV decodificado correctamente con codificación: {encoding}")
                break
            except UnicodeDecodeError:
                continue
                
        if not content_str:
            raise ValueError("No se pudo decodificar el archivo CSV con ninguna codificación conocida")
        
        # Procesar con separador correcto y manejo de valores especiales
        df = pd.read_csv(
            StringIO(content_str), 
            sep=';',  # Usar punto y coma como separador
            na_values=['', 'NaN', 'nan', '#N/A', 'NA', 'NULL'],
            keep_default_na=True
        )
        
        # Reemplazar NaN con None para compatibilidad con JSON
        df = df.replace({np.nan: None})
        
        results = {
            "total": len(df),
            "imported": 0,
            "updated": 0,
            "errors": 0,
            "error_details": [],
            "warnings": [],
            "fields_autogenerated": 0
        }

        # Crear una conexión PostgreSQL directa para las fechas
        import psycopg2
        conn_params = {
            "host": "localhost",
            "database": "masclet_imperi",
            "user": "postgres",
            "password": "1234"
        }
        pg_conn = psycopg2.connect(**conn_params)
        pg_cursor = pg_conn.cursor()
        
        # Procesar cada fila con método separado
        for index, row in df.iterrows():
            try:
                row_dict = row.to_dict()
                row_warnings = []
                
                # 1. Preparar datos básicos (SIN fechas)
                animal_data = {}
                # Mapear campos sin incluir fechas
                if row_dict.get('explotació'):
                    animal_data['explotacio'] = row_dict.get('explotació')
                if row_dict.get('NOM'):
                    animal_data['nom'] = row_dict.get('NOM')
                if row_dict.get('Genere'):
                    animal_data['genere'] = row_dict.get('Genere')
                if row_dict.get('Estado'):
                    animal_data['estado'] = row_dict.get('Estado')
                if row_dict.get('alletar') is not None:
                    animal_data['alletar'] = row_dict.get('alletar') == 'si'
                # Otros campos...
                
                # 2. Crear o actualizar animal básico
                animal = None
                if 'nom' in animal_data and animal_data['nom']:
                    animal = await Animal.get_or_none(nom=animal_data['nom'])
                
                # Reemplazar la sección que procesa fechas:

                # 1. Primero crear/actualizar el animal sin incluir la fecha
                if animal:
                    # Actualizamos animal sin incluir la fecha
                    await Animal.filter(id=animal.id).update(**{k: v for k, v in animal_data.items() if k != 'dob'})
                    animal_id = animal.id
                    results['updated'] += 1
                else:
                    # Creamos animal sin fecha
                    new_animal = await Animal.create(**{k: v for k, v in animal_data.items() if k != 'dob'})
                    animal_id = new_animal.id
                    results['imported'] += 1

                # 2. Procesamos fecha por separado usando SQL directo con psycopg2
                if row_dict.get('DOB'):
                    try:
                        date_processed = False
                        
                        # Intentar convertir fecha con varios formatos
                        for date_format in ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d', '%d.%m.%Y']:
                            try:
                                date_obj = datetime.strptime(str(row_dict['DOB']), date_format)
                                iso_date = date_obj.strftime('%Y-%m-%d')
                                
                                # Usar el cursor psycopg2 que YA ESTÁ INICIALIZADO
                                pg_cursor.execute(f"UPDATE animals SET dob = '{iso_date}'::date WHERE id = {animal_id}")
                                pg_conn.commit()
                                
                                logger.info(f"Fecha actualizada correctamente para animal {animal_id}: {iso_date}")
                                date_processed = True
                                break
                            except ValueError:
                                continue
                        
                        # Si no se pudo procesar la fecha, usar una por defecto
                        if not date_processed:
                            pg_cursor.execute(f"UPDATE animals SET dob = '1900-01-01'::date WHERE id = {animal_id}")
                            pg_conn.commit()
                            row_warnings.append(f"Fecha no reconocida: {row_dict.get('DOB')} (marcada como 1900-01-01)")
                    except Exception as e:
                        # En caso de cualquier error, usar fecha por defecto
                        logger.error(f"Error procesando fecha '{row_dict.get('DOB')}' para ID {animal_id}: {str(e)}")
                        try:
                            pg_cursor.execute(f"UPDATE animals SET dob = '1900-01-01'::date WHERE id = {animal_id}")
                            pg_conn.commit()
                            row_warnings.append(f"Error procesando fecha: {str(e)}")
                        except Exception as inner_e:
                            logger.error(f"Error crítico en fecha para ID {animal_id}: {str(inner_e)}")
                
                # 4. Registrar advertencias
                if row_warnings:
                    results['warnings'].append({
                        "row": index + 2,
                        "details": row_warnings
                    })
                    
            except Exception as e:
                results['errors'] += 1
                error_detail = {
                    "row": index + 2,
                    "data": row.to_dict(),
                    "error": str(e)
                }
                results['error_details'].append(error_detail)
        
        # Cerrar conexión PostgreSQL
        pg_cursor.close()
        pg_conn.close()
        
        # Asegurar que los resultados sean compatibles con JSON
        def clean_for_json(obj):
            if isinstance(obj, dict):
                return {k: clean_for_json(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [clean_for_json(i) for i in obj]
            elif isinstance(obj, float) and (np.isnan(obj) if np.isnan is not None else False or 
                                           np.isinf(obj) if np.isinf is not None else False):
                return None
            else:
                return obj
        
        clean_results = clean_for_json(results)
        
        return {
            "message": "Importación CSV completada con máxima flexibilidad",
            "type": "success",
            "data": clean_results
        }
        
    except Exception as e:
        logger.error(f"Error en importación CSV: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "message": str(e),
                "type": "error",
                "data": None
            }
        )