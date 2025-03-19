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
    username: 'gerente',
    email: 'gerente@example.com',
    full_name: 'Gerente de Explotaciones',
    role: 'gerente',
    is_active: false,
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
      
      // DESARROLLO: Usar datos simulados
      let filteredUsers = [...MOCK_USERS];
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
          u.username.toLowerCase().includes(searchLower) || 
          u.email.toLowerCase().includes(searchLower) || 
          u.full_name.toLowerCase().includes(searchLower)
        );
      }
      
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedUsers = filteredUsers.slice(start, end);
      
      return {
        items: paginatedUsers,
        total: filteredUsers.length,
        page: page,
        limit: limit,
        pages: Math.ceil(filteredUsers.length / limit)
      };
      
      // Código real comentado
      /*
      const response = await api.get('/users', {
        params: { page, limit, search }
      });
      return response as PaginatedResponse<User>;
      */
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  // Obtiene un usuario por su ID
  async getUserById(id: number): Promise<User> {
    try {
      // DESARROLLO: Usar datos simulados
      const user = MOCK_USERS.find(u => u.id === id);
      if (!user) {
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }
      return user;
      
      // Código real comentado
      /*
      const response = await api.get(`/users/${id}`);
      return response as User;
      */
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${id}:`, error);
      throw error;
    }
  },

  // Crea un nuevo usuario
  async createUser(userData: UserCreateDto): Promise<User> {
    try {
      // DESARROLLO: Simular creación
      const newUser: User = {
        id: Math.max(...MOCK_USERS.map(u => u.id)) + 1,
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name || '',
        role: userData.role,
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      MOCK_USERS.push(newUser);
      return newUser;
      
      // Código real comentado
      /*
      const response = await api.post('/users', userData);
      return response as User;
      */
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  // Actualiza un usuario existente
  async updateUser(id: number, userData: UserUpdateDto): Promise<User> {
    try {
      // DESARROLLO: Simular actualización
      const index = MOCK_USERS.findIndex(u => u.id === id);
      if (index === -1) {
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }
      
      const updatedUser = {
        ...MOCK_USERS[index],
        ...userData,
        updated_at: new Date().toISOString()
      };
      
      MOCK_USERS[index] = updatedUser;
      return updatedUser;
      
      // Código real comentado
      /*
      const response = await api.put(`/users/${id}`, userData);
      return response as User;
      */
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw error;
    }
  },

  // Elimina un usuario (desactivarlo)
  async deleteUser(id: number): Promise<void> {
    try {
      // DESARROLLO: Simular eliminación
      const index = MOCK_USERS.findIndex(u => u.id === id);
      if (index === -1) {
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }
      
      MOCK_USERS[index] = {
        ...MOCK_USERS[index],
        is_active: false,
        updated_at: new Date().toISOString()
      };
      
      // Código real comentado
      /*
      await api.delete(`/users/${id}`);
      */
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw error;
    }
  }
};

export default userService;
