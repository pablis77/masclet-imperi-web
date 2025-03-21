import requests
import json
from datetime import datetime, timedelta

# Configuración
BASE_URL = "http://localhost:8000/api/v1"
AUTH_URL = f"{BASE_URL}/auth/login"
DASHBOARD_URL = f"{BASE_URL}/dashboard"

# Credenciales de administrador
USERNAME = "admin"
PASSWORD = "admin123"

def obtener_token():
    """Obtiene el token de autenticación"""
    print("Obteniendo token de autenticación...")
    response = requests.post(
        AUTH_URL,
        data={"username": USERNAME, "password": PASSWORD},
    )
    
    if response.status_code == 200:
        token_data = response.json()
        return token_data.get("access_token")
    else:
        print(f"Error al obtener token: {response.status_code}")
        print(response.text)
        return None

def probar_endpoint_stats(token):
    """Prueba el endpoint de estadísticas generales"""
    print("\n=== ESTADÍSTICAS GENERALES ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Probar sin parámetros
    response = requests.get(
        f"{DASHBOARD_URL}/stats",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("Estadísticas obtenidas correctamente")
        print(f"Total de animales: {data.get('total_animales', 'N/A')}")
        print(f"Total de machos: {data.get('total_machos', 'N/A')}")
        print(f"Total de hembras: {data.get('total_hembras', 'N/A')}")
        print(f"Total de partos: {data.get('total_partos', 'N/A')}")
    else:
        print("Error al obtener estadísticas generales")
        print(response.text)
    
    return response.status_code == 200

def probar_endpoint_explotacio(token, explotacio_id=1):
    """Prueba el endpoint de estadísticas por explotación"""
    print(f"\n=== ESTADÍSTICAS DE EXPLOTACIÓN {explotacio_id} ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{DASHBOARD_URL}/explotacions/{explotacio_id}",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("Estadísticas de explotación obtenidas correctamente")
        print(f"Nombre de explotación: {data.get('explotacio_name', 'N/A')}")
        print(f"Total de animales: {data.get('total_animales', 'N/A')}")
        print(f"Total de partos: {data.get('total_partos', 'N/A')}")
    else:
        print("Error al obtener estadísticas de explotación")
        print(response.text)
    
    return response.status_code == 200

def probar_endpoint_partos(token):
    """Prueba el endpoint de estadísticas de partos"""
    print("\n=== ESTADÍSTICAS DE PARTOS ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{DASHBOARD_URL}/partos",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("Estadísticas de partos obtenidas correctamente")
        print(f"Total de partos: {data.get('total_partos', 'N/A')}")
        print(f"Partos último mes: {data.get('partos_ultimo_mes', 'N/A')}")
        print(f"Tasa de supervivencia: {data.get('tasa_supervivencia', 'N/A')}")
    else:
        print("Error al obtener estadísticas de partos")
        print(response.text)
    
    return response.status_code == 200

def probar_endpoint_combined(token):
    """Prueba el endpoint de estadísticas combinadas"""
    print("\n=== ESTADÍSTICAS COMBINADAS ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{DASHBOARD_URL}/combined",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("Estadísticas combinadas obtenidas correctamente")
        print(f"Total de animales: {data.get('animales', {}).get('total_animales', 'N/A')}")
        print(f"Total de partos: {data.get('partos', {}).get('total_partos', 'N/A')}")
    else:
        print("Error al obtener estadísticas combinadas")
        print(response.text)
    
    return response.status_code == 200

def probar_endpoint_resumen(token):
    """Prueba el endpoint de resumen (legado)"""
    print("\n=== RESUMEN (ENDPOINT LEGADO) ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{DASHBOARD_URL}/resumen",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("Resumen obtenido correctamente")
        print(json.dumps(data, indent=2))
    else:
        print("Error al obtener resumen")
        print(response.text)
    
    return response.status_code == 200

def probar_endpoint_con_fechas(token):
    """Prueba el endpoint de estadísticas con filtro de fechas"""
    print("\n=== ESTADÍSTICAS CON FILTRO DE FECHAS ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Fechas para el último mes
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    
    response = requests.get(
        f"{DASHBOARD_URL}/stats?start_date={start_date}&end_date={end_date}",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Filtro: {start_date} a {end_date}")
    
    if response.status_code == 200:
        data = response.json()
        print("Estadísticas filtradas obtenidas correctamente")
        print(f"Total de partos en periodo: {data.get('total_partos', 'N/A')}")
    else:
        print("Error al obtener estadísticas filtradas")
        print(response.text)
    
    return response.status_code == 200

def main():
    print("Iniciando pruebas de endpoints de dashboard...")
    
    # Obtener token de autenticación
    token = obtener_token()
    if not token:
        print("No se pudo obtener el token. Abortando pruebas.")
        return
    
    # Probar todos los endpoints
    resultados = {
        "stats": probar_endpoint_stats(token),
        "explotacio": probar_endpoint_explotacio(token),
        "partos": probar_endpoint_partos(token),
        "combined": probar_endpoint_combined(token),
        "resumen": probar_endpoint_resumen(token),
        "con_fechas": probar_endpoint_con_fechas(token)
    }
    
    # Resumen de resultados
    print("\n=== RESUMEN DE PRUEBAS ===")
    for endpoint, resultado in resultados.items():
        estado = "✅ Funcional" if resultado else "❌ No funcional"
        print(f"Endpoint {endpoint}: {estado}")
    
    # Verificar si todos los endpoints funcionan
    if all(resultados.values()):
        print("\nTodos los endpoints de dashboard funcionan correctamente.")
    else:
        print("\nHay endpoints de dashboard que no funcionan correctamente.")
    
    print("Pruebas completadas.")

if __name__ == "__main__":
    main()
