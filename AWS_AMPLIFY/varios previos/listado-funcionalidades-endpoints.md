# Listado Detallado de Funcionalidades y Endpoints por Sección

*Generado: 11/06/2025*

Este documento proporciona un mapeo completo entre cada sección de la interfaz de usuario, las funcionalidades disponibles y los endpoints de backend que las implementan, permitiendo una visión integral del sistema.

## Índice

- [Dashboard](#dashboard)
- [Explotaciones](#explotaciones)
- [Animales](#animales)
- [Usuarios](#usuarios)
- [Importación](#importacion)
- [Copias de Seguridad](#copias-de-seguridad)
- [Listados](#listados)

## Dashboard

| Funcionalidad            | Descripción                                               | Endpoint(s)                      |
| ------------------------ | ---------------------------------------------------------- | -------------------------------- |
| Resumen General          | Muestra estadísticas generales de todas las explotaciones | `GET /api/v1/stats`            |
| Resumen por Explotación | Estadísticas específicas de cada explotación            | `GET /api/v1/stats/explotacio` |
| Tarjetas Resumen         | Muestra conteo rápido de animales por tipo                | `GET /api/v1/resumen-card`     |
| Actividad Reciente       | Lista las últimas actividades realizadas                  | `GET /api/v1/recientes`        |
| Gráficos Temporales     | Muestra evolución de métricas en el tiempo               | `GET /api/v1/periodo-dinamico` |
| Datos Combinados         | Proporciona vista unificada de múltiples fuentes          | `GET /api/v1/combined`         |

## Explotaciones (esta no esta bien... estos

| Funcionalidad                 | Descripción                                       | Endpoint(s)                                     |
| ----------------------------- | -------------------------------------------------- | ----------------------------------------------- |
| Listado de Explotaciones      | Muestra todas las explotaciones disponibles        | `GET /api/v1/explotacions`                    |
| Búsqueda de Explotaciones    | Filtro por código de explotación                 | `GET /api/v1/explotacions?search={texto}`     |
| Ver Detalles de Explotación  | Muestra información detallada de una explotación | `GET /api/v1/explotacions/{explotacio}`       |
| Estadísticas de Explotación | Métricas específicas de la explotación          | `GET /api/v1/explotacions/{explotacio}/stats` |
| Crear Explotación            | Añade una nueva explotación al sistema           | `POST /api/v1/explotacions`                   |
| Actualizar Explotación       | Modifica los datos de una explotación existente   | `PUT /api/v1/explotacions/{explotacio}`       |
| Eliminar Explotación         | Elimina una explotación del sistema               | `DELETE /api/v1/explotacions/{explotacio}`    |
| Exportar a PDF                | Genera un informe PDF de la explotación           | `GET /api/v1/explotacions/{explotacio}/pdf`   |

## Animales

### Listado Principal

| Funcionalidad          | Descripción                           | Endpoint(s)                                  |
| ---------------------- | -------------------------------------- | -------------------------------------------- |
| Ver Todos los Animales | Muestra lista completa de animales     | `GET /api/v1/animals`                      |
| Búsqueda de Animales  | Filtra animales por diversos criterios | `GET /api/v1/animals/search?param={valor}` |
| Crear Nuevo Animal     | Añade un nuevo animal al sistema      | `POST /api/v1/animals`                     |

### Ficha de Animal

| Funcionalidad              | Descripción                          | Endpoint(s)                                 |
| -------------------------- | ------------------------------------- | ------------------------------------------- |
| Ver Información Básica   | Muestra datos principales del animal  | `GET /api/v1/animals/{animal_id}`         |
| Ver Información Completa  | Todos los datos incluyendo relaciones | `GET /api/v1/animals/{animal_id}/full`    |
| Actualizar Animal Completo | Actualiza todos los campos del animal | `PUT /api/v1/animals/{animal_id}`         |
| Actualizar Datos Parciales | Modifica solo campos específicos     | `PATCH /api/v1/animals/{animal_id}`       |
| Eliminar Animal            | Elimina el animal del sistema         | `DELETE /api/v1/animals/{animal_id}`      |
| Ver Historial de Cambios   | Muestra cambios realizados al animal  | `GET /api/v1/animals/{animal_id}/history` |

### Gestión de Partos (Solo para Vacas)

| Funcionalidad             | Descripción                                  | Endpoint(s)                                              |
| ------------------------- | --------------------------------------------- | -------------------------------------------------------- |
| Listar Partos             | Muestra todos los partos de una vaca          | `GET /api/v1/animals/{animal_id}/partos`               |
| Ver Detalle de Parto      | Información completa de un parto específico | `GET /api/v1/animals/{animal_id}/partos/{parto_id}`    |
| Registrar Nuevo Parto     | Añade un parto para una vaca                 | `POST /api/v1/animals/{animal_id}/partos`              |
| Actualizar Datos de Parto | Modifica información de un parto existente   | `PUT /api/v1/animals/{animal_id}/partos/{parto_id}`    |
| Actualización Parcial    | Modifica campos específicos de un parto      | `PATCH /api/v1/animals/{animal_id}/partos/{parto_id}`  |
| Eliminar Parto            | Elimina un registro de parto                  | `DELETE /api/v1/animals/{animal_id}/partos/{parto_id}` |

## Usuarios

### Autenticación y Perfil

| Funcionalidad       | Descripción                             | Endpoint(s)                   |
| ------------------- | ---------------------------------------- | ----------------------------- |
| Iniciar Sesión     | Autentica usuario en el sistema          | `POST /api/v1/login`        |
| Registrar Usuario   | Crea nueva cuenta de usuario             | `POST /api/v1/signup`       |
| Renovar Token       | Refresca el token de autenticación      | `POST /api/v1/refresh`      |
| Ver Perfil Propio   | Muestra información del usuario actual  | `GET /api/v1/me`            |
| Actualizar Perfil   | Modifica datos del usuario actual        | `PUT /api/v1/me`            |
| Cambiar Contraseña | Actualiza contraseña del usuario actual | `PATCH /api/v1/me/password` |

### Administración de Usuarios

| Funcionalidad          | Descripción                                    | Endpoint(s)                                |
| ---------------------- | ----------------------------------------------- | ------------------------------------------ |
| Listar Usuarios        | Muestra todos los usuarios del sistema          | `GET /api/v1/users`                      |
| Ver Detalle de Usuario | Información completa de un usuario específico | `GET /api/v1/users/{user_id}`            |
| Crear Usuario          | Añade nuevo usuario por un administrador       | `POST /api/v1/users`                     |
| Actualizar Usuario     | Modifica datos de un usuario existente          | `PUT /api/v1/users/{user_id}`            |
| Eliminar Usuario       | Elimina un usuario del sistema                  | `DELETE /api/v1/users/{user_id}`         |
| Cambiar Contraseña    | Cambia contraseña de cualquier usuario         | `PATCH /api/v1/users/{user_id}/password` |
| Asignar Rol            | Modifica permisos de un usuario                 | `PUT /api/v1/users/{user_id}/role`       |

## Importación

### Gestión de Archivos CSV

| Funcionalidad              | Descripción                            | Endpoint(s)                                |
| -------------------------- | --------------------------------------- | ------------------------------------------ |
| Listar Importaciones       | Muestra historial de importaciones      | `GET /api/v1/imports`                    |
| Ver Estado de Importación | Detalle del proceso de una importación | `GET /api/v1/imports/{import_id}`        |
| Ver Errores                | Muestra errores durante la importación | `GET /api/v1/imports/{import_id}/errors` |
| Crear Importación         | Inicia proceso de importación          | `POST /api/v1/imports`                   |
| Subir Archivo CSV          | Carga y procesa datos desde CSV         | `POST /api/v1/import/csv`                |
| Descargar Plantilla        | Obtiene plantilla para importación     | `GET /api/v1/template`                   |

## Copias de Seguridad

### Gestión Manual

| Funcionalidad       | Descripción                           | Endpoint(s)                                  |
| ------------------- | -------------------------------------- | -------------------------------------------- |
| Listar Backups      | Muestra todos los backups disponibles  | `GET /api/v1/backups/list`                 |
| Crear Backup Manual | Genera una nueva copia de seguridad    | `POST /api/v1/backups/create`              |
| Restaurar Backup    | Restaura el sistema desde un backup    | `POST /api/v1/backups/restore/{filename}`  |
| Eliminar Backup     | Borra una copia de seguridad           | `DELETE /api/v1/backups/delete/{filename}` |
| Descargar Backup    | Descarga archivo de copia de seguridad | `GET /api/v1/backups/download/{filename}`  |

### Backups Programados

| Funcionalidad            | Descripción                             | Endpoint(s)                                      |
| ------------------------ | ---------------------------------------- | ------------------------------------------------ |
| Ver Historial            | Muestra registro de backups automáticos | `GET /api/v1/scheduled_backups/history`        |
| Ejecutar Backup Diario   | Fuerza ejecución del backup diario      | `POST /api/v1/scheduled_backups/trigger/daily` |
| Configurar Programación | Ajusta frecuencia y parámetros          | `POST /api/v1/scheduled_backups/configure`     |
| Limpiar Backups Antiguos | Elimina copias antiguas según política | `POST /api/v1/scheduled_backups/cleanup`       |

## Listados

### Gestión de Listados

| Funcionalidad          | Descripción                           | Endpoint(s)                              |
| ---------------------- | -------------------------------------- | ---------------------------------------- |
| Ver Listados           | Muestra todos los listados disponibles | `GET /api/v1/listados`                 |
| Ver Detalle de Listado | Información completa de un listado    | `GET /api/v1/listados/{listado_id}`    |
| Crear Listado          | Añade nuevo listado personalizado     | `POST /api/v1/listados`                |
| Actualizar Listado     | Modifica parámetros de un listado     | `PUT /api/v1/listados/{listado_id}`    |
| Eliminar Listado       | Borra un listado del sistema           | `DELETE /api/v1/listados/{listado_id}` |

### Gestión de Animales en Listado

| Funcionalidad       | Descripción                               | Endpoint(s)                                                  |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| Añadir Animal      | Agrega un animal a un listado              | `POST /api/v1/listados/{listado_id}/animals`               |
| Quitar Animal       | Elimina un animal de un listado            | `DELETE /api/v1/listados/{listado_id}/animals/{animal_id}` |
| Actualizar Animales | Modifica múltiples animales de un listado | `PUT /api/v1/listados/{listado_id}/animales`               |

### Exportación

| Funcionalidad    | Descripción                     | Endpoint(s)                                        |
| ---------------- | -------------------------------- | -------------------------------------------------- |
| Exportar a PDF   | Genera informe PDF del listado   | `GET /api/v1/listados/{listado_id}/export-pdf`   |
| Exportar a Excel | Exporta listado en formato Excel | `GET /api/v1/listados/{listado_id}/export-excel` |
| Exportar a CSV   | Exporta listado en formato CSV   | `GET /api/v1/listados/{listado_id}/export-csv`   |
