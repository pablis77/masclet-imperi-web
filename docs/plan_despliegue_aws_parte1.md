# Plan de Despliegue en AWS para Masclet Imperi Web - Parte 1

*Documento de planificación para despliegue en AWS - Versión 1.0 - Mayo 2025*

## Introducción

Este documento detalla el plan de despliegue específico para la plataforma Amazon Web Services (AWS) de la aplicación Masclet Imperi Web. El objetivo es realizar primero un despliegue completo en una cuenta AWS de desarrollo/prueba antes de migrar al entorno AWS del cliente final.

Esta estrategia nos permitirá:

1. Validar el proceso completo de despliegue
2. Identificar y solucionar problemas técnicos anticipadamente
3. Determinar los costes reales con precisión
4. Documentar cada paso del proceso para facilitar la migración entre cuentas AWS
5. Minimizar el tiempo de inactividad durante el despliegue final

## Arquitectura AWS Propuesta

Después de analizar los requisitos del sistema Masclet Imperi Web, recomendamos la siguiente arquitectura en AWS:

### Componentes Principales

| Componente | Servicio AWS | Justificación |
|------------|--------------|---------------|
| **Base de datos** | Amazon RDS para PostgreSQL | Servicio gestionado que elimina la administración manual de la base de datos, incluye backups automáticos, alta disponibilidad y escalabilidad. |
| **Backend API** | AWS Elastic Beanstalk con EC2 | Simplifica el despliegue de aplicaciones Python/FastAPI, gestión automática de la infraestructura subyacente mientras mantiene flexibilidad. |
| **Frontend (Astro híbrido)** | Amazon S3 + CloudFront o AWS Amplify | Astro permite un modelo híbrido con renderizado estático y componentes interactivos. Para nuestra aplicación con rutas dinámicas, Amplify podría ser mejor opción. |
| **Almacenamiento de archivos** | Amazon S3 | Para almacenar CSV de importación, backups de base de datos, y otros archivos del sistema. |
| **Balanceo de carga** | Elastic Load Balancer (incluido en Elastic Beanstalk) | Distribución automática del tráfico y gestión de escalado. |
| **Dominio y DNS** | Amazon Route 53 | Gestión de dominios y DNS con alta disponibilidad. |
| **Certificados SSL** | AWS Certificate Manager | Certificados SSL/TLS gratuitos y renovación automática. |

### Diagrama de Arquitectura

```
                                  +------------------+
                                  |   Route 53 DNS   |
                                  +--------+---------+
                                           |
                                           v
                         +----------------+ +----------------+
                         |    CloudFront  | |    API         |
                         |     (CDN)      | |  Gateway       |
                         +--------+-------+ +-------+--------+
                                  |                 |
                         +--------v-------+ +-------v--------+
                         |    S3 Bucket   | | Elastic        |
                         |    (Frontend)  | | Beanstalk      |
                         +----------------+ +-------+--------+
                                                    |
                                           +--------v--------+
                                           |    RDS          |
                                           | (PostgreSQL)    |
                                           +-----------------+
```

## Requisitos Técnicos y Preparación

### Cuenta AWS

- Cuenta AWS activada con permisos de administrador
- AWS CLI instalado y configurado localmente
- Usuario IAM con permisos adecuados para desplegar recursos

### Preparación Local

- Código fuente actualizado en GitHub
- Scripts de migración de base de datos preparados
- Variables de entorno documentadas en un archivo `.env.example`
- Backup reciente de la base de datos de desarrollo

## Estrategia de Implementación Gradual y Económica

Para maximizar la eficiencia de costes y facilitar el despliegue, seguiremos una estrategia de implementación gradual utilizando principalmente el nivel gratuito de AWS:

### Fase 1: Entorno Mínimo Viable (Nivel Gratuito)

| Servicio | Configuración | Coste (Nivel Gratuito) | Notas |
|----------|---------------|------------------------|-------|
| Amazon EC2 | t2.micro | **GRATUITO** (12 meses) | 750 horas/mes (1 instancia 24/7) |
| Amazon RDS | db.t2.micro, 20GB | **GRATUITO** (12 meses) | PostgreSQL con 20GB de almacenamiento |
| Amazon S3 | 5GB | **GRATUITO** (12 meses) | Para frontend estático y archivos |
| Route 53 | Gestión de zona DNS | 0.50€/mes | Mínimo coste inevitable |
| **Total Inicial** | | **~0.50€/mes** | + Dominio si es necesario |

En esta fase inicial:
- Utilizaremos una única instancia EC2 t2.micro para alojar el backend
- Instalaremos PostgreSQL directamente en la instancia EC2 (en lugar de RDS) si necesitamos más flexibilidad
- Desplegaremos el frontend en S3 sin CloudFront inicialmente

### Fase 2: Escalado Progresivo (Post-Nivel Gratuito)

| Servicio | Configuración | Coste Estimado/Mes | Notas |
|----------|---------------|---------------------|-------|
| Amazon RDS (PostgreSQL) | db.t3.small, 20GB | 25-35€ | Cuando el tráfico aumente |
| Elastic Beanstalk (EC2) | t3.small | 30-40€ | Para mejor rendimiento |
| S3 + CloudFront | Con CDN global | 10-15€ | Para mejor rendimiento |
| Route 53 | Gestión de zona DNS | 0.50€ | Más registro de dominio |
| Otros servicios | Básico | 5-10€ | CloudWatch, etc. |
| **Total Fase 2** | | **70-100€/mes** | Optimizable según uso |

> **Nota**: El plan está diseñado para maximizar el uso del nivel gratuito de AWS durante los primeros 12 meses, permitiendo validar la solución con mínimo coste antes de escalar.

### Beneficios de la Estrategia Gradual

1. **Validación a bajo coste**: Probar la solución completa con inversión mínima
2. **Aprendizaje progresivo**: Familiarizarse con AWS antes de configuraciones complejas
3. **Adaptabilidad**: Ajustar recursos según necesidades reales observadas
4. **Migración simplificada**: Facilitar la transferencia entre cuentas AWS (desarrollo a producción)

### Pasos Prioritarios

1. **Preparar entorno local**:
   - Separar variables de entorno para desarrollo/producción
   - Realizar backup completo de la base de datos
   - Preparar código para versión de producción

2. **Configurar servicios AWS nivel gratuito**:
   - Instancia EC2 t2.micro para backend y base de datos
   - Bucket S3 para frontend
   - Configuración básica de redes y seguridad

3. **Validar solución completa** antes de escalar a servicios premium

## Resumen de Servicios AWS Necesarios

### Servicios Primarios (Esenciales)

1. **Amazon RDS para PostgreSQL**
   - Base de datos gestionada con configuración de alta disponibilidad
   - Backups automáticos diarios y replicación

2. **AWS Elastic Beanstalk**
   - Entorno Python con soporte para WSGI/ASGI
   - Configuración de variables de entorno para backend

3. **Amazon S3**
   - Bucket para frontend estático
   - Bucket para almacenamiento de archivos del sistema

4. **Amazon CloudFront**
   - Distribución CDN para frontend
   - Configuración de caché y certificados SSL

5. **Amazon Route 53**
   - Gestión de DNS para dominios personalizados

### Servicios Secundarios (Recomendados)

1. **AWS Certificate Manager**
   - Certificados SSL/TLS gratuitos para dominios

2. **Amazon CloudWatch**
   - Monitoreo y alertas para todos los servicios
   - Recopilación de logs centralizada

3. **AWS Identity and Access Management (IAM)**
   - Gestión de permisos y seguridad

4. **AWS Secrets Manager**
   - Almacenamiento seguro de credenciales y claves API

## Requerimientos del Sistema Masclet Imperi Web

Para un despliegue exitoso en AWS, nuestro sistema requiere:

### Base de Datos

- PostgreSQL 14 o superior
- Configuración específica para Tortoise ORM
- Respaldos automáticos diarios
- 20GB de almacenamiento inicial (escalable)

### Backend

- Python 3.11+
- Dependencias instaladas desde requirements.txt
- Variables de entorno configuradas
- Puerto 8000 expuesto para API
- Memoria mínima: 2GB RAM
- Configuración CORS adecuada

### Frontend

- Archivos estáticos generados con `npm run build`
- Configuración para SPA (redirección a index.html)
- Caché configurada para archivos estáticos
- Variables de entorno para conectar al backend

### Red

- HTTPS obligatorio para todas las conexiones
- Cabeceras de seguridad configuradas
- Redirecciones de HTTP a HTTPS
- Políticas CORS configuradas correctamente

## Próximos Pasos

En el siguiente documento (plan_despliegue_aws_parte2.md) desarrollaremos:

1. Pasos detallados para la preparación del entorno AWS
2. Configuración paso a paso de cada servicio AWS
3. Proceso de despliegue de cada componente
4. Pruebas y verificaciones para cada etapa
5. Procedimiento de migración entre cuentas AWS

Este enfoque modular nos permitirá tener una documentación completa y detallada para cada fase del despliegue.
