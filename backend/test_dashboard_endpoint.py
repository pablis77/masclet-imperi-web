import asyncio
import json
import sys
import httpx
import uvicorn
import threading
import time
from fastapi.testclient import TestClient
from tortoise import Tortoise

# Añadir el directorio actual al path para poder importar los módulos
sys.path.append(".")

from app.main import app

# Función para inicializar la base de datos
async def init_db():
    # Tortoise espera 'postgres://' no 'postgresql://'
    await Tortoise.init(
        db_url="postgres://postgres:1234@localhost:5432/masclet_imperi",
        modules={
            "models": [
                "app.models.animal", 
                "app.models.explotacio",
                "app.models.animal_history",
                "app.models.user",
                "app.models"
            ]
        }
    )
    print("Base de datos inicializada correctamente")

# Función para ejecutar la aplicación en un hilo separado
def run_app():
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

# Función principal
async def main():
    # Inicializar la base de datos
    await init_db()
    
    # ID de explotación a probar (usar 321 por defecto o tomar del argumento)
    explotacio_id = int(sys.argv[1]) if len(sys.argv) > 1 else 321
    
    # Iniciar el servidor en un hilo separado
    server_thread = threading.Thread(target=run_app, daemon=True)
    server_thread.start()
    
    # Esperar a que el servidor esté listo
    print("Esperando a que el servidor esté listo...")
    time.sleep(2)
    
    # Usar httpx para hacer las peticiones HTTP
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        try:
            # Autenticación
            print("Intentando autenticación...")
            login_data = {
                "username": "admin",
                "password": "admin123"
            }
            
            login_response = await client.post("/api/v1/auth/login", data=login_data)
            if login_response.status_code != 200:
                print(f"Error de autenticación: {login_response.status_code}")
                print(login_response.json())
                return
            
            token = login_response.json().get("access_token")
            print(f"Autenticación exitosa, token obtenido: {token[:10]}...")
            
            # Configurar cabeceras con el token
            headers = {
                "Authorization": f"Bearer {token}"
            }
            
            # Probar el endpoint de dashboard para la explotación
            print(f"Consultando dashboard para explotación ID: {explotacio_id}")
            response = await client.get(f"/api/v1/dashboard/explotacions/{explotacio_id}", headers=headers)
            
            # Imprimir resultado
            print(f"Código de respuesta: {response.status_code}")
            if response.status_code == 200:
                # Formatear la respuesta JSON para mejor legibilidad
                dashboard_data = response.json()
                print(json.dumps(dashboard_data, indent=2, ensure_ascii=False))
                print(f"\nDashboard obtenido correctamente para la explotación ID: {explotacio_id}")
            else:
                print(f"Error al obtener dashboard: {response.text}")
                
                # Si la explotación no existe, listar las explotaciones disponibles
                if response.status_code == 404:
                    print("\nListando explotaciones disponibles...")
                    explotaciones_response = await client.get("/api/v1/explotacions", headers=headers)
                    if explotaciones_response.status_code == 200:
                        explotaciones = explotaciones_response.json()
                        print("Explotaciones disponibles:")
                        for explotacion in explotaciones:
                            print(f"ID: {explotacion['id']} - Nombre: {explotacion['nom']}")
                    else:
                        print(f"Error al obtener lista de explotaciones: {explotaciones_response.text}")
                
        except Exception as e:
            print(f"Error inesperado: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
