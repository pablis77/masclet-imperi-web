"""
Utilidades para tests de API.
Este archivo contiene funciones helper para facilitar los tests de API.
"""
from datetime import datetime, date, timedelta

def get_valid_test_date(days_in_past=30, format_string=None):
    """
    Genera una fecha válida en el pasado para usar en tests.
    
    Args:
        days_in_past: Número de días en el pasado (por defecto 30)
        format_string: Si se proporciona, devuelve la fecha como string en ese formato
                      Si no, devuelve un objeto date
    
    Returns:
        date o string: Fecha válida para tests
    """
    today = date.today()
    test_date = today - timedelta(days=days_in_past)
    
    if format_string:
        return test_date.strftime(format_string)
    return test_date

def assert_date_equals(date1, date2, format_string="%d/%m/%Y"):
    """
    Compara dos fechas independientemente de su formato.
    
    Args:
        date1: Primera fecha (string o date)
        date2: Segunda fecha (string o date)
        format_string: Formato a usar si las fechas son strings
        
    Returns:
        bool: True si las fechas son iguales
    """
    if isinstance(date1, str):
        date1 = datetime.strptime(date1, format_string).date()
    if isinstance(date2, str):
        date2 = datetime.strptime(date2, format_string).date()
        
    return date1 == date2
