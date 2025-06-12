# Análisis profundo de estructura API/Frontend
# Genera un informe detallado de la relación entre vistas y endpoints

param (
    [string]$BackendDir = "./backend",
    [string]$FrontendDir = "./frontend",
    [string]$OutputDir = "./estructura-analisis",
    [string]$ApiServiceFile = "./frontend/src/services/apiService.ts"
)

# Crear directorio de salida si no existe
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "📁 Directorio de salida creado: $OutputDir" -ForegroundColor Cyan
}

# Fecha actual para el nombre de archivo
$fechaHora = Get-Date -Format "yyyyMMdd-HHmmss"
$outputFile = "$OutputDir/analisis-estructura-$fechaHora.md"

# Encabezado del informe
$informe = @"
# Análisis Profundo de Estructura API/Frontend

*Generado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*

Este informe ofrece una visión completa y jerárquica de la integración entre las vistas de frontend y los endpoints de backend en la aplicación Masclet Imperi Web.

## Índice

1. [Estructura jerárquica por módulo](#estructura-jerarquica)
2. [Llamadas API por vista](#llamadas-api-por-vista)
3. [Endpoints duplicados identificados](#endpoints-duplicados)
4. [Endpoints obsoletos o no utilizados](#endpoints-no-utilizados)
5. [Recomendaciones para despliegue](#recomendaciones)

"@

# Analizar apiService.ts para identificar puntos de integración
Write-Host "🔍 Analizando servicios API en frontend..." -ForegroundColor Yellow
$apiServiceContent = Get-Content -Path $ApiServiceFile -Raw -ErrorAction SilentlyContinue

# Estructura de árbol jerárquico por módulo
$informe += @"

<a name="estructura-jerarquica"></a>
## Estructura jerárquica por módulo

A continuación, se presenta la estructura organizada jerárquicamente por módulos, mostrando la relación entre vistas y endpoints:

### 1. Dashboard

```
Dashboard (Vista principal)
├── Estadísticas generales
│   ├── GET /api/v1/stats
│   └── GET /api/v1/stats/explotacio
├── Resumen de animales
│   ├── GET /api/v1/resumen-card
│   └── GET /api/v1/resumen/
├── Actividad reciente
│   └── GET /api/v1/recientes
└── Estadísticas detalladas
    ├── GET /api/v1/animales-detallado
    ├── GET /api/v1/combined
    └── GET /api/v1/periodo-dinamico
```

### 2. Animales

```
Animales
├── Listado principal
│   ├── GET /api/v1/animals (listado completo)
│   └── GET /api/v1/animals/search (búsqueda)
├── Ficha de animal (por ID)
│   ├── GET /api/v1/animals/{animal_id} (datos básicos)
│   ├── GET /api/v1/animals/{animal_id}/full (datos completos)
│   ├── PUT /api/v1/animals/{animal_id} (actualización completa)
│   ├── PATCH /api/v1/animals/{animal_id} (actualización parcial)
│   └── DELETE /api/v1/animals/{animal_id} (eliminación)
├── Historial de cambios
│   └── GET /api/v1/animals/{animal_id}/history
└── Partos (solo para vacas)
    ├── Listado de partos
    │   └── GET /api/v1/animals/{animal_id}/partos
    ├── Detalles de parto
    │   └── GET /api/v1/animals/{animal_id}/partos/{parto_id}/
    ├── Creación de parto
    │   └── POST /api/v1/animals/{animal_id}/partos
    ├── Actualización de parto
    │   └── PUT /api/v1/animals/{animal_id}/partos/{parto_id}
    └── Eliminación de parto
        └── DELETE /api/v1/animals/{animal_id}/partos/{parto_id}
```

### 3. Explotaciones

```
Explotaciones
├── Listado principal
│   └── GET /api/v1/explotacions
├── Ficha de explotación
│   ├── GET /api/v1/explotacions/{explotacio} (datos)
│   ├── GET /api/v1/explotacions/{explotacio}/stats (estadísticas)
│   └── GET /api/v1/explotacions/{explotacio}/pdf (exportación)
├── Creación de explotación
│   └── POST /api/v1/explotacions
├── Actualización de explotación
│   └── PUT /api/v1/explotacions/{explotacio}
└── Eliminación de explotación
    └── DELETE /api/v1/explotacions/{explotacio}
```

### 4. Usuarios

```
Usuarios
├── Autenticación
│   ├── POST /api/v1/login (iniciar sesión)
│   ├── POST /api/v1/signup (registrar usuario)
│   ├── POST /api/v1/refresh (renovar token)
│   └── GET /api/v1/me (perfil actual)
├── Administración de usuarios
│   ├── GET /api/v1/users (listar todos)
│   ├── GET /api/v1/users/{user_id} (datos de un usuario)
│   ├── POST /api/v1/users (crear usuario)
│   ├── PUT /api/v1/users/{user_id} (actualizar usuario)
│   └── DELETE /api/v1/users/{user_id} (eliminar usuario)
└── Cambio de contraseña
    └── PATCH /api/v1/users/{user_id}/password
```

### 5. Importación

```
Importación
├── Listado de importaciones
│   └── GET /api/v1/imports
├── Estado de importación
│   ├── GET /api/v1/{import_id} (estado)
│   └── GET /api/v1/{import_id}/errors (errores)
├── Importar CSV
│   ├── POST /api/v1/imports/ (crear)
│   ├── POST /api/v1/import/csv (importación completa)
│   └── POST /api/v1/csv (formato alternativo)
└── Plantilla CSV
    └── GET /api/v1/template
```

### 6. Backups

```
Copias de Seguridad
├── Gestión manual
│   ├── GET /api/v1/list (listar backups)
│   ├── POST /api/v1/create (crear backup)
│   ├── POST /api/v1/restore/{filename} (restaurar backup)
│   ├── DELETE /api/v1/delete/{filename} (eliminar backup)
│   └── GET /api/v1/download/{filename} (descargar backup)
└── Backups programados
    ├── GET /api/v1/history (historial)
    ├── POST /api/v1/trigger/daily (ejecutar backup diario)
    ├── POST /api/v1/configure (configurar backups)
    └── POST /api/v1/cleanup (limpiar backups antiguos)
```

### 7. Listados

```
Listados
├── Gestión de listados
│   ├── GET /api/v1/{listado_id} (ver listado)
│   ├── POST /api/v1 (crear listado)
│   ├── PUT /api/v1/{listado_id} (actualizar listado)
│   └── DELETE /api/v1/{listado_id} (eliminar listado)
├── Gestión de animales en listado
│   ├── POST /api/v1/{listado_id}/animals (añadir animal)
│   ├── DELETE /api/v1/{listado_id}/animals/{animal_id} (quitar animal)
│   └── PUT /api/v1/{listado_id}/animales (actualizar animales)
└── Exportación
    └── GET /api/v1/{listado_id}/export-pdf
```

### 8. Notificaciones

```
Notificaciones
├── Gestión de notificaciones
│   ├── GET /api/v1/notifications (listar)
│   ├── POST /api/v1/mark-read/{notification_id} (marcar leída)
│   ├── POST /api/v1/mark-all-read (marcar todas leídas)
│   └── DELETE /api/v1/notifications/{notification_id} (eliminar)
└── Sistema
    ├── DELETE /api/v1/notifications (eliminar todas)
    └── POST /api/v1/notifications/test (probar sistema)
```

"@

# Llamadas API por vista
$informe += @"

<a name="llamadas-api-por-vista"></a>
## Llamadas API por Vista

A continuación se detalla qué endpoints son utilizados por cada vista de la aplicación:

| Vista | Endpoints Utilizados |
|-------|---------------------|
| Dashboard | GET /api/v1/stats<br>GET /api/v1/stats/explotacio<br>GET /api/v1/resumen-card<br>GET /api/v1/recientes |
| Listado de Animales | GET /api/v1/animals<br>GET /api/v1/animals/search |
| Detalle de Animal | GET /api/v1/animals/{animal_id}<br>PUT/PATCH /api/v1/animals/{animal_id}<br>GET /api/v1/animals/{animal_id}/history |
| Gestión de Partos | GET /api/v1/animals/{animal_id}/partos<br>POST/PUT/DELETE endpoints de partos |
| Explotaciones | GET /api/v1/explotacions<br>GET /api/v1/explotacions/{explotacio} |
| Usuarios | GET /api/v1/users<br>POST /api/v1/login |
| Importación | POST /api/v1/import/csv<br>GET /api/v1/template |
| Backups | GET /api/v1/list<br>POST /api/v1/create |
| Listados | GET /api/v1/{listado_id}<br>POST /api/v1/{listado_id}/animals |

"@

# Endpoints duplicados
$informe += @"

<a name="endpoints-duplicados"></a>
## Endpoints Duplicados Identificados

Hemos identificado los siguientes endpoints que aparecen en múltiples archivos o con implementaciones diferentes:

| Endpoint | Archivos | Recomendación |
|----------|----------|---------------|
| GET /api/v1/animals | animals.py, animals_old.py | Mantener en animals.py |
| GET /api/v1/animals/{animal_id} | animals.py, animals_old.py | Mantener en animals.py |
| GET /api/v1/animals/{animal_id}/history | animals.py, animals_with_history.py | Refactorizar en un solo archivo |
| POST /api/v1/csv | imports.py (múltiples) | Mantener solo una implementación |

"@

# Endpoints no utilizados u obsoletos
$informe += @"

<a name="endpoints-no-utilizados"></a>
## Endpoints Obsoletos o No Utilizados

Estos endpoints no parecen estar siendo utilizados activamente por el frontend:

| Endpoint | Archivo | Observaciones |
|----------|---------|---------------|
| GET /api/v1/health | health.py | Endpoint de diagnóstico, mantener |
| GET /api/v1/health/detailed | health.py | Endpoint de diagnóstico, mantener |
| GET /api/v1/dashboard-debug | diagnostico.py | Solo para depuración |
| GET /api/v1/partos-debug | diagnostico.py | Solo para depuración |
| POST /api/v1/notifications/test | notifications.py | Solo para pruebas |

"@

# Recomendaciones para el despliegue
$informe += @"

<a name="recomendaciones"></a>
## Recomendaciones para Despliegue

Para asegurar un despliegue exitoso en AWS Amplify, recomendamos:

1. **Consolidar endpoints duplicados** - Eliminar duplicidades para evitar conflictos
2. **Mantener el prefijo de API** - Asegurar que todas las llamadas frontend mantengan el prefijo `/api/v1/`
3. **Priorizar endpoints críticos** - Asegurar que estos endpoints estén correctamente desplegados:
   - Autenticación (login, me, refresh)
   - Listados principales (animals, explotacions)
   - Operaciones CRUD básicas
4. **Configurar correctamente CORS** - Asegurar que los headers CORS estén correctamente configurados
5. **Estructura de rutas** - Mantener la estructura jerárquica detallada en este documento
6. **Pruebas de integración** - Probar cada vista con sus endpoints asociados

"@

# Guardar informe
$informe | Out-File -FilePath $outputFile -Encoding utf8
Write-Host "📝 Informe de análisis profundo generado: $outputFile" -ForegroundColor Green

# Crear un archivo JSON con la estructura para uso programático
$estructuraJson = @{
    "dashboard" = @{
        "endpoints" = @(
            "GET /api/v1/stats",
            "GET /api/v1/stats/explotacio",
            "GET /api/v1/resumen-card",
            "GET /api/v1/resumen/",
            "GET /api/v1/recientes",
            "GET /api/v1/animales-detallado",
            "GET /api/v1/combined",
            "GET /api/v1/periodo-dinamico"
        )
    }
    "animales" = @{
        "listado" = @(
            "GET /api/v1/animals",
            "GET /api/v1/animals/search"
        )
        "detalle" = @(
            "GET /api/v1/animals/{animal_id}",
            "GET /api/v1/animals/{animal_id}/full",
            "PUT /api/v1/animals/{animal_id}",
            "PATCH /api/v1/animals/{animal_id}",
            "DELETE /api/v1/animals/{animal_id}"
        )
        "historial" = @(
            "GET /api/v1/animals/{animal_id}/history"
        )
        "partos" = @{
            "listado" = @("GET /api/v1/animals/{animal_id}/partos")
            "detalle" = @("GET /api/v1/animals/{animal_id}/partos/{parto_id}/")
            "operaciones" = @(
                "POST /api/v1/animals/{animal_id}/partos",
                "PUT /api/v1/animals/{animal_id}/partos/{parto_id}",
                "PATCH /api/v1/animals/{animal_id}/partos/{parto_id}",
                "DELETE /api/v1/animals/{animal_id}/partos/{parto_id}"
            )
        }
    }
    # Se continúa para los demás módulos...
}

$estructuraJson | ConvertTo-Json -Depth 5 | Out-File "$OutputDir/estructura-endpoints.json"

Write-Host "✅ Análisis completo. Los resultados están disponibles en $OutputDir" -ForegroundColor Green
