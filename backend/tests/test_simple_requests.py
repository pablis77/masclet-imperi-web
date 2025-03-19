"""
Script simple para probar el endpoint de animales usando requests
"""
import requests
import json

def test_create_animal():
    """Prueba la creación de un animal"""
    print("\n=== Iniciando prueba de creación de animal ===\n")

    # Datos de prueba
    data = {
        "explotacio": "Granja Test",
        "nom": "Toro Test",
        "genere": "M",
        "estado": "OK",
        "dob": "01/01/2024"
    }

    try:
        # Verificar que el servidor está corriendo
        print("Verificando servidor...")
        root_response = requests.get("http://localhost:8000/")
        print(f"Status raíz: {root_response.status_code}")
        print(f"Respuesta raíz: {root_response.text}\n")

        # Crear animal
        print("Intentando crear animal...")
        print(f"Datos a enviar: {json.dumps(data, indent=2)}\n")

        response = requests.post(
            "http://localhost:8000/api/v1/animals/",
            json=data,
            headers={"Content-Type": "application/json"}
        )

        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Response: {response.text}\n")

        return response.status_code == 200

    except Exception as e:
        print(f"\nError en la prueba: {str(e)}")
        return False

if __name__ == "__main__":
    try:
        success = test_create_animal()
        print(f"=== Prueba completada. Éxito: {success} ===\n")
    except KeyboardInterrupt:
        print("\nPrueba interrumpida por el usuario")
    except Exception as e:
        print(f"\nError fatal: {str(e)}")