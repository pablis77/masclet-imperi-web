"""
Validaciones compartidas para la API
"""

VALIDATIONS = {
    "required_fields": ["explotacio", "nom", "genere", "estado"],
    "date_formats": ["DD/MM/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"],
    "encoding_options": ["utf-8", "latin-1", "cp1252"],
    "max_file_size": 10 * 1024 * 1024,  # 10MB
    "valid_genere": ["M", "F"],
    "valid_estado": ["OK", "DEF"],
    "valid_alletar": ["si", "no"]
}

def validate_animal_data(data: dict, row_index: int = None) -> list:
    """
    Valida los datos de un animal
    Args:
        data: Diccionario con los datos del animal
        row_index: Índice de la fila (para mensajes de error en imports)
    Returns:
        Lista de errores encontrados
    """
    errors = []
    prefix = f"Fila {row_index}: " if row_index is not None else ""
    
    # Validar campos requeridos
    for field in VALIDATIONS["required_fields"]:
        if field not in data or not data[field]:
            errors.append(f"{prefix}Campo requerido '{field}' faltante")
            
    # Validar género
    if "genere" in data and data["genere"]:
        if data["genere"] not in VALIDATIONS["valid_genere"]:
            errors.append(f"{prefix}Género inválido '{data['genere']}'")
            
    # Validar estado
    if "estado" in data and data["estado"]:
        if data["estado"] not in VALIDATIONS["valid_estado"]:
            errors.append(f"{prefix}Estado inválido '{data['estado']}'")
            
    # Validar alletar
    if "alletar" in data and data["alletar"] and isinstance(data["alletar"], str):
        if data["alletar"].lower() not in VALIDATIONS["valid_alletar"]:
            errors.append(f"{prefix}Alletar inválido '{data['alletar']}'")
            
    return errors