"""
Aplicación principal FastAPI
"""
import logging
import time
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from tortoise.contrib.fastapi import register_tortoise
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

from app.api.router import api_router
from app.core.config import Settings, get_settings
from app.core.security import setup_security

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Obtener configuración
settings = get_settings()

# Configuración de la aplicación FastAPI
app = FastAPI(
    title="Masclet Imperi API",
    description="API para la gestión de animales de ganadería",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

# Configurar CORS para permitir todos los orígenes temporalmente
# Esto soluciona problema de acceso desde el frontend en Render
logger.info("Configurando CORS para permitir todos los orígenes (solución temporal)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Configurar medidas de seguridad
setup_security(app)

# Middleware de depuración para diagnóstico de errores
@app.middleware("http")
async def debug_request(request: Request, call_next):
    logger.info(f"Solicitud recibida: {request.method} {request.url.path}")
    
    try:
        # Procesar la solicitud normalmente
        response = await call_next(request)
        return response
    except Exception as e:
        # Registrar detalles del error para depuración
        logger.error(f"Error en solicitud: {str(e)}")
        logger.exception("Detalles del error:")
        
        # Convertir la excepción en una respuesta JSON para el cliente
        import traceback
        return JSONResponse(
            status_code=500,
            content={
                "detail": f"Error interno del servidor: {str(e)}",
                "type": str(type(e).__name__)
            }
        )

# Montar router API con prefijo /api/v1
app.include_router(api_router, prefix="/api/v1")

# Rutas personalizadas para documentación
@app.get("/api/v1/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url="/api/v1/openapi.json",
        title=app.title + " - Swagger UI",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
    )

# También mantener la documentación en /docs para compatibilidad
@app.get("/docs", include_in_schema=False)
async def redirect_to_docs():
    return get_swagger_ui_html(
        openapi_url="/api/v1/openapi.json",
        title=app.title + " - Swagger UI",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
    )

# Añadir un endpoint de health check directo en la raíz para Render
@app.get("/health", include_in_schema=False)
async def root_health_check():
    """Endpoint de health check para Render."""
    return {
        "status": "ok",
        "environment": settings.environment,
        "version": getattr(settings, 'version', '1.0.0'),
        "timestamp": time.time()
    }

# Conectar a la base de datos
TORTOISE_ORM = {
    "connections": {"default": settings.database_url},
    "apps": {
        "models": {
            "models": settings.MODELS,
            "default_connection": "default",
        },
    },
    "use_tz": False,
    "timezone": "UTC"
}

# Imprimir información de conexión para depuración
print(f"Intentando conectar a la base de datos: {settings.database_url}")

register_tortoise(
    app,
    config=TORTOISE_ORM,
    generate_schemas=True,
    add_exception_handlers=True,
)

# Función para asegurar que existe un usuario administrador
@app.on_event("startup")
async def ensure_admin_user():
    """Asegura que existe un usuario administrador en la base de datos"""
    try:
        # Importaciones necesarias
        from app.models.user import User
        from app.core.auth import get_password_hash
        
        logger.info("Verificando si existe usuario administrador...")
        
        # Verificar si ya existe un superusuario
        admin = await User.filter(is_superuser=True).first()
        
        if not admin:
            logger.info("Creando usuario administrador por defecto...")
            # Crear nuevo superusuario con credenciales admin/admin123
            admin_username = "admin"
            admin_password = "admin123"
            
            admin = User(
                username=admin_username,
                email="admin@example.com",
                hashed_password=get_password_hash(admin_password),
                is_active=True,
                is_superuser=True,
                role="administrador",
                full_name="Administrador"
            )
            await admin.save()
            logger.info(f"Usuario administrador {admin_username} creado correctamente")
        else:
            logger.info(f"Usuario administrador ya existe: {admin.username}")
            
    except Exception as e:
        logger.error(f"Error al verificar/crear usuario admin: {str(e)}")
        # No interrumpir el arranque de la aplicación por esto

# Iniciar el servidor si este archivo es ejecutado directamente
if __name__ == "__main__":
    import uvicorn
    print("Iniciando servidor FastAPI en http://localhost:8000")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)