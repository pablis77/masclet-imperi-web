"""
Script para optimizar la sección de partos del dashboard
Reemplaza el uso del período dinámico general por uno específico de partos
"""
import os
import re

def main():
    """Función principal para optimizar la sección de partos"""
    # Ruta del archivo
    dashboard_service_path = os.path.join('backend', 'app', 'services', 'dashboard_service.py')
    
    # Leer el contenido del archivo
    with open(dashboard_service_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Asegurarse de que la importación esté actualizada
    if "obtener_fecha_primer_parto" not in content:
        content = content.replace(
            "from app.services.dashboard_service_extended import obtener_periodo_dinamico", 
            "from app.services.dashboard_service_extended import obtener_periodo_dinamico, obtener_fecha_primer_parto"
        )
    
    # Buscar la función get_partos_dashboard
    partos_pattern = r"async def get_partos_dashboard\(.*?\)"
    if re.search(partos_pattern, content, re.DOTALL):
        # Reemplazar el bloque que usa obtener_periodo_dinamico por obtener_fecha_primer_parto
        content = content.replace(
            """        # Si no se especifican fechas, usar período dinámico basado en la fecha más antigua
        if not end_date:
            end_date = date.today()
        if not start_date:
            try:
                # Obtener la fecha más antigua de la base de datos como inicio del período
                fecha_inicio_dinamica, _ = await obtener_periodo_dinamico(explotacio)
                start_date = fecha_inicio_dinamica
                if _DEBUG_MODE:
                    logger.info(f"Usando fecha dinámica como inicio: {start_date}")
            except Exception as e:
                # En caso de error, usar 5 años atrás como predeterminado
                logger.warning(f"Error al obtener período dinámico: {str(e)}")""",
            
            """        # Si no se especifican fechas, usar la fecha del primer parto como inicio del período
        if not end_date:
            end_date = date.today()
        if not start_date:
            try:
                # Obtener la fecha del primer parto como inicio del período (más eficiente)
                fecha_inicio_partos, _ = await obtener_fecha_primer_parto(explotacio)
                start_date = fecha_inicio_partos
                if _DEBUG_MODE:
                    logger.info(f"Usando fecha del primer parto como inicio: {start_date}")
            except Exception as e:
                # En caso de error, usar 5 años atrás como predeterminado
                logger.warning(f"Error al obtener fecha del primer parto: {str(e)}")"""
        )
    
    # Guardar el archivo modificado
    with open(dashboard_service_path, 'w', encoding='utf-8') as file:
        file.write(content)
    
    print("✅ Optimización de partos completada")
    print("Ahora la sección de partos usará un período basado en el primer parto")
    print("Esto eliminará el 'salchichón' de datos vacíos desde 1935 hasta 2002")

if __name__ == "__main__":
    main()
