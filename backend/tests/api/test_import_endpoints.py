"""
Tests para verificar los endpoints de importación CSV.
"""
import pytest
import logging
import os
import io
import csv
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app
from app.models.animal import Animal
from app.models.animal import Part
from app.models.explotacio import Explotacio
from tortoise.contrib.test import initializer, finalizer

logger = logging.getLogger(__name__)
client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def initialize_tests():
    initializer(
        modules=["app.models.animal", "app.models.parto", "app.models.explotacio"]
    )
    yield
    finalizer()

def crear_csv_test():
    """Crea un CSV de prueba con datos válidos."""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Cabecera
    writer.writerow(["explotacio", "NOM", "Genere", "Estado", "Alletar", "Pare", "Mare", "Quadra", "COD", "N° Serie", "DOB", "part", "GenereT", "EstadoT"])
    
    # Datos de ejemplo
    writer.writerow(["Test-Import", "Toro-Import-1", "M", "OK", "", "", "", "C1", "TI001", "ES12345678", "01/01/2023", "", "", ""])
    writer.writerow(["Test-Import", "Vaca-Import-1", "F", "OK", "0", "", "", "C2", "VI001", "ES87654321", "15/03/2023", "", "", ""])
    writer.writerow(["Test-Import", "Vaca-Import-2", "F", "OK", "1", "Toro-Import-1", "", "C2", "VI002", "ES98765432", "20/05/2023", "10/04/2024", "M", "OK"])
    writer.writerow(["Test-Import", "Vaca-Import-3", "F", "DEF", "0", "", "", "C3", "VI003", "ES11223344", "01/01/2020", "05/06/2022", "F", "DEF"])
    
    return output.getvalue()

def crear_csv_invalido():
    """Crea un CSV de prueba con algunos datos inválidos."""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Cabecera
    writer.writerow(["explotacio", "NOM", "Genere", "Estado", "Alletar", "Pare", "Mare", "Quadra", "COD", "N° Serie", "DOB", "part", "GenereT", "EstadoT"])
    
    # Datos con errores
    writer.writerow(["Test-Import", "Toro-Invalido-1", "X", "OK", "", "", "", "C1", "TI101", "ES12345678", "01/01/2023", "", "", ""])  # Género inválido
    writer.writerow(["Test-Import", "Vaca-Invalida-1", "F", "FALLECIDO", "0", "", "", "C2", "VI101", "ES87654321", "15/03/2023", "", "", ""])  # Estado inválido
    writer.writerow(["Test-Import", "Vaca-Invalida-2", "F", "OK", "3", "", "", "C2", "VI102", "ES98765432", "32/05/2023", "10/04/2024", "M", "OK"])  # Alletar y fecha inválidos
    writer.writerow(["", "Sin-Explotacion", "M", "OK", "", "", "", "C3", "SE001", "ES11223344", "01/01/2020", "", "", ""])  # Explotación vacía
    
    return output.getvalue()

@pytest.mark.asyncio
async def test_import_csv_endpoint():
    """Test para el endpoint /api/imports/csv."""
    try:
        # Crear explotación de prueba
        explotacion, created = await Explotacio.get_or_create(nom="Test-Import", defaults={"activa": True})
        
        # Contar animales antes de importar
        animals_before = await Animal.filter(explotacio=explotacion).count()
        
        # Crear datos CSV
        csv_data = crear_csv_test()
        
        # Configurar el archivo para enviar
        files = {
            "file": ("test_import.csv", csv_data, "text/csv")
        }
        
        # Enviar solicitud de importación
        response = client.post(
            "/api/imports/csv",
            files=files,
            data={
                "encoding": "utf-8",
                "delimiter": ",",
                "explotacio_id": explotacion.id
            }
        )
        
        assert response.status_code == 200, f"Error al importar CSV: {response.text}"
        data = response.json()
        
        # Verificar estructura de respuesta
        assert "status" in data
        assert data["status"] == "success"
        assert "data" in data
        
        # Verificar resultados de importación
        import_results = data["data"]
        logger.info(f"Resultados importación: {import_results}")
        
        # Contar animales después de importar
        animals_after = await Animal.filter(explotacio=explotacion).count()
        assert animals_after > animals_before, "No se importaron nuevos animales"
        
        # Verificar que se crearon los animales correctos
        toro = await Animal.get_or_none(nom="Toro-Import-1", explotacio=explotacion)
        assert toro is not None, "No se encontró el toro importado"
        assert toro.genere == "M"
        assert toro.cod == "TI001"
        
        vaca = await Animal.get_or_none(nom="Vaca-Import-2", explotacio=explotacion)
        assert vaca is not None, "No se encontró la vaca importada"
        assert vaca.genere == "F"
        assert vaca.alletar == 1
        
        # Verificar que se creó el parto
        parto = await Part.get_or_none(animal=vaca)
        assert parto is not None, "No se encontró el parto importado"
        assert parto.genere_fill == "M"
        
        logger.info(f"Test de importación CSV completado. Animales importados: {animals_after - animals_before}")
        
    except Exception as e:
        logger.error(f"Error en test de importación CSV: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_import_csv_invalid_data():
    """Test para verificar manejo de datos inválidos en importación CSV."""
    try:
        # Crear explotación de prueba
        explotacion, created = await Explotacio.get_or_create(nom="Test-Import", defaults={"activa": True})
        
        # Contar animales antes de importar
        animals_before = await Animal.filter(explotacio=explotacion).count()
        
        # Crear datos CSV inválidos
        csv_data = crear_csv_invalido()
        
        # Configurar el archivo para enviar
        files = {
            "file": ("invalid_import.csv", csv_data, "text/csv")
        }
        
        # Enviar solicitud de importación
        response = client.post(
            "/api/imports/csv",
            files=files,
            data={
                "encoding": "utf-8",
                "delimiter": ",",
                "explotacio_id": explotacion.id
            }
        )
        
        # La API debería aceptar el archivo pero reportar errores
        assert response.status_code == 200
        data = response.json()
        
        # Verificar que hay registro de errores o advertencias
        assert "data" in data
        import_results = data["data"]
        logger.info(f"Resultados importación con errores: {import_results}")
        
        if "warnings" in import_results:
            assert len(import_results["warnings"]) > 0, "No se reportaron advertencias para datos inválidos"
            logger.info(f"Advertencias reportadas: {len(import_results['warnings'])}")
        
        if "errors" in import_results:
            assert len(import_results["errors"]) > 0, "No se reportaron errores para datos inválidos"
            logger.info(f"Errores reportados: {len(import_results['errors'])}")
        
        # Contar animales después de importar
        animals_after = await Animal.filter(explotacio=explotacion).count()
        logger.info(f"Animales antes: {animals_before}, después: {animals_after}")
        
    except Exception as e:
        logger.error(f"Error en test de importación con datos inválidos: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_import_empty_csv():
    """Test para verificar manejo de CSV vacío."""
    try:
        # Crear explotación de prueba
        explotacion, created = await Explotacio.get_or_create(nom="Test-Import", defaults={"activa": True})
        
        # Crear CSV vacío
        empty_csv = "explotacio,NOM,Genere,Estado,Alletar,Pare,Mare,Quadra,COD,N° Serie,DOB,part,GenereT,EstadoT\n"
        
        # Configurar el archivo para enviar
        files = {
            "file": ("empty.csv", empty_csv, "text/csv")
        }
        
        # Enviar solicitud de importación
        response = client.post(
            "/api/imports/csv",
            files=files,
            data={
                "encoding": "utf-8",
                "delimiter": ",",
                "explotacio_id": explotacion.id
            }
        )
        
        # La API debería manejar correctamente un CSV vacío
        assert response.status_code == 200
        data = response.json()
        
        # Verificar que no hubo errores, pero tampoco importaciones
        assert "data" in data
        import_results = data["data"]
        
        if "processed" in import_results:
            assert import_results["processed"] == 0, "Se reportaron filas procesadas en CSV vacío"
        
        if "successful" in import_results:
            assert import_results["successful"] == 0, "Se reportaron filas exitosas en CSV vacío"
        
        logger.info(f"Test de importación con CSV vacío completado correctamente")
        
    except Exception as e:
        logger.error(f"Error en test de importación con CSV vacío: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_import_with_matriz_master_extract():
    """Test para importar una muestra de matriz_master.csv."""
    try:
        # Crear una muestra de matriz_master.csv
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Cabecera basada en matriz_master.csv
        writer.writerow(["Alletar", "explotaci�", "NOM", "Genere", "Pare", "Mare", "Quadra", "COD", "N� Serie", "DOB", "Estado", "part", "GenereT", "EstadoT"])
        
        # Extraer algunos ejemplos representativos
        writer.writerow(["", "Gurans", "1", "M", "", "", "Riera", "7892", "ES07090513", "31/01/2020", "OK", "", "", ""])
        writer.writerow(["no", "Gurans", "R-32", "F", "", "", "", "6144", "", "17/02/2018", "OK", "28/11/2019", "Femella", "OK"])
        writer.writerow(["si", "Gurans", "50", "F", "", "", "", "", "", "", "OK", "", "", ""])
        
        csv_data = output.getvalue()
        
        # Crear explotación si no existe
        explotacion, created = await Explotacio.get_or_create(nom="Gurans", defaults={"activa": True})
        
        # Contar animales antes de importar
        animals_before = await Animal.filter(explotacio=explotacion).count()
        
        # Configurar el archivo para enviar
        files = {
            "file": ("matriz_sample.csv", csv_data, "text/csv")
        }
        
        # Enviar solicitud de importación
        response = client.post(
            "/api/imports/csv",
            files=files,
            data={
                "encoding": "latin-1",  # Codificación de matriz_master.csv
                "delimiter": ";",       # Delimitador de matriz_master.csv
                "explotacio_id": explotacion.id
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verificar resultados de importación
        import_results = data["data"]
        logger.info(f"Resultados importación matriz: {import_results}")
        
        # Contar animales después de importar
        animals_after = await Animal.filter(explotacio=explotacion).count()
        new_animals = animals_after - animals_before
        logger.info(f"Nuevos animales importados: {new_animals}")
        
        # Verificar que se procesaron las filas correctamente
        if "processed" in import_results:
            assert import_results["processed"] == 3, f"Se esperaban 3 filas procesadas, pero fueron {import_results.get('processed', 0)}"
        
        logger.info("Test de importación con formato matriz_master completado correctamente")
        
    except Exception as e:
        logger.error(f"Error en test de importación con matriz_master: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_import_large_dataset():
    """Test para simular importación de un conjunto grande de datos."""
    try:
        # Crear explotación de prueba
        explotacion, created = await Explotacio.get_or_create(nom="Test-Bulk", defaults={"activa": True})
        
        # Generar CSV con muchos registros
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Cabecera
        writer.writerow(["explotacio", "NOM", "Genere", "Estado", "Alletar", "Pare", "Mare", "Quadra", "COD", "N° Serie", "DOB", "part", "GenereT", "EstadoT"])
        
        # Generar 50 registros (simulando conjunto grande)
        for i in range(1, 51):
            if i % 5 == 0:  # Cada 5 registros es un toro
                writer.writerow([
                    "Test-Bulk", 
                    f"Toro-Bulk-{i}", 
                    "M", 
                    "OK", 
                    "", 
                    "", 
                    "", 
                    f"C{i//10}", 
                    f"TB{i:03d}", 
                    f"ES{1000000+i}", 
                    "01/01/2023", 
                    "", 
                    "", 
                    ""
                ])
            else:  # El resto son vacas
                writer.writerow([
                    "Test-Bulk", 
                    f"Vaca-Bulk-{i}", 
                    "F", 
                    "OK" if i % 7 != 0 else "DEF",  # Algunas están muertas
                    "1" if i % 3 == 0 else "0",     # Algunas amamantando
                    "", 
                    "", 
                    f"C{i//10}", 
                    f"VB{i:03d}", 
                    f"ES{2000000+i}", 
                    "01/02/2023", 
                    "10/04/2024" if i % 3 == 0 else "",  # Partos para las que amamantan
                    "M" if i % 2 == 0 else "F", 
                    "OK"
                ])
        
        csv_data = output.getvalue()
        
        # Contar animales antes de importar
        animals_before = await Animal.filter(explotacio=explotacion).count()
        
        # Configurar el archivo para enviar
        files = {
            "file": ("bulk_import.csv", csv_data, "text/csv")
        }
        
        # Enviar solicitud de importación
        response = client.post(
            "/api/imports/csv",
            files=files,
            data={
                "encoding": "utf-8",
                "delimiter": ",",
                "explotacio_id": explotacion.id
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verificar resultados de importación
        import_results = data["data"]
        
        # Contar animales después de importar
        animals_after = await Animal.filter(explotacio=explotacion).count()
        new_animals = animals_after - animals_before
        
        logger.info(f"Importación masiva: {new_animals} nuevos animales importados")
        assert new_animals > 0, "No se importaron animales en la importación masiva"
        
        # Verificar que hay más machos y hembras
        males = await Animal.filter(explotacio=explotacion, genere="M").count()
        females = await Animal.filter(explotacio=explotacion, genere="F").count()
        
        logger.info(f"Distribución después de importación masiva: {males} machos, {females} hembras")
        
        # Verificar los partos creados
        partos = await Part.filter(animal__explotacio=explotacion).count()
        logger.info(f"Partos creados en importación masiva: {partos}")
        
        logger.info("Test de importación masiva completado correctamente")
        
    except Exception as e:
        logger.error(f"Error en test de importación masiva: {str(e)}")
        raise