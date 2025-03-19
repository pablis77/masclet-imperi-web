from fastapi import APIRouter
from .endpoints import animals, partos, dashboard, explotacions, imports

api_router = APIRouter()

api_router.include_router(animals.router, prefix="/animals", tags=["animals"])
api_router.include_router(partos.router, prefix="/partos", tags=["partos"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(explotacions.router, prefix="/explotacions", tags=["explotacions"])
api_router.include_router(imports.router, prefix="/imports", tags=["imports"])