#!/usr/bin/env python
"""
Script para validar fechas en matriz_master.csv
"""

import csv
import sys
from datetime import datetime, date
from pathlib import Path
from typing import Dict, List, Tuple

# Añadir el directorio raíz al path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.date_utils import (
    parse_date,
    validate_date_range,
    validate_birth_date,
    validate_parto_date,
    DateError
)

def validate_file(csv_path: Path) -> Tuple[bool, Dict]:
    """
    Valida todas las fechas en el archivo CSV.
    
    Returns:
        Tuple[bool, Dict]: (éxito, resultados)
    """
    results = {
        "total_rows": 0,
        "valid_dates": 0,
        "invalid_dates": 0,
        "errors": [],
        "warnings": []
    }
    
    try:
        with open(csv_path, encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=';')
            
            # Validar por animal
            current_animal = None
            animal_partos: List[date] = []
            
            for i, row in enumerate(reader, 1):
                results["total_rows"] += 1
                
                try:
                    # Validar fecha de nacimiento
                    if row["DOB"]:
                        dob = parse_date(row["DOB"])
                        validate_birth_date(dob)
                    
                    # Validar fecha de parto si existe
                    if row["part"]:
                        parto_date = parse_date(row["part"])
                        
                        # Si es un nuevo animal
                        if current_animal != row["NOM"]:
                            current_animal = row["NOM"]
                            animal_partos = []
                        
                        # Validar parto
                        if row["DOB"]:
                            validate_parto_date(
                                parto_date,
                                birth_date=parse_date(row["DOB"]),
                                last_parto=animal_partos[-1] if animal_partos else None
                            )
                        
                        animal_partos.append(parto_date)
                    
                    results["valid_dates"] += 1
                    
                except DateError as e:
                    results["invalid_dates"] += 1
                    results["errors"].append({
                        "row": i,
                        "animal": row["NOM"],
                        "error": str(e),
                        "fecha_nacimiento": row["DOB"],
                        "fecha_parto": row.get("part", "")
                    })
                
                # Advertencias
                if row["part"] and not row["DOB"]:
                    results["warnings"].append({
                        "row": i,
                        "animal": row["NOM"],
                        "warning": "Parto sin fecha de nacimiento registrada"
                    })
    
    except Exception as e:
        results["errors"].append({
            "row": 0,
            "error": f"Error al procesar archivo: {str(e)}"
        })
        return False, results
    
    return len(results["errors"]) == 0, results

def print_results(results: Dict) -> None:
    """Imprime los resultados del análisis"""
    print("\n=== Resultados de Validación de Fechas ===")
    print(f"Total de filas procesadas: {results['total_rows']}")
    print(f"Fechas válidas: {results['valid_dates']}")
    print(f"Fechas inválidas: {results['invalid_dates']}")
    
    if results["errors"]:
        print("\n=== Errores Encontrados ===")
        for error in results["errors"]:
            print(f"\nFila {error['row']} - Animal: {error['animal']}")
            print(f"Error: {error['error']}")
            if "fecha_nacimiento" in error:
                print(f"Fecha nacimiento: {error['fecha_nacimiento']}")
            if "fecha_parto" in error:
                print(f"Fecha parto: {error['fecha_parto']}")
    
    if results["warnings"]:
        print("\n=== Advertencias ===")
        for warning in results["warnings"]:
            print(f"\nFila {warning['row']} - Animal: {warning['animal']}")
            print(f"Advertencia: {warning['warning']}")

def main():
    """Función principal"""
    # Ruta al archivo matriz_master.csv
    csv_path = Path(__file__).parent.parent / "database" / "matriz_master.csv"
    
    if not csv_path.exists():
        print(f"Error: No se encuentra el archivo {csv_path}")
        sys.exit(1)
    
    print(f"Validando fechas en {csv_path}...")
    success, results = validate_file(csv_path)
    
    print_results(results)
    
    if not success:
        print("\n❌ Se encontraron errores en las fechas")
        sys.exit(1)
    else:
        print("\n✅ Todas las fechas son válidas")
        sys.exit(0)

if __name__ == "__main__":
    main()