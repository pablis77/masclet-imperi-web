/**
 * ANÁLISIS RÁPIDO DE RUTAS API
 * 
 * Este script es una versión simplificada que analiza directamente los archivos
 * en busca de patrones de URL duplicados sin depender de llamadas HTTP.
 */

const fs = require('fs');
const path = require('path');

console.log('===== ANÁLISIS RÁPIDO DE RUTAS API DUPLICADAS =====');
console.log('Fecha:', new Date().toISOString());
console.log();

// Configuración
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'frontend');
const FRONTEND_SRC = path.join(FRONTEND_DIR, 'src');
const FRONTEND_DIST = path.join(FRONTEND_DIR, 'dist');

// Patrones a buscar
const URL_PATTERNS = [
  { regex: /\/api\/v1\/api\/v1\//g, desc: '⚠️ CRÍTICO: Doble /api/v1/api/v1/' },
  { regex: /\/api\/api\/v1\//g, desc: '⚠️ CRÍTICO: Doble /api/api/v1/' },
  { regex: /http:\/\/108\.129\.139\.119:8000\/api\/v1\//g, desc: '⚠️ URL hardcoded producción' },
  { regex: /http:\/\/localhost:8000\/api\/v1\//g, desc: '⚠️ URL hardcoded desarrollo' },
  { regex: /\${import\.meta\.env\.VITE_API_URL}/g, desc: '✓ Bueno: Variable entorno' },
  { regex: /baseURL:\s*['"]([^'"]+)['"]/g, desc: '🔍 Configuración baseURL' },
  { regex: /\/api\/v1\//g, desc: '🔍 Uso de /api/v1/' }
];

// Archivos clave a analizar
const KEY_FILES = [
  {
    path: path.join(FRONTEND_SRC, 'services', 'apiService.ts'),
    desc: 'Servicio API principal'
  },
  {
    path: path.join(FRONTEND_DIR, 'fix-server.js'),
    desc: 'Configuración del servidor Node.js'
  },
  {
    path: path.join(FRONTEND_DIR, 'fix-api-urls.js'),
    desc: 'Script corrección URLs'
  },
  {
    path: path.join(PROJECT_ROOT, 'deployment', 'frontend', 'nginx-linux.conf'),
    desc: 'Configuración Nginx'
  }
];

// Función para analizar un archivo
function analyzeFile(filePath, description) {
  console.log(`\n\n===== ANALIZANDO: ${description} =====`);
  console.log(`Archivo: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ERROR: Archivo no encontrado`);
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    console.log(`✅ Archivo encontrado (${lines.length} líneas)`);
    
    // Buscar patrones
    URL_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern.regex);
      if (matches && matches.length > 0) {
        console.log(`\n${pattern.desc}: ${matches.length} ocurrencias`);
        
        // Mostrar algunas líneas de contexto para los primeros matches
        let count = 0;
        for (let i = 0; i < lines.length && count < 3; i++) {
          if (pattern.regex.test(lines[i])) {
            console.log(`  Línea ${i+1}: ${lines[i].trim()}`);
            count++;
          }
        }
      }
    });
    
    // Análisis específico según el tipo de archivo
    if (filePath.includes('fix-server.js')) {
      analyzeServerConfig(content);
    } else if (filePath.includes('apiService.ts')) {
      analyzeApiService(content);
    } else if (filePath.includes('nginx-linux.conf')) {
      analyzeNginxConfig(content);
    }
    
  } catch (error) {
    console.log(`❌ ERROR al leer el archivo: ${error.message}`);
  }
}

// Analizar configuración del servidor
function analyzeServerConfig(content) {
  console.log('\n>> ANÁLISIS ESPECÍFICO DEL SERVIDOR NODE.JS:');
  
  // Buscar configuración de proxy
  const proxyRegex = /app\.use\(['"]\/api.*?\)/g;
  const proxyMatches = content.match(proxyRegex);
  
  if (proxyMatches && proxyMatches.length > 0) {
    console.log('Configuraciones de proxy encontradas:');
    proxyMatches.forEach(match => {
      console.log(`  ${match}`);
    });
    
    // Verificar si hay múltiples proxies que podrían causar duplicación
    if (proxyMatches.length > 1) {
      console.log('\n⚠️ ALERTA: Múltiples configuraciones de proxy detectadas');
      console.log('   Esto podría causar la duplicación de rutas /api/v1/api/v1');
    }
  } else {
    console.log('No se encontraron configuraciones de proxy');
  }
  
  // Buscar BACKEND_URL
  const backendUrlMatch = content.match(/BACKEND_URL\s*=\s*['"]([^'"]+)['"]/);
  if (backendUrlMatch) {
    console.log(`\nBACKEND_URL: ${backendUrlMatch[1]}`);
  }
}

// Analizar configuración de API Service
function analyzeApiService(content) {
  console.log('\n>> ANÁLISIS ESPECÍFICO DEL API SERVICE:');
  
  // Buscar configuración de baseURL
  const baseUrlMatch = content.match(/baseURL:\s*['"]([^'"]+)['"]/);
  if (baseUrlMatch) {
    console.log(`baseURL configurado como: ${baseUrlMatch[1]}`);
    
    // Verificar si la baseURL ya incluye /api/v1
    if (baseUrlMatch[1].includes('/api/v1')) {
      console.log('⚠️ ALERTA: baseURL ya incluye /api/v1');
      console.log('   Esto podría causar duplicación si el proxy también añade /api/v1');
    }
  }
  
  // Buscar interceptores que podrían modificar URLs
  if (content.includes('interceptors.request.use')) {
    console.log('\nInterceptores de solicitud detectados:');
    
    // Extraer código relevante de interceptor
    const interceptorMatch = content.match(/interceptors\.request\.use\(\s*([^)]+)\)/s);
    if (interceptorMatch) {
      console.log('Código del interceptor:');
      console.log(interceptorMatch[0].substring(0, 200) + '...');
    }
  }
}

// Analizar configuración de Nginx
function analyzeNginxConfig(content) {
  console.log('\n>> ANÁLISIS ESPECÍFICO DE NGINX:');
  
  // Buscar location blocks
  const locationRegex = /location\s+([^{]+)\s*{[^}]*proxy_pass\s+([^;]+);/g;
  let match;
  let foundApiV1 = false;
  
  console.log('Configuraciones de proxy en Nginx:');
  
  while ((match = locationRegex.exec(content)) !== null) {
    const location = match[1].trim();
    const proxyTarget = match[2].trim();
    
    console.log(`  ${location} → ${proxyTarget}`);
    
    // Verificar si hay configuración para /api/v1
    if (location.includes('/api/v1')) {
      foundApiV1 = true;
      
      // Verificar si el proxy_pass añade otro /api/v1
      if (proxyTarget.includes('/api/v1')) {
        console.log('  ⚠️ ALERTA: El proxy para /api/v1 redirige a una URL que ya incluye /api/v1');
        console.log('     Esto podría causar duplicación de rutas');
      }
    }
  }
  
  if (!foundApiV1) {
    console.log('  ❌ No se encontró configuración específica para /api/v1');
  }
  
  // Buscar reglas de redirección que podrían corregir duplicaciones
  const redirectRegex = /location\s+([^{]+)\s*{[^}]*return\s+\d+\s+([^;]+);/g;
  let redirectMatches = [];
  
  while ((match = redirectRegex.exec(content)) !== null) {
    redirectMatches.push({
      from: match[1].trim(),
      to: match[2].trim()
    });
  }
  
  if (redirectMatches.length > 0) {
    console.log('\nReglas de redirección encontradas:');
    redirectMatches.forEach(redirect => {
      console.log(`  ${redirect.from} → ${redirect.to}`);
      
      // Verificar si hay una regla para corregir /api/v1/api/v1
      if (redirect.from.includes('/api/v1/api/v1')) {
        console.log('  ✅ BUENO: Existe una regla para corregir la duplicación /api/v1/api/v1');
      }
    });
  } else {
    console.log('\n❌ No se encontraron reglas de redirección');
    console.log('   Se recomienda añadir una regla para redirigir /api/v1/api/v1/* a /api/v1/*');
  }
}

// Analizar archivos clave
KEY_FILES.forEach(file => {
  analyzeFile(file.path, file.desc);
});

// Imprimir conclusión
console.log('\n\n===== CONCLUSIÓN =====');
console.log('Este análisis muestra los posibles puntos donde se duplican las rutas API.');
console.log('Revisa especialmente:');
console.log('1. Si el apiService.ts configura baseURL con /api/v1');
console.log('2. Si fix-server.js añade otro /api/v1 en el proxy');
console.log('3. Si la configuración de Nginx también añade /api/v1');
console.log('4. Si fix-api-urls.js está configurado para corregir /api/v1/api/v1 → /api/v1');
console.log('\nCualquier capa que añada /api/v1 cuando ya existe contribuye al problema.');
console.log('La solución es garantizar que sólo UNA capa añada el prefijo /api/v1 y el resto use la URL tal cual.');
console.log('\n===== FIN DEL ANÁLISIS =====');
