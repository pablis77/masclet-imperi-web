"""
Tests para verificar la paginación y filtrado en los endpoints de la API.
"""
import pytest
import logging
from fastapi.testclient import TestClient
from app.main import app
from app.models.animal import Animal
from app.models.explotacio import Explotacio
from tortoise.contrib.test import initializer, finalizer
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def initialize_tests():
    initializer(
        modules=["app.models.animal", "app.models.parto", "app.models.explotacio"]
    )
    yield
    finalizer()

@pytest.mark.asyncio
async def test_animal_pagination():
    """Test para verificar la paginación en el listado de animales."""
    # Limpiar datos existentes
    await Animal.all().delete()
    
    # Crear una explotación para las pruebas
    explotacio = await Explotacio.create(nom="Paginación Test", activa=True)
    
    # Crear 25 animales para probar la paginación
    for i in range(1, 26):
        await Animal.create(
            nom=f"Animal-Page-{i}",
            explotacio=explotacio,
            genere="M" if i % 2 == 0 else "F",
            estado="OK",
            cod=f"PAGE-{i:03d}"
        )
    
    # Probar primera página (10 elementos por defecto)
    response = client.get("/api/animals", params={"page": 1})
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) == 10
    assert data["total"] == 25
    assert data["page"] == 1
    
    # Probar segunda página
    response = client.get("/api/animals", params={"page": 2})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 10
    assert data["page"] == 2
    
    # Probar tercera página (solo 5 elementos)
    response = client.get("/api/animals", params={"page": 3})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 5
    assert data["page"] == 3
    
    # Probar tamaño de página personalizado
    response = client.get("/api/animals", params={"page": 1, "size": 5})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 5
    assert data["size"] == 5
    assert data["total"] == 25
    
    logger.info("Test de paginación de animales completado exitosamente")

@pytest.mark.asyncio
async def test_animal_filtering():
    """Test para verificar el filtrado en el listado de animales."""
    # Limpiar datos existentes
    await Animal.all().delete()
    
    # Crear una explotación para las pruebas
    explotacio = await Explotacio.create(nom="Filtrado Test", activa=True)
    
    # Crear animales con diferentes características para filtrar
    # 5 toros activos
    for i in range(1, 6):
        await Animal.create(
            nom=f"Toro-{i}",
            explotacio=explotacio,
            genere="M",
            estado="OK",
            cod=f"TORO-{i}"
        )
    
    # 3 toros fallecidos
    for i in range(1, 4):
        await Animal.create(
            nom=f"Toro-DEF-{i}",
            explotacio=explotacio,
            genere="M",
            estado="DEF",
            cod=f"TORO-DEF-{i}"
        )
    
    # 7 vacas activas
    for i in range(1, 8):
        await Animal.create(
            nom=f"Vaca-{i}",
            explotacio=explotacio,
            genere="F",
            estado="OK",
            cod=f"VACA-{i}",
            alletar=i % 3  # 0, 1, 2, 0, 1, 2, 0
        )
    
    # 2 vacas fallecidas
    for i in range(1, 3):
        await Animal.create(
            nom=f"Vaca-DEF-{i}",
            explotacio=explotacio,
            genere="F",
            estado="DEF",
            cod=f"VACA-DEF-{i}"
        )
    
    # Filtrar por género
    response = client.get("/api/animals", params={"genere": "M"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 8  # 5 toros activos + 3 fallecidos
    for animal in data["data"]:
        assert animal["genere"] == "M"
    
    # Filtrar por estado
    response = client.get("/api/animals", params={"estado": "DEF"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 5  # 3 toros + 2 vacas fallecidas
    for animal in data["data"]:
        assert animal["estado"] == "DEF"
    
    # Filtrar por género y estado
    response = client.get("/api/animals", params={"genere": "F", "estado": "OK"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 7  # 7 vacas activas
    for animal in data["data"]:
        assert animal["genere"] == "F"
        assert animal["estado"] == "OK"
    
    # Filtrar por código (búsqueda parcial)
    response = client.get("/api/animals", params={"cod": "VACA"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 9  # 7 vacas activas + 2 fallecidas
    for animal in data["data"]:
        assert "VACA" in animal["cod"]
    
    # Filtrar por amamantamiento
    response = client.get("/api/animals", params={"alletar": 1})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) > 0
    for animal in data["data"]:
        assert animal["alletar"] == 1
    
    logger.info("Test de filtrado de animales completado exitosamente")

@pytest.mark.asyncio
async def test_combined_pagination_and_filtering():
    """Test para verificar la combinación de paginación y filtrado."""
    # Limpiar datos existentes
    await Animal.all().delete()
    
    # Crear una explotación para las pruebas
    explotacio = await Explotacio.create(nom="Combinado Test", activa=True)
    
    # Crear 30 animales: 15 machos y 15 hembras
    for i in range(1, 31):
        genero = "M" if i <= 15 else "F"
        await Animal.create(
            nom=f"Animal-Combo-{i}",
            explotacio=explotacio,
            genere=genero,
            estado="OK",
            cod=f"COMBO-{i:03d}"
        )
    
    # Probar filtrado por género con paginación
    response = client.get("/api/animals", params={"genere": "M", "page": 1, "size": 5})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 5
    assert data["total"] == 15  # Total de machos
    assert data["page"] == 1
    assert data["size"] == 5
    for animal in data["data"]:
        assert animal["genere"] == "M"
    
    # Probar segunda página de resultados filtrados
    response = client.get("/api/animals", params={"genere": "M", "page": 2, "size": 5})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 5
    assert data["page"] == 2
    for animal in data["data"]:
        assert animal["genere"] == "M"
    
    # Probar tercera página de resultados filtrados
    response = client.get("/api/animals", params={"genere": "M", "page": 3, "size": 5})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 5
    assert data["page"] == 3
    for animal in data["data"]:
        assert animal["genere"] == "M"
    
    # Probar página fuera de rango
    response = client.get("/api/animals", params={"genere": "M", "page": 4, "size": 5})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 0  # No hay resultados en esta página
    assert data["total"] == 15
    assert data["page"] == 4
    
    logger.info("Test de paginación y filtrado combinados completado exitosamente")

@pytest.mark.asyncio
async def test_error_handling_in_pagination():
    """Test para verificar el manejo de errores en parámetros de paginación."""
    # Parámetros inválidos: página negativa
    response = client.get("/api/animals", params={"page": -1})
    assert response.status_code in [400, 422]  # Bad Request o Unprocessable Entity
    
    # Parámetros inválidos: tamaño negativo
    response = client.get("/api/animals", params={"size": -5})
    assert response.status_code in [400, 422]
    
    # Parámetros inválidos: tamaño excesivo
    response = client.get("/api/animals", params={"size": 1000})
    assert response.status_code in [400, 422]
    
    # Parámetros inválidos: no numéricos
    response = client.get("/api/animals", params={"page": "abc"})
    assert response.status_code in [400, 422]
    
    logger.info("Test de manejo de errores en paginación completado exitosamente")

@pytest.mark.asyncio
async def test_sorting():
    """Test para verificar la ordenación de resultados."""
    # Limpiar datos existentes
    await Animal.all().delete()
    
    # Crear una explotación para las pruebas
    explotacio = await Explotacio.create(nom="Ordenación Test", activa=True)
    
    # Crear animales con nombres en orden aleatorio
    nombres = ["Zebra", "Antílope", "Caballo", "Burro", "Elefante"]
    for nombre in nombres:
        await Animal.create(
            nom=nombre,
            explotacio=explotacio,
            genere="M",
            estado="OK"
        )
    
    # Ordenar por nombre ascendente
    response = client.get("/api/animals", params={"sort": "nom", "order": "asc"})
    assert response.status_code == 200
    data = response.json()
    nombres_ordenados = [animal["nom"] for animal in data["data"]]
    assert nombres_ordenados == sorted(nombres)
    
    # Ordenar por nombre descendente
    response = client.get("/api/animals", params={"sort": "nom", "order": "desc"})
    assert response.status_code == 200
    data = response.json()
    nombres_ordenados = [animal["nom"] for animal in data["data"]]
    assert nombres_ordenados == sorted(nombres, reverse=True)
    
    logger.info("Test de ordenación completado exitosamente")
