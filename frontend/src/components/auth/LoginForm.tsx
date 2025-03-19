import React, { useState, useEffect } from 'react';
import { login, isAuthenticated, getRedirectPathForUser } from '../../services/authService';
import type { UserRole } from '../../services/authService';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Verificar si ya hay una sesión activa y obtener el parámetro de redirección
  useEffect(() => {
    // Si ya está autenticado, redirigir
    if (isAuthenticated()) {
      // Obtener el path por defecto según el rol del usuario
      const defaultPath = getRedirectPathForUser();
      window.location.href = defaultPath;
      return;
    }

    // Obtener la URL de redirección desde los parámetros si existe
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log('Iniciando sesión con usuario:', username);
      const response = await login({ username, password });
      console.log('Login exitoso:', response);
      
      // Guardar datos para depuración
      setDebugInfo({
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : [],
        userInfo: response?.user ? Object.keys(response.user) : [],
        hasToken: !!response?.access_token,
        tokenType: typeof response?.access_token,
        userObject: response?.user
      });
      
      // Verificar que tenemos los datos necesarios
      if (!response || !response.access_token) {
        throw new Error('No se recibió un token válido del servidor');
      }
      
      if (!response.user) {
        throw new Error('No se recibieron datos de usuario válidos');
      }
      
      // Guardar el token explícitamente
      localStorage.setItem('token', response.access_token);
      
      // Guardar datos del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Verificar el rol e imprimir para depuración
      const userRole = response.user.role || 'usuario';
      console.log('Rol del usuario:', userRole);
      
      // Redirigir según rol de usuario
      let redirectPath;
      if (redirectUrl) {
        redirectPath = redirectUrl;
      } else {
        redirectPath = ['administrador', 'gerente'].includes(userRole) 
          ? '/dashboard' 
          : '/animals';
      }
      
      console.log('Redirigiendo a:', redirectPath);
      
      // Esperar un momento para que la consola pueda registrar
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);
      
    } catch (err: any) {
      console.error('Error durante el login:', err);
      
      // Guardar datos del error para depuración
      setDebugInfo({
        errorType: typeof err,
        errorKeys: err ? Object.keys(err) : [],
        errorMessage: err?.message,
        errorResponse: err?.response ? {
          status: err.response.status,
          data: err.response.data
        } : null,
        errorStack: err?.stack
      });
      
      // Manejar diferentes tipos de errores
      if (err.response) {
        // Error de respuesta del servidor (401, 403, etc.)
        const statusCode = err.response.status;
        if (statusCode === 401) {
          setError('Credenciales incorrectas. Por favor, verifica tu nombre de usuario y contraseña.');
        } else if (statusCode === 500) {
          setError('Error en el servidor. Por favor, inténtalo de nuevo más tarde.');
        } else {
          setError(err.response.data?.detail || 'Error al iniciar sesión');
        }
      } else if (err.request) {
        // Error de red (sin respuesta del servidor)
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else if (err.message) {
        // Error general con mensaje
        setError(err.message);
      } else {
        // Error desconocido
        setError('Error inesperado al iniciar sesión');
      }
      
      // Mostrar error en la UI
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
  };

  return (
    <div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Nombre de usuario */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Nombre de usuario
          </label>
          <div className="mt-1">
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="Ingresa tu nombre de usuario"
            />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="Ingresa tu contraseña"
            />
          </div>
        </div>

        {/* Botón de inicio de sesión */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75 ${loading ? 'cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </div>
      </form>

      {/* Información de depuración (solo en desarrollo) */}
      {debugInfo && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md text-xs font-mono">
          <h4 className="text-sm font-semibold mb-2">Información de depuración:</h4>
          <pre className="overflow-x-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}

      {/* Modal de error */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Error de autenticación
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  onClick={closeErrorModal}
                >
                  Entendido
                </button>
              </div>
              
              {/* Información de depuración en el modal de error */}
              {debugInfo && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md text-xs font-mono">
                  <h4 className="text-sm font-semibold mb-2">Información de depuración:</h4>
                  <pre className="overflow-x-auto max-h-60">{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
