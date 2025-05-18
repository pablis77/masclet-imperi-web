# Desglose Completo de la Infraestructura de Masclet Imperi para AWS

## 1. FRONTEND (AWS Amplify)

**Tecnologías actuales:**

- **Framework principal**: Astro (con hidratación parcial)
- **Componentes interactivos**: React + React Hooks
- **Estilos**: Tailwind CSS
- **Bundling**: Vite (integrado con Astro)

**Configuración en AWS:**

- **Servicio**: AWS Amplify
- **Nivel de servicio**: Plan estándar (capa gratuita durante 12 meses)
- **Implementación**: Conexión directa con repositorio GitHub
- **CI/CD**: Construye e implementa automáticamente cuando hay cambios en main
- **Dominios personalizados**: Soporte incluido con certificados SSL
- **Configuración especial**: Necesitará reglas de redirección para SPA

**Costos estimados:**

- **Primer año**: Gratuito (dentro de cuota)
- **Después**: 10-15€/mes dependiendo del tráfico
- **Almacenamiento**: ~1€/mes por 5GB

## 2. BACKEND (AWS App Runner / ECS)

**Tecnologías actuales:**

- **Framework**: FastAPI
- **Lenguaje**: Python 3.9+
- **Servidor ASGI**: Uvicorn
- **Autenticación**: JWT

**Opciones en AWS:**

1. **AWS App Runner** (recomendado para simplicidad):

   - Despliegue directo desde GitHub
   - Escalado automático
   - Más simple de gestionar
   - Costo: ~25-30€/mes (sin capa gratuita)
2. **AWS Elastic Container Service (ECS) con Fargate**:

   - Más flexible y potente
   - Mejor para cargas de trabajo variables
   - Se puede configurar con Auto Scaling
   - Costo: ~20-40€/mes dependiendo del uso
   - Posibilidad de usar EC2 Spot para reducir costos
3. **AWS Elastic Beanstalk**:

   - Más sencillo de configurar
   - Soporte nativo para Python
   - Capa gratuita disponible (parcial)
   - Costo: ~15-20€/mes después del periodo gratuito

**Dockerización**:

- Crear Dockerfile optimizado para FastAPI
- Implementar estrategia multi-etapa para imagen más pequeña
- Usar imagen base Python Alpine para reducir tamaño

## 3. BASE DE DATOS (Amazon RDS)

**Tecnologías actuales:**

- **Motor**: PostgreSQL
- **ORM**: Tortoise ORM
- **Migraciones**: Aerich
- **Contenedor**: Docker (postgres:14-alpine)

**Opciones en AWS:**

1. **Amazon RDS para PostgreSQL** (recomendado):

   - Servicio completamente gestionado
   - Respaldos automáticos
   - Alta disponibilidad opcional
   - Escalado vertical sencillo
   - **Costos**:
     - Instancia db.t3.micro: ~15€/mes (capa gratuita primer año)
     - Almacenamiento: ~2-5€/mes por 20GB
     - Respaldos: Incluidos
2. **PostgreSQL en EC2 con Docker**:

   - Mayor control y flexibilidad
   - Configurable según necesidades
   - Respaldos manuales o scripts personalizados
   - **Costos**:
     - Incluido en el costo del servidor EC2 (~8-15€/mes)
     - EBS para almacenamiento: ~2-5€/mes por 20GB
3. **Amazon Aurora Serverless** (para crecimiento futuro):

   - Escalado automático según demanda
   - Solo pagas por lo que usas
   - Ideal para cargas variables
   - **Costos**:
     - Base: ~25-40€/mes
     - Bajo demanda: facturación por segundo

## 4. MONITORIZACIÓN (CloudWatch + X-Ray)

**Estado actual del monitoreo**: Básico/desarrollo local

**Configuración en AWS:**

1. **Amazon CloudWatch**:

   - Monitoreo de recursos AWS
   - Paneles personalizables
   - Alertas configurables
   - Recopilación de logs
   - **Costos**:
     - Capa gratuita: primeros 10 métricas
     - Después: ~5-10€/mes según uso
2. **AWS X-Ray**:

   - Análisis de rendimiento
   - Trazabilidad entre servicios
   - Identificación de cuellos de botella
   - **Costos**:
     - ~1-3€/mes para aplicaciones pequeñas
3. **CloudWatch Logs Insights**:

   - Búsqueda y análisis de logs
   - Consultas para depuración
   - **Costos**:
     - Incluido en CloudWatch (~2-5€/mes según volumen)
4. **Amazon SNS para alertas**:

   - Notificaciones por email o SMS
   - Integración con sistemas de tickets
   - **Costos**:
     - Principalmente dentro de capa gratuita

## 5. SEGURIDAD Y REDES

1. **AWS Identity and Access Management (IAM)**:

   - Gestión de usuarios y permisos
   - Principio de privilegio mínimo
   - Gratis
2. **Amazon VPC**:

   - Red privada virtual para recursos
   - Control de tráfico con grupos de seguridad
   - Gratis para VPC básica
3. **AWS WAF** (opcional):

   - Firewall de aplicaciones web
   - Protección contra ataques comunes
   - **Costos**: ~5-10€/mes
4. **AWS Secrets Manager**:

   - Gestión segura de secretos y contraseñas
   - Rotación automática de credenciales
   - **Costos**: ~1€/mes por secreto

## 6. RESPALDOS Y RECUPERACIÓN

1. **Respaldos automáticos de RDS**:

   - Retención configurable (7-35 días)
   - Point-in-time recovery
   - Incluido en el precio de RDS
2. **AWS Backup** (opcional):

   - Gestión centralizada de respaldos
   - Políticas de retención personalizables
   - **Costos**: según volumen (~3-8€/mes)

## 7. COSTOS TOTALES ESTIMADOS

### Primer año (con capa gratuita):

- **Frontend (Amplify)**: Gratuito
- **Backend (EC2 o Elastic Beanstalk)**: Mayormente gratuito
- **Base de datos (RDS)**: Gratuito (capa t2.micro)
- **Monitorización**: Mayormente gratuito
- **Otros servicios**: ~5€/mes
- **TOTAL APROXIMADO**: 5-10€/mes

### Después del primer año:

- **Frontend (Amplify)**: 10-15€/mes
- **Backend (App Runner o ECS)**: 25-30€/mes
- **Base de datos (RDS)**: 15-25€/mes
- **Monitorización**: 5-10€/mes
- **Otros servicios**: 5-10€/mes
- **TOTAL APROXIMADO**: 60-90€/mes

## 7.1 PROPUESTA AFINADA BASADA EN ANÁLISIS DE INTERACTIVIDAD

Tras un análisis detallado de la estructura real del proyecto y los patrones de uso, hemos refinado nuestra propuesta para optimizar costes:

### Nivel de interactividad real: MODERADO

- 10-12 usuarios principalmente en modo consulta
- Picos ocasionales de 20-40 cambios por día
- Carga mayoritariamente de lectura, no escritura intensiva

### Infraestructura optimizada para interactividad moderada:

1. **Frontend (AWS Amplify)**:

   - Plan básico suficiente: 5-8€/mes
   - Optimizar assets para reducir transferencia
2. **Backend (AWS Lightsail en lugar de App Runner)**:

   - Instancia de 2GB RAM: 3.50-5€/mes
   - Suficiente para la carga esperada
3. **Base de datos**:

   - Opción 1: RDS t3.micro - 15€/mes
   - Opción 2: PostgreSQL en Docker en la misma instancia Lightsail - 0€ adicionales
4. **Monitorización**:

   - CloudWatch básico: 0-5€/mes
   - Solución alternativa: Prometheus+Grafana (0€ adicionales)

### COSTE MENSUAL OPTIMIZADO:

**Primer año (con capa gratuita)**: 0-5€/mes

**Después del primer año**:

- **Escenario económico** (PostgreSQL en Docker): 10-15€/mes
- **Escenario estándar** (con RDS): 25-40€/mes

Esta propuesta optimizada refleja las necesidades reales de la aplicación según el análisis exhaustivo de la estructura del código y patrones de uso, evitando sobrecostes por servicios sobredimensionados.

## 8. OPTIMIZACIONES DE COSTOS

1. **Reservas de instancias**:

   - Descuentos de hasta 60% con compromiso de 1-3 años
   - Aplicable a RDS y EC2
2. **Savings Plans**:

   - Compromiso de gasto por hora
   - Flexibilidad en tipos de instancias
   - Descuentos hasta 72%
3. **Instancias Spot para carga no crítica**:

   - Hasta 90% de descuento
   - Ideal para procesamiento batch
4. **AWS Budgets**:

   - Alertas de gastos
   - Prevención de sorpresas en facturación
5. **Dimensionamiento correcto**:

   - Análisis periódico de uso
   - Ajuste de recursos según necesidades reales

## 9. ESTRATEGIA DE DESPLIEGUE

1. **Fase inicial (Migración)**:

   - Configurar repositorios con CI/CD
   - Implementar AWS Amplify para frontend
   - Desplegar backend en EC2 (capa gratuita)
   - Migrar base de datos a RDS
   - Configurar monitorización básica
2. **Fase de optimización (3-6 meses)**:

   - Evaluar patrones de uso
   - Ajustar tamaños de instancias
   - Implementar estrategias de reducción de costos
   - Mejorar monitorización y alertas
3. **Fase de madurez (6-12 meses)**:

   - Evaluar necesidad de servicios adicionales
   - Considerar reservas a largo plazo
   - Implementar recuperación ante desastres
   - Revisar arquitectura para escalabilidad

## 10. CONSIDERACIONES ADICIONALES

1. **Soporte**:

   - Plan Básico: Gratuito (solo centro de conocimiento)
   - Plan Developer: ~29€/mes (soporte técnico por email)
2. **Cumplimiento y regulación**:

   - GDPR: Considerar región de AWS Europa (Irlanda/Frankfurt)
   - Configurar retención de datos según normativa
3. **Disaster Recovery**:

   - RDS Multi-AZ para alta disponibilidad (~+50% costo)
   - Estrategia de respaldos cross-región para casos críticos
4. **Escalabilidad futura**:

   - Arquitectura ya preparada para crecimiento
   - Posibilidad de evolucionar a microservicios si es necesario
