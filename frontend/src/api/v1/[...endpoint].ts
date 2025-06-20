import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ params, request, url }) => {
  const { endpoint } = params;
  const apiUrl = `http://34.253.203.194:8000/api/v1/${endpoint}`;
  
  // Preservar query parameters
  const searchParams = new URLSearchParams(url.search);
  const fullUrl = searchParams.toString() 
    ? `${apiUrl}?${searchParams}`
    : apiUrl;

  try {
    const response = await fetch(fullUrl, {
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
    return new Response(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};