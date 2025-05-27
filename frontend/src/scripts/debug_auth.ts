/**
 * Script para depurar la autenticación y los roles en el sistema
 * 
 * Este script se puede agregar temporalmente a cualquier página o componente
 * para entender mejor cómo se están procesando los tokens y roles.
 */

import { jwtDecode } from 'jwt-decode';
import { getToken } from '../services/authService';
import { extractRoleFromToken } from '../services/roleService';

export function debugAuth(username: string): void {
  console.log('===== DEPURACIÓN DE AUTENTICACIÓN =====');
  console.log(`Usuario de prueba: ${username}`);
  
  const token = getToken();
  console.log('Token disponible:', !!token);
  
  if (token) {
    try {
      // Decodificar el token JWT
      const decoded = jwtDecode<{ role?: string; username?: string; sub?: string }>(token);
      console.log('Token decodificado:', decoded);
      
      // Analizar campos clave
      console.log('Campo sub:', decoded.sub);
      console.log('Campo username:', decoded.username);
      console.log('Campo role:', decoded.role);
      
      // Intentar extraer el rol con nuestra función
      const extractedRole = extractRoleFromToken();
      console.log('Rol extraído:', extractedRole);
      
      // Verificar localStorage
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        console.log('Usuario en localStorage:', user);
        console.log('Rol en localStorage:', user.role);
      }
    } catch (error) {
      console.error('Error al decodificar token:', error);
    }
  }
  
  console.log('===== FIN DEPURACIÓN DE AUTENTICACIÓN =====');
}

// Para usar este script, importarlo y llamar a:
// debugAuth('nombre_usuario');
