"""
Router principal de la API
"""
from fastapi import APIRouter
from app.api.endpoints.animals import router as animals_router
from app.api.endpoints.partos import router as partos_router
from app.api.endpoints.partos_standalone import router as partos_standalone_router
from app.api.endpoints.dashboard import router as dashboard_router
from app.api.endpoints.imports import router as imports_router
from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.users import router as users_router
from app.api.endpoints.admin import admin_router
from app.api.endpoints.diagnostico import router as diagnostico_router
from app.api.endpoints.explotacions import router as explotacions_router
from app.api.endpoints.health import router as health_router

# Crear router principal
api_router = APIRouter()

# Rutas para autenticación
api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["authentication"]
)

# Rutas para usuarios
api_router.include_router(
    users_router,
    prefix="/users",
    tags=["users"]
)

# Incluir sub-routers
# Rutas para explotaciones
api_router.include_router(
    explotacions_router,
    prefix="/explotacions",
    tags=["explotacions"]
)

# Rutas para animales
api_router.include_router(
    animals_router,
    prefix="/animals",
    tags=["animals"]
)

# Rutas para partos (anidadas dentro de animals)
api_router.include_router(
    partos_router,
    tags=["partos"]
)

# Rutas para partos (acceso directo)
api_router.include_router(
    partos_standalone_router,
    prefix="/partos",
    tags=["partos"]
)

# Rutas para importaciones
api_router.include_router(
    imports_router,
    prefix="/imports",
    tags=["imports"]
)

# Rutas para administración
api_router.include_router(
    admin_router,
    prefix="/admin",
    tags=["admin"]
)

# Rutas para diagnóstico (solo desarrollo)
api_router.include_router(
    diagnostico_router,
    prefix="/diagnostico",
    tags=["diagnostico"]
)

# Rutas para dashboard - IMPORTAR DIRECTAMENTE
api_router.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["dashboard"]
)

# Rutas para health check (monitoreo)
api_router.include_router(
    health_router,
    tags=["health"]
)