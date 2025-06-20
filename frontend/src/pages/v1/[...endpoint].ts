import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ params, request, url }) => {
  // Capturar todo el path después de /v1/
  const endpoint = params.endpoint || '';
  const fullEndpoint = Array.isArray(endpoint) ? endpoint.join('/') : endpoint;
  
  const apiUrl = `http://34.253.203.194:8000/api/v1/${fullEndpoint}`;
  
  // Preservar query parameters
  const searchParams = url.searchParams.toString();
  const finalUrl = searchParams ? `${apiUrl}?${searchParams}` : apiUrl;

  console.log(`[Proxy] ${request.method} ${fullEndpoint} → ${finalUrl}`);

  try {
    const response = await fetch(finalUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: request.method !== 'GET' ? await request.text() : undefined,
    });

    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
