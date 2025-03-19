# Documentación Masclet Imperi

## 📚 Índice General

### 1. Visión General
- [README Principal](../README.md)
- [Estructura del Proyecto](project_structure.md)
- [Patrones de Datos](data_patterns.md)

### 2. Especificaciones Técnicas
- [API Endpoints](api_endpoints.md)
- [Modelos de Datos](models/README.md)
- [Validaciones](validations/README.md)

### 3. Guías de Testing
- [Casos de Prueba](../tests/docs/test_cases.md)
- [Guía de Testing](../tests/README.md)
- [Datos de Ejemplo](../tests/assets/README.md)

### 4. Roadmap y Planificación
- [Core Functionality](roadmap/core_functionality_roadmap.md)
- [Plan de Implementación](roadmap/fase1_implementation_plan.md)

## 🔍 Aspectos Clave

### Estructura de Datos
```plaintext
Animal
├── Datos Básicos
│   ├── explotacio (requerido)
│   ├── nom (requerido)
│   ├── genere (M/F) (requerido)
│   └── estado (OK/DEF) (requerido)
├── Datos Opcionales
│   ├── alletar (si/no)
│   ├── pare
│   ├── mare
│   ├── quadra
│   ├── cod
│   ├── num_serie
│   └── dob
└── Partos (solo F)
    ├── fecha
    ├── genere_cria
    └── estado_cria
```

### Patrones Importantes
1. **Identificación**
   - Simple numérica (1, 46)
   - Compuesta (20-36)
   - Alfanumérica (R-32)

2. **Partos**
   - Secuenciales
   - Múltiples
   - Estados variables

3. **Explotaciones**
   - Gurans
   - Guadalajara
   - Madrid

## 🛠️ Guías Rápidas

### Desarrollo Local
```bash
# Activar entorno
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Linux/Mac

# Ejecutar servidor
uvicorn app.main:app --reload

# Ejecutar tests
.\run_tests.bat  # Windows
pytest tests/    # Linux/Mac
```

### Docker
```bash
# Desarrollo
docker-compose -f docker/compose/docker-compose.yml up -d

# Producción
docker-compose -f docker/compose/docker-compose.prod.yml up -d
```

## 📋 Checklists

### Nueva Funcionalidad
1. [ ] Documentación actualizada
2. [ ] Tests unitarios
3. [ ] Tests de integración
4. [ ] Validaciones implementadas
5. [ ] Migraciones necesarias
6. [ ] Casos de prueba reales

### Release
1. [ ] Tests pasando
2. [ ] Migraciones aplicadas
3. [ ] Documentación al día
4. [ ] Backup realizado
5. [ ] Changelog actualizado

## 🔗 Enlaces Útiles

### Internos
- [Changelog](../CHANGELOG.md)
- [Contributing](../CONTRIBUTING.md)
- [License](../LICENSE)

### Externos
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Tortoise ORM](https://tortoise.github.io/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 📊 Métricas y KPIs

### Cobertura de Código
- Mínimo requerido: 80%
- Objetivo: 90%
- Crítico: 95%

### Performance
- Tiempo de respuesta API: < 200ms
- Importación CSV: < 1000 registros/s
- Memoria: < 512MB en producción

## 🆘 Solución de Problemas

### Problemas Comunes
1. **Cache PyC**
   ```powershell
   Get-ChildItem -Path . -Filter "__pycache__" -Recurse -Directory | Remove-Item -Recurse -Force
   ```

2. **DB Locked**
   ```bash
   docker-compose restart db
   ```

3. **Migraciones**
   ```bash
   aerich downgrade
   aerich upgrade
   ```

### Contacto Soporte
- GitHub Issues
- Email: support@mascletimperi.com
- Documentación: /docs