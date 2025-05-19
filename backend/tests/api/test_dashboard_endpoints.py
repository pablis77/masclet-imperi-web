"""
Tests para los endpoints del dashboard.
"""
import pytest
import logging
from fastapi.testclient import TestClient
from app.main import app
from app.models.animal import Animal
from app.models.animal import Part
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
async def test_dashboard_empty():
    """Test para el dashboard sin datos."""
    response = client.get("/api/dashboard/stats")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data
    
    # Verificar que las estadísticas están vacías o en cero
    stats = data["data"]
    assert stats["total_animals"] == 0
    assert stats["por_explotacio"] == {}
    
    logger.info("Test de dashboard vacío completado exitosamente")

@pytest.mark.asyncio
async def test_dashboard_with_data():
    """Test para el dashboard con datos de ejemplo."""
    try:
        # Crear explotaciones
        explotacio1 = await Explotacio.create(nom="Dashboard Test 1", activa=True)
        explotacio2 = await Explotacio.create(nom="Dashboard Test 2", activa=True)
        
        # Crear animales para la primera explotación
        await Animal.create(nom="Toro-1", explotacio=explotacio1, genere="M", estado="OK")
        await Animal.create(nom="Toro-2", explotacio=explotacio1, genere="M", estado="OK")
        await Animal.create(nom="Vaca-1", explotacio=explotacio1, genere="F", estado="OK", alletar=0)
        await Animal.create(nom="Vaca-2", explotacio=explotacio1, genere="F", estado="OK", alletar=1)
        await Animal.create(nom="Vaca-3", explotacio=explotacio1, genere="F", estado="DEF") # Fallecida
        
        # Crear animales para la segunda explotación
        await Animal.create(nom="Toro-3", explotacio=explotacio2, genere="M", estado="OK")
        await Animal.create(nom="Vaca-4", explotacio=explotacio2, genere="F", estado="OK", alletar=1)
        await Animal.create(nom="Vaca-5", explotacio=explotacio2, genere="F", estado="OK", alletar=2)
        
        # Obtener estadísticas del dashboard
        response = client.get("/api/dashboard/stats")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
        # Verificar estadísticas generales
        stats = data["data"]
        assert stats["total_animals"] == 8
        assert len(stats["por_explotacio"]) == 2
        
        # Verificar distribución por género
        genero_stats = stats["por_genero"]
        assert genero_stats["M"] == 3  # 3 machos en total
        assert genero_stats["F"] == 5  # 5 hembras en total
        
        # Verificar distribución por estado
        estado_stats = stats["por_estado"]
        assert estado_stats["OK"] == 7  # 7 animales activos
        assert estado_stats["DEF"] == 1  # 1 animal fallecido
        
        # Verificar estadísticas de amamantamiento
        alletar_stats = stats["por_alletar"]
        assert alletar_stats["0"] == 1  # 1 vaca sin amamantar
        assert alletar_stats["1"] == 2  # 2 vacas con 1 ternero
        assert alletar_stats["2"] == 1  # 1 vaca con 2 terneros
        
        # Verificar total de terneros
        assert stats["total_terneros"] == 4  # 2 vacas con 1 ternero + 1 vaca con 2 terneros
        
        logger.info("Test de dashboard con datos completado exitosamente")
        
    except Exception as e:
        logger.error(f"Error en test de dashboard: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_dashboard_recientes():
    """Test para el endpoint de actividad reciente en el dashboard."""
    try:
        # Crear una explotación
        explotacio = await Explotacio.create(nom="Recientes Test", activa=True)
        
        # Crear algunos animales con fechas recientes
        hoy = datetime.now().date()
        ayer = hoy - timedelta(days=1)
        semana_pasada = hoy - timedelta(days=7)
        mes_pasado = hoy - timedelta(days=30)
        
        # Animal creado hoy
        animal_hoy = await Animal.create(
            nom="Animal-Hoy",
            explotacio=explotacio,
            genere="M",
            estado="OK",
            created_at=datetime.now()
        )
        
        # Animal creado ayer
        animal_ayer = await Animal.create(
            nom="Animal-Ayer",
            explotacio=explotacio,
            genere="F",
            estado="OK",
            created_at=datetime.now() - timedelta(days=1)
        )
        
        # Animal creado hace una semana
        animal_semana = await Animal.create(
            nom="Animal-Semana",
            explotacio=explotacio,
            genere="F",
            estado="OK",
            created_at=datetime.now() - timedelta(days=7)
        )
        
        # Animal creado hace un mes (no debería aparecer en recientes)
        animal_mes = await Animal.create(
            nom="Animal-Mes",
            explotacio=explotacio,
            genere="M",
            estado="OK",
            created_at=datetime.now() - timedelta(days=30)
        )
        
        # Obtener actividad reciente (7 días por defecto)
        response = client.get("/api/dashboard/recientes")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
        # Verificar que solo aparecen los 3 animales recientes (7 días)
        recientes = data["data"]
        assert len(recientes) == 3
        
        # Verificar que no aparece el animal de hace un mes
        ids_recientes = [animal["id"] for animal in recientes]
        assert animal_hoy.id in ids_recientes
        assert animal_ayer.id in ids_recientes
        assert animal_semana.id in ids_recientes
        assert animal_mes.id not in ids_recientes
        
        # Probar con un filtro de 1 día
        response = client.get("/api/dashboard/recientes", params={"days": 1})
        
        assert response.status_code == 200
        data = response.json()
        recientes_1_dia = data["data"]
        
        # Solo debería aparecer el animal de hoy
        assert len(recientes_1_dia) == 1
        assert recientes_1_dia[0]["id"] == animal_hoy.id
        
        logger.info("Test de actividad reciente completado exitosamente")
        
    except Exception as e:
        logger.error(f"Error en test de actividad reciente: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_dashboard_resumen():
    """Test para el endpoint de resumen del dashboard."""
    try:
        # Crear una explotación
        explotacio = await Explotacio.create(nom="Resumen Test", activa=True)
        
        # Crear animales con diferentes características
        await Animal.create(nom="Toro-1", explotacio=explotacio, genere="M", estado="OK")
        await Animal.create(nom="Toro-2", explotacio=explotacio, genere="M", estado="OK")
        await Animal.create(nom="Toro-3", explotacio=explotacio, genere="M", estado="DEF")
        
        await Animal.create(nom="Vaca-1", explotacio=explotacio, genere="F", estado="OK", alletar=0)
        await Animal.create(nom="Vaca-2", explotacio=explotacio, genere="F", estado="OK", alletar=1)
        await Animal.create(nom="Vaca-3", explotacio=explotacio, genere="F", estado="OK", alletar=1)
        await Animal.create(nom="Vaca-4", explotacio=explotacio, genere="F", estado="OK", alletar=2)
        await Animal.create(nom="Vaca-5", explotacio=explotacio, genere="F", estado="DEF")
        
        # Obtener resumen del dashboard
        response = client.get("/api/dashboard/resumen")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
        # Verificar KPIs
        resumen = data["data"]
        assert resumen["total_animales"] == 8
        assert resumen["activos"] == 6  # 6 animales con estado OK
        assert resumen["inactivos"] == 2  # 2 animales con estado DEF
        
        # Verificar porcentajes
        assert abs(resumen["porcentaje_activos"] - 75.0) < 0.1  # 75% activos
        assert abs(resumen["porcentaje_machos"] - 37.5) < 0.1  # 37.5% machos
        assert abs(resumen["porcentaje_hembras"] - 62.5) < 0.1  # 62.5% hembras
        
        # Verificar ratio toros/vacas
        assert abs(resumen["ratio_toros_vacas"] - 0.6) < 0.1  # 3 toros / 5 vacas = 0.6
        
        # Verificar estadísticas de amamantamiento
        assert resumen["total_terneros"] == 4  # 2 vacas con 1 ternero + 1 vaca con 2 terneros
        assert abs(resumen["porcentaje_amamantando"] - 60.0) < 0.1  # 3 de 5 vacas amamantando (60%)
        
        logger.info("Test de resumen de dashboard completado exitosamente")
        
    except Exception as e:
        logger.error(f"Error en test de resumen: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_dashboard_por_explotacion():
    """Test para estadísticas filtradas por explotación."""
    try:
        # Crear dos explotaciones
        explotacio1 = await Explotacio.create(nom="Explotacion 1", activa=True)
        explotacio2 = await Explotacio.create(nom="Explotacion 2", activa=True)
        
        # Crear animales para la primera explotación
        await Animal.create(nom="Toro-E1-1", explotacio=explotacio1, genere="M", estado="OK")
        await Animal.create(nom="Toro-E1-2", explotacio=explotacio1, genere="M", estado="OK")
        await Animal.create(nom="Vaca-E1-1", explotacio=explotacio1, genere="F", estado="OK", alletar=1)
        await Animal.create(nom="Vaca-E1-2", explotacio=explotacio1, genere="F", estado="DEF")
        
        # Crear animales para la segunda explotación
        await Animal.create(nom="Toro-E2-1", explotacio=explotacio2, genere="M", estado="OK")
        await Animal.create(nom="Vaca-E2-1", explotacio=explotacio2, genere="F", estado="OK", alletar=0)
        await Animal.create(nom="Vaca-E2-2", explotacio=explotacio2, genere="F", estado="OK", alletar=2)
        
        # Obtener estadísticas filtradas por la primera explotación
        response = client.get(f"/api/dashboard/stats", params={"explotacio_id": explotacio1.id})
        
        assert response.status_code == 200
        data = response.json()
        stats_e1 = data["data"]
        
        # Verificar estadísticas de la explotación 1
        assert stats_e1["total_animals"] == 4
        assert stats_e1["por_genero"]["M"] == 2
        assert stats_e1["por_genero"]["F"] == 2
        assert stats_e1["por_estado"]["OK"] == 3
        assert stats_e1["por_estado"]["DEF"] == 1
        assert stats_e1["total_terneros"] == 1  # 1 vaca con 1 ternero
        
        # Obtener estadísticas filtradas por la segunda explotación
        response = client.get(f"/api/dashboard/stats", params={"explotacio_id": explotacio2.id})
        
        assert response.status_code == 200
        data = response.json()
        stats_e2 = data["data"]
        
        # Verificar estadísticas de la explotación 2
        assert stats_e2["total_animals"] == 3
        assert stats_e2["por_genero"]["M"] == 1
        assert stats_e2["por_genero"]["F"] == 2
        assert stats_e2["por_estado"]["OK"] == 3
        assert stats_e2["total_terneros"] == 2  # 1 vaca con 2 terneros
        
        logger.info("Test de estadísticas por explotación completado exitosamente")
        
    except Exception as e:
        logger.error(f"Error en test de estadísticas por explotación: {str(e)}")
        raise