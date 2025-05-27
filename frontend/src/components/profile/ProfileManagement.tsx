import React, { useState, useEffect } from 'react';
import { getStoredUser, isAuthenticated } from '../../services/authService';
import type { User, UserRole } from '../../services/authService';
import { getCurrentRole } from '../../services/roleService';

export const ProfileManagement: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estado para el formulario de cambio de contraseña
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState('');

  useEffect(() => {
    // Verificamos que el usuario esté autenticado
    if (!isAuthenticated()) {
      setError('Debes iniciar sesión para ver esta página');
      setLoading(false);
      return;
    }

    // Obtenemos la información del usuario actual
    let user = getStoredUser();
    
    // Si estamos autenticados pero no tenemos usuario, lo recreamos para el usuario actual
    if (!user) {
      console.log('Autenticado pero sin datos de usuario, intentando recuperar información');
      // Verificamos si existe un token en localStorage
      const tokenData = localStorage.getItem('token');
      // Verificar si hay indicador de usuario Ramon
      const isRamon = localStorage.getItem('ramonFix') === 'true';
      const userRole = localStorage.getItem('userRole');
      
      if (tokenData) {
        try {
          // Comprobar primero si es Ramon
          if (isRamon) {
            console.log('Detectado usuario Ramon por indicador ramonFix, recreando usuario Ramon');
            user = {
              id: 2,
              username: 'ramon',
              email: 'ramon@mascletimperi.com',
              full_name: 'Ramon Masclet',
              role: 'Ramon',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          } else {
            // Creamos un usuario predeterminado basado en el rol almacenado
            user = {
              id: 1,
              username: userRole === 'Ramon' ? 'ramon' : 'admin',
              email: userRole === 'Ramon' ? 'ramon@mascletimperi.com' : 'admin@mascletimperi.com',
              full_name: userRole === 'Ramon' ? 'Ramon Masclet' : 'Usuario Masclet',
              role: (userRole as UserRole) || 'usuario',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
          
          // Determinamos el rol actual como verificación adicional
          const currentRoleValue = getCurrentRole();
          if (currentRoleValue) {
            // Solo actualizamos si no es Ramon (Ramon tiene prioridad)
            if (!(isRamon || user.username === 'ramon')) {
              user.role = currentRoleValue;
            }
          }
          
          // Guardamos en localStorage para futuras sesiones
          localStorage.setItem('user', JSON.stringify(user));
          console.log('Usuario reconstruido y guardado:', user);
        } catch (err) {
          console.error('Error al reconstruir usuario:', err);
        }
      }
    }
    
    if (!user) {
      setError('No se pudo obtener la información del usuario');
      setLoading(false);
      return;
    }

    // Aseguramos que el rol sea correcto para los usuarios específicos
    if (user) {
      if (user.username === 'admin' && user.role !== 'administrador') {
        console.log('Corrigiendo rol para usuario admin de:', user.role, 'a: administrador');
        user.role = 'administrador';
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Asegurarse que Ramon siempre tiene el rol correcto
      if (user.username === 'ramon' && user.role !== 'Ramon') {
        console.log('Corrigiendo rol para usuario Ramon de:', user.role, 'a: Ramon');
        user.role = 'Ramon' as UserRole;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('ramonFix', 'true'); // Marcar indicador
        localStorage.setItem('userRole', 'Ramon');
      }
    }

    // Obtener el rol actualizado
    const actualRole = getCurrentRole();
    console.log('Rol actual detectado:', actualRole);

    setCurrentUser(user);
    setCurrentRole(actualRole);
    setLoading(false);
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Todos los campos son obligatorios');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las nuevas contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    setPasswordError(null);
    setLoading(true);
    
    try {
      // Hacer la petición al backend para cambiar la contraseña
      const response = await fetch('/api/v1/users/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          current_password: oldPassword,
          new_password: newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al cambiar la contraseña');
      }

      // Limpiar formulario y mostrar mensaje de éxito
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Contraseña actualizada correctamente');
      
      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      setPasswordError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {currentUser && (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Información del usuario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre de usuario</p>
                <p className="font-medium">{currentUser.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nombre completo</p>
                <p className="font-medium">{currentUser.full_name || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Correo electrónico</p>
                <p className="font-medium">{currentUser.email || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rol</p>
                <p className="font-medium">{currentRole}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Cambiar contraseña</h2>
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{success}</span>
              </div>
            )}
            
            {passwordError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{passwordError}</span>
              </div>
            )}
            
            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="oldPassword">
                  Contraseña actual
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                  Nueva contraseña
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa tu nueva contraseña"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirmar nueva contraseña
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>
              
              <div className="flex items-center justify-end">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Cambiar contraseña'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
