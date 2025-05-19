"""
Tests para verificar los endpoints del dashboard con datos reales.
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
async def test_dashboard_stats_endpoint():
    """Test para el endpoint /api/dashboard/stats."""
    try:
        # Crear datos de prueba si es necesario
        gurans = await Explotacio.get_or_none(nom="Gurans")
        if not gurans:
            gurans = await Explotacio.create(nom="Gurans", activa=True)
            logger.info(f"Explotación Gurans creada: {gurans.id}")
            
            # Crear algunos animales de prueba si no existen
            animals_count = await Animal.filter(explotacio=gurans).count()
            if animals_count < 5:
                await Animal.create(nom="Toro-Test-1", explotacio=gurans, genere="M", estado="OK")
                await Animal.create(nom="Vaca-Test-1", explotacio=gurans, genere="F", estado="OK", alletar=0)
                await Animal.create(nom="Vaca-Test-2", explotacio=gurans, genere="F", estado="OK", alletar=1)
                await Animal.create(nom="Vaca-Test-3", explotacio=gurans, genere="F", estado="OK", alletar=2)
                await Animal.create(nom="Vaca-Test-4", explotacio=gurans, genere="F", estado="DEF")
                
                logger.info("Animales de prueba creados para el dashboard")
        
        # Probar endpoint sin filtros
        response = client.get("/api/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        
        # Verificar que la respuesta tiene la estructura correcta
        assert "status" in data
        assert data["status"] == "success"
        assert "data" in data
        
        stats = data["data"]
        assert "total_animals" in stats
        assert "por_explotacio" in stats
        assert "por_genero" in stats
        assert "por_estado" in stats
        assert "por_alletar" in stats
        
        # Verificar estadísticas
        logger.info(f"Total de animales: {stats['total_animals']}")
        logger.info(f"Distribución por género: {stats['por_genero']}")
        logger.info(f"Distribución por estado: {stats['por_estado']}")
        logger.info(f"Distribución alletar: {stats['por_alletar']}")
        logger.info(f"Total terneros: {stats.get('total_terneros', 0)}")
        
        # Verificar distribución por explotación
        for expl, count in stats["por_explotacio"].items():
            logger.info(f"Explotación {expl}: {count} animales")
        
        # Verificar que los números son consistentes
        assert stats["total_animals"] == sum(stats["por_explotacio"].values())
        assert stats["total_animals"] == stats["por_genero"].get("M", 0) + stats["por_genero"].get("F", 0)
        assert stats["total_animals"] == stats["por_estado"].get("OK", 0) + stats["por_estado"].get("DEF", 0)
        
        # Verificar con filtro por explotación
        response = client.get(f"/api/dashboard/stats?explotacio_id={gurans.id}")
        assert response.status_code == 200
        data_filtered = response.json()
        stats_filtered = data_filtered["data"]
        
        logger.info(f"Total de animales en Gurans: {stats_filtered['total_animals']}")
        
    except Exception as e:
        logger.error(f"Error en test de dashboard stats: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_dashboard_recientes_endpoint():
    """Test para el endpoint /api/dashboard/recientes."""
    try:
        # Crear datos de prueba con fechas recientes
        gurans = await Explotacio.get_or_none(nom="Gurans")
        if not gurans:
            gurans = await Explotacio.create(nom="Gurans", activa=True)

        # Crear animales con diferentes fechas
        hoy = datetime.now()
        
        # Animal creado "hoy"
        animal1 = await Animal.create(
            nom="Reciente-1",
            explotacio=gurans,
            genere="M",
            estado="OK",
            created_at=hoy
        )
        
        # Animal creado hace 3 días
        animal2 = await Animal.create(
            nom="Reciente-2",
            explotacio=gurans,
            genere="F",
            estado="OK",
            created_at=hoy - timedelta(days=3)
        )
        
        # Animal creado hace 10 días (no debería aparecer en recientes por defecto)
        animal3 = await Animal.create(
            nom="NoReciente",
            explotacio=gurans,
            genere="F",
            estado="OK",
            created_at=hoy - timedelta(days=10)
        )
        
        # Verificar endpoint con valor predeterminado (7 días)
        response = client.get("/api/dashboard/recientes")
        assert response.status_code == 200
        data = response.json()
        
        recientes = data["data"]
        logger.info(f"Animales recientes (7 días): {len(recientes)}")
        
        # Verificar que aparecen los animales correctos
        ids_recientes = [animal["id"] for animal in recientes]
        assert animal1.id in ids_recientes, "Animal creado hoy no aparece en recientes"
        assert animal2.id in ids_recientes, "Animal creado hace 3 días no aparece en recientes"
        assert animal3.id not in ids_recientes, "Animal creado hace 10 días aparece en recientes (no debería)"
        
        # Verificar con filtro de 2 días
        response = client.get("/api/dashboard/recientes?days=2")
        assert response.status_code == 200
        data = response.json()
        
        recientes_2_dias = data["data"]
        logger.info(f"Animales recientes (2 días): {len(recientes_2_dias)}")
        
        # Solo debería aparecer el primer animal
        ids_recientes_2_dias = [animal["id"] for animal in recientes_2_dias]
        assert animal1.id in ids_recientes_2_dias, "Animal creado hoy no aparece en recientes (2 días)"
        assert animal2.id not in ids_recientes_2_dias, "Animal creado hace 3 días aparece en recientes (2 días)"
        
        # Verificar con filtro por explotación
        response = client.get(f"/api/dashboard/recientes?explotacio_id={gurans.id}")
        assert response.status_code == 200
        
        # Limpiar: eliminar los animales de prueba
        await animal1.delete()
        await animal2.delete()
        await animal3.delete()
        
        logger.info("Test de endpoint recientes completado correctamente")
        
    except Exception as e:
        logger.error(f"Error en test de dashboard recientes: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_dashboard_resumen_endpoint():
    """Test para el endpoint /api/dashboard/resumen."""
    try:
        # Verificar el endpoint resumen
        response = client.get("/api/dashboard/resumen")
        assert response.status_code == 200
        data = response.json()
        
        # Verificar estructura
        assert "status" in data
        assert data["status"] == "success"
        assert "data" in data
        
        resumen = data["data"]
        
        # Verificar campos clave
        campos_esperados = [
            "total_animales", "activos", "inactivos", 
            "porcentaje_activos", "porcentaje_machos", "porcentaje_hembras",
            "ratio_toros_vacas", "total_terneros", "porcentaje_amamantando"
        ]
        
        for campo in campos_esperados:
            assert campo in resumen, f"El campo '{campo}' no está presente en el resumen"
        
        # Verificar consistencia de datos
        assert resumen["total_animales"] == resumen["activos"] + resumen["inactivos"]
        assert abs(resumen["porcentaje_activos"] + resumen["porcentaje_inactivos"] - 100.0) < 0.1
        assert abs(resumen["porcentaje_machos"] + resumen["porcentaje_hembras"] - 100.0) < 0.1
        
        logger.info(f"Resumen KPIs:")
        logger.info(f"  - Total animales: {resumen['total_animales']}")
        logger.info(f"  - Activos: {resumen['activos']} ({resumen['porcentaje_activos']}%)")
        logger.info(f"  - Inactivos: {resumen['inactivos']} ({resumen['porcentaje_inactivos']}%)")
        logger.info(f"  - Machos: {resumen['porcentaje_machos']}%")
        logger.info(f"  - Hembras: {resumen['porcentaje_hembras']}%")
        logger.info(f"  - Ratio toros/vacas: {resumen['ratio_toros_vacas']}")
        logger.info(f"  - Total terneros: {resumen['total_terneros']}")
        
        # Verificar con filtro por explotación
        gurans = await Explotacio.get_or_none(nom="Gurans")
        if gurans:
            response = client.get(f"/api/dashboard/resumen?explotacio_id={gurans.id}")
            assert response.status_code == 200
            data_gurans = response.json()
            resumen_gurans = data_gurans["data"]
            
            logger.info(f"Resumen Gurans: {resumen_gurans['total_animales']} animales")
        
        logger.info("Test de endpoint resumen completado correctamente")
        
    except Exception as e:
        logger.error(f"Error en test de dashboard resumen: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_dashboard_stats_calculations():
    """Test para verificar que los cálculos del dashboard son correctos."""
    try:
        # Obtener estadísticas directamente de la base de datos
        all_animals = await Animal.all().count()
        active_animals = await Animal.filter(estado="OK").count()
        inactive_animals = await Animal.filter(estado="DEF").count()
        males = await Animal.filter(genere="M").count()
        females = await Animal.filter(genere="F").count()
        
        # Calcular total de terneros
        vacas_amamantando = await Animal.filter(genere="F", alletar__gt=0).all()
        total_terneros_db = sum(vaca.alletar for vaca in vacas_amamantando if vaca.alletar is not None)
        
        # Obtener estadísticas del dashboard
        response = client.get("/api/dashboard/stats")
        assert response.status_code == 200
        stats = response.json()["data"]
        
        # Verificar que los números coinciden
        assert stats["total_animals"] == all_animals
        assert stats["por_estado"].get("OK", 0) == active_animals
        assert stats["por_estado"].get("DEF", 0) == inactive_animals
        assert stats["por_genero"].get("M", 0) == males
        assert stats["por_genero"].get("F", 0) == females
        assert stats.get("total_terneros", 0) == total_terneros_db
        
        # Obtener resumen
        response = client.get("/api/dashboard/resumen")
        assert response.status_code == 200
        resumen = response.json()["data"]
        
        # Verificar cálculos del resumen
        assert resumen["total_animales"] == all_animals
        assert resumen["activos"] == active_animals
        assert resumen["inactivos"] == inactive_animals
        
        # Verificar porcentajes (con un pequeño margen de error por redondeo)
        porcentaje_activos = (active_animals / all_animals) * 100 if all_animals > 0 else 0
        assert abs(resumen["porcentaje_activos"] - porcentaje_activos) < 0.1
        
        porcentaje_machos = (males / all_animals) * 100 if all_animals > 0 else 0
        assert abs(resumen["porcentaje_machos"] - porcentaje_machos) < 0.1
        
        porcentaje_hembras = (females / all_animals) * 100 if all_animals > 0 else 0
        assert abs(resumen["porcentaje_hembras"] - porcentaje_hembras) < 0.1
        
        # Verificar ratio toros/vacas
        ratio_toros_vacas = males / females if females > 0 else 0
        assert abs(resumen["ratio_toros_vacas"] - ratio_toros_vacas) < 0.1
        
        # Verificar porcentaje de vacas amamantando
        porcentaje_amamantando = (len(vacas_amamantando) / females) * 100 if females > 0 else 0
        assert abs(resumen["porcentaje_amamantando"] - porcentaje_amamantando) < 0.1
        
        logger.info("Todas las estadísticas del dashboard se calculan correctamente")
        
    except Exception as e:
        logger.error(f"Error en test de cálculos del dashboard: {str(e)}")
        raise