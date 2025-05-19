"""
Script simple para probar el endpoint usando subprocess
"""
import subprocess
import json

def test_create_animal():
    print("=== Iniciando prueba de creación de animal ===")
    
    # Datos de prueba
    data = {
        "explotacio": "Granja Test",
        "nom": "Toro Test",
        "genere": "M",
        "estado": "OK",
        "dob": "01/01/2024"
    }
    
    # Convertir a JSON y escapar las comillas para la línea de comandos
    data_json = json.dumps(data).replace('"', '\\"')
    
    # Construir el comando curl
    cmd = f'curl -v -X POST "http://localhost:8000/api/v1/animals/" -H "Content-Type: application/json" -d "{data_json}"'
    
    print("\nEjecutando comando:")
    print(cmd)
    print("\nRespuesta:")
    
    # Ejecutar el comando
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    # Mostrar la salida
    if result.stdout:
        print("STDOUT:")
        print(result.stdout)
    
    if result.stderr:
        print("\nSTDERR:")
        print(result.stderr)
    
    print("\n=== Prueba completada ===")

if __name__ == "__main__":
    test_create_animal()