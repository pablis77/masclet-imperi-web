// Mock Data para desarrollo
// Este archivo proporciona datos simulados para todas las entidades de la aplicación

import type { UserRole } from './authService';

// Tipos básicos
export interface Animal {
  id: number;
  explotacio: string;
  nom: string;
  genere: 'M' | 'F';
  estado: 'OK' | 'DEF';
  alletar: '0' | '1' | '2';
  pare?: string | null;
  mare?: string | null;
  quadra?: string | null;
  cod?: string | null;
  num_serie?: string | null;
  dob?: string | null; // fecha de nacimiento
  created_at: string;
  updated_at: string;
}

export interface Explotacio {
  id: number;
  explotacio: string;   // Identificador único de la explotación
  animal_count?: number; // Cantidad de animales en la explotación
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  password?: string; // Añadido para simulación
  full_name?: string; // Añadido para compatibilidad con authService
}

export interface Part {
  id: number;
  animal_id: number;
  animal_nom?: string;
  data: string; // fecha del parto
  num_cries: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ImportHistoryItem {
  id: number;
  filename: string;
  user_id: number;
  user_name?: string;
  import_type: string;
  total_records: number;
  successful_records: number;
  failed_records: number;
  status: 'completed' | 'failed' | 'processing' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface ImportHistoryFilters {
  import_type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// Datos de ejemplo
export const mockAnimals: Animal[] = [
  {
    id: 1,
    nom: 'Lucero',
    explotacio: '1',
    genere: 'M',
    estado: 'OK',
    alletar: '0',
    pare: null,
    mare: null,
    quadra: 'Q1',
    cod: 'A001',
    num_serie: 'SN001',
    dob: '2020-05-15',
    created_at: '2023-01-10T10:00:00Z',
    updated_at: '2023-01-10T10:00:00Z'
  },
  {
    id: 2,
    nom: 'Estrella',
    explotacio: '1',
    genere: 'F',
    estado: 'OK',
    alletar: '1',
    pare: 'Lucero',
    mare: null,
    quadra: 'Q2',
    cod: 'A002',
    num_serie: 'SN002',
    dob: '2019-08-20',
    created_at: '2023-01-10T10:00:00Z',
    updated_at: '2023-01-10T10:00:00Z'
  },
  {
    id: 3,
    nom: 'Luna',
    explotacio: '2',
    genere: 'F',
    estado: 'OK',
    alletar: '2',
    pare: null,
    mare: null,
    quadra: 'Q1',
    cod: 'A003',
    num_serie: 'SN003',
    dob: '2021-02-10',
    created_at: '2023-01-10T10:00:00Z',
    updated_at: '2023-01-10T10:00:00Z'
  },
  {
    id: 4,
    nom: 'Tornado',
    explotacio: '2',
    genere: 'M',
    estado: 'DEF',
    alletar: '0',
    pare: 'Lucero',
    mare: 'Estrella',
    quadra: 'Q3',
    cod: 'A004',
    num_serie: 'SN004',
    dob: '2020-11-05',
    created_at: '2023-01-10T10:00:00Z',
    updated_at: '2023-01-10T10:00:00Z'
  },
  {
    id: 5,
    nom: 'Trueno',
    explotacio: 'EXP001',
    genere: 'M',
    estado: 'OK',
    alletar: '0',
    pare: null,
    mare: null,
    quadra: 'Q1',
    cod: 'A005',
    num_serie: 'SN005',
    dob: '2022-03-18',
    created_at: '2023-01-10T10:00:00Z',
    updated_at: '2023-01-10T10:00:00Z'
  }
];

export const mockExplotacions: Explotacio[] = [
  {
    id: 1,
    explotacio: 'EXP001',
    animal_count: 25,
    created_at: '2022-10-01T09:00:00Z',
    updated_at: '2023-01-05T14:30:00Z'
  },
  {
    id: 2,
    explotacio: 'EXP002',
    animal_count: 20,
    created_at: '2022-11-01T10:00:00Z',
    updated_at: '2023-01-10T10:00:00Z'
  },
  {
    id: 3,
    explotacio: 'EXP003',
    animal_count: 15,
    created_at: '2022-12-01T11:00:00Z',
    updated_at: '2023-01-15T11:00:00Z'
  },
  {
    id: 4,
    explotacio: 'EXP004',
    animal_count: 10,
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-20T12:00:00Z'
  },
  {
    id: 5,
    explotacio: 'EXP005',
    animal_count: 5,
    created_at: '2023-01-05T13:00:00Z',
    updated_at: '2023-01-25T13:00:00Z'
  }
];

export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'administrador',
    first_name: 'Administrador',
    last_name: '',
    is_active: true,
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2023-01-01T10:00:00Z',
    password: 'password123', // Añadido para simulación
    full_name: 'Administrador' // Añadido para compatibilidad con authService
  },
  {
    id: 2,
    username: 'gerente',
    email: 'gerente@example.com',
    role: 'gerente',
    first_name: 'Gerente',
    last_name: 'Principal',
    is_active: true,
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2023-01-01T10:00:00Z',
    password: 'password123', // Añadido para simulación
    full_name: 'Gerente Principal' // Añadido para compatibilidad con authService
  },
  {
    id: 3,
    username: 'editor',
    email: 'editor@example.com',
    role: 'editor',
    first_name: 'Editor',
    last_name: '',
    is_active: true,
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2023-01-01T10:00:00Z',
    password: 'password123', // Añadido para simulación
    full_name: 'Editor' // Añadido para compatibilidad con authService
  },
  {
    id: 4,
    username: 'usuario',
    email: 'usuario@example.com',
    role: 'usuario',
    first_name: 'Usuario',
    last_name: 'Estándar',
    is_active: true,
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2023-01-01T10:00:00Z',
    password: 'password123', // Añadido para simulación
    full_name: 'Usuario Estándar' // Añadido para compatibilidad con authService
  }
];

export const mockParts: Part[] = [
  {
    id: 1,
    animal_id: 2,
    animal_nom: 'Estrella',
    data: '2022-04-10',
    num_cries: 1,
    notes: '',
    created_at: '2022-04-10T10:00:00Z',
    updated_at: '2022-04-10T10:00:00Z'
  },
  {
    id: 2,
    animal_id: 3,
    animal_nom: 'Luna',
    data: '2022-06-15',
    num_cries: 1,
    notes: '',
    created_at: '2022-06-15T10:00:00Z',
    updated_at: '2022-06-15T10:00:00Z'
  },
  {
    id: 3,
    animal_id: 3,
    animal_nom: 'Luna',
    data: '2023-07-20',
    num_cries: 2,
    notes: '',
    created_at: '2023-07-20T10:00:00Z',
    updated_at: '2023-07-20T10:00:00Z'
  }
];

// Mock data para el historial de importaciones
export const mockImportHistory: ImportHistoryItem[] = [
  {
    id: 1,
    filename: 'animales_enero_2023.csv',
    user_id: 1,
    user_name: 'Admin',
    import_type: 'animals',
    total_records: 50,
    successful_records: 48,
    failed_records: 2,
    status: 'completed',
    created_at: '2023-01-15T14:22:30Z',
    updated_at: '2023-01-15T14:22:45Z'
  },
  {
    id: 2,
    filename: 'animales_febrero_2023.csv',
    user_id: 1,
    user_name: 'Admin',
    import_type: 'animals',
    total_records: 35,
    successful_records: 35,
    failed_records: 0,
    status: 'completed',
    created_at: '2023-02-10T09:45:12Z',
    updated_at: '2023-02-10T09:45:30Z'
  },
  {
    id: 3,
    filename: 'animales_marzo_2023.csv',
    user_id: 2,
    user_name: 'María Gómez',
    import_type: 'animals',
    total_records: 42,
    successful_records: 38,
    failed_records: 4,
    status: 'completed',
    created_at: '2023-03-05T11:32:45Z',
    updated_at: '2023-03-05T11:33:10Z'
  },
  {
    id: 4,
    filename: 'importacion_fallida.csv',
    user_id: 1,
    user_name: 'Admin',
    import_type: 'animals',
    total_records: 15,
    successful_records: 0,
    failed_records: 15,
    status: 'failed',
    created_at: '2023-04-12T16:18:22Z',
    updated_at: '2023-04-12T16:18:35Z'
  },
  {
    id: 5,
    filename: 'nuevos_animales.csv',
    user_id: 3,
    user_name: 'Pedro Sánchez',
    import_type: 'animals',
    total_records: 25,
    successful_records: 20,
    failed_records: 5,
    status: 'completed',
    created_at: '2023-05-20T10:15:30Z',
    updated_at: '2023-05-20T10:15:55Z'
  },
  {
    id: 6,
    filename: 'importacion_actual.csv',
    user_id: 1,
    user_name: 'Admin',
    import_type: 'animals',
    total_records: 30,
    successful_records: 0,
    failed_records: 0,
    status: 'processing',
    created_at: '2023-06-01T08:45:00Z',
    updated_at: '2023-06-01T08:45:00Z'
  }
];

// Datos para el dashboard
export const mockDashboardData = {
  totalAnimals: mockAnimals.length,
  maleAnimals: mockAnimals.filter(a => a.genere === 'M').length,
  femaleAnimals: mockAnimals.filter(a => a.genere === 'F').length,
  okAnimals: mockAnimals.filter(a => a.estado === 'OK').length,
  defAnimals: mockAnimals.filter(a => a.estado === 'DEF').length,
  allettingAnimals: mockAnimals.filter(a => a.alletar !== '0').length,
  explotacionsCount: mockExplotacions.length,
  recentParts: mockParts.slice(0, 3).map(p => ({
    id: p.id,
    animal_id: p.animal_id,
    animal_nom: p.animal_nom,
    data: p.data,
    num_cries: p.num_cries
  }))
};

// Datos simulados para endpoints específicos
// Estos objetos deben coincidir con las rutas de la API sin el prefijo /api/v1/
export const animalsData = {
  items: mockAnimals,
  total: mockAnimals.length,
  page: 1,
  limit: 10,
  pages: 1
};

// Para obtener un animal específico por ID
export const getAnimalById = (id: number) => {
  const animal = mockAnimals.find(a => a.id === id);
  if (animal) return animal;
  return null;
};

// Para el endpoint dashboard/stats
export const dashboardStats = mockDashboardData;

// Para el endpoint explotacions
export const explotacionsData = {
  items: mockExplotacions,
  total: mockExplotacions.length,
  page: 1,
  limit: 10,
  pages: 1
};

// Para obtener una explotación específica por ID
export const getExplotacionById = (id: number) => {
  const explotacion = mockExplotacions.find(e => e.id === id);
  if (explotacion) return explotacion;
  return null;
};

// Para el endpoint animals por explotación
export const getAnimalsByExplotacion = (explotacioId: number) => {
  const filteredAnimals = mockAnimals.filter(animal => animal.explotacio === String(explotacioId));
  return {
    items: filteredAnimals,
    total: filteredAnimals.length,
    page: 1,
    limit: 10,
    pages: 1
  };
};

// Para el endpoint parts
export const partsData = {
  items: mockParts,
  total: mockParts.length,
  page: 1,
  limit: 10,
  pages: 1
};

// Para obtener los partos de un animal específico
export const getPartsByAnimal = (animalId: number) => {
  const filteredParts = mockParts.filter(p => p.animal_id === animalId);
  return {
    items: filteredParts,
    total: filteredParts.length,
    page: 1,
    limit: 10,
    pages: 1
  };
};

// Para el endpoint import-history
export const importHistory = {
  items: mockImportHistory,
  total: mockImportHistory.length,
  page: 1,
  limit: 10,
  pages: 1
};

// Para el endpoint users
export const usersData = {
  items: mockUsers,
  total: mockUsers.length,
  page: 1,
  limit: 10,
  pages: 1
};
