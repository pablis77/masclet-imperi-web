// Mock Data para desarrollo
// Este archivo proporciona datos simulados para todas las entidades de la aplicación

import type { UserRole } from './authService';

// Tipos básicos
export interface Animal {
  id: number;
  explotacio_id: number;
  nom: string;
  genere: 'M' | 'F';
  estat: 'ACT' | 'DEF';
  alletar: 'NO' | '1' | '2';
  pare_id?: number | null;
  pare_nom?: string | null;
  mare_id?: number | null;
  mare_nom?: string | null;
  quadra?: string | null;
  cod?: string | null;
  num_serie?: string | null;
  dob?: string | null; // fecha de nacimiento
  created_at: string;
  updated_at: string;
}

export interface Explotacio {
  id: number;
  nombre: string;
  direccion?: string;
  codigo?: string;
  responsable?: string;
  telefono?: string;
  email?: string;
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
    explotacio_id: 1,
    genere: 'M',
    estat: 'ACT',
    alletar: 'NO',
    pare_id: null,
    mare_id: null,
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
    explotacio_id: 1,
    genere: 'F',
    estat: 'ACT',
    alletar: '1',
    pare_id: 1,
    pare_nom: 'Lucero',
    mare_id: null,
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
    explotacio_id: 2,
    genere: 'F',
    estat: 'ACT',
    alletar: '2',
    pare_id: null,
    mare_id: null,
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
    explotacio_id: 2,
    genere: 'M',
    estat: 'DEF',
    alletar: 'NO',
    pare_id: 1,
    pare_nom: 'Lucero',
    mare_id: 2,
    mare_nom: 'Estrella',
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
    explotacio_id: 1,
    genere: 'M',
    estat: 'ACT',
    alletar: 'NO',
    pare_id: null,
    mare_id: null,
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
    nombre: 'Explotación Norte',
    direccion: 'Camino de los Molinos, 23',
    codigo: 'EXP001',
    responsable: 'Juan Martínez',
    telefono: '654123987',
    email: 'juan@explotacionnorte.com',
    animal_count: 3,
    created_at: '2023-01-01T09:00:00Z',
    updated_at: '2023-01-01T09:00:00Z'
  },
  {
    id: 2,
    nombre: 'Explotación Sur',
    direccion: 'Carretera de Valencia, km 12',
    codigo: 'EXP002',
    responsable: 'María Gómez',
    telefono: '678456321',
    email: 'maria@explotacionsur.com',
    animal_count: 2,
    created_at: '2023-01-02T10:30:00Z',
    updated_at: '2023-01-02T10:30:00Z'
  },
  {
    id: 3,
    nombre: 'Granja El Amanecer',
    direccion: 'Partida La Vall, s/n',
    codigo: 'EXP003',
    responsable: 'Pedro Sánchez',
    telefono: '612345678',
    email: 'pedro@elamanecer.com',
    animal_count: 0,
    created_at: '2023-01-15T11:45:00Z',
    updated_at: '2023-01-15T11:45:00Z'
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
  okAnimals: mockAnimals.filter(a => a.estat === 'ACT').length,
  defAnimals: mockAnimals.filter(a => a.estat === 'DEF').length,
  allettingAnimals: mockAnimals.filter(a => a.alletar !== 'NO').length,
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
  const filteredAnimals = mockAnimals.filter(a => a.explotacio_id === explotacioId);
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
