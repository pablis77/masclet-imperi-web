# Script para crear un servicio de autenticación correcto basado en el entorno local funcional
# Este script genera una versión limpia y optimizada del servicio de autenticación

$workDir = "C:\Proyectos\claude\masclet-imperi-web\new_tests\DESPLIEGE_050625"
$outputDir = "$workDir\deploy"

# Crear directorio de salida si no existe
if (!(Test-Path $outputDir)) {
    Write-Host "📁 Creando directorio de salida..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

Write-Host "🔨 Generando servicio de autenticación correcto..." -ForegroundColor Cyan

# Generar la versión correcta del servicio de autenticación
$authServiceJs = @"
/**
 * Servicio de Autenticación - Versión corregida para AWS
 * 
 * Esta versión del servicio de autenticación:
 * 1. Se conecta correctamente al backend real usando OAuth2
 * 2. Usa el formato application/x-www-form-urlencoded
 * 3. Maneja tokens y roles de manera correcta
 * 4. Incluye soporte especial para el usuario Ramon
 */

// Servicio de autenticación
const authService = {
  // Verificar si estamos autenticados
  isAuthenticated() {
    return !!this.getToken();
  },

  // Obtener token
  getToken() {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('token');
      } catch (e) {
        console.warn('Error accediendo a localStorage:', e);
      }
    }
    return null;
  },

  // Inicio de sesión
  async login(credentials) {
    try {
      const { username, password } = credentials;
      
      if (!username || !password) {
        throw new Error('Usuario y contraseña son obligatorios');
      }
      
      console.log(`Intentando iniciar sesión con usuario: ${username}`);
      
      // Crear los datos en formato URLEncoded como espera el backend OAuth2
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('grant_type', 'password');
      
      // Configurar cabeceras para enviar datos en formato correcto
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
      
      // Determinar la URL de login correcta - primero intentar con la almacenada si existe
      let loginUrl = '';
      const successfulEndpoint = sessionStorage.getItem('successfulLoginEndpoint');
      
      if (successfulEndpoint) {
        loginUrl = successfulEndpoint;
        console.log('Usando endpoint exitoso anterior:', loginUrl);
      } else {
        // Intentar construir la URL como en el entorno local
        // Para contenedores Docker, usamos rutas relativas
        loginUrl = '/api/v1/auth/login';
        console.log('Usando URL de login predeterminada:', loginUrl);
      }
      
      // Lista de URLs a intentar si la primera falla
      const fallbackUrls = [
        '/api/v1/auth/login',
        '/api/auth/login',
        '/auth/login',
        '/api/api/v1/auth/login'
      ];
      
      // Hacer la petición de login
      let response, data, lastError;
      let success = false;
      
      // Primero intentar con la URL principal
      try {
        console.log('Intentando login con URL:', loginUrl);
        response = await fetch(loginUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        if (response.ok) {
          data = await response.json();
          success = true;
          // Guardar la URL exitosa para futuros intentos
          sessionStorage.setItem('successfulLoginEndpoint', loginUrl);
          console.log('Login exitoso con URL:', loginUrl);
        } else {
          lastError = new Error(`Error del servidor: ${response.status}`);
          console.warn('Falló primer intento. Código:', response.status);
        }
      } catch (err) {
        lastError = err;
        console.warn('Error en primer intento:', err.message);
      }
      
      // Si no tuvo éxito, probar con las URLs de respaldo
      if (!success) {
        console.log('Probando URLs de respaldo...');
        
        for (const url of fallbackUrls) {
          if (url === loginUrl) continue; // Saltar si ya la intentamos
          
          try {
            console.log('Intentando con URL alternativa:', url);
            response = await fetch(url, {
              method: 'POST',
              body: formData,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            });
            
            if (response.ok) {
              data = await response.json();
              success = true;
              // Guardar la URL exitosa para futuros intentos
              sessionStorage.setItem('successfulLoginEndpoint', url);
              console.log('Login exitoso con URL alternativa:', url);
              break;
            } else {
              console.warn('Falló intento con URL alternativa:', url, 'Código:', response.status);
            }
          } catch (err) {
            console.warn('Error con URL alternativa:', url, err.message);
          }
        }
      }
      
      // Si ningún intento tuvo éxito, lanzar error
      if (!success) {
        throw lastError || new Error('Todos los intentos de login fallaron');
      }
      
      // Si llegamos aquí, la autenticación fue exitosa
      console.log('Autenticación exitosa. Guardando datos...');
      
      // Guardar el token y usuario en localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('token', data.access_token);
          
          // Aplicar corrección para usuario Ramon si es necesario
          if (username.toLowerCase() === 'ramon' && data.user) {
            console.log('CORRECCIÓN: Usuario Ramon detectado, ajustando rol');
            data.user.role = 'Ramon';
            localStorage.setItem('ramonFix', 'true');
          }
          
          // Guardar usuario
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Guardar rol
          if (data.user && data.user.role) {
            localStorage.setItem('userRole', data.user.role);
          }
        } catch (e) {
          console.warn('Error al guardar datos en localStorage:', e);
        }
      }
      
      return data;
    } catch (error) {
      // Determinar mensaje de error apropiado
      let errorMessage;
      
      if (error.response) {
        // Error con respuesta del servidor
        switch (error.response.status) {
          case 400:
            errorMessage = 'Solicitud incorrecta. Revise los datos enviados.';
            break;
          case 401:
            errorMessage = 'Usuario o contraseña incorrectos';
            break;
          case 403:
            errorMessage = 'No tiene permiso para acceder';
            break;
          case 404:
            errorMessage = 'Servicio de autenticación no encontrado';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = `Error del servidor: ${error.response.status}`;
        }
      } else if (error.request) {
        // No se recibió respuesta
        errorMessage = 'No se pudo conectar con el servidor';
      } else {
        // Error de configuración de la solicitud
        errorMessage = error.message || 'Error desconocido al intentar autenticar';
      }
      
      console.error('Error de autenticación:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Cierre de sesión
  logout() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('ramonFix');
        
        // Redirigir a la página de login
        window.location.href = '/login';
      } catch (e) {
        console.warn('Error durante logout:', e);
        // Forzar redirección en caso de error
        window.location.href = '/login';
      }
    }
  },

  // Obtener usuario almacenado
  getStoredUser() {
    if (typeof window !== 'undefined') {
      try {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          return JSON.parse(userJson);
        }
      } catch (e) {
        console.warn('Error al obtener usuario de localStorage:', e);
      }
    }
    return null;
  },

  // Guardar usuario en localStorage
  saveUser(user) {
    if (typeof window !== 'undefined' && user) {
      try {
        localStorage.setItem('user', JSON.stringify(user));
        if (user.role) {
          localStorage.setItem('userRole', user.role);
        }
      } catch (e) {
        console.warn('Error al guardar usuario en localStorage:', e);
      }
    }
  },

  // Eliminar usuario de localStorage
  removeUser() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      } catch (e) {
        console.warn('Error al eliminar usuario de localStorage:', e);
      }
    }
  },

  // Obtener usuario actual
  async getCurrentUser() {
    return this.getStoredUser();
  },

  // Guardar token en localStorage
  saveToken(token) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('token', token);
      } catch (e) {
        console.warn('Error al guardar token en localStorage:', e);
      }
    }
  },

  // Eliminar token de localStorage
  removeToken() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('token');
      } catch (e) {
        console.warn('Error al eliminar token de localStorage:', e);
      }
    }
  },

  // Obtener rol del usuario actual
  getCurrentUserRole() {
    if (typeof window !== 'undefined') {
      try {
        // Verificar indicador específico para Ramon
        const ramonFix = localStorage.getItem('ramonFix');
        if (ramonFix === 'true') {
          return 'Ramon';
        }
        
        // Verificar usuario en localStorage
        const user = this.getStoredUser();
        if (user && user.username && user.username.toLowerCase() === 'ramon') {
          localStorage.setItem('ramonFix', 'true');
          return 'Ramon';
        }
        
        // Obtener rol guardado
        const role = localStorage.getItem('userRole');
        if (role) {
          return role;
        }
        
        // Obtener de usuario si existe
        if (user && user.role) {
          return user.role;
        }
      } catch (e) {
        console.warn('Error al obtener rol de usuario:', e);
      }
    }
    
    // Valor predeterminado
    return 'usuario';
  },

  // Obtener cabeceras de autenticación
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token || ''}`
    };
  }
};

// Si estamos en navegador, exportar
if (typeof window !== 'undefined') {
  window.authService = authService;
  
  // Inicializar comprobaciones
  console.log('Servicio de autenticación inicializado correctamente');
}

// Exportar funciones principales
const isAuthenticated = () => authService.isAuthenticated();
const getStoredUser = () => authService.getStoredUser();
const getCurrentUser = () => authService.getCurrentUser();

// Exportar para compatibilidad con módulos
export { getCurrentUser, getStoredUser, isAuthenticated };
"@

# Escribir el servicio de autenticación al archivo
$authServiceJs | Out-File -FilePath "$outputDir\authService.js" -Encoding UTF8

Write-Host "✅ Servicio de autenticación generado: $outputDir\authService.js" -ForegroundColor Green

# Crear un script de configuración para apiConfig
$apiConfigJs = @"
/**
 * Configuración de la API corregida para AWS
 */
const apiConfig = {
  baseURL: '/api/v1',  // Prefijo unificado
  timeout: 30000,      // Tiempo de espera ampliado para entorno de producción
  withCredentials: true,
  backendURL: ''       // En producción, usamos rutas relativas
};

// Exportar para compatibilidad con módulos
if (typeof window !== 'undefined') {
  window.apiConfig = apiConfig;
  console.log('Configuración API inicializada para entorno de producción');
}

// Exportar como valor predeterminado
export default apiConfig;
"@

# Escribir la configuración de la API al archivo
$apiConfigJs | Out-File -FilePath "$outputDir\apiConfig.js" -Encoding UTF8

Write-Host "✅ Configuración de API generada: $outputDir\apiConfig.js" -ForegroundColor Green
Write-Host "✅ Creación de archivos completada exitosamente" -ForegroundColor Green
