import axios from "/node_modules/.vite/deps/axios.js?v=5e89932e";
class NotificationService {
  baseUrl = "http://localhost:8000/api/v1/notifications";
  pollingInterval = null;
  /**
   * Obtiene todas las notificaciones del usuario
   */
  async getNotifications(unreadOnly = false, limit = 10, skip = 0) {
    try {
      const params = new URLSearchParams();
      params.append("unread_only", unreadOnly.toString());
      params.append("limit", limit.toString());
      params.append("skip", skip.toString());
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await axios.get(`${this.baseUrl}?${params.toString()}`, { headers });
      return {
        items: response.data.items || [],
        total: response.data.total || 0,
        unread_count: response.data.unread_count || 0,
        has_more: response.data.has_more || false
      };
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
      return { items: [], total: 0, unread_count: 0, has_more: false };
    }
  }
  /**
   * Marca una notificación como leída
   */
  async markAsRead(notificationId) {
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
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
  async markAllAsRead() {
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      await axios.post(`${this.baseUrl}/mark-all-read`, {}, { headers });
      return true;
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error);
      return false;
    }
  }
  /**
   * Elimina una notificación
   */
  async deleteNotification(notificationId) {
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
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
  async deleteAllNotifications() {
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      await axios.delete(this.baseUrl, { headers });
      return true;
    } catch (error) {
      console.error("Error al eliminar todas las notificaciones:", error);
      return false;
    }
  }
  /**
   * Configura el polling para obtener notificaciones periódicamente
   */
  startPolling(callback, interval = 3e4) {
    this.getNotifications().then((response) => {
      callback(response.items);
    }).catch((error) => {
      console.error("Error al obtener notificaciones:", error);
    });
    const intervalId = window.setInterval(() => {
      this.getNotifications().then((response) => {
        callback(response.items);
      }).catch((error) => {
        console.error("Error al obtener notificaciones:", error);
      });
    }, interval);
    this.pollingInterval = intervalId;
    return intervalId;
  }
  /**
   * Detiene el polling de notificaciones
   */
  stopPolling() {
    if (this.pollingInterval !== null) {
      window.clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
  /**
   * Crea una notificación de prueba (solo para desarrollo)
   */
  async createTestNotification() {
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      await axios.post(`${this.baseUrl}/test`, {}, { headers });
      return true;
    } catch (error) {
      console.error("Error al crear notificación de prueba:", error);
      return false;
    }
  }
}
const notificationService = new NotificationService();
export default notificationService;
export { notificationService };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vdGlmaWNhdGlvblNlcnZpY2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcblxuLyoqXG4gKiBJbnRlcmZhY2VzIHBhcmEgbGFzIG5vdGlmaWNhY2lvbmVzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTm90aWZpY2F0aW9uIHtcbiAgaWQ6IG51bWJlcjtcbiAgdHlwZTogc3RyaW5nO1xuICBwcmlvcml0eTogc3RyaW5nO1xuICB0aXRsZTogc3RyaW5nO1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIGljb24/OiBzdHJpbmc7XG4gIGNyZWF0ZWRfYXQ6IHN0cmluZztcbiAgcmVsYXRpdmVfdGltZT86IHN0cmluZztcbiAgcmVhZDogYm9vbGVhbjtcbiAgcmVsYXRlZF9lbnRpdHlfaWQ/OiBudW1iZXIgfCBudWxsO1xuICByZWxhdGVkX2VudGl0eV90eXBlPzogc3RyaW5nIHwgbnVsbDtcbiAgdXNlcl9pZD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3RpZmljYXRpb25SZXNwb25zZSB7XG4gIGl0ZW1zOiBOb3RpZmljYXRpb25bXTtcbiAgdG90YWw6IG51bWJlcjtcbiAgdW5yZWFkX2NvdW50OiBudW1iZXI7XG4gIGhhc19tb3JlPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3RpZmljYXRpb25TZXR0aW5ncyB7XG4gIGVuYWJsZWQ6IGJvb2xlYW47XG4gIGVtYWlsRW5hYmxlZDogYm9vbGVhbjtcbiAgcHVzaEVuYWJsZWQ6IGJvb2xlYW47XG4gIGRhaWx5U3VtbWFyeTogYm9vbGVhbjtcbiAgd2Vla2x5U3VtbWFyeTogYm9vbGVhbjtcbiAgdHlwZXM6IHtcbiAgICBba2V5OiBzdHJpbmddOiBib29sZWFuO1xuICB9O1xufVxuXG4vKipcbiAqIFNlcnZpY2lvIHBhcmEgZ2VzdGlvbmFyIG5vdGlmaWNhY2lvbmVzXG4gKi9cbmNsYXNzIE5vdGlmaWNhdGlvblNlcnZpY2Uge1xuICBwcml2YXRlIGJhc2VVcmwgPSAnaHR0cDovL2xvY2FsaG9zdDo4MDAwL2FwaS92MS9ub3RpZmljYXRpb25zJztcbiAgcHJpdmF0ZSBwb2xsaW5nSW50ZXJ2YWw6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICBcbiAgLyoqXG4gICAqIE9idGllbmUgdG9kYXMgbGFzIG5vdGlmaWNhY2lvbmVzIGRlbCB1c3VhcmlvXG4gICAqL1xuICBhc3luYyBnZXROb3RpZmljYXRpb25zKHVucmVhZE9ubHkgPSBmYWxzZSwgbGltaXQgPSAxMCwgc2tpcCA9IDApOiBQcm9taXNlPE5vdGlmaWNhdGlvblJlc3BvbnNlPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcbiAgICAgIHBhcmFtcy5hcHBlbmQoJ3VucmVhZF9vbmx5JywgdW5yZWFkT25seS50b1N0cmluZygpKTtcbiAgICAgIHBhcmFtcy5hcHBlbmQoJ2xpbWl0JywgbGltaXQudG9TdHJpbmcoKSk7XG4gICAgICBwYXJhbXMuYXBwZW5kKCdza2lwJywgc2tpcC50b1N0cmluZygpKTtcbiAgICAgIFxuICAgICAgLy8gVXNhciBheGlvcyBkaXJlY3RhbWVudGUgY29uIGNhYmVjZXJhcyBkZSBhdXRlbnRpY2FjacOzblxuICAgICAgY29uc3QgdG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKTtcbiAgICAgIGNvbnN0IGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICAgIFxuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIGhlYWRlcnNbJ0F1dGhvcml6YXRpb24nXSA9IGBCZWFyZXIgJHt0b2tlbn1gO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldChgJHt0aGlzLmJhc2VVcmx9PyR7cGFyYW1zLnRvU3RyaW5nKCl9YCwgeyBoZWFkZXJzIH0pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXRlbXM6IHJlc3BvbnNlLmRhdGEuaXRlbXMgfHwgW10sXG4gICAgICAgIHRvdGFsOiByZXNwb25zZS5kYXRhLnRvdGFsIHx8IDAsXG4gICAgICAgIHVucmVhZF9jb3VudDogcmVzcG9uc2UuZGF0YS51bnJlYWRfY291bnQgfHwgMCxcbiAgICAgICAgaGFzX21vcmU6IHJlc3BvbnNlLmRhdGEuaGFzX21vcmUgfHwgZmFsc2VcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIG9idGVuZXIgbm90aWZpY2FjaW9uZXM6JywgZXJyb3IpO1xuICAgICAgLy8gRGV2b2x2ZW1vcyB1biBvYmpldG8gdmFjw61vIHBhcmEgY3VhbHF1aWVyIHRpcG8gZGUgZXJyb3JcbiAgICAgIHJldHVybiB7IGl0ZW1zOiBbXSwgdG90YWw6IDAsIHVucmVhZF9jb3VudDogMCwgaGFzX21vcmU6IGZhbHNlIH07XG4gICAgfVxuICB9XG4gIFxuICAvKipcbiAgICogTWFyY2EgdW5hIG5vdGlmaWNhY2nDs24gY29tbyBsZcOtZGFcbiAgICovXG4gIGFzeW5jIG1hcmtBc1JlYWQobm90aWZpY2F0aW9uSWQ6IG51bWJlcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0b2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpO1xuICAgICAgY29uc3QgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAgICAgXG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgaGVhZGVyc1snQXV0aG9yaXphdGlvbiddID0gYEJlYXJlciAke3Rva2VufWA7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGF3YWl0IGF4aW9zLnBvc3QoYCR7dGhpcy5iYXNlVXJsfS9tYXJrLXJlYWQvJHtub3RpZmljYXRpb25JZH1gLCB7fSwgeyBoZWFkZXJzIH0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGFsIG1hcmNhciBub3RpZmljYWNpw7NuICR7bm90aWZpY2F0aW9uSWR9IGNvbW8gbGXDrWRhOmAsIGVycm9yKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBNYXJjYSB0b2RhcyBsYXMgbm90aWZpY2FjaW9uZXMgY29tbyBsZcOtZGFzXG4gICAqL1xuICBhc3luYyBtYXJrQWxsQXNSZWFkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0b2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpO1xuICAgICAgY29uc3QgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAgICAgXG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgaGVhZGVyc1snQXV0aG9yaXphdGlvbiddID0gYEJlYXJlciAke3Rva2VufWA7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGF3YWl0IGF4aW9zLnBvc3QoYCR7dGhpcy5iYXNlVXJsfS9tYXJrLWFsbC1yZWFkYCwge30sIHsgaGVhZGVycyB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBtYXJjYXIgdG9kYXMgbGFzIG5vdGlmaWNhY2lvbmVzIGNvbW8gbGXDrWRhczonLCBlcnJvcik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIFxuICAvKipcbiAgICogRWxpbWluYSB1bmEgbm90aWZpY2FjacOzblxuICAgKi9cbiAgYXN5bmMgZGVsZXRlTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbklkOiBudW1iZXIpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKTtcbiAgICAgIGNvbnN0IGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICAgIFxuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIGhlYWRlcnNbJ0F1dGhvcml6YXRpb24nXSA9IGBCZWFyZXIgJHt0b2tlbn1gO1xuICAgICAgfVxuICAgICAgXG4gICAgICBhd2FpdCBheGlvcy5kZWxldGUoYCR7dGhpcy5iYXNlVXJsfS8ke25vdGlmaWNhdGlvbklkfWAsIHsgaGVhZGVycyB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBhbCBlbGltaW5hciBub3RpZmljYWNpw7NuICR7bm90aWZpY2F0aW9uSWR9OmAsIGVycm9yKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBFbGltaW5hIHRvZGFzIGxhcyBub3RpZmljYWNpb25lc1xuICAgKi9cbiAgYXN5bmMgZGVsZXRlQWxsTm90aWZpY2F0aW9ucygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKTtcbiAgICAgIGNvbnN0IGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICAgIFxuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIGhlYWRlcnNbJ0F1dGhvcml6YXRpb24nXSA9IGBCZWFyZXIgJHt0b2tlbn1gO1xuICAgICAgfVxuICAgICAgXG4gICAgICBhd2FpdCBheGlvcy5kZWxldGUodGhpcy5iYXNlVXJsLCB7IGhlYWRlcnMgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgZWxpbWluYXIgdG9kYXMgbGFzIG5vdGlmaWNhY2lvbmVzOicsIGVycm9yKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBDb25maWd1cmEgZWwgcG9sbGluZyBwYXJhIG9idGVuZXIgbm90aWZpY2FjaW9uZXMgcGVyacOzZGljYW1lbnRlXG4gICAqL1xuICBzdGFydFBvbGxpbmcoY2FsbGJhY2s6IChub3RpZmljYXRpb25zOiBOb3RpZmljYXRpb25bXSkgPT4gdm9pZCwgaW50ZXJ2YWwgPSAzMDAwMCk6IG51bWJlciB7XG4gICAgLy8gSGFjZW1vcyB1bmEgcHJpbWVyYSBsbGFtYWRhIGlubWVkaWF0YW1lbnRlXG4gICAgdGhpcy5nZXROb3RpZmljYXRpb25zKCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICBjYWxsYmFjayhyZXNwb25zZS5pdGVtcyk7XG4gICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgb2J0ZW5lciBub3RpZmljYWNpb25lczonLCBlcnJvcik7XG4gICAgfSk7XG4gICAgXG4gICAgLy8gQ29uZmlndXJhbW9zIGVsIGludGVydmFsb1xuICAgIGNvbnN0IGludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdGhpcy5nZXROb3RpZmljYXRpb25zKCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIGNhbGxiYWNrKHJlc3BvbnNlLml0ZW1zKTtcbiAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgb2J0ZW5lciBub3RpZmljYWNpb25lczonLCBlcnJvcik7XG4gICAgICB9KTtcbiAgICB9LCBpbnRlcnZhbCk7XG4gICAgXG4gICAgdGhpcy5wb2xsaW5nSW50ZXJ2YWwgPSBpbnRlcnZhbElkO1xuICAgIHJldHVybiBpbnRlcnZhbElkO1xuICB9XG4gIFxuICAvKipcbiAgICogRGV0aWVuZSBlbCBwb2xsaW5nIGRlIG5vdGlmaWNhY2lvbmVzXG4gICAqL1xuICBzdG9wUG9sbGluZygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5wb2xsaW5nSW50ZXJ2YWwgIT09IG51bGwpIHtcbiAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMucG9sbGluZ0ludGVydmFsKTtcbiAgICAgIHRoaXMucG9sbGluZ0ludGVydmFsID0gbnVsbDtcbiAgICB9XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBDcmVhIHVuYSBub3RpZmljYWNpw7NuIGRlIHBydWViYSAoc29sbyBwYXJhIGRlc2Fycm9sbG8pXG4gICAqL1xuICBhc3luYyBjcmVhdGVUZXN0Tm90aWZpY2F0aW9uKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0b2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpO1xuICAgICAgY29uc3QgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAgICAgXG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgaGVhZGVyc1snQXV0aG9yaXphdGlvbiddID0gYEJlYXJlciAke3Rva2VufWA7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGF3YWl0IGF4aW9zLnBvc3QoYCR7dGhpcy5iYXNlVXJsfS90ZXN0YCwge30sIHsgaGVhZGVycyB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBjcmVhciBub3RpZmljYWNpw7NuIGRlIHBydWViYTonLCBlcnJvcik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59XG5cbi8vIEV4cG9ydGFtb3MgdW5hIMO6bmljYSBpbnN0YW5jaWEgZGVsIHNlcnZpY2lvXG5jb25zdCBub3RpZmljYXRpb25TZXJ2aWNlID0gbmV3IE5vdGlmaWNhdGlvblNlcnZpY2UoKTtcblxuLy8gRXhwb3J0YXIgY29tbyBkZWZhdWx0IChwYXJhIGltcG9ydCBub3RpZmljYXRpb25TZXJ2aWNlIGZyb20gJy4vbm90aWZpY2F0aW9uU2VydmljZScpXG5leHBvcnQgZGVmYXVsdCBub3RpZmljYXRpb25TZXJ2aWNlO1xuXG4vLyBFeHBvcnRhciB0YW1iacOpbiBjb24gbm9tYnJlIChwYXJhIGltcG9ydCB7IG5vdGlmaWNhdGlvblNlcnZpY2UgfSBmcm9tICcuL25vdGlmaWNhdGlvblNlcnZpY2UnKVxuZXhwb3J0IHsgbm90aWZpY2F0aW9uU2VydmljZSB9O1xuIl0sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFdBQVc7QUF5Q2xCLE1BQU0sb0JBQW9CO0FBQUEsRUFDaEIsVUFBVTtBQUFBLEVBQ1Ysa0JBQWlDO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLekMsTUFBTSxpQkFBaUIsYUFBYSxPQUFPLFFBQVEsSUFBSSxPQUFPLEdBQWtDO0FBQzlGLFFBQUk7QUFDRixZQUFNLFNBQVMsSUFBSSxnQkFBZ0I7QUFDbkMsYUFBTyxPQUFPLGVBQWUsV0FBVyxTQUFTLENBQUM7QUFDbEQsYUFBTyxPQUFPLFNBQVMsTUFBTSxTQUFTLENBQUM7QUFDdkMsYUFBTyxPQUFPLFFBQVEsS0FBSyxTQUFTLENBQUM7QUFHckMsWUFBTSxRQUFRLGFBQWEsUUFBUSxPQUFPO0FBQzFDLFlBQU0sVUFBa0MsQ0FBQztBQUV6QyxVQUFJLE9BQU87QUFDVCxnQkFBUSxlQUFlLElBQUksVUFBVSxLQUFLO0FBQUEsTUFDNUM7QUFFQSxZQUFNLFdBQVcsTUFBTSxNQUFNLElBQUksR0FBRyxLQUFLLE9BQU8sSUFBSSxPQUFPLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDO0FBQ3BGLGFBQU87QUFBQSxRQUNMLE9BQU8sU0FBUyxLQUFLLFNBQVMsQ0FBQztBQUFBLFFBQy9CLE9BQU8sU0FBUyxLQUFLLFNBQVM7QUFBQSxRQUM5QixjQUFjLFNBQVMsS0FBSyxnQkFBZ0I7QUFBQSxRQUM1QyxVQUFVLFNBQVMsS0FBSyxZQUFZO0FBQUEsTUFDdEM7QUFBQSxJQUNGLFNBQVMsT0FBTztBQUNkLGNBQVEsTUFBTSxvQ0FBb0MsS0FBSztBQUV2RCxhQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsT0FBTyxHQUFHLGNBQWMsR0FBRyxVQUFVLE1BQU07QUFB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