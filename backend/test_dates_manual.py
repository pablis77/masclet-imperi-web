"""
Script manual para probar el manejo de fechas usando datos reales
"""
from datetime import datetime
import pandas as pd
from app.core.date_utils import (
    parse_date,
    format_date,
    validate_birth_date,
    validate_birth_parto,
    DATE_FORMAT_API,
    DATE_FORMAT_DB
)

def load_test_data():
    """Carga datos de prueba del CSV matriz_master"""
    try:
        df = pd.read_csv('matriz_master.csv')
        # Obtener el toro 1 y la vaca 20-36
        toro = df[df['nom'] == '1'].iloc[0]
        vaca = df[df['nom'] == '20-36'].iloc[0]
        return toro, vaca
    except Exception as e:
        print(f"Error cargando datos: {str(e)}")
        return None, None

def test_parse_date():
    """Prueba de parseado de fechas con datos reales"""
    toro, vaca = load_test_data()
    if not toro.empty and not vaca.empty:
        test_cases = [
            toro['dob'],      # Fecha nacimiento toro
            vaca['dob'],      # Fecha nacimiento vaca
            "32/13/2024",     # Fecha inválida
            "",               # Fecha vacía
        ]
    else:
        test_cases = [
            "01/01/2024",     # Fecha ejemplo
            "32/13/2024",     # Fecha inválida
            "",               # Fecha vacía
        ]
    
    print("\n=== Test Parse Date ===")
    for date_str in test_cases:
        result, error = parse_date(str(date_str))
        print(f"\nInput: {date_str}")
        print(f"Result: {result}")
        print(f"Error: {error}")

def test_validate_birth():
    """Prueba de validación de fechas de nacimiento"""
    toro, vaca = load_test_data()
    if not toro.empty and not vaca.empty:
        test_cases = [
            (toro['dob'], "Nacimiento toro 1"),
            (vaca['dob'], "Nacimiento vaca 20-36"),
            ("01/01/2025", "Fecha futura"),
            ("invalid", "Fecha inválida"),
        ]
    else:
        test_cases = [
            ("01/01/2024", "Fecha pasada"),
            ("01/01/2025", "Fecha futura"),
            ("invalid", "Fecha inválida"),
        ]
    
    print("\n=== Test Birth Date Validation ===")
    for date_str, desc in test_cases:
        error = validate_birth_date(str(date_str))
        print(f"\nCaso: {desc}")
        print(f"Input: {date_str}")
        print(f"Error: {error}")

def test_validate_parto():
    """Prueba de validación de fechas de parto usando datos reales"""
    toro, vaca = load_test_data()
    if not toro.empty and not vaca.empty:
        # Asumimos que la vaca tiene al menos un parto registrado
        test_cases = [
            # Usar fechas reales de la vaca 20-36
            ("01/06/2023", vaca['dob'], "Parto real de la vaca 20-36"),
            ("01/01/2024", toro['dob'], "Parto inválido para el toro"),
            ("01/01/2025", vaca['dob'], "Parto futuro"),
        ]
    else:
        test_cases = [
            ("01/01/2024", "01/01/2022", "Parto válido (animal tiene 2 años)"),
            ("01/01/2024", "01/06/2023", "Parto inválido (animal muy joven)"),
            ("01/01/2025", "01/01/2022", "Parto inválido (fecha futura)"),
        ]
    
    print("\n=== Test Parto Date Validation ===")
    for parto_date, birth_date, desc in test_cases:
        error = validate_birth_parto(str(parto_date), str(birth_date))
        print(f"\nCaso: {desc}")
        print(f"Parto: {parto_date}, Nacimiento: {birth_date}")
        print(f"Error: {error}")

if __name__ == "__main__":
    print("Probando con datos reales del CSV matriz_master...")
    test_parse_date()
    test_validate_birth()
    test_validate_parto()