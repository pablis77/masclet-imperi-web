# Estructura del Proyecto Masclet Imperi

## 1. Organización de Carpetas

### Backend (Núcleo)
```
backend/
├── app/
│   ├── api/          # FastAPI endpoints
│   ├── models/       # Modelos Tortoise ORM
│   ├── schemas/      # Esquemas Pydantic
│   ├── core/         # Configuraciones
│   ├── services/     # Lógica de negocio
│   └── utils/        # Utilidades
├── tests/           # Tests organizados por nivel
└── database/        # Datos y migraciones
```

### Infraestructura
```
docker/
├── api/            # Dockerfile para FastAPI
├── postgres/       # Configuración PostgreSQL
└── scripts/        # Scripts de mantenimiento
```

## 2. Patrones de Datos Reales

### Tipos de Animales
1. **Toros** (M)
   - Identificación simple: "1"
   - Sin historial de partos
   - Datos mínimos requeridos

2. **Vacas** (F)
   - Identificación compleja: "20-36", "R-32"
   - Historial de partos
   - Estados alletar

### Patrones de Identificación
- **Numérica Simple**: 1, 46, 51
- **Compuesta**: 20-36, 20-50, 20-51
- **Alfanumérica**: R-32, E6, K-75

### Explotaciones
1. **Gurans**
   - Mayor número de registros
   - Sistema de numeración estructurado
   - Registro detallado de partos

2. **Guadalajara**
   - Datos más completos de genealogía
   - Nombres propios en lugar de códigos

3. **Madrid**
   - Menor cantidad de registros
   - Formato similar a Guadalajara

## 3. Modelos de Datos

### Animal
```python
class Animal(models.Model):
    explotacio: str
    nom: str
    genere: Enum(M/F)
    estado: Enum(OK/DEF)
    alletar: Optional[bool]
    # Campos opcionales
    pare: Optional[str]
    mare: Optional[str]
    quadra: Optional[str]
    cod: Optional[str]
    num_serie: Optional[str]
    dob: Optional[date]
```

### Parto
```python
class Part(models.Model):
    animal: ForeignKey[Animal]
    fecha: date
    genere_cria: Enum(Mascle/Femella/esforrada)
    estado_cria: Enum(OK/DEF)
    numero_parto: int
```

## 4. Patrones de Validación

### Reglas de Negocio
1. Partos
   - Solo animales género F
   - Orden cronológico
   - Actualiza estado alletar

2. Códigos
   - Formato ES + números para num_serie
   - COD único cuando existe
   - Secuencial por explotación

3. Estados
   - DEF es permanente
   - Alletar solo para género F
   - OK/DEF para estado_cria

## 5. Casos de Prueba Reales

### Caso 1: Toro Simple
```csv
Alletar;explotació;NOM;Genere;Pare;Mare;Quadra;COD;Nº Serie;DOB;Estado
;Gurans;1;M;;;Riera;7892;ES07090513;31/01/2020;OK
```

### Caso 2: Vaca con Partos
```csv
Alletar;explotació;NOM;Genere;Pare;Mare;COD;Nº Serie;DOB;Estado;part;GenereT;EstadoT
no;Gurans;20-36;F;Xero;11-03;6350;ES02090513;02/03/2020;OK;19/12/2022;esforrada;DEF
no;Gurans;20-36;F;Xero;11-03;6350;ES02090513;02/03/2020;OK;17/11/2023;Mascle;OK
```

### Caso 3: Vaca con Historial Extenso
```csv
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;28/11/2019;Femella;OK
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;05/02/2021;Femella;OK
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;28/02/2022;Femella;OK
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;10/02/2023;Mascle;OK
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;06/02/2024;Femella;OK
```

## 6. Tests y Validación

### Niveles de Testing
1. **Unit Tests**
   - Modelos individuales
   - Funciones de utilidad
   - Validadores

2. **Integration Tests**
   - Flujos completos
   - Interacción entre modelos
   - Operaciones DB

3. **E2E Tests**
   - APIs completas
   - Importación de datos
   - Casos reales

### Fixtures y Data
- CSV reales para importación
- Casos de borde específicos
- Datos históricos validados

## 7. Consideraciones de Rendimiento

### Base de Datos
- Índices específicos por explotación
- Optimización de queries de partos
- Gestión eficiente de null values

### API
- Paginación en listados
- Caché para datos estáticos
- Validaciones optimizadas