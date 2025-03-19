import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Configuración base
const baseURL = 'http://localhost:8000/api/v1';

// Crear instancia de axios con configuración base
const api = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // Evita problemas con CORS
});

// Interceptor para agregar el token JWT a las solicitudes
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Si la API devuelve datos en la propiedad 'data', lo extraemos
        if (response.data && response.data.hasOwnProperty('data')) {
            return response.data.data;
        }

        return response.data;
    },
    (error: AxiosError) => {
        // Manejar errores específicos por código
        if (error.response) {
            // Error de autenticación
            if (error.response.status === 401) {
                // Limpiar token y redirigir a login
                localStorage.removeItem('token');
                window.location.href = '/login';
            }

            // Formatear respuestas de error para uso en UI
            const errorData = error.response.data as any;
            const errorMsg = errorData.detail || errorData.message || 'Error desconocido';

            return Promise.reject({
                message: errorMsg,
                status: error.response.status,
                code: errorData.code || 'ERROR'
            });
        }

        // Error de red
        if (error.request) {
            return Promise.reject({
                message: 'No se pudo conectar con el servidor. Por favor, verifique su conexión.',
                status: 0,
                code: 'NETWORK_ERROR'
            });
        }

        // Error general
        return Promise.reject({
            message: error.message || 'Ocurrió un error al procesar la solicitud',
            status: 500,
            code: 'UNKNOWN_ERROR'
        });
    }
);

export default api;