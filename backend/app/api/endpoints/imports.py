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
import os
import uuid
from datetime import datetime, date
from fastapi.responses import StreamingResponse
from app.models.import_model import Import

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=ImportListResponse)
async def get_imports(
    page: int = Query(1, ge=1, description="Página a mostrar"),
    limit: int = Query(10, ge=1, le=100, description="Número de items por página"),
    status: Optional[str] = Query(None, description="Filtrar por estado")
):
    """
    Obtiene la lista de importaciones realizadas
    """
    # Calcular offset para paginación
    offset = (page - 1) * limit
    
    # Construir la consulta base
    query = Import.all()
    
    # Aplicar filtro de estado si se proporciona
    if status:
        query = query.filter(status=status)
    
    # Obtener el total de registros para la paginación
    total = await query.count()
    
    # Obtener los registros para la página actual
    imports = await query.order_by('-created_at').offset(offset).limit(limit).all()
    
    # Convertir los objetos a diccionarios para la respuesta
    items = []
    for import_record in imports:
        # Extraer contadores del resultado
        result = import_record.result or {}
        items.append({
            "id": import_record.id,
            "filename": import_record.file_name,
            "created_at": import_record.created_at,
            "status": import_record.status,
            "user_id": None,  # El modelo no tiene user_id actualmente
            "user_name": "Admin",  # Valor por defecto
            "total_records": result.get("total", 0),
            "successful_records": result.get("success", 0),
            "failed_records": result.get("errors", 0)
        })
    
    # Calcular el número total de páginas
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": limit,
        "totalPages": total_pages
    }

@router.post("/csv", response_model=ImportResponse)
async def import_csv(
    file: UploadFile = File(...),
    description: str = Form(...),
    current_user: User = Depends(get_current_user)
) -> ImportResponse:
    """
    Importa datos desde un archivo CSV.
    """
    # Verificar permisos (solo admin puede importar)
    from app.core.auth import verify_user_role
    
    if not verify_user_role(current_user, [UserRole.ADMIN]):
        logger.warning(f"Intento de importación por usuario no autorizado: {current_user.username} (Rol: {current_user.role})")
        raise HTTPException(
            status_code=403,
            detail="Solo los administradores pueden importar datos"
        )
    
    # Inicializar contadores y estado
    total_rows = 0
    imported_rows = 0
    errors = []
    
    try:
        # Leer el contenido del archivo con manejo de errores de codificación
        content = await file.read()
        try:
            csv_text = content.decode("utf-8-sig")  # Usar utf-8-sig para manejar BOM
        except UnicodeDecodeError:
            # Intentar con otras codificaciones comunes
            try:
                csv_text = content.decode("latin-1")
            except Exception as encoding_error:
                logger.error(f"Error al decodificar el archivo CSV: {str(encoding_error)}")
                import_record = await Import.create(
                    user_id=current_user.id,
                    description=description,
                    file_name=file.filename,
                    file_path="error_decode",
                    file_size=len(content),
                    file_type="text/csv",
                    status="failed",
                    errors=[f"Error de codificación en el archivo: {str(encoding_error)}"],
                    total_rows=0,
                    imported_rows=0
                )
                
                return {
                    "id": import_record.id,
                    "status": "failed",
                    "file_name": file.filename,
                    "file_size": len(content),
                    "file_type": "text/csv",
                    "created_at": import_record.created_at,
                    "updated_at": import_record.updated_at,
                    "completed_at": import_record.completed_at,
                    "description": description,
                    "result": {
                        "total": 0,
                        "success": 0,
                        "errors": 1,
                        "error_details": [{"message": f"Error de codificación en el archivo CSV: {str(encoding_error)}"}]
                    }
                }
        
        # Guardar una copia del archivo para referencia
        import_id = str(uuid.uuid4())
        file_path = f"imports/{import_id}_{file.filename}"
        os.makedirs("imports", exist_ok=True)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(csv_text)
        
        # Determinar el delimitador (auto-detectar) con manejo de errores
        try:
            # Intentar primero con el sniffer de CSV para autodetectar
            sniffer = csv.Sniffer()
            dialect = sniffer.sniff(csv_text[:1000])
            delimiter = dialect.delimiter
            logger.debug(f"Delimitador detectado con sniffer: '{delimiter}'")
        except Exception as sniffer_error:
            # Si falla el sniffer, usar el método simple
            logger.warning(f"No se pudo detectar el delimitador con sniffer: {str(sniffer_error)}")
            sample = csv_text[:1000]
            possible_delimiters = [";", ",", "\t", "|"] 
            delimiter = ";"  # Por defecto
            
            for delim in possible_delimiters:
                if delim in sample:
                    delimiter = delim
                    break
            logger.debug(f"Delimitador detectado manualmente: '{delimiter}'")
        
        # Procesar el CSV con manejo de errores
        try:
            reader = csv.DictReader(
                csv_text.splitlines(),
                delimiter=delimiter
            )
            
            # Verificar que el CSV tiene cabeceras válidas
            if not reader.fieldnames or len(reader.fieldnames) < 3:
                error_msg = "El CSV no tiene suficientes columnas o formato inválido"
                logger.error(error_msg)
                
                import_record = await Import.create(
                    user_id=current_user.id,
                    description=description,
                    file_name=file.filename,
                    file_path="error_format",
                    file_size=len(content),
                    file_type="text/csv",
                    status="completed_err",
                    errors=[error_msg],
                    total_rows=0,
                    imported_rows=0
                )
                
                return {
                    "id": import_record.id,
                    "status": "completed_err",
                    "file_name": file.filename,
                    "file_size": len(content),
                    "file_type": "text/csv",
                    "created_at": import_record.created_at,
                    "updated_at": import_record.updated_at,
                    "completed_at": import_record.completed_at,
                    "description": description,
                    "result": {
                        "total": 0,
                        "success": 0,
                        "errors": 1,
                        "error_details": [{"message": error_msg}]
                    }
                }
        except Exception as reader_error:
            error_msg = f"Error al procesar el formato del CSV: {str(reader_error)}"
            logger.error(error_msg)
            
            import_record = await Import.create(
                user_id=current_user.id,
                description=description,
                file_name=file.filename,
                file_path="error_reader",
                file_size=len(content),
                file_type="text/csv",
                status="completed_err",
                errors=[error_msg],
                total_rows=0,
                imported_rows=0
            )
            
            return {
                "id": import_record.id,
                "status": "completed_err",
                "file_name": file.filename,
                "file_size": len(content),
                "file_type": "text/csv",
                "created_at": import_record.created_at,
                "updated_at": import_record.updated_at,
                "completed_at": import_record.completed_at,
                "description": description,
                "result": {
                    "total": 0,
                    "success": 0,
                    "errors": 1,
                    "error_details": [{"message": error_msg}]
                }
            }
        
        # Registrar la información del import
        import_record = await Import.create(
            user_id=current_user.id,
            description=description,
            file_name=file.filename,
            file_path=file_path,
            file_size=len(content),
            file_type="text/csv",
            status="processing"
        )
        
        # Procesar el CSV línea por línea
        
        # Reiniciar el reader para el procesamiento real
        reader = csv.DictReader(
            csv_text.splitlines(),
            delimiter=delimiter
        )
        
        # Procesar cada fila del CSV
        for row in reader:
            try:
                total_rows += 1
                
                # Normalizar los nombres de las columnas (quitar espacios, minúsculas)
                normalized_row = {}
                for key, value in row.items():
                    if key:  # Solo procesar claves no vacías
                        # Normalizar clave
                        normalized_key = key.strip().lower()
                        # Normalizar valor
                        normalized_value = value.strip() if isinstance(value, str) else value
                        normalized_row[normalized_key] = normalized_value
                
                # El servicio se encargará de aplicar las reglas de negocio correctamente
                
                # Importar el animal y sus partos
                animal = await import_animal_with_partos(normalized_row)
                
                # Si se importó correctamente el animal, lo contamos
                
                imported_rows += 1
                
            except Exception as row_error:
                logger.error(f"Error importando fila: {str(row_error)}")
                errors.append(str(row_error))
        
        # Actualizar el estado de la importación
        # Crear el objeto de resultado
        result_data = {
            "total": total_rows,
            "success": imported_rows,
            "errors": len(errors),
            "error_details": [{'message': error} for error in errors] if errors else None
        }
        
        # Actualizar el registro de importación
        import_record.result = result_data
        
        if errors:
            import_record.status = "completed_err"
        else:
            import_record.status = "completed"
        
        import_record.completed_at = datetime.now()
        await import_record.save()
        
        # Devolver una respuesta completa con todos los campos requeridos
        return {
            "id": import_record.id,
            "status": import_record.status,
            "file_name": import_record.file_name,
            "file_size": import_record.file_size,
            "file_type": import_record.file_type,
            "created_at": import_record.created_at,
            "updated_at": import_record.updated_at,
            "completed_at": import_record.completed_at,
            "description": description,
            "result": {
                "total": total_rows,
                "success": imported_rows,
                "errors": len(errors),
                "error_details": [{'message': error} for error in errors] if errors else None
            }
        }
        
    except Exception as e:
        logger.error(f"Error general en importación: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error durante la importación: {str(e)}"
        )

@router.get("/template", response_class=StreamingResponse)
async def download_template():
    """
    Devuelve una plantilla CSV vacía con las cabeceras correctas para importar animales.
    """
    # Definir las cabeceras según las reglas de negocio
    headers = [
        "nom",           # Nombre del animal (obligatorio)
        "genere",        # Género (M/F) (obligatorio)
        "estado",        # Estado (OK/DEF) (obligatorio)
        "explotacio",    # Explotación (obligatorio)
        "alletar",       # Estado de amamantamiento (0, 1, 2) - solo para hembras
        "mare",          # Madre del animal
        "pare",          # Padre del animal
        "quadra",        # Cuadra/ubicación
        "cod",           # Código identificativo
        "num_serie",     # Número de serie oficial
        "dob",           # Fecha de nacimiento (formato DD/MM/YYYY)
        "part",          # Fecha del parto (formato DD/MM/YYYY) - solo para hembras
        "GenereT",       # Género de la cría (M/F/esforrada) - solo para hembras con parto
        "EstadoT"        # Estado de la cría (OK/DEF) - solo para hembras con parto
    ]
    
    # Crear un archivo CSV en memoria
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow(headers)
    
    # Ejemplo de fila con datos de muestra (comentada)
    # writer.writerow(["# Ejemplo: AnimalNuevo", "F", "OK", "ExplotacionEjemplo", "0", "NombreMadre", "NombrePadre", "CuadraEjemplo", "COD123", "NS456", "01/01/2020", "05/05/2022", "M", "OK"])
    
    # Reposicionar el puntero al inicio para la lectura
    output.seek(0)
    
    # Devolver como respuesta con el tipo de contenido adecuado
    filename = f"plantilla_importacion_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]), 
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{import_id}", response_model=ImportResponse)
async def get_import_status(import_id: int):
    """
    Obtiene el estado de una importación específica
    """
    # Buscar la importación en la base de datos
    import_record = await Import.filter(id=import_id).first()
    if not import_record:
        raise HTTPException(status_code=404, detail=f"Importación con ID {import_id} no encontrada")
        
    # Convertir a esquema de respuesta
    return {
        "id": import_record.id,
        "file_name": import_record.file_name,
        "file_size": import_record.file_size,
        "file_type": import_record.file_type,
        "status": import_record.status,
        "created_at": import_record.created_at,
        "updated_at": import_record.updated_at,
        "completed_at": import_record.completed_at,
        "description": import_record.description,
        "result": import_record.result
    }

@router.get("/{import_id}/errors")
async def get_import_errors(import_id: int):
    """
    Obtiene los detalles de errores de una importación específica.
    Facilita la visualización de errores para el botón "Errores" en la interfaz.
    """
    # Buscar la importación en la base de datos
    import_record = await Import.filter(id=import_id).first()
    if not import_record:
        raise HTTPException(status_code=404, detail=f"Importación con ID {import_id} no encontrada")
    
    # Verificar que tenga un resultado y detalles de errores
    if not import_record.result or "error_details" not in import_record.result:
        return {
            "import_id": import_id,
            "file_name": import_record.file_name,
            "total_records": import_record.result.get("total", 0) if import_record.result else 0,
            "success_count": import_record.result.get("success", 0) if import_record.result else 0,
            "error_count": import_record.result.get("errors", 0) if import_record.result else 0,
            "errors": []
        }
    
    # Reformatear para la respuesta
    return {
        "import_id": import_id,
        "file_name": import_record.file_name,
        "total_records": import_record.result.get("total", 0),
        "success_count": import_record.result.get("success", 0),
        "error_count": import_record.result.get("errors", 0),
        "errors": import_record.result.get("error_details", [])
    }
