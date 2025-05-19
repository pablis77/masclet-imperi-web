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

  useEffect(() => {
    // Verificar autenticación y permisos
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
      setIsAdmin(user.role === 'administrador' || user.role === 'gerente');
    } else {
      window.location.href = '/login';
    }
  }, []);

  const handleAddUser = () => {
    setSelectedUser(undefined);
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

  if (!isAdmin && currentUser) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              No tienes permisos para gestionar usuarios. Solo los administradores y gerentes pueden acceder a esta sección.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
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
        />
      )}
    </div>
  );
};
