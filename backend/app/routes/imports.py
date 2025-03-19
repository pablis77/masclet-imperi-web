"""
Endpoints para importación de datos
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, Depends
from typing import List, Optional
from app.schemas.import_schema import ImportResponse, ImportListResponse, ImportStatus, ImportResult
from app.services.import_service import import_animal_with_partos
import csv
import io
import logging
from datetime import datetime

router = APIRouter(tags=["imports"])
logger = logging.getLogger(__name__)

@router.get("/", response_model=ImportListResponse)
async def get_imports(
    page: int = Query(1, ge=1, description="Página a mostrar"),
    size: int = Query(10, ge=1, le=100, description="Número de items por página")
):
    """
    Obtiene la lista de importaciones realizadas
    """
    # En una implementación completa, esto buscaría en la base de datos
    # Por ahora, devolvemos una estructura de ejemplo
    return {
        "items": [],
        "total": 0,
        "page": page,
        "size": size
    }

@router.post("/csv/", response_model=ImportResponse)
async def import_csv(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None)
):
    """
    Importa datos desde un archivo CSV.
    El CSV debe tener encabezados y contener los campos necesarios para los animales.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="El archivo debe ser CSV")
    
    try:
        # Crear un registro de importación
        import_id = 1  # En implementación real, sería un ID de base de datos
        now = datetime.now()
        
        # Preparar respuesta
        response = {
            "id": import_id,
            "file_name": file.filename,
            "file_size": 0,  # Se actualizará después
            "file_type": "csv",
            "status": ImportStatus.PROCESSING,
            "created_at": now,
            "updated_at": now,
            "description": description,
            "result": None
        }
        
        # Procesar el archivo
        contents = await file.read()
        response["file_size"] = len(contents)
        
        # Decodificar contenido y procesar CSV
        text = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(text))
        
        # Contadores para resultados
        result = {
            "total": 0,
            "success": 0,
            "errors": 0,
            "error_details": []
        }
        
        # Procesar cada fila
        for row in csv_reader:
            result["total"] += 1
            try:
                # Limpiar datos
                cleaned_data = {k.strip(): v.strip() if isinstance(v, str) else v 
                              for k, v in row.items() if v}
                
                # Importar animal y partos
                await import_animal_with_partos(cleaned_data)
                result["success"] += 1
                
            except Exception as e:
                result["errors"] += 1
                result["error_details"].append({
                    "row": result["total"],
                    "data": row,
                    "error": str(e)
                })
                logger.error(f"Error al importar fila {result['total']}: {str(e)}")
        
        # Actualizar respuesta con resultados
        response["status"] = ImportStatus.COMPLETED
        response["result"] = result
        response["completed_at"] = datetime.now()
        
        return response
        
    except Exception as e:
        logger.error(f"Error en procesamiento de CSV: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error procesando archivo: {str(e)}")

@router.get("/{import_id}", response_model=ImportResponse)
async def get_import_status(import_id: int):
    """
    Obtiene el estado de una importación específica
    """
    # En una implementación completa, esto buscaría en la base de datos
    # Por ahora, devolvemos un error para cualquier ID
    raise HTTPException(status_code=404, detail=f"Importación con ID {import_id} no encontrada")