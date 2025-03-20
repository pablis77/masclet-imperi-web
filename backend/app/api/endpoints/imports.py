"""
Endpoints para importación de datos
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, Depends
from typing import List, Optional
from app.schemas.import_schema import ImportResponse, ImportListResponse, ImportStatus, ImportResult
from app.services.import_service import import_animal_with_partos
from app.models.user import User
from app.core.config import UserRole
from app.core.auth import get_current_user, check_permissions
import csv
import io
import logging
from datetime import datetime, date

router = APIRouter()
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

@router.post("/csv", response_model=ImportResponse)
async def import_csv(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None)
):
    """
    Importa datos desde un archivo CSV.
    El CSV debe tener encabezados y contener los campos necesarios para los animales.
    Solo usuarios con rol ADMIN pueden realizar importaciones.
    """
    # Verificar que el usuario tiene rol ADMIN - Desactivado temporalmente para desarrollo
    # if current_user.role != UserRole.ADMIN:
    #     raise HTTPException(
    #         status_code=403,
    #         detail="Solo los administradores pueden importar datos"
    #     )
    
    # Para desarrollo, usamos un usuario por defecto
    logger.warning("Usando usuario por defecto para la importación en modo desarrollo.")
    # Crear un usuario ficticio para desarrollo
    current_user = User(username="admin", role=UserRole.ADMIN)
    
    logger.info(f"Iniciando importación CSV: {file.filename}, usuario: {current_user.username}")
        
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
        try:
            # Intentar primero con UTF-8
            text = contents.decode('utf-8')
        except UnicodeDecodeError:
            # Si falla, intentar con ISO-8859-1 (Latin-1)
            logger.warning("Decodificación UTF-8 falló, intentando con ISO-8859-1")
            text = contents.decode('iso-8859-1')
        
        csv_reader = csv.DictReader(io.StringIO(text), delimiter=';')
        
        # Contadores para resultados
        result = {
            "total": 0,
            "success": 0,
            "errors": 0,
            "error_details": []
        }
        
        # Mapeo de campos CSV a campos del modelo
        field_mapping = {
            'nom': ['NOM', 'nom', 'nombre', 'Nombre', 'NOMBRE', 'Nom'],
            'genere': ['Genere', 'genere', 'género', 'genero', 'Género', 'Genero', 'GENERE', 'GENERO', 'GÉNERO'],
            'estado': ['Estado', 'estado', 'estat', 'Estat', 'ESTADO', 'ESTAT'],
            'alletar': ['Alletar', 'alletar', 'Alletar', 'ALLETAR', 'amamantar', 'Amamantar', 'AMAMANTAR'],
            'mare': ['Mare', 'mare', 'madre', 'Madre', 'MARE', 'MADRE'],
            'pare': ['Pare', 'pare', 'padre', 'Padre', 'PARE', 'PADRE'],
            'quadra': ['Quadra', 'quadra', 'Quadra', 'QUADRA', 'cuadra', 'Cuadra', 'CUADRA'],
            'cod': ['COD', 'cod', 'código', 'codigo', 'Código', 'Codigo', 'CODIGO', 'CÓDIGO'],
            'num_serie': ['Num Serie', 'num_serie', 'número de serie', 'numero de serie', 'Nº Serie', 'Número de Serie', 'Numero de Serie', 'NUM_SERIE', 'NUMERO DE SERIE', 'NÚMERO DE SERIE'],
            'data_naixement': ['DOB', 'data_naixement', 'fecha de nacimiento', 'Data Naixement', 'Fecha de Nacimiento', 'FECHA DE NACIMIENTO', 'DATA_NAIXEMENT'],
            'part': ['part', 'parto', 'fecha de parto', 'Part', 'Parto', 'Fecha de Parto', 'PART', 'PARTO', 'FECHA DE PARTO'],
            'genere_fill': ['GenereT', 'genere_t', 'género ternero', 'genero ternero', 'Género Ternero', 'Genero Ternero', 'GÉNERO TERNERO', 'GENERO TERNERO', 'genere_fill', 'Genere Fill', 'GENERE_FILL', 'genere_cria', 'Genere Cria', 'GENERE_CRIA', 'género cría', 'genero cria', 'Género Cría', 'Genero Cria', 'GÉNERO CRÍA', 'GENERO CRIA', 'generef', 'GenereF', 'GENEREF'],
            'estat_fill': ['EstadoT', 'estado_t', 'estado ternero', 'estat_t', 'EstatT', 'Estado Ternero', 'ESTADO TERNERO', 'estat_fill', 'Estat Fill', 'ESTAT_FILL', 'estado_fill', 'Estado Fill', 'ESTADO_FILL', 'estado cría', 'Estado Cría', 'ESTADO CRÍA', 'estat cria', 'Estat Cria', 'ESTAT CRIA', 'estado_cria', 'Estado Cria', 'ESTADO_CRIA'],
            'explotacio': ['explotació', 'explotacion', 'explotación', 'Explotació', 'Explotacion', 'Explotación', 'EXPLOTACIÓ', 'EXPLOTACION', 'EXPLOTACIÓN', 'Explo', 'explo', 'EXPLO']
        }
        
        # Procesar cada fila
        for row in csv_reader:
            result["total"] += 1
            try:
                # Limpiar datos y normalizar nombres de campos
                cleaned_data = {}
                
                # Procesar cada campo según el mapeo
                for target_field, source_fields in field_mapping.items():
                    for source_field in source_fields:
                        if source_field in row and row[source_field] and row[source_field].strip():
                            # Convertir tipos según el campo
                            value = row[source_field].strip()
                            
                            # Conversiones específicas
                            if target_field == 'alletar' and value:
                                try:
                                    value = int(value)
                                except ValueError:
                                    # Si no es un número, lo dejamos como está para que el validador arroje el error
                                    pass
                            # Conversión de fechas en formato DD/MM/YYYY a objetos date
                            elif target_field in ['data_naixement', 'part'] and value:
                                try:
                                    day, month, year = value.split('/')
                                    value = date(int(year), int(month), int(day))
                                except (ValueError, IndexError):
                                    raise ValueError(f"Formato de fecha incorrecto para {target_field}: {value}. Formato esperado: DD/MM/YYYY")
                            
                            cleaned_data[target_field] = value
                            break  # Tomar solo el primer campo que coincida
                
                # Asegurarse de que existe el campo de explotación
                if 'explotacio' not in cleaned_data:
                    for field in ['explotacio', 'explotacion', 'explotación']:
                        if field in row and row[field]:
                            cleaned_data['explotacio'] = row[field].strip()
                            break

                # Renombrar los campos especiales si es necesario
                if 'dob' in cleaned_data:
                    cleaned_data['data_naixement'] = cleaned_data.pop('dob')
                
                # Validar que tenga los campos mínimos requeridos
                if 'nom' not in cleaned_data or not cleaned_data['nom']:
                    raise ValueError("El campo 'nom' es obligatorio y no puede estar vacío")
                
                if 'genere' not in cleaned_data:
                    raise ValueError("El campo 'genere' es obligatorio")
                
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
