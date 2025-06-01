import requests
import sys
import json
from urllib.parse import urljoin

def color_print(message, color=None):
    """Imprime mensaje con color"""
    colors = {
        'red': '\033[91m',
        'green': '\033[92m',
        'yellow': '\033[93m',
        'blue': '\033[94m',
        'reset': '\033[0m'
    }
    
    if color in colors:
        print(f"{colors[color]}{message}{colors['reset']}")
    else:
        print(message)

def probar_login_directo(base_url, username="admin", password="admin123"):
    """Prueba de login directo con ruta específica"""
    
    color_print(f"PRUEBA DIRECTA DE LOGIN - Usuario: {username}", "blue")
    
    # URL que sabemos que funciona según diagnostico
    login_url = f"{base_url}/api/api/v1/auth/login"
    
    # Configuración correcta para OAuth2 Password Flow
    oauth_data = {
        "username": username,
        "password": password,
        "grant_type": "password"
    }
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        color_print(f"Intentando login en: {login_url}", "blue")
        response = requests.post(login_url, data=oauth_data, headers=headers)
        
        # Guardar respuesta completa para análisis
        with open("login_response.txt", "w") as f:
            f.write(f"Status: {response.status_code}\n")
            f.write(f"Headers: {dict(response.headers)}\n\n")
            f.write(f"Response: {response.text}")
        
        if response.status_code == 200:
            try:
                token_data = response.json()
                if "access_token" in token_data:
                    color_print(f"✓ ¡Login exitoso!", "green")
                    color_print(f"Token obtenido: {token_data['access_token'][:30]}...", "green")
                    
                    # Probar acceso a dashboard con token
                    session = requests.Session()
                    session.headers.update({
                        "Authorization": f"Bearer {token_data['access_token']}"
                    })
                    
                    # Simular almacenamiento en localStorage
                    local_storage = {
                        "token": token_data["access_token"],
                        "user": json.dumps({"username": username})
                    }
                    
                    color_print("\nSimulando localStorage en navegador:", "blue")
                    for key, value in local_storage.items():
                        print(f"  {key}: {value[:30]}..." if len(str(value)) > 30 else f"  {key}: {value}")
                    
                    # Probar acceso a dashboard con el token
                    dashboard_url = urljoin(base_url, "/dashboard")
                    color_print(f"\nProbando acceso a dashboard: {dashboard_url}", "blue")
                    
                    dashboard_response = session.get(dashboard_url)
                    with open("dashboard_response.txt", "w") as f:
                        f.write(f"Status: {dashboard_response.status_code}\n")
                        f.write(f"URL final: {dashboard_response.url}\n")
                        f.write(f"Headers: {dict(dashboard_response.headers)}\n\n")
                        f.write(dashboard_response.text[:1000] + "...")
                    
                    if dashboard_response.status_code == 200:
                        if "/login" in dashboard_response.url:
                            color_print("✗ Redirigido a login a pesar de tener token", "red")
                            color_print("  Problema: El token no se está aplicando o validando correctamente", "yellow")
                            return False
                        else:
                            color_print(f"✓ Acceso exitoso a dashboard", "green")
                            return True
                    else:
                        color_print(f"✗ Error al acceder a dashboard: Status {dashboard_response.status_code}", "red")
                        color_print(f"  Respuesta: {dashboard_response.text[:100]}...", "yellow")
                        return False
                else:
                    color_print(f"✗ Respuesta sin token: {response.text[:100]}...", "red")
                    return False
            except:
                color_print(f"✗ Respuesta no es JSON válido: {response.text[:100]}...", "red")
                return False
        else:
            color_print(f"✗ Error en login: Status {response.status_code}", "red")
            color_print(f"  Respuesta: {response.text[:100]}...", "yellow")
            return False
    except Exception as e:
        color_print(f"✗ Excepción: {str(e)}", "red")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "http://108.129.139.119"
    
    # Prueba con credenciales estándar
    probar_login_directo(base_url)
