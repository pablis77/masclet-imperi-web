# Informe de Adaptación de URLs Hardcodeadas

**Fecha:** 12/6/2025, 19:56:46

## Resumen

- **Total de archivos analizados:** 240
- **Archivos con URLs hardcodeadas:** 5
- **Archivos modificados:** 5

## Archivos a modificar

Los siguientes archivos contienen URLs hardcodeadas que deben ser reemplazadas por referencias a la configuración centralizada:


### HabitualesForm.astro

**Ruta completa:** `C:\Proyectos\claude\masclet-imperi-web\frontend\src\components\animals\HabitualesForm.astro`

**Importación a añadir:**
```typescript
import { API_CONFIG } from '../../config/apiConfig.centralizado';
```

**Reemplazos recomendados:**

- Reemplazar `/['"]http:\/\/127\.0\.0\.1:8000\/api\/v1['"]/g` por `API_CONFIG.baseUrl`
- Reemplazar `/['"]http:\/\/localhost:8000\/api\/v1['"]/g` por `API_CONFIG.baseUrl`
- Reemplazar `/['"]https:\/\/api-masclet-imperi\.loca\.lt\/api\/v1['"]/g` por `API_CONFIG.baseUrl`


### apiConfig.centralizado.ts

**Ruta completa:** `C:\Proyectos\claude\masclet-imperi-web\frontend\src\config\apiConfig.centralizado.ts`

**Importación a añadir:**
```typescript
import { API_CONFIG } from '/apiConfig.centralizado';
```

**Reemplazos recomendados:**

- Reemplazar `/['"]http:\/\/127\.0\.0\.1:8000\/api\/v1['"]/g` por `API_CONFIG.baseUrl`
- Reemplazar `/['"]http:\/\/localhost:8000\/api\/v1['"]/g` por `API_CONFIG.baseUrl`
- Reemplazar `/['"]https:\/\/api-masclet-imperi\.loca\.lt\/api\/v1['"]/g` por `API_CONFIG.baseUrl`


### animal-history.js

**Ruta completa:** `C:\Proyectos\claude\masclet-imperi-web\frontend\src\scripts\animal-history.js`

**Importación a añadir:**
```typescript
import { API_CONFIG } from '../config/apiConfig.centralizado';
```

**Reemplazos recomendados:**

- Reemplazar `/['"]http:\/\/127\.0\.0\.1:8000\/api\/v1['"]/g` por `API_CONFIG.baseUrl`
- Reemplazar `/['"]http:\/\/localhost:8000\/api\/v1['"]/g` por `API_CONFIG.baseUrl`
- Reemplazar `/['"]https:\/\/api-masclet-imperi\.loca\.lt\/api\/v1['"]/g` por `API_CONFIG.baseUrl`


### api.ts

**Ruta completa:** `C:\Proyectos\claude\masclet-imperi-web\frontend\src\services\api.ts`

**Importación a añadir:**
```typescript
import { API_CONFIG } from '../config/apiConfig.centralizado';
```

**Reemplazos recomendados:**

- Reemplazar `/['"]http:\/\/127\.0\.0\.1:8000\/api\/v1['"]/g` por `API_CONFIG.baseUrl`
- Reemplazar `/['"]http:\/\/localhost:8000\/api\/v1['"]/g` por `API_CONFIG.baseUrl`
- Reemplazar `/['"]https:\/\/api-masclet-imperi\.loca\.lt\/api\/v1['"]/g` por `API_CONFIG.baseUrl`


### apiService.ts

**Ruta completa:** `C:\Proyectos\claude\masclet-imperi-web\frontend\src\services\apiService.ts`

**Importación a añadir:**
```typescript
import { API_CONFIG } from '../config/apiConfig.centralizado';
```

**Reemplazos recomendados:**

- Reemplazar `/['"]http:\/\/127\.0\.0\.1:8000\/api\/v1['"]/g` por `API_CONFIG.baseUrl`
- Reemplazar `/['"]http:\/\/localhost:8000\/api\/v1['"]/g` por `API_CONFIG.baseUrl`
- Reemplazar `/['"]https:\/\/api-masclet-imperi\.loca\.lt\/api\/v1['"]/g` por `API_CONFIG.baseUrl`


## Próximos pasos

1. Revisar el informe detallado de los archivos a modificar
2. Hacer los reemplazos usando el patrón recomendado
3. Verificar que la aplicación sigue funcionando correctamente
4. Asegurarse de que todos los endpoints usan la configuración centralizada
