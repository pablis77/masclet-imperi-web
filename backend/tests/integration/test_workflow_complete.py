"""
Test de integración para el flujo completo del sistema.
Simula la importación, procesamiento y consulta de datos.
"""
import pytest
import logging
import json
import csv
import io
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app
from app.models.animal import Animal
from app.models.animal import Part
from app.models.explotacio import Explotacio
from tortoise.contrib.test import initializer, finalizer
from datetime import datetime

logger = logging.getLogger(__name__)
client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def initialize_tests():
    initializer(
        modules=["app.models.animal", "app.models.parto", "app.models.explotacio"]
    )
    yield
    finalizer()

def create_test_csv():
    """Crea un CSV de prueba con datos de animales."""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Cabecera
    writer.writerow(["explotacio", "nom", "genere", "estado", "alletar", "pare", "mare", "quadra", "cod", "num_serie", "dob", "part", "GenereT", "EstadoT"])
    
    # Datos de ejemplo
    data = [
        ["Gurans", "Toro-001", "M", "OK", None, None, None, "C1", "T001", "ES123456789", "01/01/2020", None, None, None],
        ["Gurans", "Toro-002", "M", "OK", None, None, None, "C1", "T002", "ES123456790", "05/03/2021", None, None, None],
        ["Gurans", "Vaca-001", "F", "OK", "1", "Toro-000", "Vaca-000", "C2", "V001", "ES123456791", "10/05/2019", "15/06/2023", "M", "OK"],
        ["Gurans", "Vaca-002", "F", "OK", "2", None, None, "C2", "V002", "ES123456792", "20/10/2020", "01/01/2024", "F", "OK"],
        ["Gurans", "Vaca-003", "F", "DEF", "0", None, None, "C3", "V003", "ES123456793", "15/03/2018", "10/04/2022", "M", "DEF"],
        ["Madrid", "Toro-003", "M", "OK", None, None, None, "M1", "T003", "ES123456794", "01/06/2022", None, None, None],
        ["Madrid", "Vaca-004", "F", "OK", "1", None, None, "M2", "V004", "ES123456795", "12/12/2021", "05/05/2024", "F", "OK"]
    ]
    
    for row in data:
        writer.writerow(row)
    
    return output.getvalue()

@pytest.mark.asyncio
async def test_complete_workflow():
    """Test del flujo completo: importación, procesamiento y consulta."""
    try:
        logger.info("Iniciando test de flujo completo")
        
        # 1. Crear explotaciones necesarias
        explotacio1 = await Explotacio.create(nom="Gurans", activa=True)
        explotacio2 = await Explotacio.create(nom="Madrid", activa=True)
        
        logger.info(f"Explotaciones creadas: {explotacio1.nom}, {explotacio2.nom}")
        
        # 2. Generar CSV de prueba
        csv_data = create_test_csv()
        
        # 3. Importar datos (simulando la carga de un archivo CSV)
        files = {
            "file": ("test_animals.csv", csv_data, "text/csv")
        }
        
        response = client.post(
            "/api/imports/csv",
            files=files,
            data={
                "encoding": "utf-8",
                "delimiter": ",",
                "explotacio_id": explotacio1.id  # Usar para animales sin explotación
            }
        )
        
        assert response.status_code == 200
        import_result = response.json()
        assert import_result["status"] == "success"
        
        # 4. Verificar que los datos se importaron correctamente
        animals = await Animal.all()
        assert len(animals) == 7  # 7 animales en el CSV
        
        # Verificar partos
        partos = await Part.all()
        assert len(partos) == 4  # 4 partos en el CSV
        
        # 5. Consultar animales por explotación
        response = client.get("/api/animals", params={"explotacio_id": explotacio1.id})
        assert response.status_code == 200
        gurans_animals = response.json()["data"]
        assert len(gurans_animals) == 5  # 5 animales en Gurans
        
        response = client.get("/api/animals", params={"explotacio_id": explotacio2.id})
        assert response.status_code == 200
        madrid_animals = response.json()["data"]
        assert len(madrid_animals) == 2  # 2 animales en Madrid
        
        # 6. Verificar filtros de búsqueda
        response = client.get("/api/animals/search", params={"genere": "F", "estado": "OK"})
        assert response.status_code == 200
        active_females = response.json()["data"]
        assert len(active_females) == 3  # 3 hembras activas
        
        # 7. Verificar estadísticas de dashboard
        response = client.get("/api/dashboard/stats")
        assert response.status_code == 200
        stats = response.json()["data"]
        
        # Verificar estadísticas generales
        assert stats["total_animals"] == 7
        assert stats["por_genero"]["M"] == 3
        assert stats["por_genero"]["F"] == 4
        assert stats["por_estado"]["OK"] == 6
        assert stats["por_estado"]["DEF"] == 1
        
        # Verificar estadísticas de amamantamiento
        assert stats["total_terneros"] == 4  # 2 vacas con 1 ternero + 1 vaca con 2 terneros
        
        # 8. Consultar estadísticas por explotación
        response = client.get("/api/dashboard/stats", params={"explotacio_id": explotacio1.id})
        assert response.status_code == 200
        stats_gurans = response.json()["data"]
        
        assert stats_gurans["total_animals"] == 5
        assert stats_gurans["por_genero"]["M"] == 2
        assert stats_gurans["por_genero"]["F"] == 3
        
        # 9. Consultar partos por madre
        vaca_id = next(animal["id"] for animal in gurans_animals if animal["nom"] == "Vaca-001")
        response = client.get("/api/partos", params={"animal_id": vaca_id})
        assert response.status_code == 200
        partos_vaca = response.json()["data"]
        assert len(partos_vaca) == 1  # 1 parto para Vaca-001
        
        # 10. Crear un nuevo animal mediante API
        new_animal_data = {
            "nom": "Nuevo-Toro",
            "explotacio_id": explotacio1.id,
            "genere": "M",
            "estado": "OK",
            "cod": "NT001",
            "num_serie": "ES999999999"
        }
        
        response = client.post("/api/animals", json=new_animal_data)
        assert response.status_code == 201
        new_animal_id = response.json()["data"]["id"]
        
        # Verificar que se ha creado
        response = client.get(f"/api/animals/{new_animal_id}")
        assert response.status_code == 200
        assert response.json()["data"]["nom"] == "Nuevo-Toro"
        
        # 11. Verificar actualización de estadísticas
        response = client.get("/api/dashboard/stats", params={"explotacio_id": explotacio1.id})
        assert response.status_code == 200
        updated_stats = response.json()["data"]
        
        assert updated_stats["total_animals"] == 6  # 5 iniciales + 1 nuevo
        assert updated_stats["por_genero"]["M"] == 3  # 2 iniciales + 1 nuevo
        
        logger.info("Test de flujo completo finalizado exitosamente")
        
    except Exception as e:
        logger.error(f"Error en test de flujo completo: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_alletar_workflow():
    """Test específico para el flujo de amamantamiento (alletar)."""
    try:
        logger.info("Iniciando test de flujo de amamantamiento")
        
        # 1. Crear explotación
        explotacio = await Explotacio.create(nom="Alletar Test", activa=True)
        
        # 2. Crear una vaca inicialmente sin amamantar
        vaca = await Animal.create(
            nom="Vaca-Alletar",
            explotacio=explotacio,
            genere="F",
            estado="OK",
            alletar=0,
            cod="VA001",
            num_serie="ES888888888"
        )
        
        # Verificar estado inicial
        response = client.get(f"/api/animals/{vaca.id}")
        assert response.status_code == 200
        assert response.json()["data"]["alletar"] == 0
        
        # 3. Registrar un parto
        parto_data = {
            "animal_id": vaca.id,
            "data": "01/06/2025",
            "genere_fill": "M",
            "estat_fill": "OK",
            "numero_part": 1
        }
        
        response = client.post("/api/partos", json=parto_data)
        assert response.status_code == 201
        
        # 4. Actualizar estado de amamantamiento a 1 (un ternero)
        update_data = {
            "alletar": 1
        }
        
        response = client.put(f"/api/animals/{vaca.id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["data"]["alletar"] == 1
        
        # 5. Verificar estadísticas de terneros
        response = client.get("/api/dashboard/stats", params={"explotacio_id": explotacio.id})
        assert response.status_code == 200
        stats = response.json()["data"]
        
        assert stats["total_terneros"] == 1
        
        # 6. Actualizar a 2 terneros
        update_data = {
            "alletar": 2
        }
        
        response = client.put(f"/api/animals/{vaca.id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["data"]["alletar"] == 2
        
        # 7. Verificar actualización en estadísticas
        response = client.get("/api/dashboard/stats", params={"explotacio_id": explotacio.id})
        assert response.status_code == 200
        updated_stats = response.json()["data"]
        
        assert updated_stats["total_terneros"] == 2  # Ahora amamantando a dos terneros
        
        # 8. Simular fallecimiento de la vaca (estado DEF)
        update_data = {
            "estado": "DEF"
        }
        
        response = client.put(f"/api/animals/{vaca.id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["data"]["estado"] == "DEF"
        
        # 9. Verificar que ya no cuenta en estadísticas de terneros
        response = client.get("/api/dashboard/stats", params={"explotacio_id": explotacio.id})
        assert response.status_code == 200
        final_stats = response.json()["data"]
        
        assert final_stats["total_terneros"] == 0  # Ya no hay terneros amamantando
        assert final_stats["por_estado"]["DEF"] == 1
        
        logger.info("Test de flujo de amamantamiento finalizado exitosamente")
        
    except Exception as e:
        logger.error(f"Error en test de flujo de amamantamiento: {str(e)}")
        raise