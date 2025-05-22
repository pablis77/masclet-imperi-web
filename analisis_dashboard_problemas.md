# Análisis de problemas con dashboard_service.py y ResumenGeneralSection.tsx

## Errores detectados:

1. **No seguimos la lógica de verificar_contadores.py**:
   - Inventamos estructuras anidadas inexistentes ("por_genero_estado")
   - Eliminamos datos importantes durante las modificaciones

2. **En dashboard_service.py**:
   - No añadimos las variables exactas de verificar_contadores.py:
     ```python
     self.estadisticas['toros_activos'] = await Animal.filter(genere='M', estado='OK').count()
     self.estadisticas['toros_fallecidos'] = await Animal.filter(genere='M', estado='DEF').count()
     self.estadisticas['vacas_activas'] = await Animal.filter(genere='F', estado='OK').count()
     self.estadisticas['vacas_fallecidas'] = await Animal.filter(genere='F', estado='DEF').count()
     ```
   - Modificamos estructuras existentes en lugar de solo añadir las nuevas variables

3. **En ResumenGeneralSection.tsx**:
   - A diferencia de PartosSection.tsx, no está mostrando logs en consola
   - No está conectado correctamente para consumir los datos del backend
   - Intentamos acceder a estructuras que no existen

4. **Problema de conexión**:
   - PartosSection.tsx muestra logs con datos (líneas 141-148) 
   - ResumenGeneralSection.tsx no muestra ningún console.log
   - Esto sugiere un problema de conexión o de datos

## Plan detallado para aplicar:

1. **Restaurar dashboard_service.py**:
   - Mantener la estructura original intacta
   - Añadir exactamente las mismas consultas que tiene verificar_contadores.py
   - Incluir estas variables en la respuesta JSON sin eliminar nada más:
     ```python
     "toros_activos": await Animal.filter(**base_filter, genere="M", estado="OK").count(),
     "toros_fallecidos": await Animal.filter(**base_filter, genere="M", estado="DEF").count(),
     "vacas_activas": await Animal.filter(**base_filter, genere="F", estado="OK").count(),
     "vacas_fallecidas": await Animal.filter(**base_filter, genere="F", estado="DEF").count()
     ```

2. **Actualizar ResumenGeneralSection.tsx**:
   - Añadir los mismos patrones de logging que tiene PartosSection.tsx para depuración
   - Verificar que recibe datos correctamente con console.log
   - Acceder directamente a las variables añadidas: toros_activos, toros_fallecidos, etc.
   - No cambiar la lógica de visualización existente

3. **Verificar la conexión entre componentes**:
   - Examinar cómo PartosSection.tsx está conectado al dashboard
   - Replicar la misma estructura de conexión en ResumenGeneralSection.tsx
   - Asegurar que se llama correctamente desde el componente padre

4. **Pruebas paso a paso**:
   - Verificar que la sección de partos sigue funcionando correctamente
   - Confirmar que las estadísticas coinciden con verificar_contadores.py
   - Asegurar que ambos componentes reciben los datos correctamente
   - Comprobar que los logs aparecen en la consola para ambos componentes

Este enfoque mínimo y enfocado garantizará que apliquemos exactamente la lógica de verificar_contadores.py y que ResumenGeneralSection.tsx esté correctamente conectado como PartosSection.tsx, sin alterar el resto del sistema.

## Intentos de reparación del resumen general de DASHBOARD

### Intento 1 (22/05/2025)

En este primer intento de reparación, seguimos el plan establecido en el análisis:

1. **En backend/app/services/dashboard_service.py**:
   - Añadimos exactamente las mismas variables que usa verificar_contadores.py:
   ```python
   "toros_activos": await Animal.filter(**base_filter, genere="M", estado="OK").count(),
   "toros_fallecidos": await Animal.filter(**base_filter, genere="M", estado="DEF").count(),
   "vacas_activas": await Animal.filter(**base_filter, genere="F", estado="OK").count(),
   "vacas_fallecidas": await Animal.filter(**base_filter, genere="F", estado="DEF").count(),
   ```
   - Mantuvimos la estructura original sin eliminar nada

2. **En frontend/src/components/dashboard/types/dashboard.ts**:
   - Actualizamos la interfaz AnimalStats para incluir las nuevas variables:
   ```typescript
   toros_activos: number;    // Añadido - genere="M", estado="OK"
   toros_fallecidos: number; // Añadido - genere="M", estado="DEF"
   vacas_activas: number;    // Añadido - genere="F", estado="OK"
   vacas_fallecidas: number; // Añadido - genere="F", estado="DEF"
   ```

3. **En frontend/src/components/dashboard/sections/ResumenGeneralSection.tsx**:
   - Agregamos logs para depuración similares a los que tiene PartosSection.tsx
   - Cambiamos el código para usar directamente las variables que nos envía el backend:
   ```typescript
   activeMales = stats.animales.toros_activos || 0;
   inactiveMales = stats.animales.toros_fallecidos || 0;
   activeFemales = stats.animales.vacas_activas || 0;
   inactiveFemales = stats.animales.vacas_fallecidas || 0;
   ```
   - Eliminamos el código que intentaba derivar estos valores de otras estructuras inexistentes

**Resultados**:
- El backend ahora envía correctamente las variables necesarias
- Sin embargo, el frontend muestra valores incorrectos (muchos ceros) en comparación con verificar_contadores.py
- Los valores en la verificación del script son:
  * Total de animales: 94
  * Toros activos: 9
  * Toros fallecidos: 1
  * Vacas activas: 84
  * Vacas fallecidas: 0
- Pero estos valores no se están mostrando correctamente en la interfaz

**Conclusión**:
A pesar de que hemos implementado las variables correctamente, parece que hay otro problema en la forma en que los datos se están cargando o procesando en el frontend. Necesitamos investigar:
1. Si Dashboard.tsx está pasando correctamente los datos a ResumenGeneralSection.tsx
2. Si hay algún problema con la conexión al endpoint correcto
3. Si hay algún problema de timing o de actualización de estado
