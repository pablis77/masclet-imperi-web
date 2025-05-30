import axios from 'axios';

/**
 * Interfaces para las notificaciones
 */
export interface Notification {
  id: number;
  type: string;
  priority: string;
  title: string;
  message: string;
  icon?: string;
  created_at: string;
  relative_time?: string;
  read: boolean;
  related_entity_id?: number | null;
  related_entity_type?: string | null;
  user_id?: number;
}

export interface NotificationResponse {
  items: Notification[];
  total: number;
  unread_count: number;
  has_more?: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  dailySummary: boolean;
  weeklySummary: boolean;
  types: {
    [key: string]: boolean;
  };
}

/**
 * Servicio para gestionar notificaciones
 */
class NotificationService {
  private baseUrl = 'http://localhost:8000/api/v1/notifications';
  private pollingInterval: number | null = null;
  
  /**
   * Obtiene todas las notificaciones del usuario
   */
  async getNotifications(unreadOnly = false, limit = 10, skip = 0): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams();
      params.append('unread_only', unreadOnly.toString());
      params.append('limit', limit.toString());
      params.append('skip', skip.toString());
      
      // Usar axios directamente con cabeceras de autenticación
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios.get(`${this.baseUrl}?${params.toString()}`, { headers });
      return {
        items: response.data.items || [],
        total: response.data.total || 0,
        unread_count: response.data.unread_count || 0,
        has_more: response.data.has_more || false
      };
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      // Devolvemos un objeto vacío para cualquier tipo de error
      return { items: [], total: 0, unread_count: 0, has_more: false };
    }
  }
  
  /**
   * Marca una notificación como leída
   */
  async markAsRead(notificationId: number): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await axios.post(`${this.baseUrl}/mark-read/${notificationId}`, {}, { headers });
      return true;
    } catch (error) {
      console.error(`Error al marcar notificación ${notificationId} como leída:`, error);
      return false;
    }
  }
  
  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await axios.post(`${this.baseUrl}/mark-all-read`, {}, { headers });
      return true;
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      return false;
    }
  }
  
  /**
   * Elimina una notificación
   */
  async deleteNotification(notificationId: number): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await axios.delete(`${this.baseUrl}/${notificationId}`, { headers });
      return true;
    } catch (error) {
      console.error(`Error al eliminar notificación ${notificationId}:`, error);
      return false;
    }
  }
  
  /**
   * Elimina todas las notificaciones
   */
  async deleteAllNotifications(): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await axios.delete(this.baseUrl, { headers });
      return true;
    } catch (error) {
      console.error('Error al eliminar todas las notificaciones:', error);
      return false;
    }
  }
  
  /**
   * Configura el polling para obtener notificaciones periódicamente
   */
  startPolling(callback: (notifications: Notification[]) => void, interval = 30000): number {
    // Hacemos una primera llamada inmediatamente
    this.getNotifications().then(response => {
      callback(response.items);
    }).catch(error => {
      console.error('Error al obtener notificaciones:', error);
    });
    
    // Configuramos el intervalo
    const intervalId = window.setInterval(() => {
      this.getNotifications().then(response => {
        callback(response.items);
      }).catch(error => {
        console.error('Error al obtener notificaciones:', error);
      });
    }, interval);
    
    this.pollingInterval = intervalId;
    return intervalId;
  }
  
  /**
   * Detiene el polling de notificaciones
   */
  stopPolling(): void {
    if (this.pollingInterval !== null) {
      window.clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
  
  /**
   * Crea una notificación de prueba (solo para desarrollo)
   */
  async createTestNotification(): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await axios.post(`${this.baseUrl}/test`, {}, { headers });
      return true;
    } catch (error) {
      console.error('Error al crear notificación de prueba:', error);
      return false;
    }
  }
}

// Exportamos una única instancia del servicio
const notificationService = new NotificationService();

// Exportar como default (para import notificationService from './notificationService')
export default notificationService;

// Exportar también con nombre (para import { notificationService } from './notificationService')
export { notificationService };
