# Solución de Problemas de Dependencias en Despliegue de Backend (AWS)

## Resumen del Problema

Durante el despliegue del backend de Masclet Imperi en AWS, nos encontramos con varios problemas de dependencias que impedían el correcto funcionamiento de la API. Los principales errores fueron:

1. **Error con el módulo JWT**: `ModuleNotFoundError: No module named 'jwt'`
2. **Error con la versión de Tortoise ORM**: `ImportError: cannot import name 'HTTPNotFoundError' from 'tortoise.contrib.fastapi'`
3. **Conflictos de versiones** entre FastAPI y Pydantic: `fastapi 0.95.1 depends on pydantic <2.0.0`
4. **Problema con pydantic-settings**: La versión 0.2.2 no estaba disponible

## Solución Implementada

Creamos un archivo `requirements.txt` con versiones específicas y compatibles para resolver estos problemas:

```
fastapi==0.95.1
uvicorn==0.22.0
sqlalchemy==2.0.23
pydantic==1.10.8
python-dotenv==1.0.0
email-validator==2.0.0
psycopg2-binary==2.9.9
alembic==1.12.1
tortoise-orm==0.19.3
asyncpg==0.28.0
aerich==0.7.2
passlib[bcrypt]==1.7.4
bcrypt==4.0.1
python-jose[cryptography]==3.3.0
PyJWT==2.8.0
cryptography==41.0.7
python-multipart==0.0.6
tomlkit==0.12.3
tomli-w==1.0.0
reportlab==4.0.9
pandas==2.0.3
numpy==1.24.4
requests==2.31.0
schedule==1.2.0
```

Este archivo ha sido guardado como referencia en: `c:\Proyectos\claude\masclet-imperi-web\backend\requirements.txt.aws`

## Explicación Detallada de los Cambios

1. **Inclusión de PyJWT**: Añadimos explícitamente `PyJWT==2.8.0` ya que el código hace un `import jwt` directo.

2. **Versiones compatibles de FastAPI/Pydantic**: Utilizamos `fastapi==0.95.1` con `pydantic==1.10.8` para evitar el conflicto de versiones. FastAPI 0.95.1 requiere pydantic <2.0.0.

3. **Eliminación de pydantic-settings**: Esta dependencia causaba problemas de versiones y no estaba disponible en la versión especificada, así que la eliminamos ya que no era esencial.

4. **Versión específica de Tortoise ORM**: Fijamos la versión a `tortoise-orm==0.19.3` para asegurar compatibilidad con el código existente.

## Verificación de Funcionamiento

Hemos verificado que la API está funcionando correctamente mediante pruebas de endpoints:

- `/api/v1/health`: Responde con estado "ok"
- `/docs`: Muestra correctamente la documentación Swagger
- `/api/v1/users/me`: Conecta correctamente con la base de datos y devuelve información de usuario

## Notas para Futuros Despliegues

1. **Mantener este archivo de requisitos**: Para futuros despliegues en AWS, usar este mismo archivo de requirements para evitar problemas de dependencias.

2. **Actualización cuidadosa**: Si se requiere actualizar alguna dependencia, hacerlo con precaución verificando la compatibilidad entre paquetes, especialmente entre FastAPI y Pydantic.

3. **Testing previo**: Siempre probar las dependencias en un entorno similar antes de desplegar en producción.

4. **Módulos críticos**: Prestar especial atención a las importaciones directas de módulos como `jwt` y `schedule` que han causado problemas anteriormente.
