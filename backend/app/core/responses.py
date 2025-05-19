"""
Respuestas HTTP personalizadas
"""
from fastapi import status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from typing import Any, Dict, List, Optional, Union

def format_validation_error(exc: RequestValidationError) -> List[Dict[str, str]]:
    """
    Formatea los errores de validación en un formato amigable
    
    Convierte los errores de Pydantic en una lista de diccionarios con:
    - field: campo que falló la validación
    - message: mensaje de error legible
    """
    errors = []
    for error in exc.errors():
        # Obtener el campo desde la ruta de error
        field = ".".join(str(x) for x in error["loc"])
        # Usar el mensaje de error original
        message = error["msg"]
        errors.append({
            "field": field,
            "message": message
        })
    return errors

def ValidationErrorResponse(exc: RequestValidationError) -> JSONResponse:
    """
    Respuesta HTTP para errores de validación
    
    Args:
        exc: Excepción de validación de FastAPI
    
    Returns:
        JSONResponse con formato estandarizado para errores de validación
    """
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": format_validation_error(exc)
        }
    )

def ErrorResponse(
    status_code: int,
    message: str,
    details: Optional[Union[str, Dict[str, Any]]] = None
) -> JSONResponse:
    """
    Respuesta HTTP para errores generales
    
    Args:
        status_code: Código HTTP del error
        message: Mensaje de error principal
        details: Detalles adicionales del error (opcional)
    
    Returns:
        JSONResponse con formato estandarizado para errores
    """
    content = {
        "error": message
    }
    if details:
        content["detail"] = details
        
    return JSONResponse(
        status_code=status_code,
        content=content
    )

def SuccessResponse(
    data: Any,
    message: Optional[str] = None,
    status_code: int = status.HTTP_200_OK
) -> JSONResponse:
    """
    Respuesta HTTP para operaciones exitosas
    
    Args:
        data: Datos a devolver
        message: Mensaje de éxito (opcional)
        status_code: Código HTTP (default 200)
    
    Returns:
        JSONResponse con formato estandarizado para éxito
    """
    content = {
        "data": data
    }
    if message:
        content["message"] = message
        
    return JSONResponse(
        status_code=status_code,
        content=content
    )