"""
Aplicación principal FastAPI
"""
import logging
import time
import socket
import ipaddress
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

# Configurar CORS para desarrollo
origins = [
    "*"  # En desarrollo, permitimos todos los orígenes
]

# Configuración de CORS simplificada
is_dev = os.getenv("DEV_MODE", "true").lower() == "true"
logger.info(f"Modo {'desarrollo' if is_dev else 'producción'} detectado")

# Configuración detallada de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600  # 10 minutos
)

# Middleware para manejar manualmente las peticiones OPTIONS
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    # Si es una petición OPTIONS, responder inmediatamente
    if request.method == "OPTIONS":
        response = Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Expose-Headers": "*",
                "Access-Control-Max-Age": "600"  # 10 minutos
            }
        )
        return response
    
    # Para el resto de peticiones, procesar normalmente y añadir encabezados CORS
    response = await call_next(request)
    
    # Añadir encabezados CORS a la respuesta
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Expose-Headers"] = "*"
    response.headers["Access-Control-Max-Age"] = "600"  # 10 minutos
    
    return response

# Configurar medidas de seguridad
setup_security(app)

# Middleware mejorado para manejar LocalTunnel y problemas de CORS
@app.middleware("http")
async def localtunnel_fix(request: Request, call_next):
    # Registrar origen para depuración
    origin = request.headers.get("origin", "No origin header")
    host = request.headers.get("host", "No host header")
    referer = request.headers.get("referer", "No referer header")
    method = request.method
    path = request.url.path
    
    # Log detallado en modo desarrollo
    if is_dev and ("loca.lt" in origin or "loca.lt" in host or "loca.lt" in referer):
        logger.info(f"[LocalTunnel] Recibida solicitud: {method} {path}")
        logger.info(f"[LocalTunnel] Origin: {origin}, Host: {host}, Referer: {referer}")
    
    # Arreglar URLs duplicadas que vienen de LocalTunnel
    if 'https,' in path or 'http,' in path:
        # Detectar y limpiar URLs malformadas desde el túnel
        logger.info(f"[LocalTunnel] Solicitud recibida con URL duplicada: {path}")
        
        # Extraer la última parte de la URL (la parte correcta)
        if '/api/v1/' in path:
            # Buscar todas las ocurrencias de '/api/v1/'
            parts = path.split('/api/v1/')
            if len(parts) > 1:
                # Reconstruir la URL correcta
                clean_path = f"/api/v1/{parts[-1]}"
                # Modificar la URL de la petición
                request.scope["path"] = clean_path
                logger.info(f"[LocalTunnel] URL limpiada: {clean_path}")
        else:
            # Para otras URLs malformadas, intentar extraer la parte útil
            # Buscar el patrón común: https,<url_real>
            parts = path.split(",")
            if len(parts) > 1:
                clean_path = parts[-1]  # Tomar la última parte después de la coma
                request.scope["path"] = clean_path
                logger.info(f"[LocalTunnel] URL genérica limpiada: {clean_path}")
    
    # Añadir encabezados CORS para solicitudes OPTIONS
    # Esto asegura compatibilidad con navegadores en dispositivos móviles
    response = await call_next(request)
    
    # Para solicitudes desde LocalTunnel, asegurar que los encabezados CORS son correctos
    if "loca.lt" in (origin or host or referer or ""):
        # Añadir encabezados CORS manualmente para asegurar compatibilidad
        response.headers["Access-Control-Allow-Origin"] = origin or "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        if is_dev:
            # En desarrollo, no necesitamos credentials
            response.headers["Access-Control-Allow-Credentials"] = "false"
        else:
            # En producción, sí las necesitamos
            response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

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
        
        # Verificar si ya existe un usuario administrador por su rol
        admin = await User.filter(role="administrador").first()
        
        if not admin:
            logger.info("Creando usuario administrador por defecto...")
            # Crear nuevo usuario administrador con credenciales admin/admin123
            admin_username = "admin"
            admin_password = "admin123"
            
            admin = User(
                username=admin_username,
                email="admin@example.com",
                password_hash=get_password_hash(admin_password),
                is_active=True,
                role="administrador"  # Usar el campo role en lugar de is_superuser
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