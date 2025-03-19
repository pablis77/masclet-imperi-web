# Guía de Validación de Fechas

## 🔍 Herramientas Disponibles

### 1. Validador de Fechas
```batch
cd scripts
validate_dates.bat
```
Analiza todas las fechas en matriz_master.csv y reporta:
- Fechas inválidas
- Inconsistencias en secuencias de partos
- Advertencias sobre datos faltantes

### 2. Suite de Pruebas
```batch
cd backend
run_tests.bat
```
Ejecuta todas las pruebas con énfasis especial en fechas.

## 📅 Reglas de Validación

### Fechas de Nacimiento
- No pueden ser futuras
- No pueden ser anteriores a 1900
- Formato: DD/MM/YYYY, YYYY-MM-DD, o DD-MM-YYYY

### Fechas de Parto
- Debe haber al menos 2 años desde el nacimiento
- Mínimo 9 meses entre partos
- Orden cronológico obligatorio
- No pueden ser futuras

## 🚀 Uso Rápido

### 1. Validar CSV Existente
```batch
# Desde la carpeta scripts
validate_dates.bat
```

### 2. Ejecutar Tests de Fecha
```batch
# Desde la carpeta raíz
cd backend
pytest tests/test_date_utils.py -v
pytest tests/test_dates_and_partos.py -v
pytest tests/integration/test_date_integration.py -v
```

### 3. Verificar Cobertura
```batch
# Desde la carpeta backend
pytest --cov=app.core.date_utils --cov-report=html tests/
```

## 📋 Casos de Prueba Incluidos

### 1. Formatos de Fecha
```python
# Válidos
"31/12/2024"    # Español
"2024-12-31"    # ISO
"31-12-2024"    # Alternativo

# Inválidos
"31/02/2024"    # Día inválido
"2024/31/12"    # Formato incorrecto
"abc"           # No es fecha
```

### 2. Casos Especiales
```python
# Partos múltiples (mismo día)
fecha = "23/02/2024"
partos = [
    {"fecha": fecha, "genere_cria": "Mascle"},
    {"fecha": fecha, "genere_cria": "Mascle"}
]

# Años bisiestos
"29/02/2024"    # Válido
"29/02/2023"    # Inválido
```

### 3. Casos Reales
```python
# Vaca con historial completo
animal = {
    "nom": "R-32",
    "dob": "17/02/2018",
    "partos": [
        "28/11/2019",
        "05/02/2021",
        "28/02/2022",
        "10/02/2023",
        "06/02/2024"
    ]
}
```

## 🔧 Configuración

### pytest.ini
```ini
[date]
valid_formats = 
    DD/MM/YYYY
    YYYY-MM-DD
    DD-MM-YYYY

min_year = 1900
max_year = 2100
min_parto_interval = 270
min_age_first_parto = 2
```

## 📊 Reportes

### 1. Reporte de Validación
```plaintext
=== Resultados de Validación de Fechas ===
Total de filas procesadas: XXX
Fechas válidas: XXX
Fechas inválidas: XXX

=== Errores Encontrados ===
Fila X - Animal: XXX
Error: [Descripción del error]
```

### 2. Reporte de Cobertura
- Ver htmlcov/index.html para detalles
- Mínimo requerido: 90% cobertura en date_utils.py

## ❗ Resolución de Problemas

### 1. Errores Comunes
- Formatos de fecha mezclados
- Partos sin fecha de nacimiento
- Secuencias incorrectas de partos

### 2. Soluciones
```python
# Convertir formatos
from app.core.date_utils import parse_date, format_date
fecha_estandar = format_date(parse_date(fecha_original))

# Validar secuencia
from app.core.date_utils import validate_parto_date
validate_parto_date(nueva_fecha, birth_date, last_parto)
```

## 📚 Recursos Adicionales

- [Documentación de Tests](../tests/docs/date_testing.md)
- [Configuración de Pytest](../pytest.ini)
- [Ejemplos de Uso](../tests/test_date_utils.py)

## 🤝 Contribuir

1. Añadir nuevos casos de prueba en test_date_utils.py
2. Actualizar documentación si se añaden nuevas reglas
3. Mantener cobertura de pruebas >90%
4. Seguir el estándar de formato de código