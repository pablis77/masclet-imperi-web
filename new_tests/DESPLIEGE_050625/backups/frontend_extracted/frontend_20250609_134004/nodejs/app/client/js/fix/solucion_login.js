/**
 * SCRIPT DE CORRECCIÓN DE LOGIN PARA MASCLET IMPERI
 * 
 * Este script debe inyectarse en el HTML para interceptar y corregir
 * las peticiones de login hacia el backend.
 * 
 * Problemática: En el entorno de AWS, las peticiones de login fallan porque:
 * 1. La URL puede estar mal construida
 * 2. El formato puede no ser correcto (debe ser application/x-www-form-urlencoded)
 * 3. Puede haber problemas con el proxy Nginx
 */

// Ejecutar tan pronto como sea posible
;(function() {
  console.log('🔄 Script de corrección de login inicializado');
  
  // Verificar si ya está cargado (evitar doble ejecución)
  if (window.__loginFixApplied) {
    console.log('✅ Script de corrección de login ya aplicado');
    return;
  }
  
  // Marcar como aplicado
  window.__loginFixApplied = true;
  
  // Función para mostrar información de diagnóstico
  function debugInfo(message) {
    console.log(`[LoginFix] ${message}`);
    // Guardar también en sessionStorage para persistir entre recargas
    try {
      const logs = JSON.parse(sessionStorage.getItem('loginFixLogs') || '[]');
      logs.push({
        time: new Date().toISOString(),
        message
      });
      sessionStorage.setItem('loginFixLogs', JSON.stringify(logs));
    } catch (e) {
      console.error('[LoginFix] Error guardando logs:', e);
    }
  }
  
  // Registro de inicio
  debugInfo('Script de corrección de login inyectado');
  debugInfo(`URL actual: ${window.location.href}`);
  debugInfo(`Hostname: ${window.location.hostname}`);
  
  // Interceptar los formularios de login
  function interceptLoginForms() {
    debugInfo('Monitorizando formularios de login...');
    
    // Observer para detectar formularios dinámicos
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            // Verificar si es un elemento DOM
            if (node.nodeType === 1) {
              // Buscar formularios dentro del nodo añadido
              if (node.tagName === 'FORM') {
                attachFormHandler(node);
              } else {
                const forms = node.querySelectorAll('form');
                forms.forEach(form => attachFormHandler(form));
              }
            }
          });
        }
      }
    });
    
    // Observar cambios en todo el documento
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    
    // Buscar formularios existentes
    document.querySelectorAll('form').forEach(form => {
      attachFormHandler(form);
    });
  }
  
  // Adjuntar handler a cada formulario encontrado
  function attachFormHandler(form) {
    // Verificar si ya hemos procesado este formulario
    if (form.__loginFixProcessed) return;
    
    // Buscar campos de usuario y contraseña
    const usernameField = form.querySelector('input[type="text"], input[name="username"]');
    const passwordField = form.querySelector('input[type="password"], input[name="password"]');
    
    // Si parece un formulario de login
    if (usernameField && passwordField) {
      debugInfo(`Formulario de login detectado: ${form.action || 'Sin action definido'}`);
      form.__loginFixProcessed = true;
      
      // Sobreescribir el evento submit
      form.addEventListener('submit', handleLoginSubmit, true);
      debugInfo('Handler de login instalado en formulario');
    }
  }
  
  // Manejar envío de formulario de login
  function handleLoginSubmit(event) {
    debugInfo('Interceptando envío de formulario de login');
    
    // Prevenir comportamiento normal
    event.preventDefault();
    event.stopPropagation();
    
    // Obtener el formulario
    const form = event.target;
    
    // Extraer valores
    const formData = new FormData(form);
    const username = formData.get('username');
    const password = formData.get('password');
    
    debugInfo(`Intentando login para usuario: ${username}`);
    
    // Construir la petición corregida
    performLogin(username, password)
      .then(data => {
        debugInfo('Login exitoso! Redirigiendo...');
        // Almacenar datos en localStorage como lo haría el código original
        localStorage.setItem('token', data.access_token);
        
        if (data.user) {
          // Corrección para usuario Ramon
          if (username.toLowerCase() === 'ramon') {
            debugInfo('Usuario Ramon detectado - aplicando corrección de rol');
            data.user.role = 'Ramon';
            localStorage.setItem('ramonFix', 'true');
          }
          
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Guardar rol por separado
          if (data.user.role) {
            localStorage.setItem('userRole', data.user.role);
          }
        }
        
        // Redirigir según el rol
        const redirectPath = getRedirectPathForUser(data.user);
        window.location.href = redirectPath;
      })
      .catch(error => {
        debugInfo(`Error en login: ${error.message}`);
        
        // Mostrar error en la UI
        alert(`Error de inicio de sesión: ${error.message}`);
      });
  }
  
  // Función para realizar el login correctamente
  async function performLogin(username, password) {
    debugInfo('Ejecutando login corregido');
    
    // Crear los datos en formato URLEncoded como espera el backend OAuth2
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    
    // Según el análisis del entorno de producción
    // - En el navegador debemos usar rutas relativas con /api/v1
    // - El servidor Node.js internamente usa http://masclet-api:8000
    // - El proxy Nginx dirige las peticiones a /api/ hacia el backend
    const possibleEndpoints = [
      '/api/v1/auth/login',    // La ruta correcta con prefijo v1 (debería ser esta)
      '/api/auth/login',       // Alternativa sin /v1 (por si la configuración cambió)
      '/auth/login',           // Por si el proxy está configurado directamente a /auth
      '/api/api/v1/auth/login' // Por si hay un doble prefijo accidental
    ];
    
    // Si tenemos guardado un endpoint exitoso anterior, usarlo primero
    const successfulEndpoint = sessionStorage.getItem('successfulLoginEndpoint');
    if (successfulEndpoint) {
      // Mover el endpoint exitoso al principio del array
      possibleEndpoints.unshift(successfulEndpoint);
    }
    
    // Configurar cabeceras para el formato correcto
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    
    let lastError = null;
    
    // Intentar con cada posible endpoint
    for (const endpoint of possibleEndpoints) {
      try {
        debugInfo(`Intentando login con endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        if (!response.ok) {
          // Guardar el texto de error para diagnóstico
          const errorText = await response.text().catch(() => 'No response text');
          
          // Si es un error 401, significa credenciales incorrectas (no seguir intentando)
          if (response.status === 401) {
            debugInfo(`Credenciales rechazadas: ${errorText}`);
            throw new Error('Credenciales incorrectas');
          }
          
          // Para otros errores, intentar con la siguiente URL
          debugInfo(`Error ${response.status} con endpoint ${endpoint}: ${errorText}`);
          lastError = new Error(`Error del servidor: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        debugInfo(`Login exitoso con endpoint: ${endpoint}`);
        
        // Guardar el endpoint exitoso para futuros intentos
        sessionStorage.setItem('successfulLoginEndpoint', endpoint);
        
        // Si es el usuario Ramon, aplicar el fix especial de rol
        if (username.toLowerCase() === 'ramon' && data.user) {
          data.user.role = 'Ramon';
          localStorage.setItem('ramonFix', 'true');
          debugInfo('Fix especial para usuario Ramon aplicado');
        }
        
        return data;
      } catch (error) {
        lastError = error;
        debugInfo(`Error con endpoint ${endpoint}: ${error.message}`);
      }
    }
    
    // Si llegamos aquí, ningún endpoint funcionó
    throw lastError || new Error('Todos los intentos de login fallaron');
  }
  
  // Determine la ruta de redirección basada en el rol
  function getRedirectPathForUser(user) {
    if (!user || !user.role) return '/dashboard';
    
    // Rutas específicas por rol
    switch (user.role.toLowerCase()) {
      case 'ramon':
        return '/dashboard';
      case 'administrador':
        return '/admin';
      case 'editor':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  }
  
  // También interceptamos las peticiones fetch/XHR para corregir en tiempo real
  function interceptAPIRequests() {
    // Interceptar el original fetch
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
      // Solo interceptar peticiones relacionadas con login
      if (typeof input === 'string' && 
          (input.includes('/auth/login') || input.includes('login') || input.includes('token'))) {
        
        debugInfo(`Petición fetch interceptada: ${input}`);
        
        // Verificar si tenemos un endpoint exitoso previo
        const successfulEndpoint = sessionStorage.getItem('successfulLoginEndpoint');
        if (successfulEndpoint && !input.startsWith(successfulEndpoint)) {
          debugInfo(`Redirigiendo fetch a endpoint exitoso: ${successfulEndpoint}`);
          input = successfulEndpoint;
        }
        
        // Asegurarse de que se use el Content-Type correcto
        if (init && init.body instanceof URLSearchParams) {
          init.headers = init.headers || {};
          init.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          debugInfo('Content-Type corregido a application/x-www-form-urlencoded');
        }
      }
      
      // Llamar al fetch original
      return originalFetch.apply(this, arguments);
    };
    
    // Interceptar XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      // Solo interceptar peticiones relacionadas con login
      if (typeof url === 'string' && 
          (url.includes('/auth/login') || url.includes('login') || url.includes('token'))) {
        
        debugInfo(`Petición XHR interceptada: ${url}`);
        
        // Verificar si tenemos un endpoint exitoso previo
        const successfulEndpoint = sessionStorage.getItem('successfulLoginEndpoint');
        if (successfulEndpoint && !url.startsWith(successfulEndpoint)) {
          debugInfo(`Redirigiendo XHR a endpoint exitoso: ${successfulEndpoint}`);
          url = successfulEndpoint;
        }
        
        // Almacenar la URL para uso en send
        this.__loginFixUrl = url;
      }
      
      // Llamar al método original
      return originalOpen.apply(this, [method, url, ...args]);
    };
    
    XMLHttpRequest.prototype.send = function(body) {
      if (this.__loginFixUrl && typeof body === 'string') {
        // Verificar formato de los datos
        try {
          // Intentar convertir a URLSearchParams si es JSON
          if (body.startsWith('{') && body.includes('password')) {
            const jsonData = JSON.parse(body);
            const formData = new URLSearchParams();
            
            if (jsonData.username) formData.append('username', jsonData.username);
            if (jsonData.password) formData.append('password', jsonData.password);
            if (!formData.has('grant_type')) formData.append('grant_type', 'password');
            
            body = formData.toString();
            debugInfo('Datos JSON convertidos a formato URLEncoded');
            
            // Cambiar header Content-Type
            this.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          }
        } catch (e) {
          debugInfo(`Error procesando body: ${e.message}`);
        }
      }
      
      // Llamar al método original
      return originalSend.apply(this, [body]);
    };
    
    debugInfo('Intercepción de peticiones API instalada');
  }
  
  // Función para corregir problemas de logout
  function fixLogout() {
    // Interceptar clicks en botones de logout
    document.addEventListener('click', function(event) {
      // Buscar elementos que coincidan con botones de logout
      const target = event.target;
      const isLogoutButton = 
        target.textContent?.toLowerCase().includes('logout') ||
        target.textContent?.toLowerCase().includes('cerrar sesión') ||
        target.id?.toLowerCase().includes('logout') ||
        target.classList.contains('logout-button');
      
      if (isLogoutButton) {
        debugInfo('Click en botón de logout detectado');
        
        // Prevenir el comportamiento predeterminado
        event.preventDefault();
        
        // Realizar la limpieza correcta
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          localStorage.removeItem('ramonFix');
          
          sessionStorage.clear();
          
          debugInfo('Sesión limpiada correctamente');
          
          // Redirigir a login
          window.location.href = '/login';
        } catch (e) {
          debugInfo(`Error en proceso de logout: ${e.message}`);
          
          // Forzar redirección en caso de error
          window.location.href = '/login';
        }
      }
    }, true);
    
      }
    });
    
    document.body.appendChild(indicator);
  }
  
  // Iniciar todas las correcciones
  function init() {
    try {
      interceptLoginForms();
      interceptAPIRequests();
      fixLogout();
      
      // Añadir indicador solo en páginas de login o dashboard
      if (window.location.pathname.includes('login') || 
          window.location.pathname.includes('dashboard')) {
        setTimeout(addDebugIndicator, 1000);
      }
      
      debugInfo('Todas las correcciones de login instaladas correctamente');
    } catch (e) {
      console.error('[LoginFix] Error inicializando correcciones:', e);
    }
  }
  
  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
