# 🔍 SonarQube para Masclet Imperi Web

## Introducción

Este conjunto de scripts configura SonarQube Developer Edition en Docker para realizar un análisis completo y automático del proyecto Masclet Imperi Web. Obtendremos información detallada sobre los componentes, tecnologías, endpoints y estructura del proyecto para mejorar nuestra documentación de despliegue en AWS Amplify.

## Archivos incluidos

- `sonarqube-setup.ps1`: Configura e inicia SonarQube en Docker
- `sonarqube-analyze.ps1`: Ejecuta el análisis completo (requiere token)
- `detectar-endpoints.ps1`: Script independiente para extraer todos los endpoints

## Instrucciones de uso

### 1. Iniciar SonarQube

```powershell
.\sonarqube-setup.ps1
```

Este comando:
- Crea las carpetas necesarias para datos, extensiones y logs
- Inicia SonarQube Developer Edition en Docker
- Expone el servicio en http://localhost:9000

### 2. Configurar proyecto en SonarQube

1. Esperar 1-2 minutos hasta que SonarQube inicie completamente
2. Acceder a http://localhost:9000 (credenciales: admin/admin)
3. Cambiar la contraseña inicial cuando se solicite
4. Crear un nuevo proyecto llamado "masclet-imperi"
5. Seleccionar "Configurar manualmente"
6. Generar un token y copiarlo

### 3. Ejecutar el análisis

```powershell
.\sonarqube-analyze.ps1 -token "tu-token-generado"
```

### 4. Ver resultados

- Acceder a http://localhost:9000/dashboard?id=masclet-imperi
- Explorar las diferentes secciones:
  - Arquitectura y dependencias
  - Listado de endpoints
  - Tecnologías utilizadas
  - Componentes críticos
  - Problemas detectados

## Resultados generados

Este análisis generará:

1. **Inventario completo de endpoints activos**
   - Backend: `sonarqube-results\endpoints-backend.txt`
   - Frontend (llamadas API): `sonarqube-results\endpoints-frontend.txt`

2. **Mapa de arquitectura visual** en la interfaz web de SonarQube

3. **Dashboard con métricas relevantes**:
   - Módulos utilizados
   - Tecnologías por componente
   - Dependencias entre componentes

4. **Análisis de calidad**:
   - Verificación de configuración de CORS
   - Detección de endpoints sin uso (posiblemente obsoletos)
   - Duplicación de código

Esta información es esencial para completar adecuadamente la documentación de migración a AWS Amplify y garantizar que todos los componentes estén correctamente documentados.

## Mantenimiento

Para detener SonarQube:

```powershell
docker stop sonarqube-masclet
```

Para reiniciarlo más tarde:

```powershell
docker start sonarqube-masclet
```

## Observaciones importantes

- El análisis puede tardar entre 5-15 minutos según el tamaño del proyecto
- Los resultados se almacenan en SonarQube y pueden exportarse como PDF o HTML
- Para un análisis más rápido de solo endpoints, usar el script `detectar-endpoints.ps1`
