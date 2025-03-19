# Pruebas de Fechas y Partos

## Casos de Prueba

### 1. Formatos de Fecha
- DD/MM/YYYY (formato español)
- YYYY-MM-DD (formato ISO)
- DD-MM-YYYY (formato alternativo)

### 2. Validaciones de Fecha

#### 2.1 Fechas Inválidas
```plaintext
- 31/02/2024    # Día inválido en febrero
- 00/03/2024    # Día cero
- 01/13/2024    # Mes inválido
- 01/00/2024    # Mes cero
- 01/01/1800    # Año muy antiguo
- 01/01/2100    # Año futuro lejano
```

#### 2.2 Casos Especiales
- Años bisiestos (29/02/2024)
- Cambios de mes/año
- Fechas futuras

### 3. Secuencias de Partos

#### 3.1 Casos Base
```plaintext
Ejemplo Real (vaca "20-36"):
19/12/2022 - Primer parto (esforrada/DEF)
17/11/2023 - Segundo parto (Mascle/OK)
```

#### 3.2 Casos Especiales
```plaintext
Ejemplo Real (vaca "20-50"):
23/02/2024 - Parto gemelar (dos Mascle/OK)
```

### 4. Importación de Datos

#### 4.1 Formatos en CSV
```csv
DOB;part
31/01/2020;19/12/2022
2020-01-31;2022-12-19
31-01-2020;19-12-2022
```

#### 4.2 Validaciones en Importación
- Fechas faltantes
- Formatos mezclados
- Orden cronológico

## Consideraciones Especiales

### 1. Validaciones Críticas

#### 1.1 Nacimiento vs Partos
- La fecha de nacimiento debe ser anterior a los partos
- Edad mínima para primer parto

#### 1.2 Secuencia de Partos
- Orden cronológico obligatorio
- Intervalo mínimo entre partos
- No fechas futuras

### 2. Casos del Mundo Real

#### 2.1 Vaca "R-32"
```plaintext
Historial Completo:
- DOB: 17/02/2018
- Partos:
  1. 28/11/2019 (Femella/OK)
  2. 05/02/2021 (Femella/OK)
  3. 28/02/2022 (Femella/OK)
  4. 10/02/2023 (Mascle/OK)
  5. 06/02/2024 (Femella/OK)
```

#### 2.2 Vaca "20-50"
```plaintext
Historial con Gemelos:
- DOB: 24/01/2020
- Partos:
  1. 28/02/2023 (Femella/OK)
  2. 23/02/2024 (Mascle/OK)
  3. 23/02/2024 (Mascle/OK)
```

### 3. Manejo de Errores

#### 3.1 Errores de Formato
```python
def validate_date_format(date_str: str) -> bool:
    """
    Validar formato de fecha:
    - DD/MM/YYYY
    - YYYY-MM-DD
    - DD-MM-YYYY
    """
    pass
```

#### 3.2 Errores de Lógica
```python
def validate_birth_parto_sequence(dob: date, parto_date: date) -> bool:
    """
    Validar que:
    1. DOB < parto_date
    2. Edad mínima para parto
    3. No fechas futuras
    """
    pass
```

## Cobertura de Pruebas

### 1. Tests Unitarios
- Validaciones de formato
- Conversiones de fecha
- Cálculos de intervalos

### 2. Tests de Integración
- Creación de animal con partos
- Importación de datos históricos
- Actualización de fechas

### 3. Tests End-to-End
- Flujo completo de registro
- Importación masiva
- Consultas y filtros

## Mejores Prácticas

### 1. Normalización
- Convertir todas las fechas a formato DD/MM/YYYY
- Validar antes de guardar
- Mantener coherencia en la BD

### 2. Performance
- Índices en campos de fecha
- Optimización de queries por rango
- Caché de cálculos frecuentes

### 3. Auditoría
- Logging de errores de fecha
- Registro de cambios en fechas
- Trazabilidad de correcciones

## Escenarios de Prueba Recomendados

1. **Creación Básica**
   - Animal sin partos
   - Animal con un parto
   - Animal con múltiples partos

2. **Validaciones**
   - Fechas inválidas
   - Secuencias incorrectas
   - Datos duplicados

3. **Importación**
   - CSV válido
   - CSV con errores
   - Datos históricos

4. **Consultas**
   - Filtros por fecha
   - Ordenamiento temporal
   - Estadísticas por período

5. **Actualizaciones**
   - Corrección de fechas
   - Adición de partos
   - Modificación de secuencias