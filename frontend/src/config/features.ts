/**
 * Configuración de features
 * Este archivo centraliza la activación/desactivación de funcionalidades
 */

export const FEATURES = {
  // Características generales
  ENABLE_NOTIFICATIONS: false, // Desactivado temporalmente por petición del usuario
  ENABLE_LANGUAGE_SWITCHER: true,
  
  // Características por sección
  DASHBOARD: {
    ENABLE_CHARTS: true,
    ENABLE_STATS: true
  },
  
  // Configuraciones de entorno
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production'
};

export default FEATURES;
