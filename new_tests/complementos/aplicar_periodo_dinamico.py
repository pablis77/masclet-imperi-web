"""
Script para aplicar el período dinámico en el archivo dashboard_service.py
Reemplaza todas las instancias de la fecha fija 1900-01-01 con llamadas a obtener_periodo_dinamico
"""
import re
import os
import sys

# Añadir directorio raíz al path para poder importar módulos
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

def main():
    """Función principal para reemplazar las fechas fijas con el período dinámico"""
    # Rutas de los archivos
    dashboard_service_path = os.path.join('backend', 'app', 'services', 'dashboard_service.py')
    
    # Leer el contenido del archivo
    with open(dashboard_service_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Verificar que el archivo contenga las importaciones necesarias
    import_stmt = "from app.services.dashboard_service_extended import obtener_periodo_dinamico"
    if import_stmt not in content:
        # Añadir la importación después de las importaciones existentes
        import_section = "from app.models.animal import Genere, EstadoAlletar"
        content = content.replace(import_section, f"{import_section}\n{import_stmt}")
        
        # Añadir la variable DEBUG_MODE
        debug_section = "logger = logging.getLogger(__name__)"
        debug_replacement = "logger = logging.getLogger(__name__)\n\n# Variable global para evitar logs duplicados\n_DEBUG_MODE = False"
        content = content.replace(debug_section, debug_replacement)
    
    # Patrón para encontrar bloques de código que establecen start_date a 1900-01-01
    pattern = r"(        # Si no se especifican fechas, usar desde 1900 hasta hoy \(para incluir TODOS los datos\)\n        if not end_date:\n            end_date = date\.today\(\)\n        if not start_date:\n            # Usar una fecha muy antigua \(1900\) para incluir TODOS los datos históricos\n            start_date = date\(1900, 1, 1\)(?:  # Modificado para incluir TODOS los partos históricos)?)"
    
    # Reemplazo con el código que usa el período dinámico
    replacement = """        # Si no se especifican fechas, usar período dinámico basado en la fecha más antigua
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
                logger.warning(f"Error al obtener período dinámico: {str(e)}")
                start_date = date.today().replace(year=date.today().year - 5)"""
    
    # Realizar el reemplazo
    new_content = re.sub(pattern, replacement, content)
    
    # Patrón alternativo para otros casos donde se establece start_date a 1900-01-01
    alt_pattern = r"(          if not start_date:\n              # Usar \d+ como fecha de inicio para incluir todos los datos históricos\n            start_date = date\(1900, 1, 1\)(?:  # Modificado para incluir TODOS los partos históricos)?)"
    
    alt_replacement = """          if not start_date:
              try:
                  # Obtener la fecha más antigua de la base de datos como inicio del período
                  fecha_inicio_dinamica, _ = await obtener_periodo_dinamico(explotacio)
                  start_date = fecha_inicio_dinamica
              except Exception as e:
                  # En caso de error, usar 5 años atrás como predeterminado
                  logger.warning(f"Error al obtener período dinámico: {str(e)}")
                  start_date = date.today().replace(year=date.today().year - 5)"""
    
    # Realizar el reemplazo alternativo
    new_content = re.sub(alt_pattern, alt_replacement, new_content)
    
    # Optimizar los logs
    # Reemplazar los logger.info con if _DEBUG_MODE: logger.info
    log_pattern = r"logger\.info\("
    log_replacement = "if _DEBUG_MODE:\n            logger.info("
    new_content = new_content.replace(log_pattern, log_replacement)
    
    # Guardar el archivo modificado
    with open(dashboard_service_path, 'w', encoding='utf-8') as file:
        file.write(new_content)
    
    print(f"Se ha actualizado el archivo {dashboard_service_path}")
    print("Se ha implementado el período dinámico y optimizado los logs")

if __name__ == "__main__":
    main()
