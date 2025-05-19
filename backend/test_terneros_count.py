import asyncio
import httpx
import json
from datetime import datetime, timedelta
from tortoise import Tortoise

# Configuración
API_URL = "http://localhost:8000"
USERNAME = "admin"
PASSWORD = "admin123"

async def init_db():
    """Inicializa la conexión a la base de datos"""
    await Tortoise.init(
        db_url="postgres://postgres:1234@localhost:5432/masclet_imperi",
        modules={"models": ["app.models"]}
    )

async def get_token():
    """Obtiene un token de autenticación"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{API_URL}/api/v1/auth/login",
            data={"username": USERNAME, "password": PASSWORD}
        )
        data = response.json()
        return data["access_token"]

async def test_terneros_count():
    """Prueba el recuento de terneros en los endpoints relevantes"""
    # Inicializar la base de datos
    await init_db()
    
    # Obtener token de autenticación
    token = await get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Obtener lista de explotaciones disponibles
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{API_URL}/api/v1/dashboard/explotacions",
            headers=headers
        )
        explotaciones = response.json()
        print("\n=== EXPLOTACIONES DISPONIBLES ===")
        for explotacion in explotaciones:
            print(f"ID: {explotacion['id']} - Nombre: {explotacion['nombre']}")
    
    # Probar endpoint de estadísticas generales
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{API_URL}/api/v1/dashboard/stats",
            headers=headers
        )
        stats = response.json()
        print("\n=== ESTADÍSTICAS GENERALES ===")
        print(f"Total de animales: {stats['animales']['total']}")
        print(f"Total de terneros: {stats['animales']['total_terneros']}")
        print(f"Distribución por amamantamiento: {stats['animales']['por_alletar']}")
    
    # Probar endpoint de resumen
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{API_URL}/api/v1/dashboard/resumen",
            headers=headers
        )
        resumen = response.json()
        print("\n=== RESUMEN ===")
        if 'terneros' in resumen:
            print(f"Total de terneros: {resumen['terneros']}")
        else:
            print("No se encontró información de terneros en el resumen")
    
    # Probar endpoint de explotación específica (usando la primera explotación disponible)
    if explotaciones:
        explotacion_id = explotaciones[0]['id']
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{API_URL}/api/v1/dashboard/explotacions/{explotacion_id}",
                headers=headers
            )
            explotacion_stats = response.json()
            print(f"\n=== ESTADÍSTICAS DE EXPLOTACIÓN (ID: {explotacion_id}) ===")
            print(f"Total de animales: {explotacion_stats['animales']['total']}")
            print(f"Total de terneros: {explotacion_stats['animales']['terneros']}")
            print(f"Distribución por amamantamiento: {explotacion_stats['animales']['por_alletar']}")

if __name__ == "__main__":
    asyncio.run(test_terneros_count())
