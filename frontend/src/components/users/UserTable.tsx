import React, { useState, useEffect } from 'react';
import { getStoredUser } from '../../services/authService';
import userServiceProxy from '../../services/userServiceProxy';
import type { User } from '../../services/userServiceProxy';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Pagination } from '../common/Pagination';

interface UserTableProps {
  onEdit: (user: User) => void;
  onRefresh: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({ onEdit, onRefresh }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Cargar usuarios al montar el componente o cuando cambia la página o el refreshTrigger
  useEffect(() => {
    loadUsers();
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    }
  }, [currentPage, pageSize, onRefresh]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log('Solicitando usuarios: página', currentPage, 'tamaño', pageSize);
      const response = await userServiceProxy.getUsers(currentPage, pageSize);
      console.log('Respuesta del servidor (tipo):', typeof response);
      console.log('Respuesta del servidor (valor):', response);
      
      let usersData: User[] = [];
      let totalPagesCount = 1;
      let totalItemsCount = 0;
      
      // Determinar el formato de la respuesta y extraer usuarios
      if (Array.isArray(response)) {
        // Si es un array directo de usuarios
        console.log('Formato detectado: Array directo de usuarios');
        usersData = [...response];
        totalPagesCount = 1;
        totalItemsCount = response.length;
      } else if (response && typeof response === 'object') {
        // Si es un objeto paginado
        if (response.items && Array.isArray(response.items)) {
          console.log('Formato detectado: Objeto con items[]');
          usersData = [...response.items];
          totalPagesCount = response.pages || 1;
          totalItemsCount = response.total || response.items.length;
        } else {
          // Intentar otros formatos comunes
          const responseObj = response as Record<string, any>;
          const possibleItems = responseObj.users || responseObj.data || responseObj.results;
          
          if (Array.isArray(possibleItems) && possibleItems.length > 0) {
            console.log('Formato alternativo detectado con usuarios');
            usersData = [...possibleItems];
          }
          
          totalPagesCount = responseObj.pages || responseObj.totalPages || 1;
          totalItemsCount = responseObj.total || responseObj.totalItems || responseObj.count || usersData.length;
        }
      }
      
      console.log('Usuarios encontrados:', usersData.length);
      
      // Actualizar estado con los datos procesados
      setUsers(usersData);
      setTotalPages(totalPagesCount);
      setTotalItems(totalItemsCount);
      setError(null);
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar la lista de usuarios. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1); // Volver a la primera página al cambiar el tamaño
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await userServiceProxy.deleteUser(userToDelete.id);
      setShowConfirmDialog(false);
      setUserToDelete(null);
      // Recargar la lista de usuarios
      loadUsers();
      onRefresh();
    } catch (err: any) {
      console.error('Error al eliminar usuario:', err);
      setError('Error al eliminar el usuario. Por favor, inténtalo de nuevo.');
      setShowConfirmDialog(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setUserToDelete(null);
  };

  // Función para renderizar el badge del rol
  const getRoleBadge = (role: string) => {
    let bgColor = '';
    switch (role) {
      case 'administrador':
        bgColor = 'bg-red-100 text-red-800';
        break;
      case 'gerente':
        bgColor = 'bg-blue-100 text-blue-800';
        break;
      case 'editor':
        bgColor = 'bg-green-100 text-green-800';
        break;
      default:
        bgColor = 'bg-gray-100 text-gray-800';
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
        {role}
      </span>
    );
  };

  if (loading && users.length === 0) {
    return <div className="text-center py-4">Cargando usuarios...</div>;
  }

  if (error && users.length === 0) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-700">
            Mostrando {users.length} de {totalItems} usuarios
          </div>
          <div className="flex items-center">
            <label htmlFor="pageSize" className="mr-2 text-sm text-gray-700">
              Mostrar:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="rounded border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay usuarios para mostrar
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.full_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                    >
                      Editar
                    </button>
                    {/* No permitir eliminar:
                        1. Al usuario actual
                        2. A usuarios con rol administrador (excepto si eres administrador)
                        3. A usuarios con rol gerente (Ramon) */}
                    {(currentUser?.id !== user.id && 
                      user.role !== 'Ramon' && 
                      (user.role !== 'administrador' || currentUser?.role === 'administrador')) && (
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 hover:text-red-900 focus:outline-none"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar al usuario ${userToDelete?.username}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};
