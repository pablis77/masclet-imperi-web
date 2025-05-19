"""
Endpoints para la importación de datos
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import pandas as pd
import logging
from io import StringIO

from app.models.animal import Animal
from app.core.responses import SuccessResponse, ErrorResponse
from app.core.date_utils import parse_date, DATE_FORMAT_API, DATE_FORMAT_DB

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/csv")
async def import_csv(file: UploadFile = File(...)):
    """
    Importa animales desde un archivo CSV.
    El archivo debe tener las columnas: explotacio, nom, genere, estado, dob
    Las fechas deben estar en formato DD/MM/YYYY
    """
    try:
        # Leer el archivo CSV
        contents = await file.read()
        csv_text = contents.decode()
        df = pd.read_csv(StringIO(csv_text))
        
        # Validar columnas requeridas
        required_columns = ['explotacio', 'nom', 'genere', 'estado']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return ErrorResponse(
                message="Columnas requeridas faltantes",
                data={"missing_columns": missing_columns}
            )
            
        # Procesar cada fila
        imported_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Preparar datos del animal
                animal_data = {
                    'explotacio': row['explotacio'],
                    'nom': row['nom'],
                    'genere': row['genere'],
                    'estado': row['estado']
                }
                
                # Procesar fecha de nacimiento si existe
                if 'dob' in row and pd.notna(row['dob']):
                    # Asumimos que la fecha en el CSV está en formato DD/MM/YYYY
                    dob_str = str(row['dob'])
                    dob_iso, error = parse_date(dob_str)
                    if error:
                        errors.append(f"Fila {index + 2}: {error}")
                        continue
                    animal_data['dob'] = dob_iso
                
                # Procesar campos opcionales
                optional_fields = ['alletar', 'pare', 'mare', 'quadra', 'cod', 'num_serie']
                for field in optional_fields:
                    if field in row and pd.notna(row[field]):
                        animal_data[field] = row[field]
                
                # Crear animal
                await Animal.create(**animal_data)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Fila {index + 2}: {str(e)}")
        
        # Preparar respuesta
        return SuccessResponse(
            message=f"Importación completada. {imported_count} animales importados.",
            data={
                "total_processed": len(df),
                "imported": imported_count,
                "errors": errors if errors else None
            }
        )
        
    except pd.errors.EmptyDataError:
        return ErrorResponse(message="El archivo CSV está vacío")
    except pd.errors.ParserError:
        return ErrorResponse(message="Error al parsear el archivo CSV")
    except Exception as e:
        logger.error(f"Error en importación: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))