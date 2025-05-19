# Scripts de Mantenimiento

Este directorio contiene los scripts necesarios para el mantenimiento y gestión del sistema Masclet Imperi.

## Scripts Disponibles

### 1. init_maintenance.sh
- **Propósito**: Script principal de inicialización
- **Funciones**:
  - Verifica entorno y requisitos
  - Configura estructura de directorios
  - Establece permisos y variables
  - Configura tareas programadas
- **Uso**: `sudo ./init_maintenance.sh`

### 2. maintenance_manager.sh
- **Propósito**: Gestión centralizada de mantenimiento
- **Funciones**:
  - Ejecuta scripts en orden específico
  - Gestiona dependencias entre scripts
  - Genera reportes de ejecución
  - Maneja errores y recuperación
- **Uso**: `sudo ./maintenance_manager.sh`

### 3. setup_permissions.sh
- **Propósito**: Configuración de permisos del sistema
- **Funciones**:
  - Configura usuarios y grupos
  - Establece permisos por tipo de archivo
  - Gestiona accesos a directorios
  - Verifica configuración aplicada
- **Uso**: `sudo ./setup_permissions.sh`

### 4. setup_monitoring.sh
- **Propósito**: Configuración del sistema de monitorización
- **Funciones**:
  - Configura recolectores de métricas
  - Establece umbrales de alerta
  - Configura dashboards y visualización
  - Mantiene historial de métricas
- **Uso**: `sudo ./setup_monitoring.sh`

### 5. setup_notifications.sh
- **Propósito**: Configuración del sistema de notificaciones
- **Funciones**:
  - Configura canales de notificación
  - Define plantillas de mensajes
  - Establece reglas de envío
  - Gestiona cola de notificaciones
- **Uso**: `sudo ./setup_notifications.sh`

### 6. setup_recovery.sh
- **Propósito**: Configuración del sistema de recuperación
- **Funciones**:
  - Define puntos de recuperación
  - Configura backups automáticos
  - Establece políticas de retención
  - Implementa scripts de restauración
- **Uso**: `sudo ./setup_recovery.sh`

### 7. test_maintenance.sh
- **Propósito**: Pruebas del sistema de mantenimiento
- **Funciones**:
  - Verifica cada script individual
  - Prueba integraciones entre scripts
  - Genera reportes de pruebas
  - Documenta resultados
- **Uso**: `sudo ./test_maintenance.sh`

## Jerarquía de Directorios

```
/app
├── scripts/          # Scripts de mantenimiento
├── config/          # Archivos de configuración
├── data/           # Datos de la aplicación
└── logs/           # Logs del sistema
    ├── maintenance/
    ├── monitoring/
    ├── notifications/
    └── recovery/
```

## Permisos Requeridos

- **Usuario**: root o sudo
- **Grupo**: maintenance
- **Permisos Base**:
  - Scripts: 750 (-rwxr-x---)
  - Configs: 640 (-rw-r-----)
  - Logs: 660 (-rw-rw----)

## Variables de Entorno

```bash
# Directorios base
MAINTENANCE_ROOT="/app"
LOG_ROOT="/logs"
BACKUP_ROOT="/backups"
CONFIG_ROOT="/app/config"

# Intervalos
CHECK_INTERVAL="5m"
MONITOR_INTERVAL="1m"
BACKUP_INTERVAL="1d"

# Notificaciones
NOTIFICATION_EMAIL="admin@mascletimperi.com"
TELEGRAM_CHAT_ID="-100xxxxxxxxxxxx"
```

## Tareas Programadas

```bash
# Verificación del sistema
*/5 * * * * root /app/scripts/check_system.sh

# Monitorización
* * * * * root /app/scripts/setup_monitoring.sh

# Backups
0 2 * * * root /app/scripts/setup_recovery.sh

# Limpieza de logs
0 0 * * * root find /logs -type f -mtime +30 -delete
```

## Logs y Reportes

- **Ubicación**: `/logs/{categoria}/{script}_{timestamp}.log`
- **Formato**: `[YYYY-MM-DD HH:mm:ss] [LEVEL] Message`
- **Retención**: 30 días por defecto
- **Reportes**: Generados en HTML en `/logs/reports/`

## Manejo de Errores

1. **Errores Críticos**:
   - Detienen la ejecución
   - Notifican inmediatamente
   - Requieren intervención manual

2. **Errores No Críticos**:
   - Registrados pero continúa ejecución
   - Notificación según configuración
   - Retry automático configurable

3. **Advertencias**:
   - Solo registro en logs
   - No afectan ejecución
   - Útiles para mantenimiento preventivo

## Seguridad

- Todos los scripts requieren privilegios root
- Logs protegidos con permisos restrictivos
- Backups encriptados cuando corresponde
- Auditoría de todas las operaciones

## Recomendaciones

1. **Antes de Ejecutar**:
   - Verificar permisos necesarios
   - Backup de configuraciones existentes
   - Revisar logs anteriores

2. **Durante Ejecución**:
   - Monitorizar logs en tiempo real
   - Verificar recursos del sistema
   - Atender notificaciones de error

3. **Después de Ejecutar**:
   - Revisar reportes generados
   - Verificar funcionamiento del sistema
   - Archivar logs importantes

## Soporte

Para problemas o consultas:
- Email: tech@mascletimperi.com
- Logs: `/logs/maintenance/`
- Docs: `/app/docs/maintenance/`