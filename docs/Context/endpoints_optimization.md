# Plan de Optimización de Endpoints

## Fase 1: Análisis [30min]
1. Revisar endpoints actuales en cada módulo
2. Identificar duplicados
3. Listar endpoints esenciales vs opcionales

✅ Revisado endpoints actuales en cada módulo
✅ Identificado duplicados
✅ Listado endpoints esenciales vs opcionales

## Fase 2: Limpieza por Módulo [2h]
### 2.1 Animals (/api/v1/animals)
- [ ] Consolidar endpoints de búsqueda
- [ ] Unificar rutas de explotación
- [ ] Eliminar endpoints redundantes
- [ ] Mantener CRUD básico:
  - POST / (create)
  - GET / (list)
  - GET /{id} (detail)
  - PUT /{id} (update)
  - DELETE /{id} (delete)
  - GET /search (búsqueda)
  - GET /explotacio (lista + stats)

### 2.2 Partos (/api/v1/partos)
- [ ] Simplificar a:
  - POST / (create)
  - GET /animal/{id} (get by animal)

### 2.3 Dashboard (/api/v1/stats)
- [ ] Consolidar en un solo endpoint:
  - GET / (todas las stats)

### 2.4 Auth (/api/v1/auth)
- [ ] Mantener mínimo:
  - POST /login
  - GET /me

## Fase 3: Testing [1h]
- [ ] Verificar cada endpoint simplificado
- [ ] Comprobar respuestas
- [ ] Validar integridad de datos

## Fase 4: Documentación [30min]
- [ ] Actualizar Swagger
- [ ] Documentar cambios
- [ ] Actualizar tests

## Fase 5: Frontend Updates [1h]
- [ ] Actualizar llamadas API
- [ ] Verificar funcionalidad

## 1. Endpoints Consolidados

### Animals (/api/v1/animals)
| Endpoint | Método | Descripción | Permisos |
|----------|--------|-------------|-----------|
| / | GET | Listar + filtros explotació | CONSULTAR |
| / | POST | Crear animal | CREAR |
| /{id} | GET | Detalle animal | CONSULTAR |
| /{id} | PUT | Actualizar animal | ACTUALIZAR |
| /{id} | DELETE | Eliminar animal | ACTUALIZAR |
| /search | GET | Búsqueda avanzada | CONSULTAR |
| /explotacio | GET | Lista + stats por explotación | CONSULTAR |

### Partos (/api/v1/partos)
| Endpoint | Método | Descripción | Permisos |
|----------|--------|-------------|-----------|
| / | POST | Crear parto | CREAR |
| /animal/{id} | GET | Historial partos | CONSULTAR |

### Dashboard (/api/v1/stats)
| Endpoint | Método | Descripción | Permisos |
|----------|--------|-------------|-----------|
| / | GET | Todas las estadísticas | VER_ESTADISTICAS |

### Auth (/api/v1/auth)
| Endpoint | Método | Descripción | Permisos |
|----------|--------|-------------|-----------|
| /login | POST | Login | - |
| /me | GET | Usuario actual | CONSULTAR |

### Imports (/api/v1/imports)
| Endpoint | Método | Descripción | Permisos |
|----------|--------|-------------|-----------|
| /preview | POST | Preview CSV | IMPORTAR_DATOS |
| /import | POST | Importar CSV | IMPORTAR_DATOS |

## 2. Endpoints a Eliminar
- /api/v1/animals/animals/{id} (duplicado)
- /api/v1/animals/by-name/{nom} (usar /search)
- /api/v1/animals/search (duplicado)
- /api/v1/partos/partos (ruta redundante)
- /api/v1/dashboard/recientes (consolidar en /stats)
- /api/v1/explotacions/{id}/stats (mover a /animals/explotacio)

## 3. Impacto en Middleware y Validaciones
- Mantener MessageMiddleware para formato respuestas
- Conservar validaciones de modelo en validation.py
- Respetar permisos definidos en auth.py

## 4. Plan de Migración
1. Creación de archivos _new:
   - [ ] animals_new.py
   - [ ] partos_new.py
   - [ ] dashboard_new.py
   - [ ] auth_new.py
   - [ ] imports_new.py

2. Testing en paralelo:
   - [ ] Verificar cada endpoint en versión _new
   - [ ] Comparar respuestas con versión actual
   - [ ] Validar permisos y schemas
   - [ ] Probar casos de error

3. Switch de rutas:
   - [ ] Actualizar router.py para usar nuevos endpoints
   - [ ] Mantener compatibilidad hacia atrás
   - [ ] Verificar en entorno de pruebas
   
4. Limpieza final:
   - [ ] Renombrar archivos _new a definitivos
   - [ ] Eliminar código obsoleto
   - [ ] Actualizar documentación

1. Crear nuevos endpoints
2. Marcar antiguos como @deprecated
3. Actualizar frontend
4. Eliminar endpoints obsoletos en v3.0