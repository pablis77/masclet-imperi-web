/**
 * Definiciones de tipos para la aplicación
 */

// Tipos para animales
export interface Parto {
  id?: number;
  animal_id?: number;
  animal_nom?: string;
  part?: string | null;  // Fecha del parto (DD/MM/YYYY)
  GenereT?: 'M' | 'F' | 'esforrada' | null;
  EstadoT?: 'OK' | 'DEF' | null;
  created_at?: string;
  updated_at?: string;
}

export interface Animal {
  id: number;
  explotacio: string;
  nom: string;
  genere: 'M' | 'F';
  estado: 'OK' | 'DEF';
  alletar: '0' | '1' | '2' | null;  // 0: No amamanta, 1: Un ternero, 2: Dos terneros (solo para vacas)
  pare?: string | null;
  mare?: string | null;
  quadra?: string | null;
  cod?: string | null;
  num_serie?: string | null;
  dob?: string | null;
  created_at?: string;
  updated_at?: string;
  partos?: Parto[] | { items: Parto[] };
  parts?: Parto[];  // Soporte para nombre anterior (retrocompatibilidad)
  estat?: 'OK' | 'DEF';  // Soporte para nombre anterior (retrocompatibilidad)
}

export interface AnimalCreateDto {
  explotacio: string;
  nom: string;
  genere: 'M' | 'F';
  estado: 'OK' | 'DEF';
  alletar: '0' | '1' | '2' | null;
  pare?: string | null;
  mare?: string | null;
  quadra?: string | null;
  cod?: string | null;
  num_serie?: string | null;
  dob?: string | null;
}

export interface AnimalUpdateDto extends Partial<AnimalCreateDto> {}

export interface AnimalFilters {
  explotacio?: string;
  genere?: 'M' | 'F';
  estado?: 'OK' | 'DEF';
  alletar?: '0' | '1' | '2';
  quadra?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Tipos para formularios
export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  value: any;
  originalValue: any;
  required?: boolean;
  options?: {value: string, label: string}[];
  validator?: (value: any) => string | null;
  apiField?: string; // Campo correspondiente en la API si es diferente
}

export interface FormState {
  fields: Record<string, FormField>;
  errors: Record<string, string | null>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// Tipos para mensajes y notificaciones
export type MessageType = 'success' | 'error' | 'info' | 'warning';

export interface Message {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  duration?: number; // en milisegundos
  dismissible?: boolean;
}

// Tipos para la caché
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number; // Tiempo de expiración en milisegundos
}

export interface CacheOptions {
  ttl?: number; // Tiempo de vida en milisegundos
  key?: string; // Clave personalizada
  forceRefresh?: boolean; // Forzar actualización de caché
}
