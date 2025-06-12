# Endpoints Detectados en Masclet Imperi Web

Informe generado automáticamente el 2025-06-11 04:30:10

## Resumen

- Dashboard: 1 endpoints
- Animales: 35 endpoints
- Usuarios: 4 endpoints
- Importaciones: 4 endpoints
- Backups: 29 endpoints
- Listados: 9 endpoints
- Notificaciones: 2 endpoints
- Explotaciones (directos): 6 endpoints
- Otros: 69 endpoints

## Endpoints por Módulo

### Dashboard

`
GET /api/v1/dashboard-debug
`

### Animales

`
POST /api/v1/animals
GET /api/v1/animals
GET /api/v1/animals/{animal_id}
GET /api/v1/animals/{animal_id}
PUT /api/v1/animals/{animal_id}
DELETE /api/v1/animals/{animal_id}
GET /api/v1/animals/{animal_id}/history
GET /api/v1/animals/search
GET /api/v1/animals/{animal_id}/full
GET /api/v1/animals/{nom}
GET /api/v1/animals/{id}
GET /api/v1/animals/by-name/{nom}
GET /api/v1/animals
POST /api/v1/animals
GET /api/v1/animals/{animal_id}
GET /api/v1/animals/{animal_id}/history
GET /api/v1/animals
PATCH /api/v1/animals/{animal_id}
PUT /api/v1/animals/{animal_id}
DELETE /api/v1/animals/{animal_id}
GET /api/v1/animals/{animal_id}/history
GET /api/v1/animals/{animal_id}/parts
GET /api/v1/partos
GET /api/v1/partos-debug
POST /api/v1/{listado_id}/animals
DELETE /api/v1/{listado_id}/animals/{animal_id}
POST /api/v1/{listado_id}/animals
DELETE /api/v1/{listado_id}/animals/{animal_id}
POST /api/v1/animals/{animal_id}/partos
GET /api/v1/animals/{animal_id}/partos
PUT /api/v1/animals/{animal_id}/partos/{parto_id}
PATCH /api/v1/animals/{animal_id}/partos/{parto_id}
GET /api/v1/animals/{animal_id}/partos/{parto_id}/
GET /api/v1/animals/{animal_id}/partos/list
DELETE /api/v1/animals/{animal_id}/partos/{parto_id}
`

### Usuarios

`
POST /api/v1/login
GET /api/v1/users
DELETE /api/v1/users/{user_id}
PATCH /api/v1/users/{user_id}/password
`

### Importaciones

`
POST /api/v1/imports/
POST /api/v1/import/csv
GET /api/v1/{import_id}
GET /api/v1/{import_id}/errors
`

### Backups

`
GET /api/v1/list
POST /api/v1/create
POST /api/v1/restore/{filename}
DELETE /api/v1/delete/{filename}
GET /api/v1/download/{filename}
GET /api/v1/list
POST /api/v1/create
POST /api/v1/restore/{filename}
DELETE /api/v1/delete/{filename}
GET /api/v1/download/{filename}
GET /api/v1/list
POST /api/v1/create
POST /api/v1/restore/{filename}
DELETE /api/v1/delete/{filename}
GET /api/v1/download/{filename}
GET /api/v1/list
POST /api/v1/create
POST /api/v1/restore/{filename}
DELETE /api/v1/delete/{filename}
GET /api/v1/download/{filename}
GET /api/v1/list
POST /api/v1/create
POST /api/v1/restore/{filename}
DELETE /api/v1/delete/{filename}
GET /api/v1/download/{filename}
GET /api/v1/history
POST /api/v1/trigger/daily
POST /api/v1/configure
POST /api/v1/cleanup
`

### Listados

`
GET /api/v1/{listado_id}
PUT /api/v1/{listado_id}
DELETE /api/v1/{listado_id}
GET /api/v1/{listado_id}/export-pdf
GET /api/v1/{listado_id}
PUT /api/v1/{listado_id}
DELETE /api/v1/{listado_id}
PUT /api/v1/{listado_id}/animales
GET /api/v1/{listado_id}/export-pdf
`

### Notificaciones

`
POST /api/v1/mark-read/{notification_id}
DELETE /api/v1/{notification_id}
`

### Explotaciones (Directos)

`
GET /api/v1/explotacions/{explotacio}
GET /api/v1/explotacions/{explotacio}/pdf
GET /api/v1/explotacions/{explotacio}
GET /api/v1/explotacions
GET /api/v1/explotacions/{explotacio_value}
GET /api/v1/explotacions/{explotacio_value}/stats
`

### Otros

`
GET /api/v1/stats/explotacio
GET /api/v1
POST /api/v1
GET /api/v1/explotacio
GET /api/v1/{animal_id}
GET /api/v1/search/
GET /api/v1/{animal_id}/parts
GET /api/v1/search
GET /api/v1/search
POST /api/v1/preview
POST /api/v1/csv
GET /api/v1
PATCH /api/v1/{animal_id}
POST /api/v1
GET /api/v1/{animal_id}
GET /api/v1
PATCH /api/v1/{animal_id}
PUT /api/v1/{animal_id}
DELETE /api/v1/{animal_id}
GET /api/v1/{animal_id}/history
GET /api/v1/{animal_id}/parts
POST /api/v1
GET /api/v1/{animal_id}
GET /api/v1/{animal_id}/history
GET /api/v1
PATCH /api/v1/{animal_id}
PUT /api/v1/{animal_id}
DELETE /api/v1/{animal_id}
GET /api/v1/{animal_id}/history
GET /api/v1/{animal_id}/parts
POST /api/v1/signup
GET /api/v1/me
POST /api/v1/refresh
GET /api/v1/animales-detallado
GET /api/v1/periodo-dinamico
GET /api/v1/stats
GET /api/v1/resumen/
GET /api/v1/combined
GET /api/v1/resumen-card
GET /api/v1/recientes
POST /api/v1
GET /api/v1
GET /api/v1/{explotacio}
PUT /api/v1/{explotacio}
DELETE /api/v1/{explotacio}
GET /api/v1/health
GET /api/v1/health/detailed
GET /api/v1
POST /api/v1/csv
GET /api/v1/template
POST /api/v1
GET /api/v1
POST /api/v1
GET /api/v1
GET /api/v1
POST /api/v1/mark-all-read
DELETE /api/v1
POST /api/v1/test
POST /api/v1
GET /api/v1/{parto_id}
PATCH /api/v1/{parto_id}
GET /api/v1
DELETE /api/v1/{parto_id}
GET /api/v1/me
GET /api/v1
GET /api/v1/{user_id}
POST /api/v1
PUT /api/v1/{user_id}
DELETE /api/v1/{user_id}
`

## Nota Importante

Este informe fue generado mediante análisis estático del código. No se ejecutó ningún código ni se modificó la base de datos.
