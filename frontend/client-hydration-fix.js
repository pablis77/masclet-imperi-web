// Este script corrige problemas de hidratación en despliegue
// Debe ser incluido en el HTML antes de cargar los componentes

window.fixVendorHydration = function() {
  // Crear un objeto global S si no existe para evitar el error "Cannot access 'S' before initialization"
  if (typeof window.S === 'undefined') {
    console.log('[Hydration Fix] Inicializando objeto S global');
    window.S = {};
  }

  // Función auxiliar para comprobar si un componente ya está hidratado
  window.isComponentHydrated = function(componentId) {
    return document.querySelector(`astro-island[uid="${componentId}"][data-hydrated]`) !== null;
  };

  // Intentar hidratar componentes manualmente si la hidratación automática falla
  window.manualHydrate = function(componentId) {
    const island = document.querySelector(`astro-island[uid="${componentId}"]:not([data-hydrated])`);
    if (island) {
      console.log(`[Hydration Fix] Hidratando manualmente: ${componentId}`);
      island.dispatchEvent(new CustomEvent('astro:hydrate'));
      return true;
    }
    return false;
  };
};

// Ejecutar automáticamente cuando se carga
window.addEventListener('DOMContentLoaded', () => {
  console.log('[Hydration Fix] Script de corrección de hidratación cargado');
  if (typeof window.fixVendorHydration === 'function') {
    window.fixVendorHydration();
  }
});
