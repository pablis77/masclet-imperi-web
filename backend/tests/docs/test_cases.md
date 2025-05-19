# Casos de Prueba Basados en Datos Reales

## 1. Casos Principales

### 1.1 Toro "1" - Caso Base
```csv
Alletar;explotació;NOM;Genere;Pare;Mare;Quadra;COD;Nº Serie;DOB;Estado
;Gurans;1;M;;;Riera;7892;ES07090513;31/01/2020;OK
```
**Características a Probar:**
- Identificador numérico simple
- Ubicación específica (Riera)
- Sin partos (por ser macho)
- Campos parentales vacíos

### 1.2 Vaca "20-36" - Caso con Partos Mixtos
```csv
no;Gurans;20-36;F;Xero;11-03;;6350;ES02090513;02/03/2020;OK;19/12/2022;esforrada;DEF
no;Gurans;20-36;F;Xero;11-03;;6350;ES02090513;02/03/2020;OK;17/11/2023;Mascle;OK
```
**Características a Probar:**
- Múltiples partos
- Diferentes resultados de parto
- Genealogía completa
- Estado alletar cambiante

### 1.3 Vaca "R-32" - Caso Historial Extenso
```csv
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;28/11/2019;Femella;OK
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;05/02/2021;Femella;OK
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;28/02/2022;Femella;OK
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;10/02/2023;Mascle;OK
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;06/02/2024;Femella;OK
```
**Características a Probar:**
- Historial largo de partos
- Consistencia en datos repetidos
- Secuencia temporal extensa
- Variación en género de crías

## 2. Escenarios de Validación

### 2.1 Validaciones de Identificación
- **Formatos Válidos:**
  - Numérico simple: "1", "46", "51"
  - Compuesto numérico: "20-36", "20-50"
  - Alfanumérico: "R-32", "E6", "K-75"

### 2.2 Validaciones de Partos
- **Reglas Temporales:**
  - Orden cronológico obligatorio
  - No fechas futuras
  - Intervalo mínimo entre partos

- **Estados de Cría:**
  - OK: Cría viva
  - DEF: Cría fallecida
  - esforrada: Parto problemático

### 2.3 Validaciones de Estado alletar
- **Reglas:**
  - Solo aplicable a hembras
  - Actualización automática post-parto
  - Cambio manual permitido

## 3. Casos Especiales

### 3.1 Animal con Estado DEF
```csv
;Guadalajara;Pablo;M;alfonso;Emma;Martinez;4785;es1123456987;09/03/1977;DEF
```
**Características a Probar:**
- Estado definitivo
- No permite modificaciones
- Mantiene historial

### 3.2 Vaca con Partos Múltiples Mismo Día
```csv
no;Gurans;20-50;F;Xero;83;;8461;ES04090513;24/01/2020;OK;23/02/2024;Mascle;OK
no;Gurans;20-50;F;Xero;83;;8461;ES04090513;24/01/2020;OK;23/02/2024;Mascle;OK
```
**Características a Probar:**
- Gemelos/múltiples
- Consistencia de datos
- Numeración de partos

### 3.3 Animal sin Campos Opcionales
```csv
no;Gurans;23-04;F;;;;;;;OK
```
**Características a Probar:**
- Campos nulos permitidos
- Validaciones mínimas
- Funcionamiento básico

## 4. Escenarios de Importación

### 4.1 Validaciones de CSV
- Codificación UTF-8
- Separador punto y coma (;)
- Campos obligatorios presentes
- Manejo de campos vacíos

### 4.2 Detección de Duplicados
- Por número de serie
- Por código interno
- Por combinación de campos

### 4.3 Actualización de Registros
- Merge de datos existentes
- Preservación de historial
- Resolución de conflictos

## 5. Pruebas de Rendimiento

### 5.1 Carga de Datos
- Importación masiva
- Actualización en lote
- Gestión de memoria

### 5.2 Consultas Complejas
- Filtrado por explotación
- Estadísticas de partos
- Historial completo

## 6. Matriz de Pruebas

| Escenario | Datos de Entrada | Resultado Esperado | Validaciones |
|-----------|------------------|-------------------|--------------|
| Toro Simple | 1,M,Gurans | Creación exitosa | Sin partos |
| Vaca con Partos | 20-36,F,2 partos | Historial correcto | Alletar actualizado |
| Estado DEF | Pablo,M,DEF | No modificable | Historial preservado |
| Partos Múltiples | 20-50,F,misma fecha | Numeración correcta | Orden preservado |
| Sin Opcionales | 23-04,F | Datos mínimos | Funcional básico |

## 7. Pruebas de Integración

### 7.1 Flujos Completos
- Creación → Partos → Actualización
- Importación → Validación → Corrección
- Consulta → Filtrado → Exportación

### 7.2 Consistencia de Datos
- Relaciones parentales
- Historial de partos
- Estados y transiciones