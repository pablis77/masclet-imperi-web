import re

# Ruta al archivo
ruta_archivo = 'app/services/dashboard_service.py'

# Leer el archivo
with open(ruta_archivo, 'r', encoding='utf-8') as f:
    contenido = f.read()

# Patrón para buscar el código a reemplazar
patron = r"# Si no se especifican fechas, usar el último año\n\s+if not end_date:\n\s+end_date = date.today\(\)\n\s+if not start_date:\n\s+start_date = end_date - timedelta\(days=365\)"

# Código de reemplazo
reemplazo = """# Si no se especifican fechas, usar desde 2010 hasta hoy
        if not end_date:
            end_date = date.today()
        if not start_date:
            # Usar 2010 como fecha de inicio para incluir todos los datos históricos
            start_date = date(2010, 1, 1)
            
        logger.info(f"Usando rango de fechas ampliado: {start_date} hasta {end_date}")"""

# Realizar el reemplazo
nuevo_contenido = re.sub(patron, reemplazo, contenido)

# Guardar los cambios
with open(ruta_archivo, 'w', encoding='utf-8') as f:
    f.write(nuevo_contenido)

print("Modificación completada con éxito.")
