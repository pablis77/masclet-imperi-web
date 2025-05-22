import os
import sys
import json
import requests
import datetime

# Añadir directorio raíz al path para importar módulos de la aplicación
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.core.config import get_settings

# Configurar URL base
settings = get_settings()
BASE_URL = "http://localhost:8000/api/v1"

def obtener_token():
    """Obtiene un token JWT mediante inicio de sesión"""
    url = f"{BASE_URL}/auth/login"
    print(f"🔑 Obteniendo token JWT desde {url}...")
    
    # CREDENCIALES CORRECTAS USANDO EL MÉTODO QUE FUNCIONA
    credenciales = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(
            url, 
            data=credenciales,  # data en lugar de json
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get("access_token")
            if token:
                print("✅ Token JWT obtenido correctamente")
                return token
            print("⚠️ Respuesta 200 pero sin token válido")
        else:
            print(f"⚠️ Error de autenticación: {response.status_code}")
            print(f"Contenido de la respuesta: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error al conectar con el endpoint de autenticación: {e}")
    
    print("❌ No se pudo obtener token JWT. Abortando.")
    return None

def probar_endpoint_animales_detallado():
    """Prueba el endpoint de animales detallado y muestra los resultados"""
    token = obtener_token()
    if not token:
        print("No se pudo obtener token. Abortando.")
        return
    
    # Cabeceras con token JWT
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Probar endpoint de animales detallado
    url = f"{BASE_URL}/dashboard-detallado/animales-detallado"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        datos = response.json()
        
        # Mostrar resultados de forma legible
        print("\n📊 ESTADÍSTICAS DETALLADAS DE ANIMALES")
        print("=" * 50)
        print(f"Total animales: {datos['total']}")
        
        # Información general
        print("\n📌 ESTADÍSTICAS GENERALES")
        print(f"Machos: {datos['general']['machos']}")
        print(f"Hembras: {datos['general']['hembras']}")
        print(f"Activos: {datos['general']['activos']}")
        print(f"Fallecidos: {datos['general']['fallecidos']}")
        
        # Información por género y estado
        print("\n📌 ESTADÍSTICAS POR GÉNERO Y ESTADO")
        print(f"Machos totales: {datos['por_genero']['machos']['total']}")
        print(f"  ✓ Activos: {datos['por_genero']['machos']['activos']}")
        print(f"  ✗ Fallecidos: {datos['por_genero']['machos']['fallecidos']}")
        print(f"Hembras totales: {datos['por_genero']['hembras']['total']}")
        print(f"  ✓ Activas: {datos['por_genero']['hembras']['activas']}")
        print(f"  ✗ Fallecidas: {datos['por_genero']['hembras']['fallecidas']}")
        
        # Información de amamantamiento
        print("\n📌 ESTADÍSTICAS DE AMAMANTAMIENTO (HEMBRAS)")
        for estado, cantidad in datos['por_alletar'].items():
            print(f"Estado {estado}: {cantidad} vacas")
            
        # Guardar datos en un archivo JSON para referencia
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        with open(f"new_tests/complementos/datos_detallados_{timestamp}.json", "w") as f:
            json.dump(datos, f, indent=2)
            print(f"\nDatos guardados en: new_tests/complementos/datos_detallados_{timestamp}.json")
            
    except requests.exceptions.RequestException as e:
        print(f"Error al consultar endpoint: {e}")

if __name__ == "__main__":
    probar_endpoint_animales_detallado()
