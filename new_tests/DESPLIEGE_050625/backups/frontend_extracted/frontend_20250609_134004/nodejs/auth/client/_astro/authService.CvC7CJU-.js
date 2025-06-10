// Servicio de autenticación con URL absoluta al backend
import { A as apiConfig } from './apiConfig.BYL0hBvc.js';

const authService = {
  async login(credentials) {
      // Usar la URL completa del backend para el login
      const loginUrl = ${apiConfig.backendURL}/auth/login;
      console.log('URL de login utilizada:', loginUrl);
      
      // Realizar la petición de login al backend
      const response = await fetch(loginUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
              username: credentials.username,
              password: credentials.password,
              grant_type: 'password'
          }),
          credentials: 'include'
      });

      if (!response.ok) {
          throw new Error('Error en la autenticación');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', credentials.username);

      // Implementación para manejar roles especiales como el de Ramon
      if (credentials.username.toLowerCase() === 'ramon') {
          localStorage.setItem('role', 'administrador');
      } else {
          const tokenParts = data.access_token.split('.');
          if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              localStorage.setItem('role', payload.role || 'usuario');
          }
      }

      return { user: credentials.username, success: true };
  }
};

const isAuthenticated = () => authService.isAuthenticated();
const getUserRole = () => authService.getUserRole();
const getCurrentUser = () => authService.getCurrentUser();
const login = (credentials) => authService.login(credentials);
const logout = () => authService.logout();

export { authService as a, getCurrentUser as b, getUserRole as c, isAuthenticated as d, login as e, logout as f };
