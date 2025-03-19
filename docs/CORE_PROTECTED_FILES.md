# 🔒 Archivos Protegidos del Core

## Estructura Base de Datos
Los siguientes archivos son críticos para el funcionamiento de la aplicación:

### 🚫 `/backend/app/models/animal.py`
- Modelo principal de Animal
- Contiene la estructura base de datos
- NO modificar campos existentes

### 🚫 `/backend/app/models/parto.py`
- Modelo de Partos
- Gestiona relaciones con Animal
- NO modificar campos existentes

### 🚫 `/backend/app/models/__init__.py`
- Gestiona importaciones de modelos
- Crítico para evitar importaciones circulares

## ✅ Modificaciones Permitidas
1. Añadir nuevos métodos
2. Documentación
3. Optimizaciones

## ❌ Modificaciones Prohibidas
1. Cambiar campos existentes
2. Alterar relaciones entre modelos
3. Modificar nombres de métodos core

## 🔍 Proceso de Modificación
1. Revisar documentación
2. Crear branch separado
3. Tests exhaustivos
4. Code review obligatorio