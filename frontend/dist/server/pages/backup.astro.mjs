import { c as createComponent, a as createAstro, b as renderTemplate, r as renderComponent, m as maybeRenderHead } from '../chunks/vendor_XrHmsJ5B.mjs';
export { e as renderers } from '../chunks/vendor_XrHmsJ5B.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_CQEYGpDK.mjs';
import 'clsx';
import { a as getCurrentLanguage, t } from '../chunks/Footer_CbdEWwuE.mjs';

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(raw || cooked.slice()) }));
var _a$1, _b;
const $$Astro$1 = createAstro();
const $$PermissionsManager = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$PermissionsManager;
  const currentPath = Astro2.url.pathname;
  const isRestrictedPath = [
    "/imports",
    "/backup",
    "/users"
  ].some((path) => currentPath.startsWith(path));
  return renderTemplate(_b || (_b = __template$1(["<!-- Bloqueo de acceso para p\xE1ginas restringidas -->", `<!-- Estilos para bloqueo de botones --><link rel="stylesheet" href="/styles/block-buttons.css"><!-- Scripts para restricciones de UI basados en rol --><script src="/scripts/block-delete-button.js"><\/script><!-- Script desactivado temporalmente para evitar conflictos --><!-- <script src="/scripts/block-new-animal-button.js" is:inline><\/script> --><!-- Script para inicializaci\xF3n inmediata --><script>
/**
 * Inicializaci\xF3n del sistema de permisos
 */

// Funci\xF3n principal para gestionar permisos en la UI
function setupPermissionsUI() {
  console.log("Inicializando gesti\xF3n de permisos en UI...");
  
  // 1. Verificar el rol del usuario desde localStorage
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    // Obtener el rol del usuario
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role;
    
    console.log(\`Rol detectado: \${userRole}\`);
    
    // 2. Aplicar restricciones espec\xEDficas seg\xFAn la p\xE1gina actual
    const currentPath = window.location.pathname;
    
    // P\xE1gina de importaciones
    if (currentPath.includes('/imports') && userRole === 'Ramon') {
      handleImportPageRestrictions();
    }
    
    // P\xE1gina de backup/restore
    if (currentPath.includes('/backup') && userRole === 'Ramon') {
      handleBackupPageRestrictions();
    }
    
  } catch (e) {
    console.error('Error al procesar permisos de UI:', e);
  }
}

// Gestionar restricciones en la p\xE1gina de importaciones
function handleImportPageRestrictions() {
  // Evitar ejecutar m\xFAltiples veces
  if (window.ramonImportRestrictionApplied) return;
  window.ramonImportRestrictionApplied = true;
  
  console.log("Aplicando restricciones a la p\xE1gina de importaciones para Ramon...");
  
  // Eliminar todos los mensajes de advertencia existentes para evitar duplicados
  document.querySelectorAll('.bg-yellow-50.border-l-4.border-yellow-400.p-4.mb-4').forEach(el => {
    el.remove();
  });
  
  // Ocultar botones de importaci\xF3n excepto los de descarga
  document.querySelectorAll('.import-btn:not(.download-btn)').forEach(btn => {
    btn.style.display = 'none';
  });
  
  // Tambi\xE9n podemos ocultar el formulario de carga si existe
  const uploadForm = document.querySelector('#import-form');
  if (uploadForm) {
    uploadForm.style.display = 'none';
  }
  
  // A\xF1adir un \xFAnico mensaje informativo
  const container = document.querySelector('.import-container');
  if (container) {
    const infoMsg = document.createElement('div');
    infoMsg.id = 'mensaje-restriccion-ramon';
    infoMsg.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4';
    infoMsg.innerHTML = \`
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            Esta funci\xF3n de importaci\xF3n solo est\xE1 disponible para administradores. Puedes ver el historial de importaciones pero no iniciar nuevas.
          </p>
        </div>
      </div>
    \`;
    
    // Insertar al principio del contenedor
    const titleElement = container.querySelector('h2');
    if (titleElement) {
      container.insertBefore(infoMsg, titleElement.nextSibling);
    } else {
      container.prepend(infoMsg);
    }
  }
}

// Gestionar restricciones en la p\xE1gina de backup/restore
function handleBackupPageRestrictions() {
  // Evitar ejecutar m\xFAltiples veces
  if (window.ramonBackupRestrictionApplied) return;
  window.ramonBackupRestrictionApplied = true;
  
  console.log("Aplicando restricciones a la p\xE1gina de backup para Ramon...");
  
  // Funci\xF3n para deshabilitar completamente un elemento
  function deshabilitarElemento(elemento, mensaje) {
    // 1. Modificar atributos
    elemento.disabled = true;
    elemento.setAttribute('disabled', 'true');
    
    // 2. Modificar estilos
    elemento.style.opacity = '0.5';
    elemento.style.cursor = 'not-allowed';
    elemento.style.pointerEvents = 'none';
    elemento.title = mensaje || 'Solo disponible para administradores';
    
    // 3. A\xF1adir clases visuales
    elemento.classList.add('opacity-50', 'cursor-not-allowed');
    elemento.classList.remove('hover:bg-gray-300', 'dark:hover:bg-gray-600');
    
    // 4. Evitar eventos de clic
    elemento.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);
    
    // 5. A\xF1adir texto de candado si no existe
    if (!elemento.querySelector('.lock-icon')) {
      const lockIcon = document.createElement('span');
      lockIcon.textContent = ' \\ud83d\\udd12';
      lockIcon.className = 'lock-icon ml-2';
      elemento.appendChild(lockIcon);
    }
  }
  
  // 1. Deshabilitar bot\xF3n de selecci\xF3n de backup espec\xEDficamente
  const selectBackupBtn = document.getElementById('select-backup-btn');
  if (selectBackupBtn) {
    deshabilitarElemento(selectBackupBtn, 'No tienes permisos para restaurar copias de seguridad');
    console.log('Bot\xF3n de selecci\xF3n de backup deshabilitado correctamente');
  } else {
    console.log('Bot\xF3n de selecci\xF3n de backup no encontrado, buscando con retraso...');
    // Intentar encontrarlo con retraso (a veces se carga din\xE1micamente)
    setTimeout(() => {
      const btnDelayed = document.getElementById('select-backup-btn');
      if (btnDelayed) {
        deshabilitarElemento(btnDelayed, 'No tienes permisos para restaurar copias de seguridad');
        console.log('Bot\xF3n de selecci\xF3n de backup encontrado y deshabilitado con retraso');
      }
    }, 500);
  }

  // 2. Deshabilitar todos los elementos con data-requires-admin="true"
  document.querySelectorAll('[data-requires-admin="true"]').forEach(element => {
    deshabilitarElemento(element);
  });

  // 3. Deshabilitar botones de restauraci\xF3n y eliminaci\xF3n en la tabla
  document.querySelectorAll('.restore-btn, .delete-btn').forEach(btn => {
    deshabilitarElemento(btn);
  });
  
  // 4. A\xF1adir mensaje informativo en la secci\xF3n de restauraci\xF3n
  const restoreSection = document.getElementById('restore-section');
  if (restoreSection) {
    const container = restoreSection.closest('.bg-white');
    if (container && !container.querySelector('.bg-yellow-50')) {
      const infoMsg = document.createElement('div');
      infoMsg.id = 'mensaje-restauracion-ramon';
      infoMsg.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4';
      infoMsg.innerHTML = \`
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              Esta funci\xF3n de restauraci\xF3n solo est\xE1 disponible para administradores.
            </p>
          </div>
        </div>
      \`;
      const titleElement = container.querySelector('h2');
      if (titleElement) {
        container.insertBefore(infoMsg, titleElement.nextSibling);
      } else {
        container.prepend(infoMsg);
      }
    }
  }
  
  // 5. Observar cambios en el DOM para seguir aplicando restricciones a elementos nuevos
  const observer = new MutationObserver(() => {
    // Volver a buscar botones que necesiten ser deshabilitados
    const newBtn = document.getElementById('select-backup-btn');
    if (newBtn && !newBtn.disabled) {
      deshabilitarElemento(newBtn, 'No tienes permisos para restaurar copias de seguridad');
    }
    
    // Revisar nuevos elementos con data-requires-admin
    document.querySelectorAll('[data-requires-admin="true"]:not([disabled])').forEach(element => {
      deshabilitarElemento(element);
    });
  });
  
  // Observar todo el documento para detectar nuevos elementos
  observer.observe(document.documentElement, { 
    childList: true, 
    subtree: true 
  });
}

// Inicializar cuando el DOM est\xE9 cargado
document.addEventListener('DOMContentLoaded', setupPermissionsUI);

// Tambi\xE9n ejecutar cuando se navegue mediante SPA (si aplica)
document.addEventListener('astro:page-load', setupPermissionsUI);
<\/script>`], ["<!-- Bloqueo de acceso para p\xE1ginas restringidas -->", `<!-- Estilos para bloqueo de botones --><link rel="stylesheet" href="/styles/block-buttons.css"><!-- Scripts para restricciones de UI basados en rol --><script src="/scripts/block-delete-button.js"><\/script><!-- Script desactivado temporalmente para evitar conflictos --><!-- <script src="/scripts/block-new-animal-button.js" is:inline><\/script> --><!-- Script para inicializaci\xF3n inmediata --><script>
/**
 * Inicializaci\xF3n del sistema de permisos
 */

// Funci\xF3n principal para gestionar permisos en la UI
function setupPermissionsUI() {
  console.log("Inicializando gesti\xF3n de permisos en UI...");
  
  // 1. Verificar el rol del usuario desde localStorage
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    // Obtener el rol del usuario
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role;
    
    console.log(\\\`Rol detectado: \\\${userRole}\\\`);
    
    // 2. Aplicar restricciones espec\xEDficas seg\xFAn la p\xE1gina actual
    const currentPath = window.location.pathname;
    
    // P\xE1gina de importaciones
    if (currentPath.includes('/imports') && userRole === 'Ramon') {
      handleImportPageRestrictions();
    }
    
    // P\xE1gina de backup/restore
    if (currentPath.includes('/backup') && userRole === 'Ramon') {
      handleBackupPageRestrictions();
    }
    
  } catch (e) {
    console.error('Error al procesar permisos de UI:', e);
  }
}

// Gestionar restricciones en la p\xE1gina de importaciones
function handleImportPageRestrictions() {
  // Evitar ejecutar m\xFAltiples veces
  if (window.ramonImportRestrictionApplied) return;
  window.ramonImportRestrictionApplied = true;
  
  console.log("Aplicando restricciones a la p\xE1gina de importaciones para Ramon...");
  
  // Eliminar todos los mensajes de advertencia existentes para evitar duplicados
  document.querySelectorAll('.bg-yellow-50.border-l-4.border-yellow-400.p-4.mb-4').forEach(el => {
    el.remove();
  });
  
  // Ocultar botones de importaci\xF3n excepto los de descarga
  document.querySelectorAll('.import-btn:not(.download-btn)').forEach(btn => {
    btn.style.display = 'none';
  });
  
  // Tambi\xE9n podemos ocultar el formulario de carga si existe
  const uploadForm = document.querySelector('#import-form');
  if (uploadForm) {
    uploadForm.style.display = 'none';
  }
  
  // A\xF1adir un \xFAnico mensaje informativo
  const container = document.querySelector('.import-container');
  if (container) {
    const infoMsg = document.createElement('div');
    infoMsg.id = 'mensaje-restriccion-ramon';
    infoMsg.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4';
    infoMsg.innerHTML = \\\`
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            Esta funci\xF3n de importaci\xF3n solo est\xE1 disponible para administradores. Puedes ver el historial de importaciones pero no iniciar nuevas.
          </p>
        </div>
      </div>
    \\\`;
    
    // Insertar al principio del contenedor
    const titleElement = container.querySelector('h2');
    if (titleElement) {
      container.insertBefore(infoMsg, titleElement.nextSibling);
    } else {
      container.prepend(infoMsg);
    }
  }
}

// Gestionar restricciones en la p\xE1gina de backup/restore
function handleBackupPageRestrictions() {
  // Evitar ejecutar m\xFAltiples veces
  if (window.ramonBackupRestrictionApplied) return;
  window.ramonBackupRestrictionApplied = true;
  
  console.log("Aplicando restricciones a la p\xE1gina de backup para Ramon...");
  
  // Funci\xF3n para deshabilitar completamente un elemento
  function deshabilitarElemento(elemento, mensaje) {
    // 1. Modificar atributos
    elemento.disabled = true;
    elemento.setAttribute('disabled', 'true');
    
    // 2. Modificar estilos
    elemento.style.opacity = '0.5';
    elemento.style.cursor = 'not-allowed';
    elemento.style.pointerEvents = 'none';
    elemento.title = mensaje || 'Solo disponible para administradores';
    
    // 3. A\xF1adir clases visuales
    elemento.classList.add('opacity-50', 'cursor-not-allowed');
    elemento.classList.remove('hover:bg-gray-300', 'dark:hover:bg-gray-600');
    
    // 4. Evitar eventos de clic
    elemento.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);
    
    // 5. A\xF1adir texto de candado si no existe
    if (!elemento.querySelector('.lock-icon')) {
      const lockIcon = document.createElement('span');
      lockIcon.textContent = ' \\\\ud83d\\\\udd12';
      lockIcon.className = 'lock-icon ml-2';
      elemento.appendChild(lockIcon);
    }
  }
  
  // 1. Deshabilitar bot\xF3n de selecci\xF3n de backup espec\xEDficamente
  const selectBackupBtn = document.getElementById('select-backup-btn');
  if (selectBackupBtn) {
    deshabilitarElemento(selectBackupBtn, 'No tienes permisos para restaurar copias de seguridad');
    console.log('Bot\xF3n de selecci\xF3n de backup deshabilitado correctamente');
  } else {
    console.log('Bot\xF3n de selecci\xF3n de backup no encontrado, buscando con retraso...');
    // Intentar encontrarlo con retraso (a veces se carga din\xE1micamente)
    setTimeout(() => {
      const btnDelayed = document.getElementById('select-backup-btn');
      if (btnDelayed) {
        deshabilitarElemento(btnDelayed, 'No tienes permisos para restaurar copias de seguridad');
        console.log('Bot\xF3n de selecci\xF3n de backup encontrado y deshabilitado con retraso');
      }
    }, 500);
  }

  // 2. Deshabilitar todos los elementos con data-requires-admin="true"
  document.querySelectorAll('[data-requires-admin="true"]').forEach(element => {
    deshabilitarElemento(element);
  });

  // 3. Deshabilitar botones de restauraci\xF3n y eliminaci\xF3n en la tabla
  document.querySelectorAll('.restore-btn, .delete-btn').forEach(btn => {
    deshabilitarElemento(btn);
  });
  
  // 4. A\xF1adir mensaje informativo en la secci\xF3n de restauraci\xF3n
  const restoreSection = document.getElementById('restore-section');
  if (restoreSection) {
    const container = restoreSection.closest('.bg-white');
    if (container && !container.querySelector('.bg-yellow-50')) {
      const infoMsg = document.createElement('div');
      infoMsg.id = 'mensaje-restauracion-ramon';
      infoMsg.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4';
      infoMsg.innerHTML = \\\`
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              Esta funci\xF3n de restauraci\xF3n solo est\xE1 disponible para administradores.
            </p>
          </div>
        </div>
      \\\`;
      const titleElement = container.querySelector('h2');
      if (titleElement) {
        container.insertBefore(infoMsg, titleElement.nextSibling);
      } else {
        container.prepend(infoMsg);
      }
    }
  }
  
  // 5. Observar cambios en el DOM para seguir aplicando restricciones a elementos nuevos
  const observer = new MutationObserver(() => {
    // Volver a buscar botones que necesiten ser deshabilitados
    const newBtn = document.getElementById('select-backup-btn');
    if (newBtn && !newBtn.disabled) {
      deshabilitarElemento(newBtn, 'No tienes permisos para restaurar copias de seguridad');
    }
    
    // Revisar nuevos elementos con data-requires-admin
    document.querySelectorAll('[data-requires-admin="true"]:not([disabled])').forEach(element => {
      deshabilitarElemento(element);
    });
  });
  
  // Observar todo el documento para detectar nuevos elementos
  observer.observe(document.documentElement, { 
    childList: true, 
    subtree: true 
  });
}

// Inicializar cuando el DOM est\xE9 cargado
document.addEventListener('DOMContentLoaded', setupPermissionsUI);

// Tambi\xE9n ejecutar cuando se navegue mediante SPA (si aplica)
document.addEventListener('astro:page-load', setupPermissionsUI);
<\/script>`])), isRestrictedPath && renderTemplate(_a$1 || (_a$1 = __template$1(["<script>\n    // Este script se ejecuta inmediatamente al cargar la p\xE1gina, antes de mostrar el contenido\n    (function() {\n      try {\n        // Obtener el token del localStorage\n        const token = localStorage.getItem('token');\n        if (token) {\n          // Decodificar el payload del JWT\n          const payload = JSON.parse(atob(token.split('.')[1]));\n          const userRole = payload.role || 'guest';\n          \n          // Si el usuario es editor o user, redirigir a la p\xE1gina principal\n          if (userRole.toLowerCase() === 'editor' || userRole.toLowerCase() === 'user') {\n            console.log('Acceso denegado para rol:', userRole);\n            window.location.href = '/';\n          }\n        } else {\n          // Si no hay token, redirigir a login\n          window.location.href = '/login';\n        }\n      } catch (e) {\n        console.error('Error al verificar permisos:', e);\n        window.location.href = '/';\n      }\n    })();\n  <\/script>"]))));
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/permissions/PermissionsManager.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const currentLang = getCurrentLanguage();
  let userRole = "guest";
  const token = Astro2.cookies.get("token")?.value;
  if (token) {
    try {
      const tokenParts = token.split(".");
      if (tokenParts.length > 1) {
        const payload = JSON.parse(atob(tokenParts[1]));
        userRole = payload.role || "guest";
      }
    } catch (e) {
      console.error("Error al decodificar token:", e);
    }
  }
  userRole.toLowerCase() === "editor";
  const title = t("backup.title", currentLang);
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": title, "userRole": userRole, "currentPath": "/backup" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["  <script>\n    (function() {\n      try {\n        const token = localStorage.getItem('token');\n        if (token) {\n          const payload = JSON.parse(atob(token.split('.')[1]));\n          const userRole = payload.role || 'guest';\n          if (userRole.toLowerCase() !== 'administrador' && userRole.toLowerCase() !== 'ramon') {\n            console.log('ACCESO DENEGADO: Redirigiendo...');\n            window.location.href = '/';\n          }\n        } else {\n          window.location.href = '/login';\n        }\n      } catch (e) {\n        console.error('Error:', e);\n        window.location.href = '/';\n      }\n    })();\n  <\/script> ", "    ", '<div class="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 mb-6 rounded shadow-sm"> <h2 data-i18n-key="backup.protocol" class="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">', '</h2> <div class="text-sm text-blue-700 dark:text-blue-200 space-y-2"> <p><strong data-i18n-key="backup.automatic">', ':</strong> <span data-i18n-key="backup.automaticDesc">', '</span></p> <ul class="list-disc ml-5 space-y-1"> <li data-i18n-key="backup.autoDaily">', '</li> <li data-i18n-key="backup.autoNewAnimals">', '</li> <li data-i18n-key="backup.autoEditedAnimals">', '</li> <li data-i18n-key="backup.autoAfterImport">', '</li> </ul> <p class="mt-2"><strong data-i18n-key="backup.retentionPolicy">', ':</strong> <span data-i18n-key="backup.retentionDesc">', '</span></p> <ul class="list-disc ml-5 space-y-1"> <li data-i18n-key="backup.retentionDaily">', '</li> <li data-i18n-key="backup.retentionWeekly">', '</li> </ul> <p class="mt-2"><strong data-i18n-key="backup.storage">', ':</strong> <span data-i18n-key="backup.storageDesc">', '</span></p> <p class="mt-2"><strong data-i18n-key="backup.manualBackups">', ':</strong> <span data-i18n-key="backup.manualDesc">', '</span></p> </div> </div>  <div id="alert-container" class="hidden mb-4"> <div id="alert" class="p-4 rounded-md text-center"> <span id="alert-message"></span> </div> </div> <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"> <!-- Crear backup --> <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700"> <h2 data-i18n-key="backup.createBackup" class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">', '</h2> <p data-i18n-key="backup.createDesc" class="text-gray-600 dark:text-gray-300 mb-4">', '</p> <div class="space-y-4"> <div> <label class="flex items-center space-x-2 text-gray-700 dark:text-gray-200"> <input type="checkbox" id="include-animals" checked class="form-checkbox text-primary dark:border-gray-600"> <span data-i18n-key="backup.includeAnimals">', '</span> </label> </div> <div> <label class="flex items-center space-x-2 text-gray-700 dark:text-gray-200"> <input type="checkbox" id="include-births" checked class="form-checkbox text-primary dark:border-gray-600"> <span data-i18n-key="backup.includeBirths">', '</span> </label> </div> <div> <label class="flex items-center space-x-2 text-gray-700 dark:text-gray-200"> <input type="checkbox" id="include-config" checked class="form-checkbox text-primary dark:border-gray-600"> <span data-i18n-key="backup.includeConfig">', '</span> </label> </div> </div> <div class="mt-4"> <button id="create-backup-btn" class="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light"> <span data-i18n-key="backup.createButton">', '</span> </button> </div> </div> <!-- Restaurar backup --> <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700"> <h2 data-i18n-key="backup.restoreBackup" class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">', "</h2> ", ' <p class="text-gray-600 dark:text-gray-300 mb-4"> <span data-i18n-key="backup.restoreDesc">', '</span> <span data-i18n-key="backup.warning" class="font-semibold text-amber-600 dark:text-amber-400">', '</span> </p> <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-4 text-center" id="restore-section"> <div id="selected-backup-container" class="hidden"> <p class="mb-2" data-i18n-key="backup.selectFile">', ': <span id="selected-backup-name" class="font-semibold"></span></p> <button id="change-backup-btn" class="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors" data-requires-admin="true" data-i18n-key="backup.selectButton">', '</button> </div> <div id="no-selected-backup-container" class="text-gray-500 dark:text-gray-400"> <p class="mb-2" data-i18n-key="backup.selectFile">', '</p> <p class="text-sm" data-i18n-key="backup.or">', '</p> <button id="select-backup-btn" class="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors" data-requires-admin="true" data-i18n-key="backup.selectButton">', '</button> </div> </div> <button id="restore-backup-btn" class="w-full px-4 py-2 bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-md transition-colors opacity-50 cursor-not-allowed" disabled data-requires-admin="true" data-i18n-key="backup.restoreButton">', '</button> </div> </div>  <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700"> <h3 class="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-lg font-semibold text-gray-800 dark:text-white">', '</h3> <div class="overflow-x-auto"> <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"> <thead class="bg-gray-50 dark:bg-gray-700"> <tr> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">', '</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">', '</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">', '</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">', '</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">', '</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">', '</th> </tr> </thead> <tbody id="backups-table-body" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"> <!-- Aqu\xED se cargar\xE1n los backups din\xE1micamente --> <tr class="text-center"> <td colspan="5" class="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">', '</td> <td class="px-6 py-4 whitespace-nowrap text-sm font-medium"> <div class="flex space-x-2"> <button class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">', '</button> <button class="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300">', '</button> <button class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">', "</button> </div> </td> </tr> </tbody> </table> </div> </div>   <script>\n    // Ejecutar inmediatamente cuando carga la p\xE1gina\n    (function() {\n      // Verificar si el usuario es Ramon\n      try {\n        const token = localStorage.getItem('token');\n        if (!token) return;\n        \n        const payload = JSON.parse(atob(token.split('.')[1]));\n        const userRole = payload.role;\n        \n        if (userRole === 'Ramon') {\n          console.log('\u26A0\uFE0F Usuario Ramon detectado - Aplicando restricciones espec\xEDficas...');\n          \n          // Funci\xF3n para bloquear completamente el bot\xF3n\n          function bloquearBotonSelectBackup() {\n            const btn = document.getElementById('select-backup-btn');\n            if (!btn) {\n              console.log('Bot\xF3n no encontrado, reintentando en 500ms...');\n              setTimeout(bloquearBotonSelectBackup, 500);\n              return;\n            }\n            \n            // Aplicar m\xFAltiples capas de bloqueo\n            btn.disabled = true;\n            btn.setAttribute('disabled', 'disabled');\n            btn.style.opacity = '0.5';\n            btn.style.pointerEvents = 'none';\n            btn.style.cursor = 'not-allowed';\n            btn.title = 'No tienes permisos para restaurar copias de seguridad';\n            btn.classList.add('opacity-50', 'cursor-not-allowed');\n            btn.classList.remove('hover:bg-gray-300', 'dark:hover:bg-gray-600');\n            \n            // Agregar icono de candado\n            const lockIcon = document.createElement('span');\n            lockIcon.innerHTML = ' \u{1F512}';\n            lockIcon.className = 'ml-2';\n            btn.appendChild(lockIcon);\n            \n            // Sobrescribir handlers\n            btn.onclick = function(e) {\n              e.preventDefault();\n              e.stopPropagation();\n              console.log('Intento de acceso bloqueado');\n              return false;\n            };\n            \n            // Tambi\xE9n bloquear el bot\xF3n change-backup-btn si existe\n            const changeBtn = document.getElementById('change-backup-btn');\n            if (changeBtn) {\n              changeBtn.disabled = true;\n              changeBtn.style.opacity = '0.5';\n              changeBtn.style.pointerEvents = 'none';\n              changeBtn.style.cursor = 'not-allowed';\n            }\n            \n            console.log('\u2705 Bot\xF3n de selecci\xF3n de backup bloqueado exitosamente para Ramon');\n          }\n          \n          // Ejecutar la funci\xF3n inmediatamente\n          bloquearBotonSelectBackup();\n          \n          // Y tambi\xE9n despu\xE9s de un retraso para asegurarnos\n          setTimeout(bloquearBotonSelectBackup, 500);\n          setTimeout(bloquearBotonSelectBackup, 1000);\n          setTimeout(bloquearBotonSelectBackup, 2000);\n          \n          // Ejecutar una \xFAltima vez cuando la ventana est\xE9 completamente cargada\n          window.addEventListener('load', function() {\n            setTimeout(bloquearBotonSelectBackup, 100);\n          });\n        }\n      } catch (e) {\n        console.error('Error al verificar permisos:', e);\n      }\n    })();\n  <\/script> "])), renderComponent($$result2, "PermissionsManager", $$PermissionsManager, {}), maybeRenderHead(), t("backup.protocol", currentLang), t("backup.automatic", currentLang), t("backup.automaticDesc", currentLang), t("backup.autoDaily", currentLang), t("backup.autoNewAnimals", currentLang), t("backup.autoEditedAnimals", currentLang), t("backup.autoAfterImport", currentLang), t("backup.retentionPolicy", currentLang), t("backup.retentionDesc", currentLang), t("backup.retentionDaily", currentLang), t("backup.retentionWeekly", currentLang), t("backup.storage", currentLang), t("backup.storageDesc", currentLang), t("backup.manualBackups", currentLang), t("backup.manualDesc", currentLang), t("backup.createBackup", currentLang), t("backup.createDesc", currentLang), t("backup.includeAnimals", currentLang), t("backup.includeBirths", currentLang), t("backup.includeConfig", currentLang), t("backup.createButton", currentLang), t("backup.restoreBackup", currentLang), userRole !== "administrador" && renderTemplate`<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4"> <div class="flex"> <div class="flex-shrink-0"> <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path> </svg> </div> <div class="ml-3"> <p class="text-sm text-yellow-700">
Esta función de restauración solo está disponible para administradores. Puedes ver y descargar los backups pero no restaurarlos.
</p> </div> </div> </div>`, t("backup.restoreDesc", currentLang), t("backup.warning", currentLang), t("backup.selectFile", currentLang), t("backup.selectButton", currentLang), t("backup.selectFile", currentLang), t("backup.or", currentLang), t("backup.selectButton", currentLang), t("backup.restoreButton", currentLang), t("backup.historyTitle", currentLang), t("backup.date", currentLang), t("backup.size", currentLang), t("backup.createdBy", currentLang), t("backup.type", currentLang) || "Tipo", t("backup.description", currentLang) || "Descripci\xF3n", t("backup.actions", currentLang), t("backup.loading", currentLang), t("backup.download", currentLang), t("backup.restore", currentLang), t("backup.delete", currentLang)) })}`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/backup/index.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/backup/index.astro";
const $$url = "/backup";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=backup.astro.mjs.map
