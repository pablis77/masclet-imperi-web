# Tests de Masclet Imperi

## Estructura de Tests

```
tests/
├── assets/                    # Archivos de datos para pruebas
│   ├── test_real_cases.csv   # Datos basados en casos reales
│   └── test_import.csv       # Datos de prueba genéricos
├── test_real_cases.py        # Tests basados en casos reales
├── test_animals_api.py       # Tests generales de la API de animales
└── test_imports_sync.py      # Tests de importación
```

## Casos de Prueba Reales

Los tests utilizan casos reales extraídos del sistema original:

### Caso 1: Toro Simple
- **Nombre**: "1"
- **Características**: Toro sin partos ni relaciones
- **Pruebas**: Validaciones básicas de CRUD

### Caso 2: Vaca con Múltiples Partos
- **Nombre**: "20-36"
- **Características**: 
  - 3 partos registrados
  - Estado alletar activo
  - Partos con diferentes resultados (OK/DEF)
- **Pruebas**: 
  - Gestión de partos
  - Actualización de estado alletar
  - Validaciones temporales

## Ejecución de Tests

### Windows
```bash
# Ejecutar usando el script batch
.\run_tests.bat

# O ejecutar directamente con pytest
pytest tests\test_real_cases.py -v
```

### Configuración de Entorno
Los tests utilizan:
- Base de datos SQLite en memoria
- Variables de entorno específicas para testing
- Fixtures de pytest para gestión de recursos

## Dependencias

```toml
[dev-dependencies]
pytest = "^7.4.0"
pytest-asyncio = "^0.21.1"
httpx = "^0.24.1"
```

## Notas de Implementación

### Base de Datos
- Los tests utilizan SQLite en memoria para mayor velocidad
- Cada test inicia con una base de datos limpia
- Los datos se cargan desde CSVs en /assets

### Validaciones Específicas
- Control de fechas de parto (orden cronológico)
- Validación de género para partos (solo hembras)
- Estado alletar actualizado automáticamente

### Estructura de Datos
Los archivos CSV siguen el formato:
```csv
Alletar;explotació;NOM;Genere;Pare;Mare;Quadra;COD;Nº Serie;DOB;Estado;part;GenereT;EstadoT
```

### Codificación
- Archivos CSV en UTF-8
- Separador de campos: punto y coma (;)
- Fechas en formato DD/MM/YYYY