# Endpoints en Uso Real - Masclet Imperi Web

Informe generado automáticamente el 2025-06-11 03:53:34

> **NOTA IMPORTANTE:** Este informe solo incluye endpoints de los archivos importados en router.py, es decir, los que están actualmente en uso en la aplicación.

## Resumen

- **Total endpoints detectados: 83**
- Dashboard: 12 endpoints
- Animales: 24 endpoints
- Usuarios: 13 endpoints
- Importaciones: 5 endpoints
- Backups: 9 endpoints
- Listados: 7 endpoints
- Notificaciones: 6 endpoints
- Explotaciones (directos): 5 endpoints
- Otros: 2 endpoints

## Endpoints por Módulo

### Dashboard

`
GET /api/v1/dashboard/stats
GET /api/v1/dashboard/explotacions
GET /api/v1/dashboard/explotacions/{explotacio_value}
GET /api/v1/dashboard/explotacions/{explotacio_value}/stats
GET /api/v1/dashboard/partos
GET /api/v1/dashboard/resumen/
GET /api/v1/dashboard/combined
GET /api/v1/dashboard/resumen-card
GET /api/v1/dashboard/recientes
GET /api/v1/dashboard-detallado/animales-detallado
GET /api/v1/dashboard-periodo/periodo-dinamico
GET /api/v1/diagnostico/dashboard-debug
`

### Animales

`
POST /api/v1/animals
GET /api/v1/animals/{animal_id}
GET /api/v1/animals/{animal_id}/history
GET /api/v1/animals
PATCH /api/v1/animals/{animal_id}
PUT /api/v1/animals/{animal_id}
DELETE /api/v1/animals/{animal_id}
GET /api/v1/animals/{animal_id}/history
GET /api/v1/animals/{animal_id}/parts
POST /api/v1/animals/{animal_id}/partos
GET /api/v1/animals/{animal_id}/partos
PUT /api/v1/animals/{animal_id}/partos/{parto_id}
PATCH /api/v1/animals/{animal_id}/partos/{parto_id}
GET /api/v1/animals/{animal_id}/partos/{parto_id}/
GET /api/v1/animals/{animal_id}/partos/list
DELETE /api/v1/animals/{animal_id}/partos/{parto_id}
POST /api/v1/partos
GET /api/v1/partos/{parto_id}
PATCH /api/v1/partos/{parto_id}
GET /api/v1/partos
DELETE /api/v1/partos/{parto_id}
GET /api/v1/diagnostico/partos-debug
POST /api/v1/listados/{listado_id}/animals
DELETE /api/v1/listados/{listado_id}/animals/{animal_id}
`

### Usuarios

`
POST /api/v1/auth/login
POST /api/v1/auth/signup
GET /api/v1/auth/me
POST /api/v1/auth/refresh
GET /api/v1/auth/users
DELETE /api/v1/auth/users/{user_id}
PATCH /api/v1/auth/users/{user_id}/password
GET /api/v1/users/me
GET /api/v1/users
GET /api/v1/users/{user_id}
POST /api/v1/users
PUT /api/v1/users/{user_id}
DELETE /api/v1/users/{user_id}
`

### Importaciones

`
GET /api/v1/imports
POST /api/v1/imports/csv
GET /api/v1/imports/template
GET /api/v1/imports/{import_id}
GET /api/v1/imports/{import_id}/errors
`

### Backups

`
GET /api/v1/backup/list
POST /api/v1/backup/create
POST /api/v1/backup/restore/{filename}
DELETE /api/v1/backup/delete/{filename}
GET /api/v1/backup/download/{filename}
GET /api/v1/scheduled-backup/history
POST /api/v1/scheduled-backup/trigger/daily
POST /api/v1/scheduled-backup/configure
POST /api/v1/scheduled-backup/cleanup
`

### Listados

`
POST /api/v1/listados
GET /api/v1/listados
GET /api/v1/listados/{listado_id}
PUT /api/v1/listados/{listado_id}
DELETE /api/v1/listados/{listado_id}
PUT /api/v1/listados/{listado_id}/animales
GET /api/v1/listados/{listado_id}/export-pdf
`

### Notificaciones

`
GET /api/v1/notifications
POST /api/v1/notifications/mark-read/{notification_id}
POST /api/v1/notifications/mark-all-read
DELETE /api/v1/notifications/{notification_id}
DELETE /api/v1/notifications
POST /api/v1/notifications/test
`

### Explotaciones (Directos)

`
POST /api/v1/explotacions
GET /api/v1/explotacions
GET /api/v1/explotacions/{explotacio}
PUT /api/v1/explotacions/{explotacio}
DELETE /api/v1/explotacions/{explotacio}
`

### Otros

`
GET /api/v1/health
GET /api/v1/health/detailed
`

## Archivos de Endpoints Analizados

Los siguientes archivos fueron analizados porque están importados en router.py:

`
animals.py
partos.py
partos_standalone.py
dashboard.py
dashboard_detallado.py
dashboard_periodo.py
imports.py
auth.py
users.py
diagnostico.py
explotacions.py
health.py
backup.py
scheduled_backup.py
listados.py
notifications.py
admin.py
`

## Nota Técnica

Este informe fue generado mediante análisis estático del código, considerando únicamente los archivos importados en el router principal de la aplicación. No se ejecutó ningún código ni se modificó la base de datos.

El análisis incluye endpoints definidos en los archivos y considera también los prefijos asignados en router.py.
