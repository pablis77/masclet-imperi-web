import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

/**
 * Componente para depurar el proceso de login
 * Muestra información detallada sobre el token y usuario actual
 */
export const LoginDebugger = () => {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showDebugger, setShowDebugger] = useState<boolean>(true);

  useEffect(() => {
    try {
      // Obtener token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<any>(token);
          setTokenInfo(decoded);
        } catch (error) {
          console.error('Error al decodificar token:', error);
        }
      }

      // Obtener usuario
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          setUserInfo(user);
        } catch (error) {
          console.error('Error al parsear usuario:', error);
        }
      }
    } catch (error) {
      console.error('Error general:', error);
    }
  }, []);

  const toggleDebugger = () => {
    setShowDebugger(!showDebugger);
  };

  if (!tokenInfo && !userInfo) {
    return <div className="bg-gray-100 p-3 rounded-lg mb-4">No hay información de sesión</div>;
  }

  return (
    <div className="bg-gray-100 p-3 rounded-lg mb-4 text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Depurador de Login</h3>
        <button 
          onClick={toggleDebugger}
          className="text-blue-500 hover:text-blue-700"
        >
          {showDebugger ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {showDebugger && (
        <div>
          <div className="mb-3">
            <h4 className="font-semibold">Token JWT:</h4>
            <pre className="bg-white p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(tokenInfo, null, 2)}
            </pre>
            
            <div className="mt-2">
              <div><strong>Sub:</strong> {tokenInfo?.sub}</div>
              <div><strong>Username:</strong> {tokenInfo?.username}</div>
              <div><strong>Role:</strong> {tokenInfo?.role}</div>
              <div><strong>Exp:</strong> {tokenInfo?.exp ? new Date(tokenInfo.exp * 1000).toLocaleString() : 'N/A'}</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Usuario en localStorage:</h4>
            <pre className="bg-white p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(userInfo, null, 2)}
            </pre>

            <div className="mt-2">
              <div><strong>Username:</strong> {userInfo?.username}</div>
              <div><strong>Rol:</strong> {userInfo?.role}</div>
              <div><strong>Email:</strong> {userInfo?.email}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginDebugger;
