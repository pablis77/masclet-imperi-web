# BACKUP COMPLETO DE MASCLET-IMPERI BACKEND EN AWS

Fecha: 05/06/2025
Hora: 02:20:15

## Contenidos de este backup

1. **Base de datos**
   - Archivo: backup_masclet_imperi_aws_20250605_022008.sql
   - TamaÃ±o: 0.112044334411621 MB

2. **Archivos de configuraciÃ³n**
   - backend.env.aws: Variables de entorno para el backend
   - requirements.txt.aws: Dependencias compatibles para el backend
   - docker-compose.backend.yml: ConfiguraciÃ³n del contenedor backend

3. **InformaciÃ³n de contenedores**
   - db_container.json: ConfiguraciÃ³n del contenedor PostgreSQL
   - backend_container.json: ConfiguraciÃ³n del contenedor Backend FastAPI

## Instrucciones para restauraciÃ³n rÃ¡pida

1. **Base de datos**: Usar uno de estos mÃ©todos:
   - OpciÃ³n 1: Restaurar desde el archivo SQL:
     `
     cat backup_masclet_imperi_aws_20250605_022008.sql | docker exec -i masclet-db psql -U admin -d masclet_imperi
     `
   - OpciÃ³n 2: Usar nuestro script de importaciÃ³n:
     `
     python backend\scripts\restore_database.py --file backup_aws_20250605\backup_masclet_imperi_aws_20250605_022008.sql
     `

2. **Backend**: Crear contenedor con:
   `
   docker-compose -f docker-compose.backend.yml up -d
   `

3. **Frontend**: Usar configuraciÃ³n estÃ¡ndar con:
   `
   docker-compose -f docker-compose.frontend.yml up -d
   `

Nota: Este backup contiene toda la configuraciÃ³n necesaria para recrear el entorno de AWS localmente o en otro servidor.
