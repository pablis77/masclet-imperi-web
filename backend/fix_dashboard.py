"""
Script para corregir todos los filtros de fecha en el dashboard_service.py
para que muestre correctamente todos los datos históricos desde 2010.
"""
import re

archivo = 'app/services/dashboard_service.py'

# Leer el contenido del archivo
with open(archivo, 'r', encoding='utf-8') as f:
    contenido = f.read()

# 1. Reemplazar todas las ocurrencias de filtro de último año (365 días) por 2010
contenido = re.sub(
    r'start_date = end_date - timedelta\(days=365\)',
    'start_date = date(2010, 1, 1)  # Usar fecha inicio 2010',
    contenido
)

# 2. Reemplazar todas las referencias a un_anio_atras
contenido = re.sub(
    r'un_anio_atras = date\.today\(\) - timedelta\(days=365\)',
    'un_anio_atras = date(2010, 1, 1)  # Usar fecha inicio 2010',
    contenido
)

# 3. Actualizar el cálculo de distribución mensual para considerar todos los meses
patron_distribucion_mensual = r'# Distribución mensual \(por_mes en el esquema\)(.*?)# Distribución anual'
reemplazo_distribucion_mensual = '''# Distribución mensual (por_mes en el esquema) - agrupar por mes independientemente del año
        # Nombres de meses en español
        nombres_meses = {
            1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio",
            7: "Julio", 8: "Agosto", 9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
        }
        
        # Inicializar todos los meses con 0 partos
        por_mes = {nombre: 0 for nombre in nombres_meses.values()}
        
        # Obtener todos los partos con su fecha
        partos = await Part.filter(**parto_filter).values('part')
        
        # Contar partos por mes (ignorando el año)
        for parto in partos:
            if parto['part']:  # Verificar que la fecha no sea None
                mes_numero = parto['part'].month
                mes_nombre = nombres_meses[mes_numero]
                por_mes[mes_nombre] += 1
                
        logger.info(f"Distribución mensual de partos: {por_mes}")
        
        # Distribución anual'''

contenido = re.sub(
    patron_distribucion_mensual, 
    reemplazo_distribucion_mensual, 
    contenido, 
    flags=re.DOTALL
)

# 4. Actualizar el cálculo de distribución anual para considerar todos los años
patron_distribucion_anual = r'# Distribución anual(.*?)# Calcular tendencia'
reemplazo_distribucion_anual = '''# Distribución anual - mostrar todos los años desde 2010 hasta el presente
        # Inicializar la distribución anual con años desde 2010 hasta el presente
        anio_actual = date.today().year
        anio_inicio = 2010
        distribucion_anual = {str(anio): 0 for anio in range(anio_inicio, anio_actual + 1)}
        
        # Obtener todos los partos con sus fechas (sin filtro de rango de fechas)
        partos = await Part.filter(**parto_filter).values('part')
        
        # Contar partos por año
        for parto in partos:
            if parto['part']:  # Verificar que la fecha no sea None
                anio = str(parto['part'].year)
                if anio in distribucion_anual:
                    distribucion_anual[anio] += 1
                else:
                    # Si el año es anterior a 2010 o posterior al año actual, lo agregamos
                    distribucion_anual[anio] = 1
        
        # Ordenar la distribución por año
        distribucion_anual = {k: distribucion_anual[k] for k in sorted(distribucion_anual.keys())}
        
        logger.info(f"Distribución anual de partos: {distribucion_anual}")
        
        # Calcular tendencia'''

contenido = re.sub(
    patron_distribucion_anual, 
    reemplazo_distribucion_anual, 
    contenido, 
    flags=re.DOTALL
)

# Escribir el contenido actualizado en el archivo
with open(archivo, 'w', encoding='utf-8') as f:
    f.write(contenido)

print("¡Script completado con éxito! Se han aplicado todas las correcciones al archivo dashboard_service.py")
