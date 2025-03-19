#!/usr/bin/env python
"""
Script para probar directamente el endpoint HTTP de login.
"""
import asyncio
import httpx
import json

async def test_login_endpoint():
    # URL del endpoint
    url = "http://localhost:8000/api/v1/auth/login"
    
    # Credenciales a probar
    credentials = {
        "username": "admin",
        "password": "admin123"
    }
    
    # Configurar los datos en formato application/x-www-form-urlencoded
    form_data = {
        "username": credentials["username"],
        "password": credentials["password"]
    }
    
    print(f"\nProbando autenticación HTTP para usuario: {credentials['username']}")
    print("=" * 60)
    print(f"URL: {url}")
    print(f"Datos: {form_data}")
    
    try:
        # Realizar la solicitud POST al endpoint
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url, 
                data=form_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            print(f"\nCódigo de estado: {response.status_code}")
            print(f"Headers de respuesta:")
            for key, value in response.headers.items():
                print(f"  {key}: {value}")
            
            print("\nContenido de respuesta:")
            try:
                # Intentar parsear como JSON
                content = response.json()
                print(json.dumps(content, indent=2))
            except:
                # Si no es JSON, mostrar como texto
                print(response.text)
                
    except Exception as e:
        print(f"Error durante la solicitud HTTP: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_login_endpoint())
