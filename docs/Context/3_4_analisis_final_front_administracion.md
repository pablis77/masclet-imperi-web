# Análisis Exhaustivo del Frontend - Administración

## Introducción
Este documento detalla el análisis del módulo de administración, que incluye la gestión de usuarios, administración general y backups. Se identifican funcionalidades existentes, problemas detectados y próximos pasos para optimizar el sistema.

---

## Módulo: Gestión de Usuarios

### Funcionalidades Existentes

1. **Listado de Usuarios**:
   - Muestra una tabla con los usuarios registrados.
   - Incluye columnas para nombre, rol, estado y acciones.

2. **Creación de Usuarios**:
   - Formulario para registrar nuevos usuarios.
   - Campos obligatorios: nombre, correo electrónico, rol y contraseña.

3. **Edición de Usuarios**:
   - Permite modificar datos de usuarios existentes.
   - Incluye validaciones para evitar duplicados.

4. **Eliminación de Usuarios**:
   - Soft delete para desactivar usuarios en lugar de eliminarlos permanentemente.

### Requisitos de Roles y Permisos

1. **Roles Disponibles**:
   - **ADMINISTRADOR**:
     - Acceso completo a toda la aplicación.
     - No puede ser eliminado.
   - **GERENTE**:
     - Acceso a toda la aplicación excepto a Importación y Backups.
     - Acceso total al módulo de Usuarios.
   - **EDITOR**:
     - Acceso a Dashboard, Explotaciones y Animales.
     - En Animales, solo puede consultar y actualizar datos, pero no crear nuevas fichas.
   - **USUARIO**:
     - Acceso a Dashboard y Explotaciones.
     - En Animales, solo puede consultar datos.

2. **Restricciones**:
   - Solo el ADMINISTRADOR tiene acceso a todo lo relacionado con administración.
   - El GERENTE puede gestionar usuarios, pero no tiene acceso a Importación ni Backups.
   - El ADMINISTRADOR no puede ser eliminado.

### Funcionalidades Faltantes o Mejorables

1. **Ventana de Gestión de Usuarios**:
   - Mostrar los usuarios existentes en una tabla.
   - Permitir editar datos como nombre, correo, teléfono, contraseña y rol.
   - Crear nuevos usuarios con roles EDITOR y USUARIO.
   - Eliminar usuarios con roles EDITOR y USUARIO.

2. **Validaciones Avanzadas**:
   - Verificar que el correo electrónico sea único.
   - Validar la fortaleza de las contraseñas.

3. **Interfaz Intuitiva**:
   - Añadir filtros por rol y estado.
   - Mostrar mensajes de error claros y descriptivos.

### Próximos Pasos

1. **Implementar Roles y Permisos**:
   - Configurar el sistema para que respete las restricciones de acceso según el rol.
   - Asegurar que el ADMINISTRADOR no pueda ser eliminado.

2. **Diseñar la Ventana de Gestión de Usuarios**:
   - Crear una tabla interactiva para listar usuarios.
   - Añadir formularios para crear y editar usuarios.

3. **Validar Datos**:
   - Implementar validaciones para correos únicos y contraseñas seguras.

---

## Módulo: Administración General

### Funcionalidades Existentes

1. **Configuración del Sistema**:
   - Permite ajustar parámetros globales como idioma, zona horaria y formato de fecha.

2. **Monitorización**:
   - Muestra estadísticas básicas del sistema, como uso de memoria y CPU.

3. **Gestión de Logs**:
   - Acceso a registros de actividad y errores.

### Problemas Detectados

1. **Falta de Métricas Avanzadas**:
   - No se incluyen métricas clave como tiempo de respuesta de endpoints o uso de disco.

2. **Interfaz Poco Intuitiva**:
   - La navegación entre secciones no es clara.

3. **Gestión de Logs Limitada**:
   - No permite filtrar logs por tipo o rango de fechas.

### Próximos Pasos

1. **Añadir Métricas Avanzadas**:
   - Incluir gráficos de uso de recursos y tiempos de respuesta.

2. **Rediseñar la Interfaz**:
   - Mejorar la navegación y organización de secciones.

3. **Optimizar la Gestión de Logs**:
   - Permitir filtros avanzados y exportación de logs.

---

## Módulo: Backups

### Funcionalidades Existentes

1. **Creación de Backups**:
   - Permite generar copias de seguridad manualmente.

2. **Restauración de Backups**:
   - Opción para restaurar el sistema desde un archivo de backup.

3. **Programación de Backups**:
   - Configuración para realizar backups automáticos en horarios específicos.

### Problemas Detectados

1. **Falta de Notificaciones**:
   - No se informa al usuario si un backup programado falla.

2. **Interfaz Básica**:
   - No muestra detalles como tamaño del backup o tiempo estimado de restauración.

3. **Gestión de Espacio**:
   - No hay alertas cuando el espacio en disco es insuficiente para nuevos backups.

### Próximos Pasos

1. **Implementar Notificaciones**:
   - Enviar alertas por correo o en la interfaz cuando un backup falle.

2. **Mejorar la Interfaz**:
   - Mostrar detalles avanzados de los backups.

3. **Añadir Gestión de Espacio**:
   - Implementar alertas para espacio insuficiente y opciones para eliminar backups antiguos.

---

## Módulo: Importación

### Funcionalidades Existentes

1. **Descarga de Plantilla**:
   - Permite descargar un archivo CSV con los campos requeridos para la importación.

2. **Reiniciar Importación**:
   - Botón para reiniciar el proceso de importación en caso de errores.

3. **Importación de Archivos CSV**:
   - Dos botones disponibles para diferentes métodos de importación (pendiente de aclarar su diferencia).
   - Card para buscar o arrastrar el archivo CSV a importar.

4. **Historial de Importaciones**:
   - Muestra un listado de importaciones previas con detalles como fecha, estado y errores.

### Requisitos y Restricciones

1. **Plantilla de Importación**:
   - Debe incluir los campos del CSV principal (e.g., NOM, explotacio, genere, estado, etc.).

2. **Manejo de Datos Existentes**:
   - La importación no debe borrar datos existentes en la base de datos.
   - Si un nombre (NOM) ya existe, debe ser renombrado automáticamente (e.g., `NOM_1`, `NOM_2`, etc.).
   - Informar al usuario sobre los casos renombrados al finalizar la importación.

3. **Validaciones**:
   - Validar que el archivo CSV tenga el formato correcto antes de procesarlo.
   - Manejar errores de forma clara y mostrar mensajes descriptivos.

4. **Datos Simulados**:
   - Actualmente, los datos mostrados en el historial son simulados y deben conectarse a datos reales.

5. **Mensajes de Éxito y Error**:
   - Implementar popups modales para mostrar resultados de éxito o error, evitando redirecciones innecesarias.

### Funcionalidades Faltantes o Mejorables

1. **Unificar Métodos de Importación**:
   - Aclarar la diferencia entre los dos botones de importación o unificarlos en un único flujo.

2. **Validaciones Avanzadas**:
   - Verificar que los datos importados no generen conflictos en la base de datos.
   - Mostrar un resumen detallado de los errores encontrados.

3. **Interfaz Intuitiva**:
   - Mejorar la experiencia de usuario al arrastrar y soltar archivos.
   - Añadir indicadores visuales durante el proceso de importación.

### Próximos Pasos

1. **Conectar con Datos Reales**:
   - Integrar el historial de importaciones con datos reales de la base de datos.

2. **Diseñar Mensajes Modales**:
   - Implementar popups para mostrar resultados de éxito o error.

3. **Validar Plantilla**:
   - Asegurar que la plantilla descargable incluya todos los campos requeridos.

4. **Optimizar el Proceso de Importación**:
   - Unificar los métodos de importación y simplificar el flujo para el usuario.

---

## Conexión con Backend y Endpoints

### Endpoints Relacionados

1. **Usuarios**:
   - `GET /api/v1/auth/users`: Listado de usuarios.
   - `POST /api/v1/auth/register`: Crear nuevo usuario.
   - `PUT /api/v1/auth/users/{id}`: Actualizar usuario.
   - `DELETE /api/v1/auth/users/{id}`: Eliminar usuario.

2. **Administración**:
   - `GET /api/v1/admin/stats`: Estadísticas del sistema.
   - `GET /api/v1/admin/logs`: Obtener logs del sistema.

3. **Backups**:
   - `POST /api/v1/backups`: Crear backup.
   - `GET /api/v1/backups`: Listar backups.
   - `POST /api/v1/backups/restore`: Restaurar backup.

### Problemas Detectados en la Conexión

1. **Falta de Estandarización**:
   - Algunos endpoints no siguen el prefijo `/api/v1`.

2. **Respuestas Inconsistentes**:
   - Las estructuras de respuesta varían entre endpoints.

3. **Falta de Seguridad**:
   - No todos los endpoints verifican roles y permisos correctamente.

### Próximos Pasos

1. **Estandarizar Endpoints**:
   - Asegurar que todos los endpoints sigan el prefijo `/api/v1`.

2. **Unificar Respuestas**:
   - Definir una estructura estándar para todas las respuestas.

3. **Revisar Seguridad**:
   - Implementar validaciones estrictas de roles y permisos en todos los endpoints.