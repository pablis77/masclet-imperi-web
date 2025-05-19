"""
Tests para el módulo de importación de datos
"""
import pytest
from fastapi.testclient import TestClient
from io import BytesIO
import csv
from datetime import date
import pandas as pd

from app.main import app
from app.core.date_utils import DATE_FORMAT_API, DATE_FORMAT_DB

client = TestClient(app)

def create_test_csv(data: list) -> BytesIO:
    """Crea un archivo CSV en memoria con los datos proporcionados"""
    # Primero escribimos a un string
    output_str = StringIO()
    writer = csv.writer(output_str)
    writer.writerow(['explotacio', 'nom', 'genere', 'estado', 'dob'])
    writer.writerows(data)
    
    # Convertimos el string a bytes
    output_bytes = BytesIO()
    output_bytes.write(output_str.getvalue().encode())
    output_bytes.seek(0)
    return output_bytes

@pytest.fixture
def valid_csv_data():
    """Datos válidos para pruebas"""
    return [
        ['Granja Test', 'Animal 1', 'M', 'OK', '01/01/2024'],
        ['Granja Test', 'Animal 2', 'F', 'OK', '02/01/2024'],
    ]

@pytest.fixture
def invalid_date_csv_data():
    """Datos con fechas inválidas"""
    return [
        ['Granja Test', 'Animal 1', 'M', 'OK', '32/13/2024'],  # Fecha inválida
        ['Granja Test', 'Animal 2', 'F', 'OK', '02/01/2024'],
    ]

def test_import_csv_valid(valid_csv_data):
    """Test de importación de CSV con datos válidos"""
    csv_file = create_test_csv(valid_csv_data)
    
    response = client.post(
        "/api/v1/imports/csv",
        files={"file": ("test.csv", csv_file, "text/csv")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["imported"] == 2
    assert data["data"]["errors"] is None

def test_import_csv_invalid_dates(invalid_date_csv_data):
    """Test de importación de CSV con fechas inválidas"""
    csv_file = create_test_csv(invalid_date_csv_data)
    
    response = client.post(
        "/api/v1/imports/csv",
        files={"file": ("test.csv", csv_file, "text/csv")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["imported"] == 1  # Solo el segundo registro debería importarse
    assert len(data["data"]["errors"]) == 1
    assert "fecha" in data["data"]["errors"][0].lower()

def test_import_csv_missing_columns():
    """Test de importación de CSV con columnas faltantes"""
    data = [
        ['Granja Test', 'Animal 1', 'M'],  # Faltan columnas
        ['Granja Test', 'Animal 2', 'F'],
    ]
    output_str = StringIO()
    writer = csv.writer(output_str)
    writer.writerow(['explotacio', 'nom', 'genere'])  # Faltan columnas requeridas
    writer.writerows(data)
    
    # Convertir a BytesIO
    csv_file = BytesIO(output_str.getvalue().encode())
    
    response = client.post(
        "/api/v1/imports/csv",
        files={"file": ("test.csv", csv_file, "text/csv")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert "columnas" in data["message"].lower()

def test_import_csv_empty_file():
    """Test de importación de CSV vacío"""
    csv_file = BytesIO(b"")
    
    response = client.post(
        "/api/v1/imports/csv",
        files={"file": ("test.csv", csv_file, "text/csv")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert "vacío" in data["message"].lower()

def test_import_csv_invalid_file():
    """Test de importación de archivo inválido"""
    invalid_file = BytesIO(b"This is not a CSV file")
    
    response = client.post(
        "/api/v1/imports/csv",
        files={"file": ("test.txt", invalid_file, "text/plain")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert "csv" in data["message"].lower()

def test_verify_imported_dates():
    """Test para verificar que las fechas se almacenan en el formato correcto"""
    # Crear datos de prueba
    today = date.today()
    test_date = today.strftime(DATE_FORMAT_API)  # Fecha en formato DD/MM/YYYY
    data = [['Granja Test', 'Animal Test', 'M', 'OK', test_date]]
    
    # Importar datos
    csv_file = create_test_csv(data)
    response = client.post(
        "/api/v1/imports/csv",
        files={"file": ("test.csv", csv_file, "text/csv")}
    )
    
    assert response.status_code == 200
    
    # Verificar el animal importado
    response = client.get("/api/v1/animals/")
    assert response.status_code == 200
    data = response.json()
    
    # Verificar que hay al menos un animal
    assert data["success"] is True
    assert len(data["data"]["items"]) > 0
    
    # Verificar el formato de la fecha
    animal = data["data"]["items"][0]
    assert "dob" in animal
    # La fecha debería estar en formato DD/MM/YYYY en la respuesta
    assert len(animal["dob"].split("/")) == 3