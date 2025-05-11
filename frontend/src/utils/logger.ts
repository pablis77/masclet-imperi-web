/**
 * Utilidad de logging para Masclet Imperi Web
 * 
 * Este módulo proporciona funciones para logging que se pueden desactivar automáticamente
 * en producción mientras se mantienen durante el desarrollo.
 */

// Determinar si estamos en producción
const isProduction = import.meta.env.PROD || false;

/**
 * Logger con múltiples niveles que se desactiva automáticamente en producción
 */
const logger = {
  /**
   * Log de información general (desactivado en producción)
   */
  log: (...args: any[]): void => {
    if (!isProduction) {
      console.log(...args);
    }
  },

  /**
   * Log de información (desactivado en producción)
   */
  info: (...args: any[]): void => {
    if (!isProduction) {
      console.info(...args);
    }
  },

  /**
   * Log de depuración (desactivado en producción)
   */
  debug: (...args: any[]): void => {
    if (!isProduction) {
      console.debug(...args);
    }
  },

  /**
   * Log de advertencia (visible también en producción)
   */
  warn: (...args: any[]): void => {
    console.warn(...args);
  },

  /**
   * Log de error (visible también en producción)
   */
  error: (...args: any[]): void => {
    console.error(...args);
  },

  /**
   * Grupo de logs (desactivado en producción)
   */
  group: (label: string): void => {
    if (!isProduction) {
      console.group(label);
    }
  },

  /**
   * Fin de grupo de logs (desactivado en producción)
   */
  groupEnd: (): void => {
    if (!isProduction) {
      console.groupEnd();
    }
  },

  /**
   * Tiempo de ejecución (desactivado en producción)
   */
  time: (label: string): void => {
    if (!isProduction) {
      console.time(label);
    }
  },

  /**
   * Fin de tiempo de ejecución (desactivado en producción)
   */
  timeEnd: (label: string): void => {
    if (!isProduction) {
      console.timeEnd(label);
    }
  },
};

export { logger };
