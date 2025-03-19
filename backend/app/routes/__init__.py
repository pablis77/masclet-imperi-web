from .animals import router as animals_router
from .partos import router as partos_router
from .dashboard import router as dashboard_router
from .imports import router as imports_router

__all__ = ["animals_router", "partos_router", "dashboard_router", "imports_router"]