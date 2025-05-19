# Contexto de Interfaz de Usuario

## 1. Componentes Existentes

### Dashboard.tsx (359 bytes)

- Vista principal de estadísticas
- KPIs y métricas clave
- Implementación actual básica

### Toast.tsx (606 bytes)

- Sistema de notificaciones
- Tipos: success, warning, error, info
- Duración configurable

### ImportCsv.tsx

- Sistema de importación de datos CSV
- Previsualización antes de importar
- Validación de datos
- Manejo de errores por fila
- Estados de proceso: carga, previsualización, importación
- Muestra estadísticas de resultados

## 2. Referencias Visuales

- Ubicación screenshots: `/docs/context/screenshots/`
- Programa original: `/base_masclet/masclet_imperi archivos no programa completo/screenshots/`

## 3. Vistas Principales

### Dashboard

- KPIs principales  
  - Total animales (por explotación)  
  - Distribución M/F  
  - Estado alletar
- Gráficos  
  - Distribución por estado  
  - Timeline de partos
- Actividad reciente

### Listado de Animales

- Filtros  
  - Explotació (dropdown)  
  - Genere (M/F)  
  - Estado (OK/DEF)  
  - Alletar (si/no)
- Tabla  
  - Columnas ordenables  
  - Paginación  
  - Iconos según estado

### Ficha Animal

- Datos generales  
  - Campos obligatorios marcados (*)  
  - Validación en tiempo real
- Historial  
  - Timeline de cambios  
  - Registro de partos
- Acciones  
  - Guardar/Cancelar  
  - Marcar fallecido

## 4. Sistema de Iconos

```typescript
ICON_TYPES = {
    BULL: "🐂",              // Icono cabeza toro
    COW_EMPTY: "⚪",         // Círculo blanco (vaca sin amamantar)
    COW_NURSING: "🔵",       // Círculo azul (vaca/ternero amamantando)
    DECEASED: "†",          // X negrita (fallecido)
    SUCCESS: "✅",          // Operación exitosa
    WARNING: "⚠️",          // Advertencia
    ERROR: "❌"            // Error
}

// Lógica de asignación de iconos
getAnimalIcon(animal) {
    if (animal.estado === 'DEF') return ICON_TYPES.DECEASED
    if (animal.genere === 'M') return ICON_TYPES.BULL
    return animal.alletar ? ICON_TYPES.COW_NURSING : ICON_TYPES.COW_EMPTY
}
```

## Sistema de Iconos y UI

### Iconografía Base

- BULL (♂️): Toro
- COW_EMPTY (⚪): Vaca sin amamantar
- COW_NURSING (🔵): Vaca amamantando
- DECEASED (†): Fallecido

### Estados UI

- SUCCESS (✓): Operación exitosa
- WARNING (⚠️): Advertencia
- ERROR (❌): Error crítico

## 5. Estados Visuales

### Colores del Sistema

```css
:root {
    --primary: #2C5282;     /* Azul principal */
    --secondary: #718096;   /* Gris secundario */
    --success: #48BB78;     /* Verde éxito */
    --warning: #ECC94B;     /* Amarillo advertencia */
    --danger: #E53E3E;      /* Rojo error */
    --alletar: #4299E1;     /* Azul amamantando */
}
```

### Estados de Formulario

- Input.error: Borde rojo + mensaje
- Input.success: Check verde
- Button.loading: Spinner
- Form.disabled: Opacidad reducida

## 6. Responsive Design

### Breakpoints

```css
--mobile: 320px;
--tablet: 768px;
--desktop: 1024px;
--widescreen: 1280px;
```

### Adaptaciones

- Mobile: Menú colapsable
- Tablet: Sidebar reducido
- Desktop: Layout completo

## 7. Feedback Usuario

### Notificaciones

```typescript
- Success: Verde, 3s
- Warning: Amarillo, 5s
- Error: Rojo, manual close
- Info: Azul, 4s
```

### Notificaciones y Feedback

- Sin uso de popups modales
- Sistema de toasts integrados en la interfaz:
  - Success: Verde, autocierre 3s
  - Warning: Amarillo, autocierre 5s  
  - Error: Rojo, cierre manual
- Posición fija bottom-right
- No bloquean interacción
- Compatible móvil/tablet
- No conflictos con adblockers

### Loading States

- Skeleton loaders
- Spinners
- Progress bars

## 8. Accesibilidad

### Estándares

- WCAG 2.1 Level AA
- Keyboard navigation
- Screen reader support
- High contrast mode

### Aria Labels

```html
<button aria-label="Crear nuevo animal">
<input aria-describedby="error-message">
<table role="grid">
```

## 9. Interacciones

### Formularios

- Validación tiempo real
- Autocompletado
- Guardado automático
- Confirmación cambios

### Tablas

- Ordenamiento múltiple
- Filtros combinados
- Exportación datos
- Selección múltiple

## 10. Próximos Pasos Frontend

### Fase 1: Componentes Base

```typescript
- Layout principal
- Sistema de navegación
- Componentes forms
- Tabla de datos
```

### Fase 2: Vistas Principales

```typescript
- Dashboard con KPIs
- CRUD Animales
- Gestión Partos
- Importación datos
```

### Fase 3: Mejoras UX

```typescript
- Feedback usuario
- Estados loading
- Optimización móvil
- Accesibilidad
```

## 11. Diseño Responsivo y Optimización Móvil

### Estructura Responsiva

La aplicación implementa una estructura de diseño completamente responsiva, optimizada especialmente para uso en condiciones de campo con dispositivos móviles:

#### Layout Principal (DefaultLayout.astro)

- Botón flotante para mostrar/ocultar el sidebar en dispositivos móviles
- Sistema de sidebar deslizable optimizado para interacción táctil
- Padding adaptativo para el área de contenido principal según tamaño de pantalla
- Soporte para dispositivos con notch y áreas seguras
- Elementos táctiles con tamaño mínimo de 44px para facilitar uso con guantes
- Modo de alto contraste para mejorar visibilidad en condiciones de luz exterior

#### Barra de Navegación (Navbar.astro)

- Comportamiento responsivo en todos los tamaños de pantalla
- Menú móvil con elementos de tamaño adecuado para uso con guantes
- Visualización del título de página actual en dispositivos móviles
- Interruptores accesibles para modo oscuro y alto contraste
- Organización de elementos de navegación según rol de usuario

#### Barra Lateral (Sidebar.astro)

- Barra lateral deslizable para dispositivos móviles
- Botón dedicado de cierre para mejorar experiencia de usuario
- Menú organizado en secciones lógicas basadas en funcionalidad
- Estados activos visuales para elementos de navegación
- Visualización del rol de usuario para conciencia de contexto

#### Pie de Página (Footer.astro)

- Diseño responsivo con apilamiento en pantallas pequeñas
- Soporte completo para modo oscuro con mejoras de contraste
- Interruptor adicional de alto contraste para dispositivos móviles pequeños
- Utilización de márgenes de área segura para dispositivos con notch o barras de sistema

### Consideraciones de Uso en Campo

- **Interacción táctil**: Todos los elementos interactivos tienen un tamaño mínimo de 44px para facilitar el uso con guantes
- **Visibilidad exterior**: Implementación de modo de alto contraste con colores optimizados para visualización en exteriores
- **Uso offline**: Diseño optimizado para funcionar con conexiones inestables
- **Eficiencia energética**: Modo oscuro para reducir consumo de batería en dispositivos OLED
- **Accesibilidad**: Controles claros y fácilmente identificables con etiquetas adecuadas

## 12. ACTUALIZACIÓN (14/Marzo/2025): Optimización para Uso en Campo con Dispositivos Móviles

### Contexto de Uso Real

- **Usuarios Primarios**: Ganaderos trabajando en exteriores
- **Dispositivos**: Principalmente smartphones y tablets, no ordenadores de escritorio
- **Conexión**: Potencialmente inestable o limitada
- **Entorno**: Condiciones físicas adversas (luz solar directa, polvo, lluvia)

### Principios de Diseño Mobile-First

- **Controles táctiles amplios**: Mínimo 48px de altura/anchura para todos los elementos interactivos
- **Contraste elevado**: Legibilidad garantizada en condiciones de luz solar directa
- **Funcionamiento offline**: Caché local para operaciones críticas
- **Diseño minimalista**: Priorización severa de funciones esenciales en móvil
- **Tolerancia a errores**: Capacidad para recuperar sesión y formularios ante fallos de conexión

### Adaptaciones de UI para Campo

- **Modo offline**: Indicador visual de estado de conexión
- **Caché agresiva**: Almacenamiento local de datos frecuentes
- **Formularios resistentes**: Auto-guardado de entradas parciales
- **Sincronización inteligente**: Cola de operaciones pendientes al recuperar conexión
- **Batería optimizada**: Reducción de animaciones y operaciones costosas

### Componentes Específicos Mobile

```typescript
// Componente de estado de conectividad
const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? 'Conectado' : 'Modo Offline'}
    </div>
  );
};

// Componente de entrada adaptado para dedos grandes
const TouchFriendlyInput = ({ label, ...props }) => (
  <div className="touch-input-container">
    <label className="touch-label">{label}</label>
    <input 
      className="touch-input" 
      {...props} 
    />
  </div>
);
```

### Consideraciones de Rendimiento

- **Tamaño de bundle**: <100KB inicial para carga rápida
- **Imágenes optimizadas**: WebP con fallbacks, carga progresiva
- **Lazy loading**: Componentes y rutas bajo demanda
- **Prefetching inteligente**: Anticipación de navegación probable
- **Monitorización de rendimiento**: Métricas de campo reales (Core Web Vitals)

Esta actualización refuerza nuestro compromiso con una experiencia robusta, centrada en el uso real por ganaderos en condiciones de campo, con disponibilidad parcial de conectividad y optimizada para dispositivos móviles.

## Formatos de Entrada

#### Fechas

- **Backend Format**: DD/MM/YYYY
- **Validation Rules**: 
  - Day: 1-31
  - Month: 1-12
  - Year: 1900-2100
  - Separator: "/"

```typescript
// Componente de entrada de fecha
const DateInput = () => {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const formatDate = () => `${day}/${month}/${year}`;

  return (
    <div className="date-input-group">
      <input type="number" min="1" max="31" placeholder="DD" 
             value={day} onChange={e => setDay(e.target.value)} />
      <input type="number" min="1" max="12" placeholder="MM"
             value={month} onChange={e => setMonth(e.target.value)} />
      <input type="number" min="1900" max="2100" placeholder="YYYY"
             value={year} onChange={e => setYear(e.target.value)} />
    </div>
  );
};