# Patrones de Datos en Masclet Imperi

## 1. Sistemas de Identificación

### 1.1 Patrones de Numeración

#### Serie 20-XX
- Prefijo "20-" posiblemente indica año 2020
- Numeración secuencial: 20-36, 20-50, 20-51, 20-64
- Usado principalmente en Gurans
- Asociado a registro genealógico completo

#### Serie Simple
- Números individuales: 1, 46, 47, 51
- Típicamente para toros o animales más antiguos
- Menos información genealógica

#### Serie Alfanumérica
- Formato letra-número: R-32, E6, K-75
- Variable en longitud y estructura
- Posible sistema heredado o externo

### 1.2 Códigos Oficiales
- Formato: ESXXXXXXXXX
- Longitud variable pero consistente por explotación
- Más completo en registros recientes

## 2. Patrones de Partos

### 2.1 Partos Múltiples
```csv
no;Gurans;20-50;F;Xero;83;;8461;ES04090513;24/01/2020;OK;23/02/2024;Mascle;OK
no;Gurans;20-50;F;Xero;83;;8461;ES04090513;24/01/2020;OK;23/02/2024;Mascle;OK
```
- Mismo animal, misma fecha
- Mismas características de cría
- Posibles gemelos o error de registro

### 2.2 Secuencia Temporal
```csv
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;28/11/2019;Femella;OK
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;05/02/2021;Femella;OK
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;28/02/2022;Femella;OK
```
- Intervalos regulares entre partos
- Patrón estacional visible
- Consistencia en registro

## 3. Gestión de Datos Vacíos

### 3.1 Patrones de Campos Nulos
- **Alletar**: Vacío en machos, "si"/"no" en hembras
- **Pare/Mare**: Completo en animales nuevos, vacío en antiguos
- **Quadra**: Más común en Gurans que otras explotaciones
- **Nº Serie**: Consistente en registros nuevos, variable en antiguos

### 3.2 Campos Opcionales vs Requeridos
```plaintext
Requeridos (100% completitud):
- explotació
- NOM
- Genere
- Estado

Variables (% completitud):
- Alletar (~90%)
- Pare/Mare (~70%)
- Quadra (~65%)
- COD (~80%)
- Nº Serie (~75%)
- DOB (~75%)
```

## 4. Peculiaridades por Explotación

### 4.1 Gurans
- Sistema de numeración estructurado
- Alto % de registro de partos
- Datos genealógicos completos en series 20-XX

### 4.2 Guadalajara
- Uso de nombres propios
- Registro familiar más detallado
- Menor frecuencia de partos registrados

### 4.3 Madrid
- Mezcla de sistemas de identificación
- Datos más básicos
- Menos historial de partos

## 5. Recomendaciones para Importación

### 5.1 Validaciones Críticas
- Verificar unicidad de códigos oficiales
- Validar fechas de partos secuenciales
- Comprobar consistencia en datos repetidos

### 5.2 Transformaciones Necesarias
- Normalización de identificadores
- Estandarización de formatos de fecha
- Unificación de valores vacíos

### 5.3 Reglas de Negocio
- Preservar historial de partos completo
- Mantener relaciones genealógicas
- Respetar restricciones de género en partos

## 6. Consideraciones de Calidad de Datos

### 6.1 Integridad
- Verificar referencias cruzadas
- Validar secuencias temporales
- Comprobar consistencia de estados

### 6.2 Completitud
- Priorizar campos obligatorios
- Flexibilidad en campos opcionales
- Documentar datos faltantes

### 6.3 Consistencia
- Estandarizar formatos
- Normalizar valores
- Unificar nomenclatura

## 7. Mejoras Propuestas

### 7.1 Estructura de Datos
- Implementar validación de códigos oficiales
- Añadir timestamps de modificación
- Mejorar trazabilidad de cambios

### 7.2 Procesos
- Validación en tiempo real
- Detección de duplicados
- Logging detallado de importación

### 7.3 Calidad
- Métricas de completitud
- Reportes de inconsistencias
- Seguimiento de correcciones