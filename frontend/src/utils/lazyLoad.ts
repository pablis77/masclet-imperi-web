/**
 * Utilidad para cargar componentes de forma perezosa (lazy loading)
 * Mejora el rendimiento inicial de la aplicación cargando componentes solo cuando son necesarios
 */
import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { logger } from './logger';

/**
 * Carga un componente React de forma perezosa con un mensaje de log
 * @param importFunction - Función de importación dinámica que devuelve una promesa
 * @param componentName - Nombre del componente para logs
 * @returns Componente cargado de forma perezosa
 */
export function lazyLoadComponent<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  componentName: string
): LazyExoticComponent<T> {
  return lazy(() => {
    logger.debug(`Cargando componente: ${componentName}`);
    return importFunction()
      .then((module) => {
        logger.debug(`Componente cargado con éxito: ${componentName}`);
        return module;
      })
      .catch((error) => {
        logger.error(`Error al cargar el componente ${componentName}:`, error);
        throw error;
      });
  });
}

/**
 * Cargar componentes de forma perezosa con suspense
 * Ejemplo de uso:
 * 
 * ```tsx
 * // En tu componente principal:
 * const LazyDashboard = lazyLoadComponent(() => import('../components/Dashboard'), 'Dashboard');
 * 
 * // Al renderizar:
 * <Suspense fallback={<div>Cargando...</div>}>
 *   <LazyDashboard />
 * </Suspense>
 * ```
 */
