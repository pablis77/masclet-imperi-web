from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_animal_flow():
    """Test flujo completo CRUD animal"""
    # Create
    response = client.post("/api/animals/", json={
        "explotacio": "Test Farm",
        "nom": "Test Animal",
        "genere": "FEMELLA",
        "estado": "OK"
    })
    assert response.status_code == 201
    animal_id = response.json()["id"]
    
    # Read
    response = client.get(f"/api/animals/{animal_id}")
    assert response.status_code == 200
    assert response.json()["nom"] == "Test Animal"