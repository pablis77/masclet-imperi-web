import type { Animal, AnimalFilters, PaginatedResponse } from '../types/types';
import { cachedFetch } from '../stores/cacheStore';
import animalService from './animalService';

// Tiempo de vida predeterminado para la caché de animales (2 minutos)
const ANIMALS_CACHE_TTL = 2 * 60 * 1000;

// Tiempo de vida para datos que cambian con menos frecuencia (10 minutos)
const STATIC_DATA_CACHE_TTL = 10 * 60 * 1000;

/**
 * Servicio para manejar el caché de datos de animales
 */
const animalCacheService = {
  /**
   * Obtiene un animal por su ID (con caché)
   * @param id - ID del animal
   * @param forceRefresh - Si es true, ignora la caché y obtiene datos frescos
   * @returns Promesa con los datos del animal
   */
  async getAnimal(id: number | string, forceRefresh = false): Promise<Animal> {
    const cacheKey = `animal_${id}`;
    
    return cachedFetch(
      cacheKey,
      () => animalService.getAnimalById(Number(id)),
      {
        ttl: ANIMALS_CACHE_TTL,
        forceRefresh
      }
    );
  },
  
  /**
   * Obtiene una lista paginada de animales (con caché)
   * @param filters - Filtros para la búsqueda
   * @param forceRefresh - Si es true, ignora la caché y obtiene datos frescos
   * @returns Promesa con la respuesta paginada
   */
  async getAnimals(
    filters: AnimalFilters = {},
    forceRefresh = false
  ): Promise<PaginatedResponse<Animal>> {
    // Generar una clave de caché basada en los filtros
    const filterString = Object.entries(filters)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const cacheKey = `animals_${filterString || 'all'}`;
    
    return cachedFetch(
      cacheKey,
      () => animalService.getAnimals(filters),
      {
        ttl: ANIMALS_CACHE_TTL,
        forceRefresh
      }
    );
  },
  
  /**
   * Obtiene las explotaciones disponibles (con caché)
   * @param forceRefresh - Si es true, ignora la caché y obtiene datos frescos
   * @returns Promesa con las explotaciones
   */
  async getExplotacions(forceRefresh = false): Promise<{id: number, explotacio: string}[]> {
    const cacheKey = 'explotacions';
    
    return cachedFetch(
      cacheKey,
      () => animalService.getExplotacions(),
      {
        ttl: STATIC_DATA_CACHE_TTL,
        forceRefresh
      }
    );
  },
  
  /**
   * Obtiene los posibles padres para un animal (con caché)
   * @param explotacioId - ID de la explotación
   * @param forceRefresh - Si es true, ignora la caché y obtiene datos frescos
   * @returns Promesa con los posibles padres
   */
  async getPotentialFathers(
    explotacioId?: number | string,
    forceRefresh = false
  ): Promise<Animal[]> {
    const cacheKey = `potential_fathers_${explotacioId || 'all'}`;
    
    return cachedFetch(
      cacheKey,
      () => animalService.getPotentialFathers(explotacioId),
      {
        ttl: STATIC_DATA_CACHE_TTL,
        forceRefresh
      }
    );
  },
  
  /**
   * Obtiene las posibles madres para un animal (con caché)
   * @param explotacioId - ID de la explotación
   * @param forceRefresh - Si es true, ignora la caché y obtiene datos frescos
   * @returns Promesa con las posibles madres
   */
  async getPotentialMothers(
    explotacioId?: number | string,
    forceRefresh = false
  ): Promise<Animal[]> {
    const cacheKey = `potential_mothers_${explotacioId || 'all'}`;
    
    return cachedFetch(
      cacheKey,
      () => animalService.getPotentialMothers(explotacioId),
      {
        ttl: STATIC_DATA_CACHE_TTL,
        forceRefresh
      }
    );
  },
  
  /**
   * Invalida la caché de un animal específico
   * @param id - ID del animal
   */
  invalidateAnimal(id: number | string): void {
    // Eliminar la caché del animal
    const cacheKey = `animal_${id}`;
    removeCache(cacheKey);
    
    // También invalidar las listas que podrían contener este animal
    this.invalidateAnimalLists();
  },
  
  /**
   * Invalida todas las listas de animales en caché
   */
  invalidateAnimalLists(): void {
    // Eliminar todas las entradas de caché que empiecen por "animals_"
    const cacheState = cacheStore.get();
    
    Object.keys(cacheState).forEach(key => {
      if (key.startsWith('animals_') || 
          key.startsWith('potential_fathers_') || 
          key.startsWith('potential_mothers_')) {
        removeCache(key);
      }
    });
  }
};

// Importar funciones necesarias del cacheStore
import { cacheStore, removeCache } from '../stores/cacheStore';

export default animalCacheService;
