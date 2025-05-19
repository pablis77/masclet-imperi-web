from fastapi.testclient import TestClient
from fastapi import FastAPI, UploadFile, File
from app.core.middleware import MessageMiddleware
import io
import os

# Create test app
app = FastAPI()
app.add_middleware(MessageMiddleware)

@app.get("/api/v1/animals")
async def get_animals():
    return {"items": [], "total": 0}

@app.post("/api/v1/imports/preview")
async def preview_import(file: UploadFile = File(...)):
    # Este es el endpoint mock que devuelve datos sin transformar
    return {
        "headers": ["test", "data"],
        "preview": [{"test": "data"}],
        "total_rows": 1,
        "valid_rows": 1,
        "errors": []
    }

client = TestClient(app)

def test_animal_endpoint_not_affected():
    response = client.get("/api/v1/animals")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data

def test_imports_endpoint_transformed():
    """Test that import endpoints get transformed response"""
    # 1. Preparar el archivo
    test_content = "test,data\n1,2"
    test_file = io.BytesIO(test_content.encode())
    
    # 2. Hacer la petición
    response = client.post(
        "/api/v1/imports/preview",
        files={"file": ("test.csv", test_file, "text/csv")}
    )
    
    # 3. Verificaciones detalladas
    assert response.status_code == 200
    data = response.json()
    
    # Debug detallado
    print("\nResponse Status:", response.status_code)
    print("Response Headers:", dict(response.headers))
    print("Response Data:", data)
    print("Data Type:", type(data))
    print("Data Keys:", data.keys() if isinstance(data, dict) else "Not a dict")
    
    # 4. Verificaciones específicas
    assert isinstance(data, dict), "Response should be a dictionary"
    assert "message" in data, "Response should have 'message' key"
    assert "type" in data, "Response should have 'type' key"
    assert "data" in data, "Response should have 'data' key"