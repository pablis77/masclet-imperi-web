import React, { useState, useEffect } from 'react';
import { UserForm } from './UserForm';
import { UserTable } from './UserTable';
import { isAuthenticated, getStoredUser } from '../../services/authService';
import type { User } from '../../services/authService';

export const UsersManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [authStatus, setAuthStatus] = useState<string>('Cargando...');
  const [authDebug, setAuthDebug] = useState<Record<string, any>>({});

  useEffect(() => {
    // Verificar autenticación y permisos
    const isAuth = isAuthenticated();
    setAuthStatus(isAuth ? 'Autenticado' : 'No autenticado');
    
    if (!isAuth) {
      // Mostramos información de debug en lugar de redirigir automáticamente
      setAuthDebug(prev => ({ ...prev, isAuthenticated: false }));
      return;
    }

    let user = getStoredUser();
    
    // Si estamos autenticados pero no tenemos usuario, lo recreamos para admin
    if (isAuth && !user) {
      console.log('Autenticado pero sin datos de usuario, recreando usuario administrador');
      // Verificamos si existe admin/admin123 a través del localStorage
      const tokenData = localStorage.getItem('token');
      if (tokenData) {
        // Recreamos el usuario admin por defecto
        user = {
          id: 1,
          username: 'admin',
          email: 'admin@mascletimperi.com',
          full_name: 'Administrador',
          role: 'administrador',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        // Guardamos en localStorage para futuras sesiones
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
    
    setAuthDebug(prev => ({ ...prev, user: user ? JSON.stringify(user) : 'null' }));
    
    if (user) {
      setCurrentUser(user);
      
      // IMPORTANTE: Para el usuario 'admin', siempre asumimos que es administrador
      // independientemente del rol almacenado
      let hasAdminRole = false;
      
      if (user.username === 'admin') {
        hasAdminRole = true;
        // Aseguramos que el rol sea correcto para el admin (debe ser 'administrador', no 'admin')
        if (user.role !== 'administrador') {
          console.log('Corrigiendo el rol del usuario admin de:', user.role, 'a: administrador');
          user.role = 'administrador';
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else {
        // Para otros usuarios, verificamos el rol normalmente
        // Usamos 'as string' para evitar el error de tipo ya que sabemos que estos valores son válidos
        // Verificamos si el rol es administrador o Ramon
        // Por compatibilidad también aceptamos 'gerente' (backend)
        hasAdminRole = user.role === 'administrador' || 
                      user.role === 'Ramon' ||
                      (user.role as string) === 'gerente'; // Para compatibilidad con backend
      }
      
      setIsAdmin(hasAdminRole);
      
      // Depuración extendida
      const debugInfo = {
        role: user.role,
        hasAdminRole,
        username: user.username,
        isAdmin: hasAdminRole,
        tokenExists: !!localStorage.getItem('token'),
        tokenFirstChars: localStorage.getItem('token')?.substring(0, 15) + '...' || 'no-token'
      };
      
      console.log('Información de depuración del usuario:', debugInfo);
      setAuthDebug(prev => ({ ...prev, ...debugInfo }));
    } else {
      // Mostramos información de debug en lugar de redirigir automáticamente
      setAuthDebug(prev => ({ ...prev, userFound: false }));
    }
  }, []);

  const handleAddUser = () => {
    // Al crear un nuevo usuario aseguramos que no haya usuario preseleccionado
    setSelectedUser(undefined);
    // Reiniciamos completamente el formulario
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedUser(undefined);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedUser(undefined);
  };

  // Panel de diagnóstico para depuración
  const renderDebugPanel = () => (
    <div className="bg-white border border-gray-300 p-4 mb-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Panel de Diagnóstico</h3>
      <div className="space-y-2">
        <div><strong>Estado de Autenticación:</strong> {authStatus}</div>
        <div><strong>¿Es administrador?:</strong> {isAdmin ? 'Sí' : 'No'}</div>
        {Object.entries(authDebug).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </div>
        ))}
      </div>
    </div>
  );

  if (!isAdmin && currentUser) {
    return (
      <>
        {renderDebugPanel()}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No tienes permisos para gestionar usuarios. Solo los administradores y usuarios con rol Ramon pueden acceder a esta sección.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {renderDebugPanel()}
      {!showForm ? (
        <>
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={handleAddUser}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Nuevo Usuario
            </button>
          </div>
          <UserTable 
            onEdit={handleEditUser} 
            onRefresh={() => setRefreshTrigger(prev => prev + 1)} 
            key={refreshTrigger} 
          />
        </>
      ) : (
        <UserForm 
          user={selectedUser} 
          onSuccess={handleFormSuccess} 
          onCancel={handleFormCancel}
          availableRoles={isAdmin ? 
            ['administrador', 'Ramon', 'editor', 'usuario'] : 
            ['editor', 'usuario']}
        />
      )}
    </div>
  );
};
