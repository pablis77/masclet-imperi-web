import React, { useState, useEffect } from 'react';
import userServiceProxy from '../../services/userServiceProxy';
import type { User } from '../../services/userServiceProxy';
import type { UserRole } from '../../services/authService';
import { getStoredUser } from '../../services/authService';

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
  // Lista de roles disponibles para seleccionar
  availableRoles?: UserRole[];
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel, availableRoles }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'usuario' as UserRole
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Inicializar isAdmin directamente con el valor del usuario almacenado
  const loggedUser = getStoredUser();
  const [currentUser, setCurrentUser] = useState<User | null>(loggedUser);
  const [isAdmin, setIsAdmin] = useState(loggedUser?.role === 'administrador');

  // Mostrar la información de depuración para verificar el estado
  console.log('UserForm - Estado de usuario actual:', {
    currentUser,
    isAdmin: isAdmin,
    role: loggedUser?.role
  });

  useEffect(() => {
    if (user) {
      setIsEdit(true);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role
      });
      console.log('UserForm - Usuario cargado para edición:', user);
      console.log('UserForm - Datos de formulario inicializados:', {
        username: user.username,
        email: user.email,
        role: user.role
      });
    } else {
      // Resetear el formulario cuando no hay usuario seleccionado
      setIsEdit(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'usuario' as UserRole
      });
    }
  }, [user]);  // Este efecto se ejecuta cuando cambia el usuario seleccionado

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('El nombre de usuario es obligatorio');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('El email es obligatorio');
      return false;
    }
    
    if (!isEdit && !formData.password) {
      setError('La contraseña es obligatoria');
      return false;
    }
    
    if (!isEdit && formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (isEdit && user) {
        // Actualizar usuario existente
        const userData = {
          username: formData.username,
          email: formData.email,
          role: formData.role
        };
        
        // Si se proporcionó contraseña, la incluimos en la actualización
        if (formData.password && isAdmin) {
          Object.assign(userData, { password: formData.password });
        }
        
        console.log('UserForm - Enviando datos para actualizar usuario:', userData);
        const updatedUser = await userServiceProxy.updateUser(user.id, userData);
        console.log('UserForm - Usuario actualizado correctamente:', updatedUser);
      } else {
        // Registrar nuevo usuario
        const userData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role
        };
        
        console.log('UserForm - Enviando datos para crear usuario:', userData);
        const createdUser = await userServiceProxy.createUser(userData);
        console.log('UserForm - Usuario creado correctamente:', createdUser);
      }
      
      // Notificar al componente padre que la operación fue exitosa
      onSuccess();
    } catch (err: any) {
      console.error('Error al guardar usuario:', err);
      
      if (err.response) {
        setError(err.response.data?.detail || 'Error al guardar el usuario');
      } else if (err.request) {
        setError('No se pudo conectar con el servidor');
      } else {
        setError('Error al procesar la solicitud');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-lg font-medium text-gray-900">
        {isEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
      </h2>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Nombre de usuario
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
        </div>

        {(!isEdit || isAdmin) && (
          <>
            <div className="sm:col-span-3">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required={!isEdit && !isAdmin}
                  />
                  {isAdmin && (
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <div className="mt-1">
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required={!isEdit && !isAdmin}
                  />
                  {isAdmin && (
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="sm:col-span-3">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Rol
          </label>
          <div className="mt-1">
            {/* Utilizar la prop availableRoles si existe, o utilizar roles predeterminados según el tipo de usuario */}
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {/* Si se proporcionaron roles disponibles, usar esos */}
              {availableRoles ? (
                // Mapear los roles disponibles a opciones
                availableRoles.map(role => {
                  let label = role;
                  if (role === 'Ramon') label = 'Gerente (Ramon)';
                  else if (role === 'administrador') label = 'Administrador';
                  else if (role === 'editor') label = 'Editor';
                  else if (role === 'usuario') label = 'Usuario';
                  
                  return <option key={role} value={role}>{label}</option>
                })
              ) : (
                // Opciones por defecto si no se proporcionaron roles
                loggedUser?.role === 'administrador' ? (
                  // Si es administrador, mostrar todas las opciones
                  <>
                    <option value="administrador">Administrador</option>
                    <option value="Ramon">Gerente (Ramon)</option>
                    <option value="editor">Editor</option>
                    <option value="usuario">Usuario</option>
                  </>
                ) : (
                  // Si NO es administrador, solo roles básicos
                  <>
                    <option value="editor">Editor</option>
                    <option value="usuario">Usuario</option>
                  </>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};
