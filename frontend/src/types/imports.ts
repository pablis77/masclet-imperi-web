/**
 * Tipos para el módulo de importaciones
 */

// Resultado de una importación
export interface ImportResult {
  success: boolean;
  message: string;
  total_processed?: number;
  total_imported?: number;
  total_errors?: number;
  errors?: string[];
  imported_ids?: number[];
}

// Estados posibles de una importación
export enum ImportStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed"
}

// Filtros para el historial de importaciones
export interface ImportHistoryFilters {
  status?: string;
  page?: number;
  limit?: number;
}

// Respuesta paginada para listados
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
