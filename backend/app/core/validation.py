from typing import Dict, List
from datetime import datetime

# From 1_contexto_proyecto_base.md
MODEL_VALIDATION = {
    "Animal": {
        "required_fields": ["explotacio", "nom", "genere", "estado"],
        "max_lengths": {
            "explotacio": 255,
            "nom": 255,
            "pare": 100,
            "mare": 100,
            "quadra": 100,
            "cod": 20,
            "num_serie": 50
        },
        "enums": {
            "genere": ["M", "F"],
            "estado": ["OK", "DEF"]
        }
    },
    "Part": {
        "required_fields": ["animal_id", "data", "genere_fill", "numero_part"],
        "enums": {
            "genere_fill": ["M", "F", "esforrada"],
            "estat_fill": ["OK", "DEF"]
        }
    }
}