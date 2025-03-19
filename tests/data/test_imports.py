from fastapi.testclient import TestClient
from app.main import app
import os

client = TestClient(app)

def test_preview_import():
    """Test CSV import preview endpoint"""
    # 1. Debug preparación archivo
    test_file_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        'data',
        'test_import.csv'
    )
    print(f"\nArchivo a usar: {test_file_path}")
    print(f"Archivo existe: {os.path.exists(test_file_path)}")
    
    with open(test_file_path, 'rb') as f:
        file_content = f.read()
        print(f"Contenido del archivo (primeros 100 bytes): {file_content[:100]}")
        
        # 2. Debug request
        response = client.post(
            "/api/v1/imports/preview",
            files={"file": ("test_import.csv", file_content, "text/csv")}
        )
        
        # 3. Debug respuesta
        print(f"\nResponse status code: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response raw content: {response.content}")
        print(f"Response text: {response.text}")
        
        try:
            data = response.json()
            print(f"Response JSON: {data}")
        except Exception as e:
            print(f"Error parsing JSON: {str(e)}")
            print(f"Response content type: {type(response.content)}")
            print(f"Response content length: {len(response.content)}")
    
    # 3. Verificaciones
    assert response.status_code == 200
    data = response.json()
    
    # Verificar estructura básica según documentación
    assert isinstance(data, dict)
    assert all(key in data for key in ["message", "type", "data"])
    assert data["message"] == "Preview generado correctamente"
    assert data["type"] == "success"
    
    # Verificar estructura de datos
    assert all(key in data["data"] for key in ["headers", "preview", "total_rows", "valid_rows", "errors"])
    
    # Verificar contenido específico
    expected_headers = [
        "Alletar", "explotació", "NOM", "Genere", "Pare", "Mare",
        "Quadra", "COD", "Nº Serie", "DOB", "Estado", "part",
        "GenereT", "EstadoT"
    ]
    assert all(header in data["data"]["headers"] for header in expected_headers)
    
    # Verificar preview data
    assert len(data["data"]["preview"]) > 0
    assert data["data"]["total_rows"] == 3
    assert data["data"]["valid_rows"] == 3
    assert len(data["data"]["errors"]) == 0

def test_available_routes():
    """Debug available routes"""
    print("\nAvailable routes:")
    for route in app.routes:
        print(f"  {route.path} [{route.methods}]")