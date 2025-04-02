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

## mas reglas del programa

1. Sobre los nombres de campos y el estándar
El cambio de data_naixement a dob en los tests resalta la importancia de mantener una nomenclatura estándar en todo el sistema. La implicación principal es que:

Todos los componentes del sistema (backend, frontend, importación) deben usar consistentemente dob en lugar de data_naixement
Cualquier código existente que use data_naixement debe ser actualizado para cumplir con los estándares de nomenclatura documentados
2. Sobre el manejo de duplicados
El uso de timestamps en los nombres de animales para evitar duplicados indica que:

El sistema debe tener mecanismos robustos para evitar duplicados en importaciones repetidas
La generación de identificadores únicos debería ser parte de la lógica de negocio del sistema
Sería recomendable implementar validaciones que detecten duplicados antes de intentar insertarlos
3. Sobre el manejo de estados
Al hacer la comprobación de estados insensible a mayúsculas y añadir "FAILED" como estado válido:

El sistema debe manejar consistentemente los estados de importación (debe decidirse si se usarán mayúsculas o minúsculas)
La enumeración ImportStatus debe incluir todos los estados posibles (PENDING, PROCESSING, COMPLETED, FAILED)
El frontend debe estar preparado para manejar todos estos estados posibles
4. Sobre la validación de partos
El asegurar que no hay campos de partos a medias (con fecha pero sin géneros o estados) indica que:

El sistema debe validar que si se proporciona una fecha de parto, también deben proporcionarse los campos GenereT y EstadoT
Se requiere una validación condicional: si part tiene valor, entonces GenereT y EstadoT no pueden ser nulos
Los formularios en el frontend deberían reflejar esta lógica, haciendo obligatorios estos campos cuando se introduce una fecha de parto
5. Sobre el manejo de datos vacíos
Los cambios en test_import_with_empty_fields destacan que:

El sistema debe ser robusto ante datos faltantes en campos no obligatorios
Los campos obligatorios deben estar claramente identificados y validados
Es importante que la aplicación funcione correctamente en entornos de campo donde puede ser difícil completar todos los datos
6. Sobre el flujo de trabajo de importación
Los tests revelan un proceso de importación en múltiples pasos:

El sistema permite primero subir un archivo CSV
Luego procesa los registros uno por uno, pudiendo completar algunos y fallar en otros
El resultado de la importación debe proporcionar información clara sobre los éxitos y errores
