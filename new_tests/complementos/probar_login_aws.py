import requests
import json

# URL de la API en AWS
BASE_URL = "http://108.129.139.119:8000"

# Datos de autenticación
login_data = {
    "username": "admin",
    "password": "admin123"
}

# Realizar petición de login
print("Intentando login en:", f"{BASE_URL}/api/v1/auth/login")
try:
    login_response = requests.post(
        f"{BASE_URL}/api/v1/auth/login", 
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Código de estado: {login_response.status_code}")
    print(f"Respuesta: {login_response.text}")
    
    if login_response.status_code == 200:
        token = login_response.json().get("access_token")
        print(f"Token obtenido: {token[:10]}...")
        
        # Probar endpoint protegido
        headers = {"Authorization": f"Bearer {token}"}
        user_response = requests.get(f"{BASE_URL}/api/v1/users/me", headers=headers)
        print("\nDatos del usuario:")
        print(f"Código: {user_response.status_code}")
        print(f"Respuesta: {json.dumps(user_response.json(), indent=2, ensure_ascii=False)}")
    
except Exception as e:
    print(f"Error en la petición: {str(e)}")

# Probar otros endpoints públicos
print("\nProbando endpoint de salud:")
health_response = requests.get(f"{BASE_URL}/api/v1/health")
print(f"Código: {health_response.status_code}")
print(f"Respuesta: {health_response.text}")

# Probar si el servicio Nginx está funcionando
print("\nProbando acceso a través de Nginx (puerto 80):")
try:
    nginx_response = requests.get("http://108.129.139.119/", timeout=5)
    print(f"Código: {nginx_response.status_code}")
    print(f"Respuesta: {nginx_response.text[:100]}...")
except Exception as e:
    print(f"Error accediendo a Nginx: {str(e)}")

# Probar redirección API a través de Nginx
print("\nProbando API a través de Nginx:")
try:
    api_nginx = requests.get("http://108.129.139.119/api/v1/health", timeout=5)
    print(f"Código: {api_nginx.status_code}")
    print(f"Respuesta: {api_nginx.text[:100]}...")
except Exception as e:
    print(f"Error accediendo a API vía Nginx: {str(e)}")
