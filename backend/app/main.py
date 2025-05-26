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

# Importar nuestras utilidades para la generación de OpenAPI
from app.core.openapi_utils import get_enhanced_openapi
from fastapi.responses import JSONResponse
import json
import traceback
from app.core.json_utils import EnhancedJSONEncoder

# Importar nuestras utilidades JSON
from app.core.json_utils import patch_pydantic_encoder

# Aplicar el parche al encoder de Pydantic antes de importar cualquier otro módulo
patch_pydantic_encoder()

from app.api.router import api_router
from app.core.config import Settings, get_settings
from app.core.security import setup_security

# Configurar logging
log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs')
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, 'masclet_imperi.log')

# Configurar el logger raíz
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Formato para los mensajes de log
formatter = logging.Formatter('%(asctime)s [%(levelname)8s] %(name)s - %(message)s', '%Y-%m-%d %H:%M:%S')

# Manejador para consola
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)

# Manejador para archivo
file_handler = logging.FileHandler(log_file, encoding='utf-8')
file_handler.setFormatter(formatter)

# Añadir manejadores al logger
logger.addHandler(console_handler)
logger.addHandler(file_handler)

logger = logging.getLogger(__name__)
logger.info(f"Iniciando aplicación. Logs guardados en: {log_file}")

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

# Función personalizada para generar el esquema OpenAPI con nuestro encoder JSON mejorado
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    # Usar la función original de FastAPI para generar el esquema
    try:
        openapi_schema = get_openapi(
            title=app.title,
            version=app.version,
            description=app.description,
            routes=app.routes,
        )
        
        # Serializar y deserializar usando nuestro encoder personalizado para eliminar tipos problemáticos
        openapi_json = json.dumps(openapi_schema, cls=EnhancedJSONEncoder)
        app.openapi_schema = json.loads(openapi_json)
        
        return app.openapi_schema
    except Exception as e:
        logger.error(f"Error generando esquema OpenAPI: {e}")
        # Devolver un esquema mínimo en caso de error
        return {
            "openapi": "3.0.2",
            "info": {
                "title": app.title,
                "description": app.description,
                "version": app.version
            },
            "paths": {}
        }

# Configurar CORS para desarrollo - FORZAR ACEPTACIÓN DE TODAS LAS CONEXIONES
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4321",
    "http://127.0.0.1:4321",
    "http://localhost:52944",
    "http://127.0.0.1:52944",
    "http://127.0.0.1:59313",  # Añadido para el puerto 59313
    "https://masclet-imperi-web-frontend-2025.loca.lt",
    "https://api-masclet-imperi.loca.lt",
    "http://10.5.0.2:3000",
    "http://192.168.1.147:3000"
]

# Configuración de CORS simplificada
is_dev = os.getenv("DEV_MODE", "true").lower() == "true"
logger.info(f"Modo {'desarrollo' if is_dev else 'producción'} detectado")

# ========================================================================
# SOLUCIÓN COMPLETA DE CORS PARA DESARROLLO
# ========================================================================

# 1. Configuración permisiva para el middleware estándar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos
    allow_headers=["*"],  # Permitir todos los encabezados
    expose_headers=["*"],
    max_age=600  # 10 minutos
)

# Middleware personalizado para manejar todas las solicitudes CORS correctamente
@app.middleware("http")
async def cors_middleware_universal(request: Request, call_next):
    # 1. Preparar los encabezados CORS para todas las solicitudes
    if request.method == "OPTIONS":
        # Responder inmediatamente a las solicitudes OPTIONS (preflight)
        return Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",  # O configura un origen específico si lo prefieres
                "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
                "Access-Control-Allow-Headers": "*",  # Permitir todos los encabezados
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "86400",  # Cache por 24 horas
                "Vary": "Origin"
            }
        )
    
    # 2. Para otras solicitudes, continuar con el procesamiento normal
    try:
        # Procesar la solicitud
        response = await call_next(request)
        
        # 3. Agregar encabezados CORS a todas las respuestas
        response.headers["Access-Control-Allow-Origin"] = "*"  # O configura un origen específico
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Vary"] = "Origin"
        
        return response
    except Exception as e:
        logger.error(f"Error en middleware CORS: {str(e)}")
        raise

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

# Definir una función personalizada para el esquema OpenAPI que use nuestro generador mejorado
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
        
    # Usar nuestra versión mejorada del generador de OpenAPI
    openapi_schema = get_enhanced_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

# Asignar nuestra función personalizada a la propiedad openapi de la aplicación
app.openapi = custom_openapi

# Middleware de depuración para diagnóstico de errores
@app.middleware("http")
async def debug_request(request: Request, call_next):
    try:
        # Registrar la solicitud entrante
        path = request.url.path
        logger.info(f"Solicitud recibida: {request.method} {path}")
        
        # Procesar la solicitud normalmente
        response = await call_next(request)
        return response
    except Exception as e:
        # Registrar el error
        logger.error(f"Error en solicitud: {e}")
        logger.error(f"Detalles del error:\n{traceback.format_exc()}")
        
        # Devolver una respuesta de error
        return JSONResponse(
            status_code=500,
            content={"detail": "Error interno del servidor"},
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