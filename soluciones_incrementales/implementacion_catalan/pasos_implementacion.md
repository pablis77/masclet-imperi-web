# Pasos para Implementar Catalán en Partes Faltantes

## 1. Actualizar archivos de traducción

Primero debemos actualizar los archivos principales de traducción:

1. Abrir `frontend/src/i18n/locales/ca.json`
2. Añadir las nuevas secciones:
   ```json
   "dashboard_compare": {
     "title": "Comparació de Taulers",
     "side_by_side": "Vista Costat a Costat",
     "toggle_view": "Vista Alternar"
   },
   "dashboard_direct": {
     "title": "Tauler de Control (Versió Directa)"
   }
   ```
3. Asegurarse de que se mantiene el formato JSON válido
4. Hacer lo mismo con `es.json` pero con los textos en español

## 2. Modificar páginas con textos hardcodeados

### dashboard-compare.astro

Cambiar:
```astro
<MainLayout title="Comparación de Dashboards - Masclet Imperi">
```

Por:
```astro
---
import { t } from '../i18n/config';
---
<MainLayout title={`${t('dashboard_compare.title')} - Masclet Imperi`}>
```

Y los botones:
```astro
<button id="view-side" class="bg-primary text-white px-4 py-2 rounded-md">Vista Lado a Lado</button>
<button id="view-toggle" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Vista Alternar</button>
```

Por:
```astro
<button id="view-side" class="bg-primary text-white px-4 py-2 rounded-md">{t('dashboard_compare.side_by_side')}</button>
<button id="view-toggle" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">{t('dashboard_compare.toggle_view')}</button>
```

### dashboard-direct.astro

Cambiar:
```astro
const title = 'Dashboard (Versión Directa)';
```

Por:
```astro
import { t } from '../i18n/config';
const title = t('dashboard_direct.title');
```

## 3. Implementar selección de idioma en todas las páginas

Asegurarse de que el componente de selección de idioma está presente en todas las páginas y funciona correctamente.

## 4. Verificar textos en componentes

Revisar todos los componentes que puedan tener textos hardcodeados y reemplazarlos usando el sistema i18n.

## 5. Pruebas de validación

1. Cambiar el idioma a catalán y navegar por todas las páginas
2. Verificar que todos los textos aparecen en catalán
3. Probar formularios y mensajes de error
4. Probar funcionalidades específicas como backup/restore

## 6. Documentación

Actualizar la documentación para reflejar que toda la aplicación está disponible en catalán.
