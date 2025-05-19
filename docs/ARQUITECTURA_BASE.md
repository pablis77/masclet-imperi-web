# 📚 Arquitectura Base Masclet Imperi (Proyecto Original)

> Este documento sirve como referencia de la arquitectura y funcionamiento del proyecto original Masclet Imperi, desarrollado en Python con Tkinter.

## 1. GUI (Interfaz Gráfica)
### 1.1 Ventana Principal
- Gestiona la ventana root de tkinter
- Controla el ciclo de vida de la aplicación

# Arquitectura Detallada Masclet Imperi

## 1. GUI (Interfaz Gráfica)
### 1.1 Ventana Principal
- Gestiona la ventana root de tkinter
- Controla el ciclo de vida de la aplicación

### 1.2 Frames
- MainFrame
  - Contenedor principal
  - Gestiona layout general
- HeaderFrame
  - Contiene logo
  - Título de aplicación
- ContentFrame
  - Área principal de contenido
  - Cambia según funcionalidad activa
- StatusFrame
  - Información de usuario
  - Fecha/hora
  - Estado del sistema

### 1.3 Componentes
- LoginForm
  - Campo usuario
  - Campo contraseña
  - Checkbox recordar
  - Botón login
- UserInfo
  - Nombre usuario
  - Rol actual
  - Estado sesión
- DateTime
  - Hora actual
  - Fecha sistema
- CustomButtons
  - Botones dinámicos según rol
  - Estilos personalizados

## 2. Core Services (Servicios Principales)

### 2.1 AuthService
- CredentialManager
  - Encriptación/desencriptación
  - Gestión de tokens
  - Almacenamiento seguro
- UserValidator
  - Validación de credenciales
  - Control de acceso
  - Gestión de roles
- Dependencies:
  -> Storage_Layer.Encryption
  -> Storage_Layer.Files.UserDB
  -> Storage_Layer.Files.CredStore

### 2.2 DataManager
- CSVHandler
  - Lectura/escritura CSV
  - Parseo de datos
  - Validación formato
- DataValidator
  - Reglas de negocio
  - Validaciones de campo
  - Integridad referencial
- BackupSystem
  - Copias de seguridad
  - Rotación de backups
  - Restauración
- Dependencies:
  -> Storage_Layer.Files.MasterData
  -> Storage_Layer.Files.Backups

### 2.3 UIManager
- ButtonCreator
  - Generación dinámica
  - Estilos consistentes
- StyleConfig
  - Temas
  - Colores
  - Fuentes
- Dependencies:
  -> GUI.*

### 2.4 MessageSystem
- MsgQueue
  - Cola de mensajes
  - Priorización
- MsgDisplay
  - Visualización
  - Temporización
- AlertSystem
  - Errores
  - Advertencias
  - Confirmaciones

## 3. Storage Layer (Capa de Almacenamiento)

### 3.1 Files
- users.json
  - Datos usuarios
  - Roles
  - Configuraciones
- credentials.dat
  - Credenciales encriptadas
  - Tokens de sesión
- matriz_master.csv
  - Datos principales
  - Registros históricos
- backups/*.csv
  - Copias de seguridad
  - Versiones anteriores

### 3.2 Encryption
- Fernet
  - Encriptación simétrica
  - Gestión de claves
- SHA256
  - Hash de contraseñas
  - Verificación de integridad

## 4. Functional Modules (Módulos Funcionales)

### 4.1 ConsultaFicha
- SearchSystem
  - Búsqueda por campos
  - Filtros combinados
- DataDisplay
  - Visualización de datos
  - Formateo de campos
- FilterSystem
  - Filtros avanzados
  - Ordenamiento
- Dependencies:
  -> DataManager
  -> UIManager
  -> MessageSystem

### 4.2 ActualizarFicha
- UpdateForm
  - Formulario de edición
  - Validación en tiempo real
- ValidationSystem
  - Reglas de negocio
  - Validaciones de campo
- ChangeTracker
  - Registro de cambios
  - Histórico de modificaciones
- Dependencies:
  -> DataManager
  -> AuthService
  -> MessageSystem

### 4.3 NuevaFicha
- NewForm
  - Formulario de creación
  - Campos requeridos
- DataGenerator
  - Generación de IDs
  - Valores por defecto
- Validator
  - Validación de campos
  - Reglas de negocio
- Dependencies:
  -> DataManager
  -> MessageSystem

### 4.4 ImportarDatos
- CSVReader
  - Lectura de archivos
  - Validación formato
- DataMerger
  - Fusión de datos
  - Resolución conflictos
- BackupManager
  - Gestión de backups
  - Restauración
- PreviewSystem
  - Vista previa
  - Validación previa
- Dependencies:
  -> DataManager
  -> BackupSystem
  -> MessageSystem

## 5. Flujos de Datos Principales

### 5.1 Autenticación
```
Usuario -> LoginForm -> AuthService -> UserValidator -> CredentialManager -> Storage
                    -> MessageSystem (si hay error)
                    -> MainFrame (si éxito)
```

### 5.2 Consulta de Ficha
```
Usuario -> SearchSystem -> DataManager -> CSVHandler -> Storage
                       -> DataDisplay -> MessageSystem
```

### 5.3 Actualización de Ficha
```
Usuario -> UpdateForm -> ValidationSystem -> DataManager -> BackupSystem -> Storage
                     -> ChangeTracker -> MessageSystem
```

### 5.4 Importación de Datos
```
Usuario -> CSVReader -> DataValidator -> BackupManager -> DataMerger -> Storage
                    -> PreviewSystem -> MessageSystem
```

## 6. Validaciones y Reglas de Negocio

### 6.1 Validaciones de Campo
- Nombre: único, obligatorio
- Código: formato específico
- Fechas: formato válido, coherencia
- Estado: valores permitidos
- Género: valores específicos

### 6.2 Validaciones de Proceso
- Permisos de usuario
- Estados de transición válidos
- Relaciones genealógicas
- Integridad referencial

### 6.3 Validaciones de Importación
- Estructura CSV
- Tipos de datos
- Duplicados
- Referencias válidas