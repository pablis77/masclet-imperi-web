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
            
        # Si no es un string, lanzar error
        if not isinstance(date_str, str):
            raise ValueError(f"Valor no es un string, date o datetime: {type(date_str)}")
            
        formats = [
            DATE_FORMAT_ES,
            DATE_FORMAT_DB,
            DATE_FORMAT_ISO,
            DATE_FORMAT_ALT1,
            DATE_FORMAT_ALT2
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue
                
        raise ValueError(
            f"Formato de fecha no válido. Formatos soportados: "
            f"{DATE_FORMAT_ES}, {DATE_FORMAT_DB}, {DATE_FORMAT_ALT1}, {DATE_FORMAT_ALT2}"
        )
    
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