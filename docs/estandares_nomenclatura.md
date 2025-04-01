# Estándares de Nomenclatura en Masclet Imperi Web

## Modelo de Explotaciones

### Campos y Significado

| Campo                | Tipo    | Descripción                                                         |
| -------------------- | ------- | -------------------------------------------------------------------- |
| **id**         | int     | ID técnico autogenerado por la base de datos. Uso interno.          |
| **nom**        | string  | Nombre de la explotación.                                           |
| **explotacio** | string  | Código/identificador de negocio de la explotación. Puede ser null. |
| **activa**     | boolean | Estado activo/inactivo de la explotación.                           |

### Reglas Importantes

- El campo `nom` es el **nombre** de la explotación
- El campo `explotacio` es un **código identificador** de la explotación (distinto del nombre)
- El `id` es un campo técnico para operaciones CRUD en la API

## Modelo de Animales

### Campos y Significado

| Campo                | Tipo         | Descripción                                                   |
| -------------------- | ------------ | -------------------------------------------------------------- |
| **id**         | int          | ID técnico autogenerado. Uso interno.                         |
| **nom**        | string       | Nombre del animal.                                             |
| **explotacio** | string       | Identificador de la explotación a la que pertenece el animal. |
| **genere**     | enum(M/F)    | Género del animal (M: toro, F: vaca).                         |
| **estado**     | enum(OK/DEF) | Estado del animal (OK: activo, DEF: fallecido).                |
| **alletar**    | enum(0,1,2)  | Estado de amamantamiento (sólo para vacas).                   |

### Reglas Importantes

- El campo `nom` se usa exclusivamente para el **nombre del animal**
- El campo `explotacio` hace referencia al código de explotación del registro correspondiente
- El campo `alletar` solo aplica a animales hembra (vacas)

## Modelo de Partos

### Campos y Significado

| Campo               | Tipo                | Descripción                                     |
| ------------------- | ------------------- | ------------------------------------------------ |
| **id**        | int                 | ID técnico autogenerado. Uso interno.           |
| **animal_id** | int                 | ID técnico del animal (vaca) asociado al parto. |
| **part**      | date                | Fecha del parto (formato DD/MM/YYYY).            |
| **GenereT**   | enum(M/F/esforrada) | Género de la cría.                             |
| **EstadoT**   | enum(OK/DEF)        | Estado de la cría.                              |

### Reglas Importantes

- Los partos **siempre** están asociados a una vaca (animal con genere='F')
- Los partos son registros históricos y **no pueden eliminarse**
- El `animal_id` es el ID técnico de la vaca, mientras que en la API se utiliza el nombre (`nom`) de la vaca

## Estándar general de identificadores

1. **ID técnico**: Todos los modelos tienen un `id` numérico autogenerado para operaciones CRUD
2. **Nombre descriptivo**:
   - Para animales: campo `nom`
   - Para explotaciones: campo `nom`
3. **Codigo de negocio**:
   - Para explotaciones: campo `explotacio`

## Endpoints

Los endpoints de la API usan el ID técnico para operaciones CRUD, pero internamente el sistema conoce la relación entre:

- El ID técnico de una explotación y su código de negocio (`explotacio`)
- El ID técnico de un animal y su nombre (`nom`)

Esto permite que el frontend muestre la información relevante para el usuario mientras se mantiene la integridad referencial interna.






## Reglas Correctas para Explotaciones: (Y PARA TODO EN GENERAL)

1. **Campo EXPLOTACIO** :

* Es el ÚNICO campo para identificar/nombrar la explotación
* NO debe ser null=True, debe ser obligatorio
* No existe ni debe existir un campo "descripcion"

1. **Campo NOM** :

* NO debe existir en explotaciones
* Solo está reservado para ANIMALES

1. **Campo ACTIVA** :

* NO está en las reglas de negocio
* Debe eliminarse completamente

1. **Campo ID** :

* Es solo un campo técnico para la base de datos
* No tiene significado de negocio
