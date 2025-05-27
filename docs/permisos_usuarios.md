# Documentación de Permisos de Usuario en Masclet Imperi

## 1. Introducción

Este documento define la estructura completa del frontend de Masclet Imperi y establece los permisos recomendados para cada tipo de usuario. El objetivo es proporcionar una guía clara para la implementación del sistema de permisos en la aplicación.

## 2. Tipos de Usuarios

El sistema contempla los siguientes perfiles de usuario:

1. **Administrador**: Acceso completo a todas las funcionalidades del sistema.
2. Ramon: Acceso a todas las secciones de navegación con permisos de edición y creación limitados.
3. **Editor**: Acceso a todas las secciones de navegación con permisos para crear y editar animales y listados.
4. **Usuario**: Acceso de solo lectura a las secciones principales de navegación.

## 3. Estructura del Frontend

### 3.1 Navegación Principal

#### 3.1.1 Dashboard

- **Ruta**: `/`
- **Componentes**: Estadísticas generales, gráficos, indicadores
- **Descripción**: Panel principal con información resumida de la explotación

#### 3.1.2 Explotaciones

- **Ruta**: `/explotaciones-react`
- **Componentes**: Lista de explotaciones, detalles de explotación
- **Descripción**: Gestión de las diferentes explotaciones ganaderas

#### 3.1.3 Animales

- **Ruta**: `/animals`
- **Componentes**: Lista de animales, ficha de animal, partos, historial
- **Descripción**: Gestión completa de los animales de las explotaciones

#### 3.1.4 Listados

- **Ruta**: `/listados`
- **Componentes**: Generación de listados, exportación
- **Descripción**: Herramienta para generar informes y listados de animales

### 3.2 Administración

#### 3.2.1 Importación

- **Ruta**: `/imports`
- **Componentes**: Carga de archivos, mapeo de campos, proceso de importación
- **Descripción**: Herramienta para importar datos desde archivos externos

#### 3.2.2 Usuarios

- **Ruta**: `/users`
- **Componentes**: Lista de usuarios, creación y edición de usuarios
- **Descripción**: Gestión de usuarios del sistema

#### 3.2.3 Copias de Seguridad

- **Ruta**: `/backup`
- **Componentes**: Creación y restauración de backups
- **Descripción**: Gestión de las copias de seguridad del sistema

## 4. Matriz de Permisos

### 4.1 Permisos Generales

| Sección            | Administrador | Ramon | Editor | Usuario |
| ------------------- | ------------- | ----- | ------ | ------- |
| Dashboard           | ✓            | ✓    | ✓     | ✓      |
| Explotaciones       | ✓            | ✓    | ✓     | ✓      |
| Animales            | ✓            | ✓    | ✓     | ✓      |
| Listados            | ✓            | ✓    | ✓     | ✓      |
| Importación        | ✓            | ✓    | ✗     | ✗      |
| Usuarios            | ✓            | ✓    | ✗     | ✗      |
| Copias de Seguridad | ✓            | ✓    | ✗     | ✗      |

### 4.2 Permisos Específicos: Dashboard

| Acción           | Administrador | Ramon | Editor | Usuario |
| ----------------- | ------------- | ----- | ------ | ------- |
| Ver estadísticas | ✓            | ✓    | ✓     | ✓      |

<!-- No hay funcionalidad de personalización de vistas actualmente -->

### 4.3 Permisos Específicos: Explotaciones

| Acción           | Administrador | Ramon | Editor | Usuario |
| ----------------- | ------------- | ----- | ------ | ------- |
| Ver explotaciones | ✓            | ✓    | ✓     | ✓      |

<!-- Las explotaciones no se pueden crear, editar o eliminar directamente, solo a través de la creación de animales -->

| Buscar explotaciones | ✓ | ✓ | ✓ | ✓ |
| Ver detalle de explotación | ✓ | ✓ | ✓ | ✓ |
| Exportar a PDF | ✓ | ✓ | ✓ | ✗ |

### 4.4 Permisos Específicos: Animales

| Acción               | Administrador | Ramon | Editor | Usuario |
| --------------------- | ------------- | ----- | ------ | ------- |
| Ver lista de animales | ✓            | ✓    | ✓     | ✓      |
| Ver ficha detallada   | ✓            | ✓    | ✓     | ✓      |
| Crear animal          | ✓            | ✓    | ✗     | ✗      |
| Editar animal         | ✓            | ✓    | ✓     | ✗      |
| Eliminar animal       | ✓            | ✓    | ✗     | ✗      |
| Registrar parto       | ✓            | ✓    | ✓     | ✗      |
| Editar parto          | ✓            | ✓    | ✓     | ✗      |
| Eliminar parto        | ✓            | ✓    | ✗     | ✗      |

### 4.5 Permisos Específicos: Listados

| Acción                     | Administrador | Gerente | Editor | Usuario |
| --------------------------- | ------------- | ------- | ------ | ------- |
| Ver listados existentes     | ✓            | ✓      | ✓     | ✓      |
| Crear listado               | ✓            | ✓      | ✓     | ✗      |
| Editar listado              | ✓            | ✓      | ✓     | ✗      |
| Eliminar listado            | ✓            | ✓      | ✗     | ✗      |
| Exportar a PDF/Excel        | ✓            | ✓      | ✓     | ✗      |
| Exportar ficha animal a PDF | ✓            | ✓      | ✓     | ✗      |

### 4.6 Permisos Específicos: Importación

| Acción                        | Administrador | Ramon | Editor | Usuario |
| ------------------------------ | ------------- | ----- | ------ | ------- |
| Ver historial de importaciones | ✓            | ✓    | ✗     | ✗      |
| Iniciar importación           | ✓            | ✗    | ✗     | ✗      |
| Configurar mapeo de campos     | ✓            | ✗    | ✗     | ✗      |
| Ejecutar importación          | ✓            | ✗    | ✗     | ✗      |

### 4.7 Permisos Específicos: Usuarios

| Acción                      | Administrador | Ramon | Editor | Usuario |
| ---------------------------- | ------------- | ----- | ------ | ------- |
| Ver lista de usuarios        | ✓            | ✓    | ✗     | ✗      |
| Crear usuario                | ✓            | ✓    | ✗     | ✗      |
| Editar usuario               | ✓            | ✓    | ✗     | ✗      |
| Cambiar rol de usuario       | ✓            | ✓    | ✗     | ✗      |
| Eliminar usuario             | ✓            | ✓    | ✗     | ✗      |
| Cambiar contraseña propia   | ✓            | ✓    | ✓     | ✓      |
| Cambiar contraseña de otros | ✓            | ✓    | ✗     | ✗      |

### 4.8 Permisos Específicos: Copias de Seguridad

| Acción              | Administrador | Ramon | Editor | Usuario |
| -------------------- | ------------- | ----- | ------ | ------- |
| Ver lista de backups | ✓            | ✓    | ✗     | ✗      |
| Crear backup manual  | ✓            | ✓    | ✗     | ✗      |
| Restaurar backup     | ✓            | ✗    | ✗     | ✗      |
| Eliminar backup      | ✓            | ✗    | ✗     | ✗      |
| Descargar backup     | ✓            | ✓    | ✗     | ✗      |

## 5. Componentes Específicos y Permisos

### 5.1 Componentes de Animales

| Componente       | Descripción                  | Administrador     | Ramon             | Editor            | Usuario      |
| ---------------- | ----------------------------- | ----------------- | ----------------- | ----------------- | ------------ |
| AnimalList       | Lista de animales con filtros | Lectura/Escritura | Lectura/Escritura | Lectura/Escritura | Solo Lectura |
| AnimalDetail     | Ficha completa del animal     | Lectura/Escritura | Lectura/Escritura | Lectura/Escritura | Solo Lectura |
| CreateAnimalForm | Formulario de creación       | Acceso Total      | Acceso Total      | Sin Acceso        | Sin Acceso   |
| EditAnimalForm   | Formulario de edición        | Acceso Total      | Acceso Total      | Acceso Total      | Sin Acceso   |
| AnimalHistory    | Historial de cambios          | Acceso Total      | Acceso Total      | Acceso Total      | Solo Lectura |
| PartosSection    | Gestión de partos            | Acceso Total      | Acceso Total      | Acceso Total      | Solo Lectura |

### 5.2 Componentes de Explotaciones

| Componente         | Descripción                       | Administrador     | Ramon             | Editor            | Usuario      |
| ------------------ | ---------------------------------- | ----------------- | ----------------- | ----------------- | ------------ |
| ExplotacionesList  | Lista de explotaciones             | Lectura/Escritura | Lectura/Escritura | Lectura/Escritura | Solo Lectura |
| ExplotacionDetail  | Detalle de explotación            | Lectura/Escritura | Lectura/Escritura | Lectura/Escritura | Solo Lectura |
| ExplotacionSearch  | Buscador de explotaciones          | Acceso Total      | Acceso Total      | Acceso Total      | Acceso Total |
| ExplotacionAnimals | Lista de animales por explotación | Acceso Total      | Acceso Total      | Acceso Total      | Solo Lectura |

### 5.3 Componentes de Listados

| Componente        | Descripción                | Administrador     | Ramon             | Editor            | Usuario      |
| ----------------- | --------------------------- | ----------------- | ----------------- | ----------------- | ------------ |
| ListadosList      | Lista de listados guardados | Lectura/Escritura | Lectura/Escritura | Lectura/Escritura | Solo Lectura |
| CreateListadoForm | Creación de listado        | Acceso Total      | Acceso Total      | Acceso Total      | Sin Acceso   |
| EditOwnListado    | Edición de listado propio  | Acceso Total      | Acceso Total      | Acceso Total      | Sin Acceso   |
| ListadoDetail     | Detalle y vista previa      | Acceso Total      | Acceso Total      | Acceso Total      | Solo Lectura |
| ExportListado     | Exportación a formatos     | Acceso Total      | Acceso Total      | Acceso Total      | Sin Acceso   |

### 5.4 Componentes de Importación

| Componente    | Descripción               | Administrador | Ramon        | Editor     | Usuario    |
| ------------- | -------------------------- | ------------- | ------------ | ---------- | ---------- |
| ImportUpload  | Carga de archivos          | Acceso Total  | Sin Acceso   | Sin Acceso | Sin Acceso |
| ImportMapper  | Mapeo de campos            | Acceso Total  | Sin Acceso   | Sin Acceso | Sin Acceso |
| ImportProcess | Proceso de importación    | Acceso Total  | Sin Acceso   | Sin Acceso | Sin Acceso |
| ImportHistory | Historial de importaciones | Acceso Total  | Solo Lectura | Sin Acceso | Sin Acceso |

### 5.5 Componentes de Usuarios

| Componente     | Descripción          | Administrador | Ramon          | Editor         | Usuario        |
| -------------- | --------------------- | ------------- | -------------- | -------------- | -------------- |
| UsersList      | Lista de usuarios     | Acceso Total  | Solo Lectura   | Sin Acceso     | Sin Acceso     |
| CreateUserForm | Creación de usuario  | Acceso Total  | Sin Acceso     | Sin Acceso     | Sin Acceso     |
| EditUserForm   | Edición de usuario   | Acceso Total  | Sin Acceso     | Sin Acceso     | Sin Acceso     |
| UserProfile    | Perfil personal       | Acceso Total  | Acceso Total   | Acceso Total   | Acceso Total   |
| ChangePassword | Cambio de contraseña | Acceso Total  | Propio Usuario | Propio Usuario | Propio Usuario |

### 5.6 Componentes de Backup

| Componente     | Descripción       | Administrador | Ramon        | Editor     | Usuario    |
| -------------- | ------------------ | ------------- | ------------ | ---------- | ---------- |
| BackupList     | Lista de backups   | Acceso Total  | Solo Lectura | Sin Acceso | Sin Acceso |
| CreateBackup   | Creación manual   | Acceso Total  | Acceso Total | Sin Acceso | Sin Acceso |
| RestoreBackup  | Restauración      | Acceso Total  | Sin Acceso   | Sin Acceso | Sin Acceso |
| BackupSettings | Configuración     | Acceso Total  | Sin Acceso   | Sin Acceso | Sin Acceso |
| DownloadBackup | Descarga de backup | Acceso Total  | Acceso Total | Sin Acceso | Sin Acceso |

## 6. Implementación Técnica

Para implementar estos permisos en el sistema, se recomienda:

1. Crear un sistema de roles en la base de datos (administrador, Ramon, editor, usuario)
2. Implementar middleware en el backend para verificar permisos
3. Crear un sistema de comprobación de permisos en el frontend
4. Ocultar o deshabilitar elementos de la interfaz según los permisos

### 6.1 Estructura de datos para permisos

```typescript
// Ejemplo de estructura de permisos en TypeScript
interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}
interface UserPermissions {
  dashboard: Permission;
  animals: Permission;
  explotaciones: Permission;
  listados: Permission;
  imports: Permission;
  users: Permission;
  backup: Permission;
}
interface Role {
  id: string;
  name: string;
  permissions: UserPermissions;
}
```

### 6.2 Ejemplo de implementación en el frontend

```typescript
// Función para verificar permisos en componentes
function hasPermission(section: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean {
  const userRole = getUserRole(); // Obtener del contexto de autenticación
  const permissions = PERMISSIONS_MAP[userRole];
  
  if (!permissions || !permissions[section]) {
    return false;
  }
  
  return permissions[section][action];
}
// Uso en componentes
function AnimalEditButton({ animalId }) {
  if (!hasPermission('animals', 'edit')) {
    return null; // No mostrar el botón si no tiene permiso
  }
  
  return <Button onClick={() => editAnimal(animalId)}>Editar</Button>;
}
```

## 7. Recomendaciones para el Despliegue

1. Implementar esta estructura de permisos antes del despliegue en AWS
2. Crear usuarios de prueba para cada rol y verificar los permisos
3. Documentar cualquier cambio o ajuste a esta estructura
4. Revisar periódicamente los permisos para asegurar que siguen siendo adecuados

## 8. Próximos Pasos

1. Validar esta estructura de permisos con el equipo y ajustar según sea necesario
2. Implementar el sistema de roles en la base de datos
3. Desarrollar el sistema de comprobación de permisos en el frontend
4. Implementar el middleware de permisos en el backend
5. Realizar pruebas exhaustivas con diferentes roles de usuario
