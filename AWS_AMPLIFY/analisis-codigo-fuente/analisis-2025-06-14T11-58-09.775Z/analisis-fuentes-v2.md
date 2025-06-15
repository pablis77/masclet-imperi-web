# Informe de Análisis de Estructura del Código Fuente (v2)

Fecha: 14/6/2025, 11:58:09

## Resumen

- **Total de archivos analizados**: 2501
- **Total de directorios analizados**: 229
- **Frontend**: 2277 archivos en 193 directorios
- **Backend**: 224 archivos en 36 directorios
- **Secciones identificadas**: 13

## Índice de Secciones

- [Panel de Control / Dashboard](#dashboard)
- [Animales](#animales)
- [Explotaciones](#explotaciones)
- [Listados](#listados)
- [Importaciones](#importaciones)
- [Copias de Seguridad](#copias-seguridad)
- [Login](#login)
- [Notificaciones](#notificaciones)
- [Usuarios](#usuarios)
- [Backend API](#backend-api)
- [Backend Database](#backend-database)
- [Compartidos](#compartidos)
- [Desconocido](#desconocido)

## Panel de Control / Dashboard {#dashboard}

**Resumen de la sección:**

- **Archivos**: 2131
- **Directorios**: 172

### Estructura de directorios principales

```
frontend/
├── components/
│   ├── dashboard/
│   ├── charts/
│   └── widgets/
├── pages/
│   └── index.astro
├── scripts/
│   └── dashboard-data.js
└── styles/
    └── dashboard.css
```

### Archivos clave

- `frontend/pages/index.astro` - Página principal del dashboard
- `frontend/components/dashboard/StatsCard.jsx` - Componente para tarjetas de estadísticas
- `frontend/components/charts/LineChart.jsx` - Gráficos de líneas para tendencias
- `frontend/scripts/dashboard-data.js` - Lógica de obtención de datos para el dashboard

## Animales {#animales}

**Resumen de la sección:**

- **Archivos**: 50
- **Directorios**: 7

### Estructura de directorios principales

```
frontend/
├── pages/
│   └── animals/
│       ├── index.astro
│       ├── create.astro
│       ├── update/
│       │   └── [id].astro
│       └── delete.js
├── components/
│   └── animals/
└── scripts/
    └── animal-data.js
```

### Archivos clave

- `frontend/pages/animals/index.astro` - Listado principal de animales
- `frontend/pages/animals/create.astro` - Formulario de creación de animales
- `frontend/pages/animals/update/[id].astro` - Página de edición de animal por ID
- `frontend/scripts/animal-data.js` - Funciones de manipulación de datos de animales

## Explotaciones {#explotaciones}

**Resumen de la sección:**

- **Archivos**: 8
- **Directorios**: 2

### Estructura de directorios principales

```
frontend/
├── pages/
│   └── explotaciones-react/
│       ├── index.jsx
│       ├── create.jsx
│       └── [id].jsx
└── components/
    └── explotaciones/
```

### Archivos clave

- `frontend/pages/explotaciones-react/index.jsx` - Listado de explotaciones
- `frontend/pages/explotaciones-react/create.jsx` - Formulario de creación
- `frontend/pages/explotaciones-react/[id].jsx` - Vista detalle de explotación

## Listados {#listados}

**Resumen de la sección:**

- **Archivos**: 10
- **Directorios**: 2

### Estructura de directorios principales

```
frontend/
├── pages/
│   └── listings/
└── components/
    └── listings/
```

### Archivos clave

- `frontend/pages/listings/index.astro` - Página principal de listados
- `frontend/components/listings/DataTable.jsx` - Componente de tabla de datos

## Importaciones {#importaciones}

**Resumen de la sección:**

- **Archivos**: 12
- **Directorios**: 2

### Estructura de directorios principales

```
frontend/
├── pages/
│   └── imports/
└── components/
    └── imports/
```

### Archivos clave

- `frontend/pages/imports/index.astro` - Interfaz de importación
- `frontend/pages/imports/status.astro` - Estado de importaciones

## Copias de Seguridad {#copias-seguridad}

**Resumen de la sección:**

- **Archivos**: 27
- **Directorios**: 4

### Estructura de directorios principales

```
frontend/
├── pages/
│   └── backup/
├── components/
│   └── backup/
└── scripts/
    └── backup-utils.js
```

### Archivos clave

- `frontend/pages/backup/index.astro` - Interfaz de copias de seguridad
- `frontend/scripts/backup-utils.js` - Utilidades para gestión de backups

## Login {#login}

**Resumen de la sección:**

- **Archivos**: 12
- **Directorios**: 0

### Estructura de directorios principales

```
frontend/
├── pages/
│   └── login.astro
└── scripts/
    └── auth.js
```

### Archivos clave

- `frontend/pages/login.astro` - Página de inicio de sesión
- `frontend/scripts/auth.js` - Funciones de autenticación

## Notificaciones {#notificaciones}

**Resumen de la sección:**

- **Archivos**: 3
- **Directorios**: 1

### Estructura de directorios principales

```
frontend/
├── components/
│   └── notifications/
│       └── NotificationsMenu.js
└── scripts/
    └── notifications.js
```

### Archivos clave

- `frontend/components/notifications/NotificationsMenu.js` - Menú de notificaciones
- `frontend/scripts/notifications.js` - Lógica de notificaciones

## Usuarios {#usuarios}

**Resumen de la sección:**

- **Archivos**: 7
- **Directorios**: 2

### Estructura de directorios principales

```
frontend/
├── pages/
│   └── users/
└── components/
    └── users/
```

### Archivos clave

- `frontend/pages/users/index.astro` - Listado de usuarios
- `frontend/pages/users/create.astro` - Creación de usuarios
- `frontend/pages/users/edit/[id].astro` - Edición de usuarios

## Backend API {#backend-api}

**Resumen de la sección:**

- **Archivos**: 202
- **Directorios**: 31

### Estructura de directorios principales

```
backend/
├── app/
│   ├── api/
│   ├── routers/
│   ├── models/
│   └── main.py
├── tests/
└── utils/
```

### Archivos clave

- `backend/app/main.py` - Punto de entrada principal de la API
- `backend/app/api/endpoints/` - Definición de endpoints por entidad
- `backend/app/models/` - Modelos de datos y esquemas Pydantic

## Backend Database {#backend-database}

**Resumen de la sección:**

- **Archivos**: 22
- **Directorios**: 1

### Estructura de directorios principales

```
backend/
└── database/
    ├── connection.py
    ├── models/
    └── matriz_master.csv
```

### Archivos clave

- `backend/database/connection.py` - Configuración de conexión a base de datos
- `backend/database/matriz_master.csv` - Archivo principal de datos maestros

## Compartidos {#compartidos}

**Resumen de la sección:**

- **Archivos**: 17
- **Directorios**: 5

### Estructura de directorios principales

```
frontend/
└── shared/
    ├── utils/
    └── types/

backend/
└── shared/
    └── helpers/
```

### Archivos clave

- `frontend/shared/utils/common.js` - Utilidades comunes del frontend
- `backend/shared/helpers/date_utils.py` - Utilidades de fechas compartidas

## Desconocido {#desconocido}

**Resumen de la sección:**

- **Archivos**: 0
- **Directorios**: 2

*No se encontraron archivos en categoría desconocida, pero se identificaron 2 directorios que no pudieron clasificarse adecuadamente.*
