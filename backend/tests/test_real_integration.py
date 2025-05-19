"""
Tests de integración usando datos reales
"""
import pytest
from datetime import datetime, timedelta
import pandas as pd
import os
from typing import Dict, List
from fastapi.testclient import TestClient

from app.models.animal import Animal, Genere, Estado
from app.models.explotacio import Explotacio
from app.core.date_utils import DateConverter

def load_test_data() -> pd.DataFrame:
    """Carga los datos de prueba"""
    file_path = os.path.join("database", "test_sample.csv")
    if not os.path.exists(file_path):
        pytest.skip("Archivo de datos de prueba no encontrado")
    try:
        return pd.read_csv(file_path, sep=";", encoding='utf-8')
    except UnicodeDecodeError:
        return pd.read_csv(file_path, sep=";", encoding='latin1')

@pytest.mark.asyncio
async def test_create_gurans_explotacio(client: TestClient):
    """Test de creación de explotación Gurans con datos reales"""
    # Crear explotación
    explotacio_data = {
        "nom": "Gurans",
        "ubicacio": "Parets de Dalt",
        "activa": True
    }
    
    response = client.post("/api/v1/explotacions/", json=explotacio_data)
    assert response.status_code == 200
    data = response.json()
    assert data["nom"] == "Gurans"
    assert data["ubicacio"] == "Parets de Dalt"
    assert data["activa"] is True
    assert "id" in data
    
    return data["id"]

@pytest.mark.asyncio
async def test_populate_gurans_with_real_data(client: TestClient):
    """Test de población de Gurans con datos reales"""
    # Crear explotación
    explotacio_id = await test_create_gurans_explotacio(client)
    
    # Cargar y procesar datos
    df = load_test_data()
    gurans_data = df[df["explotació"] == "Gurans"]
    
    # Crear animales
    created_animals = []
    for _, row in gurans_data.iterrows():
        animal_data = {
            "explotacio": str(explotacio_id),
            "nom": row["NOM"],
            "genere": "F" if row["Genere"] == "F" else "M",
            "estado": row["Estado"],
            "alletar": row["Alletar"].lower() == "si",
            "quadra": row["Quadra"],
            "cod": row["COD"],
            "num_serie": row["Nº Serie"],
            "dob": DateConverter.get_display_format(
                datetime.strptime(row["DOB"], "%d/%m/%Y").date()
            ) if pd.notna(row["DOB"]) else None,
            "mare": row["Mare"] if pd.notna(row["Mare"]) else None,
            "pare": row["Pare"] if pd.notna(row["Pare"]) else None,
            "part": int(row["part"]) if pd.notna(row["part"]) else None,
            "genere_t": row["GenereT"] if pd.notna(row["GenereT"]) else None,
            "estado_t": row["EstadoT"] if pd.notna(row["EstadoT"]) else None
        }
        
        response = client.post("/api/v1/animals/", json=animal_data)
        assert response.status_code == 200
        created_animals.append(response.json())
    
    # Verificar estadísticas
    response = client.get(f"/api/v1/explotacions/{explotacio_id}/dashboard")
    assert response.status_code == 200
    stats = response.json()
    
    # Verificar totales
    assert stats["total"] == len(created_animals)
    assert stats["vacas"] == len([a for a in created_animals if a["genere"] == "F"])
    assert stats["toros"] == len([a for a in created_animals if a["genere"] == "M"])
    assert stats["activos"] == len([a for a in created_animals if a["estado"] == "A"])
    
    # Verificar ratios
    assert 0 <= stats["ratio_machos_hembras"] <= 1
    assert 0 <= stats["tasa_supervivencia"] <= 1

@pytest.mark.asyncio
async def test_delete_explotacio_with_animals(client: TestClient):
    """Test de eliminación de explotación con animales"""
    # Crear y poblar explotación
    explotacio_id = await test_create_gurans_explotacio(client)
    
    # Crear un animal activo
    animal_data = {
        "explotacio": str(explotacio_id),
        "nom": "TEST ANIMAL",
        "genere": "F",
        "estado": "A",
        "alletar": True,
        "quadra": "Test Quadra",
        "cod": "T001",
        "num_serie": "ES999999999",
        "dob": DateConverter.get_display_format(datetime.now().date())
    }
    response = client.post("/api/v1/animals/", json=animal_data)
    assert response.status_code == 200
    
    # Intentar eliminar con animales activos
    response = client.delete(f"/api/v1/explotacions/{explotacio_id}")
    assert response.status_code == 400
    assert "animales activos" in response.json()["detail"].lower()
    
    # Dar de baja todos los animales
    response = client.get(f"/api/v1/animals/?explotacio_id={explotacio_id}")
    assert response.status_code == 200
    animals = response.json()
    
    for animal in animals:
        response = client.patch(
            f"/api/v1/animals/{animal['id']}",
            json={"estado": "B"}  # Baja
        )
        assert response.status_code == 200
    
    # Ahora sí debería poder eliminarse
    response = client.delete(f"/api/v1/explotacions/{explotacio_id}")
    assert response.status_code == 200