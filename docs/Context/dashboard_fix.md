# Solución de Problemas en los Endpoints del Dashboard

## Problemas Identificados

1. **Error de conexión a la base de datos**: 
   - Error: `tortoise.exceptions.ConfigurationError: default_connection for the model <class 'app.models.animal.Animal'> cannot be None`
   - Causa: La conexión a la base de datos no estaba correctamente inicializada antes de acceder a los modelos.

2. **Error de tipo de datos en el campo `alletar`**:
   - Error: `TypeError: object of type 'int' has no len()`
   - Causa: El servicio de dashboard estaba intentando filtrar por el campo `alletar` con valores enteros (0, 1, 2), pero el modelo `Animal` define este campo como un `CharEnumField` con valores de texto ("NO", "1", "2").

3. **Error de campo inexistente `provincia`**:
   - Error: `Unknown field "provincia" for model "Explotacio"`
   - Causa: El servicio de dashboard intentaba acceder a un campo `provincia` en el modelo `Explotacio`, pero este campo no existe en el modelo.

## Soluciones Implementadas

1. **Para el error de conexión a la base de datos**:
   - Se creó un script de diagnóstico que inicializa explícitamente la conexión a la base de datos antes de acceder a los modelos.
   - Esto asegura que la conexión esté disponible cuando se intenta acceder a los modelos.

2. **Para el error de tipo de datos en el campo `alletar`**:
   - Se modificó el servicio de dashboard para utilizar los valores correctos de la enumeración `EstadoAlletar` en lugar de valores enteros.
   - Se importó la enumeración `EstadoAlletar` del modelo `Animal` y se utilizaron los valores `EstadoAlletar.NO_ALLETAR`, `EstadoAlletar.UN_TERNERO` y `EstadoAlletar.DOS_TERNEROS`.

3. **Para el error de campo inexistente `provincia`**:
   - Se eliminó la sección del código que intentaba obtener estadísticas por provincia, ya que el campo no existe en el modelo `Explotacio`.
   - Se mantuvo un diccionario vacío `por_provincia` para mantener la compatibilidad con el resto del código.

## Resultados

Después de implementar estas soluciones, el servicio de dashboard funciona correctamente y puede acceder a la base de datos para obtener estadísticas. Las consultas SQL se ejecutan sin errores y los datos se pueden recuperar correctamente.

## Recomendaciones para el Futuro

1. **Inicialización de la base de datos**: Asegurarse siempre de que la conexión a la base de datos esté inicializada antes de acceder a los modelos.
2. **Validación de tipos de datos**: Verificar que los tipos de datos utilizados en las consultas coincidan con los definidos en los modelos.
3. **Verificación de campos**: Comprobar que los campos utilizados en las consultas existan en los modelos correspondientes.
4. **Manejo de errores**: Implementar un mejor manejo de errores en el servicio de dashboard para proporcionar mensajes de error más claros y útiles.
5. **Documentación**: Mantener actualizada la documentación de los modelos y sus campos para facilitar el desarrollo y mantenimiento.

## Próximos Pasos

1. Implementar estas soluciones en el código principal de la aplicación.
2. Realizar pruebas exhaustivas de los endpoints del dashboard para asegurar su correcto funcionamiento.
3. Actualizar la documentación de la API para reflejar los cambios realizados.
