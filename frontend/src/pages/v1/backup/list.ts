import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('📦 Backup proxy: Iniciando solicitud');
    
    // Detectar si estamos en local o producción
    const isLocal = request.url.includes('localhost') || request.url.includes('127.0.0.1');
    
    if (isLocal) {
      // EN LOCAL: Redirigir al backend real
      console.log('📦 Entorno LOCAL: Redirigiendo a backend real');
      
      const backendUrl = 'http://localhost:8000/api/v1/backup/list';
      
      // Obtener headers de autorización
      const authHeader = request.headers.get('authorization');
      
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { 'Authorization': authHeader })
        }
      });
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }
      
      const data = await response.text();
      
      return new Response(data, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } else {
      // EN PRODUCCIÓN: Datos simulados
      console.log('📦 Entorno PRODUCCIÓN: Usando datos simulados');
      
      const backups = [
        {
          filename: 'backup_2025_06_20.sql',
          size: '2.3 MB',
          created_at: '2025-06-20T20:00:00Z',
          description: 'Backup automático diario'
        },
        {
          filename: 'backup_2025_06_19.sql', 
          size: '2.1 MB',
          created_at: '2025-06-19T20:00:00Z',
          description: 'Backup automático diario'
        }
      ];
      
      return new Response(JSON.stringify(backups), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('📦 Error en backup proxy:', error);
    
    return new Response(JSON.stringify({
      error: 'Error al obtener backups',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};