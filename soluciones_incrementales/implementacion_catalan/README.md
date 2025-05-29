# Implementación Completa de Catalán en Masclet Imperi

## Problema

Actualmente, hay partes de la aplicación Masclet Imperi que solo están disponibles en español, mientras que otras ya tienen soporte bilingüe español/catalán. Como Ramon es catalán, es importante que toda la aplicación esté completamente disponible en catalán.

## Áreas identificadas con falta de traducción

1. **Páginas específicas**:
   - `dashboard-compare.astro`: Textos fijos en español ("Comparación de Dashboards", "Vista Lado a Lado", etc.)
   - `dashboard-direct.astro`: Título en español ("Dashboard (Versión Directa)")
   - `backup/index.astro`: Algunas traducciones incompletas

2. **Componentes con textos hardcodeados**:
   - Varios componentes tienen textos fijos en español en lugar de usar el sistema i18n
   - Mensajes de error y confirmación en español
   - Algunos formularios con etiquetas y placeholder en español

3. **Elementos de UI**:
   - Ciertas partes de la navegación y UI general
   - Modales y mensajes de confirmación
   - Mensajes de validación en formularios

## Plan de Acción

### Fase 1: Actualización de archivos de traducción

1. Actualizar los archivos `ca.json` y `es.json` con todas las traducciones faltantes
2. Asegurar consistencia en la terminología utilizada
3. Validar que no hay claves duplicadas o faltantes entre ambos archivos

### Fase 2: Refactorización de textos hardcodeados

1. Identificar todos los textos hardcodeados en español
2. Reemplazarlos con llamadas al sistema i18n
3. Implementar soporte para cambio dinámico de idioma donde falte

### Fase 3: Implementación en páginas específicas

1. Modificar `dashboard-compare.astro` para usar el sistema i18n
2. Actualizar `dashboard-direct.astro` para usar traducciones
3. Completar la traducción en `backup/index.astro`

### Fase 4: Pruebas y validación

1. Probar la aplicación en ambos idiomas
2. Verificar que todos los textos se muestran correctamente
3. Comprobar que el cambio de idioma funciona en todas las páginas

## Métricas de éxito

- 100% de los textos visibles para el usuario disponibles en catalán
- Consistencia en la terminología utilizada
- Funcionamiento correcto del cambio de idioma en toda la aplicación

## Implementación

Para implementar esta solución, se debe:

1. Seguir la estructura actual del sistema de i18n
2. Mantener la compatibilidad con el sistema existente
3. Minimizar cambios en la estructura del código, enfocándonos solo en la internacionalización

## Fecha de implementación prevista

29/05/2025
