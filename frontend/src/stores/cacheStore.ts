import { map } from 'nanostores';
import type { CacheItem, CacheOptions } from '../types/types';

// Tiempo de vida predeterminado para la caché (5 minutos)
const DEFAULT_TTL = 5 * 60 * 1000;

// Store para gestionar la caché de datos
export const cacheStore = map<Record<string, CacheItem<any>>>({});

/**
 * Guarda datos en la caché
 * @param key - Clave para identificar los datos
 * @param data - Datos a almacenar
 * @param options - Opciones de caché
 */
export function setCache<T>(key: string, data: T, options?: CacheOptions): void {
  const ttl = options?.ttl || DEFAULT_TTL;
  
  cacheStore.setKey(key, {
    data,
    timestamp: Date.now(),
    expiry: ttl
  });
}

/**
 * Obtiene datos de la caché
 * @param key - Clave de los datos
 * @param options - Opciones de caché
 * @returns Los datos almacenados o null si no existen o han expirado
 */
export function getCache<T>(key: string, options?: CacheOptions): T | null {
  // Si se solicita forzar refresco, ignorar la caché
  if (options?.forceRefresh) {
    return null;
  }
  
  const cacheItem = cacheStore.get()[key] as CacheItem<T> | undefined;
  
  // Si no hay datos en caché, devolver null
  if (!cacheItem) {
    return null;
  }
  
  // Comprobar si los datos han expirado
  const now = Date.now();
  const isExpired = now - cacheItem.timestamp > cacheItem.expiry;
  
  if (isExpired) {
    // Eliminar datos expirados
    removeCache(key);
    return null;
  }
  
  return cacheItem.data;
}

/**
 * Elimina datos de la caché
 * @param key - Clave de los datos a eliminar
 */
export function removeCache(key: string): void {
  const state = cacheStore.get();
  const { [key]: _, ...rest } = state;
  cacheStore.set(rest);
}

/**
 * Limpia toda la caché o los elementos expirados
 * @param onlyExpired - Si es true, solo elimina los elementos expirados
 */
export function clearCache(onlyExpired: boolean = false): void {
  if (!onlyExpired) {
    cacheStore.set({});
    return;
  }
  
  const now = Date.now();
  const state = cacheStore.get();
  const newState: Record<string, CacheItem<any>> = {};
  
  // Mantener solo los elementos no expirados
  Object.entries(state).forEach(([key, item]: [string, CacheItem<any>]) => {
    if (now - item.timestamp <= item.expiry) {
      newState[key] = item;
    }
  });
  
  cacheStore.set(newState);
}

/**
 * Función para envolver peticiones a la API con caché
 * @param key - Clave para la caché
 * @param fetchFn - Función que realiza la petición a la API
 * @param options - Opciones de caché
 * @returns Resultado de la petición (desde caché o desde la API)
 */
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  // Usar clave personalizada si se proporciona
  const cacheKey = options?.key || key;
  
  // Intentar obtener datos de la caché
  const cachedData = getCache<T>(cacheKey, options);
  if (cachedData !== null) {
    console.log(`Usando datos en caché para: ${cacheKey}`);
    return cachedData;
  }
  
  // Si no hay datos en caché o han expirado, realizar la petición
  console.log(`Obteniendo datos frescos para: ${cacheKey}`);
  const data = await fetchFn();
  
  // Guardar los nuevos datos en la caché
  setCache(cacheKey, data, options);
  
  return data;
}
