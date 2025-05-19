# Script para modificar el rango de fechas en dashboard_service.py
import re

archivo = 'app/services/dashboard_service.py'

with open(archivo, 'r', encoding='utf-8') as f:
    contenido = f.read()

# Sustituir el rango de fechas en la función get_partos_dashboard
nuevo_contenido = re.sub(
    r'# Si no se especifican fechas, usar el último año\s+if not end_date:\s+end_date = date\.today\(\)\s+if not start_date:\s+start_date = end_date - timedelta\(days=365\)',
    '# Si no se especifican fechas, usar desde 2010 hasta hoy\n        if not end_date:\n            end_date = date.today()\n        if not start_date:\n            # Usar 2010 como fecha de inicio para todos los datos históricos\n            start_date = date(2010, 1, 1)',
    contenido
)

with open(archivo, 'w', encoding='utf-8') as f:
    f.write(nuevo_contenido)

print("Modificación completada con éxito.")
