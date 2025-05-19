"""
Router principal de la API
"""
from fastapi import APIRouter
from .endpoints import animals, imports

api_router = APIRouter(prefix="/api/v1")

# Registrar los endpoints
api_router.include_router(animals.router, prefix="/animals", tags=["animals"])
api_router.include_router(imports.router, prefix="/imports", tags=["imports"])