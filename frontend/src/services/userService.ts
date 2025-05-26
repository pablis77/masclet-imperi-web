import api from './api';
import type { UserRole } from './authService';

// Interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreateDto {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  role: UserRole;
  is_active?: boolean;
}

export interface UserUpdateDto extends Partial<Omit<UserCreateDto, 'password'>> {
  password?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Datos simulados para desarrollo
const MOCK_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    full_name: 'Administrador',
    role: 'administrador',
    is_active: true,
    created_at: '2023-01-15T10:00:00Z',
    updated_at: '2023-02-20T11:30:00Z'
  },
  {
    id: 2,
    username: 'usuario',
    email: 'usuario@example.com',
    full_name: 'Usuario Estándar',
    role: 'usuario',
    is_active: true,
    created_at: '2023-02-15T10:00:00Z',
    updated_at: '2023-03-20T11:30:00Z'
  },
  {
    id: 3,
    username: 'editor',
    email: 'editor@example.com',
    full_name: 'Editor de Contenido',
    role: 'editor',
    is_active: true,
    created_at: '2023-03-15T10:00:00Z',
    updated_at: '2023-04-20T11:30:00Z'
  },
  {
    id: 4,
    username: 'ramon',
    email: 'ramon@example.com',
    full_name: 'Ramon de Explotaciones',
    role: 'Ramon',
    is_active: true,
    created_at: '2023-04-15T10:00:00Z',
    updated_at: '2023-05-20T11:30:00Z'
  }
];

// Servicio de usuarios
const userService = {
  // Obtiene una lista paginada de usuarios
  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<User>> {
    try {
      console.log(`Obteniendo usuarios - Página: ${page}, Límite: ${limit}, Búsqueda: ${search || 'ninguna'}`);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      
      // Llamar al endpoint real
      const response = await api.get<PaginatedResponse<User>>(`/users/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      // Si falla, devolver datos vacíos con formato correcto
      return {
        items: [],
        total: 0,
        page,
        limit,
        pages: 0
      };
    }
  },

  // Obtiene un usuario por su ID
  async getUserById(id: number): Promise<User> {
    try {
      console.log(`Obteniendo usuario con ID: ${id}`);
      
      // Llamar al endpoint real
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${id}:`, error);
      throw error;
    }
  },

  // Crea un nuevo usuario
  async createUser(userData: UserCreateDto): Promise<User> {
    try {
      console.log('Creando nuevo usuario:', userData);
      
      // Llamar al endpoint real
      const response = await api.post<User>('/users/', userData);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  // Actualiza un usuario existente
  async updateUser(id: number, userData: UserUpdateDto): Promise<User> {
    try {
      console.log(`Actualizando usuario con ID ${id}:`, userData);
      
      // Llamar al endpoint real
      const response = await api.put<User>(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw error;
    }
  },

  // Elimina un usuario
  async deleteUser(id: number): Promise<void> {
    try {
      console.log(`Eliminando usuario con ID: ${id}`);
      
      // Llamar al endpoint real
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw error;
    }
  }
};

export default userService;
