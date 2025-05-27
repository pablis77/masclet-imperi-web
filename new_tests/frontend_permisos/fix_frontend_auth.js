// Script para corregir problemas de autenticación en el frontend
// Para usar: Copiar y pegar en la consola del navegador

(function() {
    console.log('🔧 Iniciando reparación de autenticación en frontend...');
    
    // 1. Verificar tokens actuales
    const token = localStorage.getItem('token');
    const accessToken = localStorage.getItem('accessToken');
    const jwt = localStorage.getItem('jwt');
    
    console.log('Tokens existentes:');
    console.log('- token:', token ? '✅ Presente' : '❌ No encontrado');
    console.log('- accessToken:', accessToken ? '✅ Presente' : '❌ No encontrado');
    console.log('- jwt:', jwt ? '✅ Presente' : '❌ No encontrado');
    
    // 2. Verificar información de usuario
    const userJson = localStorage.getItem('user');
    let user = null;
    
    if (userJson) {
        try {
            user = JSON.parse(userJson);
            console.log('Usuario en localStorage:', user);
        } catch (e) {
            console.error('Error al parsear usuario:', e);
        }
    } else {
        console.log('❌ No hay información de usuario en localStorage');
    }
    
    // 3. Verificar si ya estamos autenticados mediante una petición de prueba
    fetch('/api/v1/auth/me', {
        headers: {
            'Authorization': token ? `Bearer ${token}` : (accessToken ? `Bearer ${accessToken}` : '')
        }
    })
    .then(response => {
        console.log('Estado de autenticación actual:', response.status === 200 ? '✅ Autenticado' : '❌ No autenticado');
        if (response.status === 200) {
            return response.json();
        } else {
            throw new Error('No autenticado');
        }
    })
    .then(userData => {
        console.log('Datos de usuario desde API:', userData);
    })
    .catch(err => {
        console.log('Error verificando autenticación:', err.message);
        
        // 4. Si no estamos autenticados, intentar hacer login
        console.log('🔄 Intentando autenticar con usuario admin...');
        
        const formData = new URLSearchParams();
        formData.append('username', 'admin');
        formData.append('password', 'admin123');
        
        return fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Login falló: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('✅ Login exitoso:', data);
        
        // 5. Guardar token en todos los lugares posibles
        const newToken = data.access_token;
        localStorage.setItem('token', newToken);
        localStorage.setItem('accessToken', newToken);
        
        // Guardar también información de usuario
        const userInfo = {
            username: 'admin',
            role: 'administrador',
            id: 1
        };
        localStorage.setItem('user', JSON.stringify(userInfo));
        localStorage.setItem('userRole', 'administrador');
        
        console.log('✅ Tokens y datos de usuario guardados correctamente');
        
        // 6. Probar si funciona con una petición
        return fetch('/api/v1/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${newToken}`
            }
        });
    })
    .then(response => {
        console.log('Prueba de endpoint protegido:', response.status === 200 ? '✅ Funcionando' : '❌ Aún falla');
        if (response.status === 200) {
            return response.json();
        } else {
            throw new Error('Endpoint sigue fallando');
        }
    })
    .then(data => {
        console.log('Datos del endpoint:', data);
        console.log('🎉 Reparación completada. Recarga la página para ver los cambios.');
    })
    .catch(err => {
        console.error('❌ Error durante la reparación:', err.message);
        console.log('Intenta recargar la página y volver a intentarlo.');
    });
})();
