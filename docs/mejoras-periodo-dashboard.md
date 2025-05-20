# Mejoras en el Dashboard: Plan de implementación para períodos de análisis

## Objetivo

Modificar el dashboard para que los datos mostrados en las secciones de análisis (especialmente en partos) incluyan por defecto TODOS los registros históricos, y solo se filtren por período cuando el usuario lo solicite explícitamente a través del selector de fechas.

## Problemas detectados

1. Actualmente, algunos gráficos están pre-filtrados para mostrar solo datos desde 2010, mientras que los contadores totales incluyen todos los registros históricos.
2. Esto causa discrepancias como en el caso de los partos (se muestran 275 partos totales, pero el gráfico solo suma 271).
3. Los 4 partos "perdidos" corresponden a fechas anteriores a 2010 (Emma: 1/5/1978, Mariaelena: 3 partos entre 2000-2004).
4. El período de análisis no afecta consistentemente a todas las visualizaciones.

## Plan de implementación

### 1. Modificación del backend (API)

- **Endpoint `/dashboard/stats/`**: Modificar para que por defecto incluya todos los registros históricos en la respuesta.
- **Endpoint `/dashboard/partos/`**: Asegurar que devuelve todos los partos históricos sin filtros predeterminados.
- **Parámetros de filtrado**: Mantener la capacidad de filtrar mediante `fecha_inicio` y `fecha_fin`, pero sin valores predeterminados "hardcodeados".
- **Soporte para el parto más antiguo**: Implementar un endpoint para obtener la fecha del parto más antiguo (`/dashboard/oldest-parto/`).

### 2. Modificación del frontend (Dashboard)

#### Componente `Dashboard.tsx`:
- Modificar para recuperar la fecha del parto más antiguo al cargar.
- Establecer por defecto `fechaInicio` como la fecha del parto más antiguo y `fechaFin` como la fecha actual.
- Asegurar que las solicitudes iniciales a los endpoints NO incluyan parámetros de filtro.

#### Componente `PeriodoAnalisisSection.tsx`:
- Mostrar las fechas iniciales (parto más antiguo y fecha actual) en los campos correspondientes.
- Implementar un botón "Restablecer" que devuelva a este período completo.

#### Componentes de visualización:
- `GenderCriaChart`: Modificar para mostrar TODOS los partos por defecto.
- `MonthlyChart`: Ajustar para incluir todos los meses históricos.
- `TrendChart`: Garantizar que muestre la tendencia histórica completa.

### 3. Implementación del filtrado bajo demanda

1. Al hacer clic en "Aplicar Filtros":
   - Actualizar todos los endpoints con los parámetros `fecha_inicio` y `fecha_fin` seleccionados
   - Refrescar todas las visualizaciones con los datos filtrados
   - Mostrar una indicación visual de que se está viendo un período filtrado

2. Añadir un indicador claro en el dashboard cuando se esté viendo un período personalizado, no el histórico completo.

## Impacto esperado

- Mayor claridad en la presentación de datos históricos
- Eliminación de discrepancias entre contadores y visualizaciones
- Experiencia de usuario más intuitiva y transparente
- Capacidad de ver tendencias históricas completas por defecto
- Mayor flexibilidad para el análisis personalizado cuando sea necesario

## Notas adicionales

Es fundamental garantizar que todos los cálculos (promedios, ratios, etc.) se ajusten correctamente según el período seleccionado. Si el usuario filtra un período específico, todos los indicadores derivados deben recalcularse en base a ese período, no solo las visualizaciones directas.
