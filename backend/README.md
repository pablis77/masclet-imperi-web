# Masclet Imperi Backend

Sistema de gestión ganadera con soporte para múltiples explotaciones, seguimiento de partos y genealogía.

## 📁 Estructura del Proyecto

```
backend/
├── app/               # Núcleo de la aplicación
├── database/          # Datos y migraciones
├── docker/           # Configuración de contenedores
├── tests/            # Suite de pruebas
└── docs/             # Documentación
```

Documentación detallada:
- [Estructura del Proyecto](docs/project_structure.md)
- [Casos de Prueba](tests/docs/test_cases.md)

## 🚀 Inicio Rápido

### Requisitos
- Python 3.9+
- PostgreSQL 17
- Docker (opcional)

### Instalación

1. Clonar el repositorio
```bash
git clone [url-repositorio]
cd masclet-imperi-web/backend
```

2. Crear entorno virtual
```bash
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. Instalar dependencias
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Para desarrollo
```

4. Configurar variables de entorno
```bash
# Copiar plantilla
cp .env.example .env
# Editar con tus valores
notepad .env  # o tu editor preferido
```

### Ejecución

#### Desarrollo Local
```bash
# Iniciar base de datos
docker-compose -f docker/compose/docker-compose.yml up -d db

# Ejecutar migraciones
aerich upgrade

# Iniciar servidor
uvicorn app.main:app --reload
```

#### Docker
```bash
docker-compose -f docker/compose/docker-compose.yml up -d
```

## 🧪 Tests

### Ejecutar Tests
```bash
# Windows
.\run_tests.bat

# Linux/Mac
pytest tests/ -v
```

### Tipos de Tests
- Unit: `tests/unit/`
- Integration: `tests/integration/`
- E2E: `tests/e2e/`
- API: `tests/test_api/`

## 📊 Datos de Ejemplo

El sistema incluye datos reales anonimizados en `database/matriz_master.csv` que muestran:
- Toros simples (ej: "1")
- Vacas con historial de partos (ej: "20-36")
- Diferentes explotaciones (Gurans, Guadalajara, Madrid)
- Varios estados y escenarios

## 🔑 Características Principales

### Gestión de Animales
- CRUD completo
- Búsqueda avanzada
- Historial de cambios
- Validaciones específicas

### Control de Partos
- Registro cronológico
- Múltiples partos por animal
- Estados y seguimiento
- Actualización automática de alletar

### Importación de Datos
- Soporte CSV
- Validación flexible
- Manejo de errores
- Log detallado

## 📝 Convenciones

### Commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `refactor:` Mejora de código
- `test:` Añadir/modificar tests
- `docs:` Actualización documentación

### Código
- Black para formateo
- Flake8 para linting
- MyPy para tipos
- Docstrings en funciones principales

## 📚 Documentación Adicional

- [API Endpoints](docs/api_endpoints.md)
- [Roadmap](docs/roadmap/core_functionality_roadmap.md)
- [Plan de Implementación](docs/roadmap/fase1_implementation_plan.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'feat: Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 🛟 Soporte

- **Issues**: Usar el sistema de issues de GitHub
- **Documentación**: Ver carpeta `/docs`
- **Ejemplos**: Ver carpeta `/tests`
