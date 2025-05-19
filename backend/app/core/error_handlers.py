from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, ResponseValidationError
from starlette.responses import Response
from app.models.animal import Animal
import json

async def http_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=getattr(exc, "status_code", 500),
        content={
            "message": str(exc),
            "type": "error",
            "data": None
        }
    )

async def validation_error_handler(request: Request, exc: RequestValidationError):
    """
    Custom handler for validation errors
    """
    detail = []
    for error in exc.errors():
        error_location = error.get("loc", [])
        error_msg = error.get("msg", "")
        error_type = error.get("type", "")
        detail.append({
            "loc": error_location,
            "msg": error_msg,
            "type": error_type
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "message": "Error de validación",
            "type": "error",
            "data": {
                "detail": detail
            }
        }
    )

async def http_exception_handler(request: Request, exc):
    """
    Custom handler for HTTP exceptions
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "message": exc.detail,
            "type": "error",
            "data": None
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """
    Custom handler for general exceptions
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "message": str(exc),
            "type": "error",
            "data": None
        }
    )

async def response_validation_handler(request: Request, exc: ResponseValidationError) -> JSONResponse:
    """Handle response validation errors"""
    try:
        # Get the original response data
        input_data = exc.errors()[0].get('input', {})
        
        # If it's a MessageResponse with Animal data
        if hasattr(input_data, 'data') and 'animal' in input_data.data:
            animal = input_data.data['animal']
            
            # Convert Animal model to dict
            animal_dict = {
                "alletar": bool(animal.alletar),
                "explotacio": str(animal.explotacio) if animal.explotacio else None,
                "nom": str(animal.nom),
                "genere": str(animal.genere),
                "pare": str(animal.pare) if animal.pare else None,
                "mare": str(animal.mare) if animal.mare else None,
                "quadra": str(animal.quadra) if animal.quadra else None,
                "cod": str(animal.cod) if animal.cod else None,
                "num_serie": str(animal.num_serie) if animal.num_serie else None,
                "dob": animal.dob.strftime("%d/%m/%Y") if animal.dob else None,
                "estado": str(animal.estado)
            }
            
            return JSONResponse(
                status_code=status.HTTP_201_CREATED,
                content={
                    "message": "Animal creado correctamente",
                    "type": "success",
                    "data": {"animal": animal_dict}
                }
            )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": str(e),
                "type": "error",
                "data": None
            }
        )