# Código Implementado para la Mejora del Dashboard

## Endpoint Backend Optimizado

Nuevo endpoint en `backend/app/api/endpoints/dashboard.py`:

```python
@router.get("/resumen-card", response_model=Dict)
async def get_resumen_dashboard_card(
    explotacio: Optional[str] = Query(None, description="Valor del campo 'explotacio' para filtrar (opcional)"),
    current_user = Depends(get_current_user)  # Requerimos autenticación
):
    """
    Endpoint optimizado específico para el componente ResumenOriginalCard.
    Combina en una sola llamada la información de tres endpoints:
    - /dashboard/stats
    - /dashboard-detallado/animales-detallado
    - /dashboard-periodo/periodo-dinamico
    
    Esto permite reducir el número de peticiones y mejorar el rendimiento.
    """
    try:
        logger.info(f"Obteniendo datos optimizados para ResumenOriginalCard. Explotación: {explotacio}")
        
        # IMPORTANTE: Optimización radical - consultar directamente los datos mínimos necesarios
        # en lugar de utilizar funciones pesadas que hacen muchos cálculos innecesarios
        from app.models import Animal
        from app.models.enums import Genere, Estat
        from app.models.animal import EstadoAlletar
        from tortoise.functions import Count
        
        logger.info("Realizando consulta rápida y directa a la base de datos")
        
        # Consulta única para todos los conteos que necesitamos
        filters = {}
        if explotacio:
            filters["explotacio"] = explotacio

        # Forma simplificada - ejecutamos consultas directas para cada combinación de datos que necesitamos
        # Esto elimina la necesidad de operaciones de agrupación complejas
        
        # Consulta 1: Total de animales
        total_animales = await Animal.filter(**filters).count()
        
        # Consulta 2: Animales activos
        animales_activos = await Animal.filter(**filters, estado=Estat.OK).count()
        
        # Consulta 3: Animales fallecidos
        animales_fallecidos = await Animal.filter(**filters, estado=Estat.DEF).count()
        
        # Consulta 4: Machos activos
        machos_activos = await Animal.filter(**filters, genere=Genere.M, estado=Estat.OK).count()
        
        # Consulta 5: Machos fallecidos
        machos_fallecidos = await Animal.filter(**filters, genere=Genere.M, estado=Estat.DEF).count()
        
        # Consulta 6: Hembras activas
        hembras_activas = await Animal.filter(**filters, genere=Genere.F, estado=Estat.OK).count()
        
        # Consulta 7: Hembras fallecidas
        hembras_fallecidas = await Animal.filter(**filters, genere=Genere.F, estado=Estat.DEF).count()
        
        # Consulta 8-10: Conteos por estado de amamantamiento (solo vacas activas)
        alletar_0 = await Animal.filter(**filters, genere=Genere.F, estado=Estat.OK, alletar=EstadoAlletar.NO_ALLETAR).count()
        alletar_1 = await Animal.filter(**filters, genere=Genere.F, estado=Estat.OK, alletar=EstadoAlletar.UN_TERNERO).count()
        alletar_2 = await Animal.filter(**filters, genere=Genere.F, estado=Estat.OK, alletar=EstadoAlletar.DOS_TERNEROS).count()
        
        # Ya tenemos todos los conteos de las consultas directas
        # No necesitamos procesamiento adicional
        
        # Estructurar datos para el frontend - compatible con la estructura esperada
        stats = {"total": total_animales}
        
        animales_detallados = {
            "total": total_animales,
            "general": {
                "activos": animales_activos,
                "fallecidos": animales_fallecidos
            },
            "por_genero": {
                "machos": {
                    "activos": machos_activos,
                    "fallecidos": machos_fallecidos,
                    "total": machos_activos + machos_fallecidos
                },
                "hembras": {
                    "activas": hembras_activas,
                    "fallecidas": hembras_fallecidas,
                    "total": hembras_activas + hembras_fallecidas
                }
            },
            "por_alletar": {
                "0": alletar_0,
                "1": alletar_1,
                "2": alletar_2
            }
        }
        
        # 3. Obtener periodo dinámico (consultando la fecha más antigua de TODA la base de datos)
        logger.info("3/3: Obteniendo periodo dinámico (usando fecha más antigua de la BD)")
        from datetime import date, timedelta
        from app.models import Part, Animal
        from tortoise.functions import Min
        
        # Obtener fecha actual
        hoy = date.today()
        fecha_inicio = None
        
        try:
            # 1. Intentamos obtener la fecha de nacimiento más antigua de los animales
            logger.info("Buscando fecha de nacimiento más antigua...")
            # Buscar primero en el campo data_naixement (fecha de nacimiento)
            animal_mas_antiguo_nacimiento = await Animal.all().order_by('data_naixement').first()
            
            if animal_mas_antiguo_nacimiento and animal_mas_antiguo_nacimiento.data_naixement:
                fecha_inicio = animal_mas_antiguo_nacimiento.data_naixement
                logger.info(f"Fecha más antigua encontrada en data_naixement: {fecha_inicio}")
            
            # 2. Obtener también la fecha del parto más antiguo y comparar
            logger.info("Buscando fecha de parto más antigua...")
            parto_mas_antiguo = await Part.all().order_by('part').first()
            
            if parto_mas_antiguo and parto_mas_antiguo.part:
                if not fecha_inicio or parto_mas_antiguo.part < fecha_inicio:
                    # Si no teníamos fecha o la fecha del parto es más antigua, actualizamos
                    fecha_inicio = parto_mas_antiguo.part
                    logger.info(f"Fecha más antigua encontrada en partos: {fecha_inicio}")
            
            # 3. Si no encontramos ninguna fecha, usamos un valor predeterminado histórico
            if not fecha_inicio:
                # Si no hay fechas encontradas, poner 1970 como año inicial
                fecha_inicio = date(1970, 1, 1)  # Fecha arbitraria histórica
                logger.info(f"No se encontraron fechas antiguas, usando fecha histórica: {fecha_inicio}")
            else:
                # Si encontramos una fecha, ajustar al primer día del año
                fecha_inicio = date(fecha_inicio.year, 1, 1)  # 1 de enero del año más antiguo
                logger.info(f"Ajustando al primer día del año más antiguo: {fecha_inicio}")
                
        except Exception as e:
            # En caso de error, usar un valor predeterminado seguro (1970)
            logger.error(f"Error al obtener fecha más antigua: {str(e)}")
            fecha_inicio = date(1970, 1, 1)  # Una fecha histórica segura
        
        # Calcular periodo desde la fecha más antigua hasta hoy
        periodo_data = {
            "fecha_inicio": fecha_inicio.strftime("%Y-%m-%d"),  # Formato ISO para frontend
            "fecha_fin": hoy.strftime("%Y-%m-%d"),              # Formato ISO para frontend
            "dias": (hoy - fecha_inicio).days,
            "formato_fecha_inicio": fecha_inicio.strftime("%d/%m/%Y"),  # Formato español
            "formato_fecha_fin": hoy.strftime("%d/%m/%Y")                # Formato español
        }
        
        # Combinar todos los datos en una respuesta unificada
        resultado = {
            "stats": stats,
            "animales_detallados": animales_detallados,
            "periodo": periodo_data
        }
        
        logger.info("Endpoint optimizado completado con éxito")
        return resultado
        
    except Exception as e:
        logger.error(f"Error en endpoint optimizado ResumenOriginalCard: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener datos optimizados para dashboard: {str(e)}"
        )
```

## Modificación del Componente Frontend

Actualización en `frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx`:

```tsx
// Nuevo método optimizado que hace una sola llamada API
const fetchResumenOptimizado = async () => {
  try {
    const response = await fetch(`/api/v1/dashboard/resumen-card?${explotacioParam}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Actualizar todos los estados con la respuesta unificada
    setStats(data.stats);
    setAnimalesDetallados(data.animales_detallados);
    setPeriodo(data.periodo);
    setLoading(false);
    
    console.log("Datos obtenidos correctamente del endpoint optimizado");
  } catch (error) {
    console.error("Error al obtener datos optimizados:", error);
    console.log("Fallback: Intentando método tradicional...");
    
    // En caso de error, volver al método tradicional
    fetchDataTradicional();
  }
};

// Método tradicional como fallback (3 llamadas separadas)
const fetchDataTradicional = async () => {
  try {
    // Llamadas originales a los 3 endpoints separados
    const [statsResponse, animalesResponse, periodoResponse] = await Promise.all([
      fetch(`/api/v1/dashboard/stats?${explotacioParam}`),
      fetch(`/api/v1/dashboard-detallado/animales-detallado?${explotacioParam}`),
      fetch(`/api/v1/dashboard-periodo/periodo-dinamico`)
    ]);
    
    const statsData = await statsResponse.json();
    const animalesData = await animalesResponse.json();
    const periodoData = await periodoResponse.json();
    
    setStats(statsData);
    setAnimalesDetallados(animalesData);
    setPeriodo(periodoData);
    setLoading(false);
    
  } catch (error) {
    console.error("Error en método tradicional:", error);
    setLoading(false);
    setError(true);
  }
};

// En el useEffect, usar primero el método optimizado
useEffect(() => {
  fetchResumenOptimizado();
}, [explotacio]);
```
