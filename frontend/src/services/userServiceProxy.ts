import api from './api';
import type { UserRole } from './authService';
import { API_CONFIG } from '../config/apiConfig.centralizado';

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
  // Formato estándar
  items?: T[];
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
  
  // Formatos alternativos
  users?: T[];
  data?: T[];
  results?: T[];
  totalPages?: number;
  totalItems?: number;
  count?: number;
  
  // Para cuando es un array directo
  [key: number]: T;
  length?: number;
}

// Servicio de usuario que conecta con el backend
const userServiceProxy = {
  // Obtiene una lista paginada de usuarios
  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<User> | User[]> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) {
        params.append('search', search);
      }
      
      console.log('Obteniendo usuarios, página:', page, 'límite:', limit);
      
      // Aseguramos que tenemos el token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación disponible');
        return [];
      }
      
      // Configuración explícita para asegurar que se envía el token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      console.log('Enviando solicitud con token:', token.substring(0, 15) + '...');
      
      // Llamamos directamente al endpoint de usuarios con el token
      console.log('URL de solicitud:', `/users?${params.toString()}`);
      
      // IMPLEMENTACIÓN DIRECTA: Usamos fetch en lugar de axios para tener más control
      try {
        console.log('Intentando obtener usuarios con fetch...');
        // Usar la configuración centralizada de apiConfig.ts
        let fullUrl;
        // Construir la URL base usando API_CONFIG
        const baseUrl = API_CONFIG.baseUrl;
        // Asegurar que siempre usamos users/ con barra final para consistencia con el backend
        fullUrl = `${baseUrl}/users/?${params.toString()}`;
        console.log('URL de la API construida desde configuración centralizada:', fullUrl);
        console.log('URL completa:', fullUrl);
        
        const fetchResponse = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (fetchResponse.ok) {
          const jsonData = await fetchResponse.json();
          console.log('Datos obtenidos con fetch:', jsonData);
          
          // Verificar si hay datos y tienen el formato esperado
          if (jsonData && jsonData.items && Array.isArray(jsonData.items)) {
            console.log('Devolviendo usuarios desde fetch:', jsonData.items.length);
            return jsonData.items;
          } else if (Array.isArray(jsonData)) {
            console.log('Devolviendo array de usuarios desde fetch:', jsonData.length);
            return jsonData;
          }
        } else {
          console.warn('Error en la respuesta fetch:', fetchResponse.status);
        }
      } catch (fetchError) {
        console.error('Error al usar fetch:', fetchError);
      }
      
      // Si fetch falla, seguimos con el método axios como respaldo
      console.log('Usando axios como método alternativo...');
      // En desarrollo local, siempre usar URL absoluta para usuarios
      let url;
      let response;
      if (window.location.hostname === 'localhost' || window.location.hostname.includes('192.168.')) {
        // Para desarrollo local, usamos una URL absoluta y pasamos todo el objeto
        url = `http://localhost:8000/api/v1/users?${params.toString()}`;
        response = await api.get(url, { ...config, baseURL: '' });
      } else {
        // En otros entornos, usar rutas relativas
        url = `users?${params.toString()}`;
        response = await api.get(url, config);
      }
      
      // Inspeccionar el objeto de respuesta completo para encontrar los datos
      console.log('Respuesta completa de axios:', response);
      
      // Intentamos extraer datos de diferentes propiedades de la respuesta
      let responseData;
      
      if (response.data) {
        responseData = response.data;
        console.log('Datos encontrados en response.data');
      } else if (response.request && response.request.response) {
        try {
          responseData = JSON.parse(response.request.response);
          console.log('Datos encontrados en response.request.response');
        } catch (e) {
          console.warn('Error al parsear response.request.response');
        }
      }
      
      // Si todavía no tenemos datos, intentamos solicitud alternativa
      if (!responseData) {
        console.warn('No se encontraron datos en la respuesta, intentando solicitud alternativa...');
        const alternativeResponse = await api.get('/users', config);
        
        if (alternativeResponse.data) {
          responseData = alternativeResponse.data;
          console.log('Datos encontrados en solicitud alternativa');
        } else if (alternativeResponse.request && alternativeResponse.request.response) {
          try {
            responseData = JSON.parse(alternativeResponse.request.response);
            console.log('Datos encontrados en alternativeResponse.request.response');
          } catch (e) {
            console.warn('Error al parsear alternativeResponse.request.response');
          }
        }
      }
      
      // Si aún no tenemos datos, hacemos una última solicitud sin axios
      if (!responseData) {
        console.warn('Intentando solicitud XMLHttpRequest como último recurso...');
        
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          // Determinar la URL correcta según el entorno
          let xhrUrl;
          if (window.location.hostname === 'localhost' || window.location.hostname.includes('192.168.')) {
            xhrUrl = 'http://localhost:8000/api/v1/users';
          } else {
            xhrUrl = `${api.defaults.baseURL}/users`;
          }
          console.log('URL para XMLHttpRequest:', xhrUrl);
          xhr.open('GET', xhrUrl);
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.responseType = 'json';
          
          xhr.onload = function() {
            if (xhr.status === 200) {
              console.log('Respuesta XMLHttpRequest:', xhr.response);
              if (xhr.response && xhr.response.items) {
                resolve(xhr.response.items);
              } else if (Array.isArray(xhr.response)) {
                resolve(xhr.response);
              } else {
                resolve([]);
              }
            } else {
              console.error('Error en XMLHttpRequest:', xhr.status);
              resolve([]);
            }
          };
          
          xhr.onerror = function() {
            console.error('Error de red en XMLHttpRequest');
            resolve([]);
          };
          
          xhr.send();
        });
      }
      
      // Procesar los datos si los encontramos
      if (responseData) {
        console.log('Datos a procesar:', responseData);
        
        // CASO ESPECÍFICO IDENTIFICADO: El backend devuelve los usuarios en una propiedad 'items'
        if (responseData.items && Array.isArray(responseData.items)) {
          console.log('Estructura detectada: { items: [...usuarios] }');
          return responseData.items;
        }
        
        // Convertimos arrays en formato paginado para mantener consistencia
        if (Array.isArray(responseData)) {
          console.log('La respuesta es un array directo de usuarios con', responseData.length, 'elementos');
          const paginatedResponse: PaginatedResponse<User> = {
            items: responseData,
            total: responseData.length,
            page: page,
            limit: limit,
            pages: Math.ceil(responseData.length / limit)
          };
          return paginatedResponse;
        }
        
        return responseData;
      }
      
      // Si no encontramos datos, devolvemos array vacío
      console.warn('No se pudieron obtener datos de usuarios después de múltiples intentos');
      return [];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      // No propagar el error, devolver array vacío para evitar bloqueos en la UI
      return [];
    }
  },

  // Obtiene un usuario por su ID
  async getUserById(id: number): Promise<User> {
    try {
      console.log('Obteniendo usuario con ID:', id);
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
      console.log('Creando nuevo usuario:', userData.username);
      
      // Asegurarnos que el rol siempre se envía en minúsculas para evitar errores de validación
      // Y añadir explícitamente is_active para evitar el error en el backend
      const processedUserData = {
        ...userData,
        role: userData.role.toLowerCase(),
        is_active: userData.is_active !== undefined ? userData.is_active : true
      };
      
      console.log('Datos del usuario a crear:', JSON.stringify(processedUserData, null, 2));
      
      // Obtenemos el token para asegurar que estamos autenticados
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación disponible para crear usuario');
        throw new Error('No hay token de autenticación disponible');
      }
      
      // Usar la configuración centralizada en lugar de api.post directo
      const baseUrl = API_CONFIG.baseUrl;
      // IMPORTANTE: Para crear usuarios el endpoint es /users/ (CON barra al final, como los demás recursos)
      const url = `${baseUrl}/users/`;
      
      console.log('Usando URL construida desde API_CONFIG para crear usuario:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processedUserData)
      });
      
      if (!response.ok) {
        throw {
          message: 'Error al crear usuario',
          status: response.status,
          code: 'ERROR'
        };
      }
      
      const data = await response.json();
      console.log('Respuesta al crear usuario:', data);
      return data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  // Actualiza un usuario existente
  async updateUser(id: number, userData: UserUpdateDto): Promise<User> {
    try {
      console.log('Actualizando usuario con ID:', id);
      
      // Usar la configuración centralizada en lugar de api.put directo
      const token = localStorage.getItem('token');
      const baseUrl = API_CONFIG.baseUrl;
      const url = `${baseUrl}/users/${id}/`;
      
      console.log('Usando URL construida desde API_CONFIG:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw {
          message: 'Error al actualizar usuario',
          status: response.status,
          code: 'ERROR'
        };
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw error;
    }
  },

  // Elimina un usuario
  async deleteUser(id: number): Promise<void> {
    try {
      console.log('Eliminando usuario con ID:', id);
      
      // Usar la configuración centralizada en lugar de api.delete directo
      const token = localStorage.getItem('token');
      const baseUrl = API_CONFIG.baseUrl;
      const url = `${baseUrl}/users/${id}/`;
      
      console.log('Usando URL construida desde API_CONFIG para eliminar:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw {
          message: 'Error al eliminar usuario',
          status: response.status,
          code: 'ERROR'
        };
      }
      
      // No hay datos a devolver para una operación DELETE exitosa
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw error;
    }
  },
};

export default userServiceProxy;
