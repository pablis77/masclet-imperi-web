"""
Utilidades para el manejo de fechas
"""
from datetime import datetime, date
from typing import Optional, Union

# Formatos de fecha soportados
DATE_FORMAT_ES = "%d/%m/%Y"  # Formato español (01/01/2024)
DATE_FORMAT_DB = "%Y-%m-%d"  # Formato ISO/DB (2024-01-01)
DATE_FORMAT_ISO = "%Y-%m-%d"  # Alias para formato ISO
DATE_FORMAT_ALT1 = "%d-%m-%Y"  # Formato alternativo con guiones (01-01-2024)
DATE_FORMAT_ALT2 = "%Y/%m/%d"  # Formato alternativo con barras (2024/01/01)

class DateConverter:
    """
    Utilidades para convertir fechas entre diferentes formatos
    """
    
    @staticmethod
    def parse_date(date_str: str) -> Optional[date]:
        """
        Intenta parsear una fecha en cualquier formato soportado
        
        Args:
            date_str: String con la fecha
            
        Returns:
            date: Objeto date si el parseo es exitoso
            None: Si el string es None o vacío
            
        Raises:
            ValueError: Si el formato no es reconocido
        """
        if not date_str:
            return None
            
        # Si ya es un objeto date o datetime, devolverlo directamente
        if isinstance(date_str, date):
            return date_str
        if isinstance(date_str, datetime):
            return date_str.date()
            
        # Si no es un string, intentar convertirlo
        if not isinstance(date_str, str):
            try:
                date_str = str(date_str)
            except Exception as e:
                raise ValueError(f"No se pudo convertir a string: {type(date_str)}. Error: {str(e)}")
        
        # SOLUCIÓN MANUAL ROBUSTA
        try:
            # Primero limpiamos la cadena
            clean_date = date_str.strip()
            
            # Detectar el separador
            separator = None
            for sep in ['/', '-', '.']:
                if sep in clean_date:
                    separator = sep
                    break
                    
            if not separator:
                # Si no hay separador, intentar formato ISO sin separadores (YYYYMMDD)
                if len(clean_date) == 8 and clean_date.isdigit():
                    year = int(clean_date[0:4])
                    month = int(clean_date[4:6])
                    day = int(clean_date[6:8])
                    return date(year, month, day)
                raise ValueError(f"No se encontró separador en '{clean_date}'")
                
            # Dividir la fecha según el separador
            parts = clean_date.split(separator)
            if len(parts) != 3:
                raise ValueError(f"La fecha debe tener 3 partes, tiene {len(parts)}: '{clean_date}'")
                
            # Detectar y convertir formato DD/MM/YYYY o YYYY/MM/DD
            first, second, third = parts
            
            # Determinar tipo de formato (por longitud del primer y último componente)
            # El día puede tener 1 o 2 caracteres, el mes 1 o 2, y el año 2 o 4
            is_dmy_format = (len(first) <= 2 or first.isdigit()) and len(third) == 4 and int(first) <= 31
            is_ymd_format = len(first) == 4 and (len(third) <= 2 or third.isdigit()) and int(first) >= 1900
            
            if is_dmy_format:  # DD/MM/YYYY
                day = int(first)
                month = int(second)
                year = int(third)
            elif is_ymd_format:  # YYYY/MM/DD
                year = int(first)
                month = int(second)
                day = int(third)
            else:
                # Intentar determinar por rango de valores y contexto
                first_val = int(first)
                third_val = int(third)
                
                # Si el primer valor es >31, debe ser año
                if first_val > 31 and first_val >= 1900:
                    # Formato YYYY/MM/DD
                    year = first_val
                    month = int(second)
                    day = third_val
                # Si el tercer valor es >31 y >= 1900, debe ser año
                elif third_val > 31 and third_val >= 1900:
                    # Formato DD/MM/YYYY - el más común en España
                    day = first_val
                    month = int(second)
                    year = third_val
                # Si el primer valor es <= 12 y el tercero <= 12, asumir DD/MM/YYYY
                elif first_val <= 31 and third_val >= 1900:
                    # Preferir formato DD/MM/YYYY para este caso
                    day = first_val
                    month = int(second)
                    year = third_val
                else:
                    # Último recurso: tratar como formato europeo DD/MM/YYYY
                    day = first_val
                    month = int(second)
                    year = third_val
            
            # Validar cada componente
            if not (1 <= month <= 12):
                raise ValueError(f"Mes inválido: {month}")
            
            if not (1 <= day <= 31):
                raise ValueError(f"Día inválido: {day}")
                
            # Más validaciones para fechas válidas
            if month in [4, 6, 9, 11] and day > 30:
                raise ValueError(f"El mes {month} no puede tener más de 30 días")
                
            if month == 2:
                is_leap = (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)
                max_days = 29 if is_leap else 28
                if day > max_days:
                    raise ValueError(f"Febrero del año {year} no puede tener más de {max_days} días")
            
            # Crear objeto date
            return date(year, month, day)
            
        except Exception as manual_error:
            print(f"DEBUG_DATE - Error en método manual para '{date_str}': {str(manual_error)}")
            
            # COMO FALLBACK, INTENTAR MÉTODO TRADICIONAL
            try:
                # Limpiar la cadena de fecha
                clean_date_str = date_str.strip()
                
                formats = [
                    DATE_FORMAT_ES,
                    DATE_FORMAT_DB,
                    DATE_FORMAT_ISO,
                    DATE_FORMAT_ALT1,
                    DATE_FORMAT_ALT2
                ]
                
                # Intentar parsear con cada formato soportado
                for fmt in formats:
                    try:
                        return datetime.strptime(clean_date_str, fmt).date()
                    except ValueError:
                        continue
                        
                # Si llegamos aquí, ningún método funcionó
                raise ValueError(f"No se pudo parsear la fecha: '{date_str}'")
                
            except Exception as fallback_error:
                print(f"DEBUG_DATE - Error también en fallback para '{date_str}': {str(fallback_error)}")
                # Último intento directo para fechas en formato estándar español DD/MM/YYYY
                try:
                    if separator and len(parts) == 3:
                        # Asumir formato español DD/MM/YYYY
                        day = int(parts[0])
                        month = int(parts[1])
                        year = int(parts[2])
                        
                        # Validaciones rápidas
                        if 1 <= day <= 31 and 1 <= month <= 12 and year >= 1900:
                            return date(year, month, day)
                except Exception as last_error:
                    print(f"DEBUG_DATE - Último intento fallido para '{date_str}': {str(last_error)}")
                
                # Si todo falló, lanzar error general
                raise ValueError(f"Unable to parse date string '{date_str}'")
    
    @staticmethod
    def to_db_format(date_val: Optional[Union[str, date, datetime]]) -> Optional[str]:
        """
        Convierte una fecha al formato de base de datos
        
        Args:
            date_val: Fecha como string, date o datetime
            
        Returns:
            str: Fecha en formato DB (YYYY-MM-DD)
            None: Si la entrada es None
            
        Raises:
            ValueError: Si el tipo de fecha no es soportado
        """
        if date_val is None:
            return None
            
        if isinstance(date_val, str):
            parsed = DateConverter.parse_date(date_val)
            return parsed.strftime(DATE_FORMAT_DB) if parsed else None
            
        if isinstance(date_val, datetime):
            date_val = date_val.date()
            
        if isinstance(date_val, date):
            return date_val.strftime(DATE_FORMAT_DB)
            
        raise ValueError(f"Tipo de fecha no soportado: {type(date_val)}")
    
    @staticmethod
    def get_display_format(date_val: Optional[Union[str, date, datetime]]) -> Optional[str]:
        """
        Convierte una fecha al formato de visualización
        
        Args:
            date_val: Fecha como string, date o datetime
            
        Returns:
            str: Fecha en formato ES (DD/MM/YYYY)
            None: Si la entrada es None
            
        Raises:
            ValueError: Si el tipo de fecha no es soportado
        """
        if date_val is None:
            return None
            
        if isinstance(date_val, str):
            parsed = DateConverter.parse_date(date_val)
            return parsed.strftime(DATE_FORMAT_ES) if parsed else None
            
        if isinstance(date_val, datetime):
            date_val = date_val.date()
            
        if isinstance(date_val, date):
            return date_val.strftime(DATE_FORMAT_ES)
            
        raise ValueError(f"Tipo de fecha no soportado: {type(date_val)}")

    @staticmethod
    def to_date(date_val: Optional[Union[str, date, datetime]]) -> Optional[date]:
        """
        Convierte un valor (string, date, datetime) a un objeto date
        
        Args:
            date_val: Fecha como string, date o datetime
            
        Returns:
            date: Objeto date
            None: Si la entrada es None
            
        Raises:
            ValueError: Si el formato no es reconocido o el tipo no es soportado
        """
        if date_val is None:
            return None
            
        if isinstance(date_val, str):
            return DateConverter.parse_date(date_val)
            
        if isinstance(date_val, datetime):
            return date_val.date()
            
        if isinstance(date_val, date):
            return date_val
            
        raise ValueError(f"Tipo de fecha no soportado: {type(date_val)}")
    
    @staticmethod
    def to_es_format(date_val: Optional[Union[str, date, datetime]]) -> Optional[str]:
        """
        Alias para get_display_format para mantener compatibilidad
        """
        return DateConverter.get_display_format(date_val)
    
    @staticmethod
    def format_date(date_val: Optional[Union[str, date, datetime]]) -> Optional[str]:
        """
        Alias para get_display_format para mantener compatibilidad con código existente
        que llama a DateConverter.format_date directamente
        """
        return DateConverter.get_display_format(date_val)
    
    @staticmethod
    def format_datetime(datetime_val: Optional[Union[str, date, datetime]]) -> Optional[str]:
        """
        Formatea un objeto datetime al formato de visualización DD/MM/YYYY HH:MM:SS
        
        Args:
            datetime_val: Valor datetime a formatear
            
        Returns:
            str: Datetime formateado en formato de visualización
            None: Si la entrada es None
        """
        if datetime_val is None:
            return None
            
        if isinstance(datetime_val, str):
            try:
                # Intentar parsear como datetime
                dt = datetime.fromisoformat(datetime_val.replace('Z', '+00:00'))
                return dt.strftime("%d/%m/%Y %H:%M:%S")
            except ValueError:
                # Si falla, intentar como fecha
                try:
                    parsed = DateConverter.parse_date(datetime_val)
                    if parsed:
                        return parsed.strftime("%d/%m/%Y")
                    return None
                except ValueError:
                    return datetime_val  # Devolver tal cual si no se puede parsear
            
        if isinstance(datetime_val, datetime):
            return datetime_val.strftime("%d/%m/%Y %H:%M:%S")
            
        if isinstance(datetime_val, date):
            return datetime_val.strftime("%d/%m/%Y")
            
        return str(datetime_val)


class DateField:
    """
    Clase para manejar campos de fecha en modelos
    """
    
    def validate(self, value):
        """
        Valida un valor de fecha
        
        Args:
            value: Valor a validar
            
        Returns:
            bool: True si es válido, False en caso contrario
        """
        try:
            if value is None:
                return True
                
            if isinstance(value, date):
                return True
                
            # Para strings, rechazar strings vacíos
            if isinstance(value, str):
                if not value:
                    return False
                DateConverter.parse_date(value)
                return True
                
            return False
        except ValueError:
            return False
    
    def to_python_value(self, value):
        """
        Convierte un valor a un objeto date
        
        Args:
            value: Valor a convertir
            
        Returns:
            date: Fecha convertida
            None: Si el valor es None o no se puede convertir
        """
        if value is None:
            return None
            
        if isinstance(value, date) and not isinstance(value, datetime):
            return value
            
        if isinstance(value, datetime):
            return value.date()
            
        if isinstance(value, str):
            return DateConverter.parse_date(value)
            
        return None
    
    def to_db_value(self, value):
        """
        Convierte un valor a formato de BD
        
        Args:
            value: Valor a convertir
            
        Returns:
            str: Fecha en formato de BD
            None: Si el valor es None
        """
        if value is None:
            return None
            
        return DateConverter.to_db_format(value)


# Alias para compatibilidad con tests existentes
DATE_FORMAT_API = DATE_FORMAT_ES

# Funciones alias para mantener compatibilidad con tests existentes
def parse_date(date_str: str) -> Optional[date]:
    """Alias para DateConverter.parse_date"""
    return DateConverter.parse_date(date_str)

def format_date(date_val: Optional[Union[str, date, datetime]]) -> Optional[str]:
    """Alias para DateConverter.get_display_format"""
    return DateConverter.get_display_format(date_val)


def is_valid_date(date_str: str) -> bool:
    """
    Valida si un string tiene un formato de fecha válido
    
    Args:
        date_str: String con la fecha a validar
        
    Returns:
        bool: True si el formato es válido, False en caso contrario
    """
    try:
        if not date_str:
            return False
            
        DateConverter.parse_date(date_str)
        return True
    except ValueError:
        return False