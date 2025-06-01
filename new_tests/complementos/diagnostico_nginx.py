import sys
import requests
import re
import json
from colorama import Fore, Style, init

# Inicializar colorama para salida en color
init()

def print_color(text, color=Fore.WHITE):
    """Imprime texto con color"""
    print(f"{color}{text}{Style.RESET_ALL}")

def diagnosticar_nginx(host):
    """Realiza un diagnóstico básico de la configuración de Nginx en el servidor"""
    print_color("\n============================================================", Fore.CYAN)
    print_color("DIAGNÓSTICO DE CONFIGURACIÓN NGINX Y PROXY", Fore.CYAN)
    print_color("============================================================", Fore.CYAN)
    
    # Probar acceso a la raíz del sitio
    print_color(f"\nProbando acceso a la raíz: http://{host}/", Fore.CYAN)
    try:
        response = requests.get(f"http://{host}/", timeout=10)
        print_color(f"✓ Respuesta: {response.status_code}", Fore.GREEN if response.status_code == 200 else Fore.YELLOW)
    except Exception as e:
        print_color(f"✗ Error al acceder a la raíz: {str(e)}", Fore.RED)
    
    # Probar acceso al login (que debe funcionar siempre)
    print_color(f"\nProbando acceso a login: http://{host}/login", Fore.CYAN)
    try:
        response = requests.get(f"http://{host}/login", timeout=10)
        print_color(f"✓ Respuesta: {response.status_code}", Fore.GREEN if response.status_code == 200 else Fore.YELLOW)
    except Exception as e:
        print_color(f"✗ Error al acceder a login: {str(e)}", Fore.RED)
    
    # Probar TODAS las posibles rutas de la API para login
    print_color("\nProbando rutas de la API para login:", Fore.CYAN)
    
    # 1. Probar login con OAuth2 estándar en diferentes rutas
    login_data = {
        'username': 'admin', 
        'password': 'admin123',
        'grant_type': 'password'
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    
    api_routes = [
        '/api/auth/login',
        '/api/v1/auth/login',
        '/api/api/v1/auth/login',
        '/auth/login'
    ]
    
    working_routes = []
    
    for route in api_routes:
        url = f"http://{host}{route}"
        print_color(f"\nProbando login en: {url}", Fore.BLUE)
        try:
            response = requests.post(url, data=login_data, headers=headers, timeout=10)
            if response.status_code == 200 and 'access_token' in response.text:
                print_color(f"✓ ¡Login exitoso! Ruta: {route}", Fore.GREEN)
                token = response.json().get('access_token', '')[:30]
                print_color(f"  Token: {token}...", Fore.GREEN)
                working_routes.append(route)
            else:
                print_color(f"✗ Login fallido. Status: {response.status_code}", Fore.RED)
                print_color(f"  Respuesta: {response.text[:100]}...", Fore.YELLOW)
        except Exception as e:
            print_color(f"✗ Error: {str(e)}", Fore.RED)
    
    # Verificar rutas API para endpoints protegidos usando la primera ruta exitosa
    if working_routes:
        print_color("\nVerificando endpoints protegidos con token:", Fore.CYAN)
        
        # Obtener token para probar endpoints protegidos
        best_route = working_routes[0]
        url = f"http://{host}{best_route}"
        try:
            response = requests.post(url, data=login_data, headers=headers, timeout=10)
            if response.status_code == 200 and 'access_token' in response.text:
                token = response.json().get('access_token', '')
                auth_header = {'Authorization': f'Bearer {token}'}
                
                # Probar diferentes prefijos para endpoints protegidos
                api_prefixes = [
                    '/api',
                    '/api/v1',
                    '/api/api/v1'
                ]
                
                for prefix in api_prefixes:
                    endpoints = ['users', 'animals', 'explotaciones']
                    
                    for endpoint in endpoints:
                        url = f"http://{host}{prefix}/{endpoint}"
                        print_color(f"\nProbando endpoint protegido: {url}", Fore.BLUE)
                        try:
                            response = requests.get(url, headers=auth_header, timeout=10)
                            if response.status_code == 200:
                                print_color(f"✓ Acceso exitoso a {endpoint}", Fore.GREEN)
                                print_color(f"  Datos recibidos: {response.text[:50]}...", Fore.GREEN)
                            else:
                                print_color(f"✗ Acceso fallido. Status: {response.status_code}", Fore.RED)
                                print_color(f"  Respuesta: {response.text[:100]}...", Fore.YELLOW)
                        except Exception as e:
                            print_color(f"✗ Error: {str(e)}", Fore.RED)
        except Exception as e:
            print_color(f"✗ Error al obtener token: {str(e)}", Fore.RED)
    
    # Revisar qué servidor web está respondiendo
    print_color("\nRevisando servidor web:", Fore.CYAN)
    try:
        response = requests.get(f"http://{host}/", timeout=10)
        server = response.headers.get('Server', 'Desconocido')
        print_color(f"Servidor: {server}", Fore.GREEN)
        
        # Mostrar todos los headers para diagnóstico
        print_color("\nHeaders de respuesta:", Fore.CYAN)
        for header, value in response.headers.items():
            print_color(f"  {header}: {value}", Fore.WHITE)
    except Exception as e:
        print_color(f"✗ Error al obtener información del servidor: {str(e)}", Fore.RED)
    
    # Resumen de hallazgos
    print_color("\n============================================================", Fore.CYAN)
    print_color("RESUMEN DE DIAGNÓSTICO", Fore.CYAN)
    print_color("============================================================", Fore.CYAN)
    
    if working_routes:
        print_color(f"\n✓ Rutas de login funcionales: {', '.join(working_routes)}", Fore.GREEN)
        print_color("\nBasado en este diagnóstico, la configuración correcta para el frontend debería ser:", Fore.CYAN)
        base_url = working_routes[0].rsplit('/auth/login', 1)[0]
        print_color(f"  BASE_URL: '{base_url}'", Fore.GREEN)
    else:
        print_color("\n✗ No se encontró ninguna ruta de login funcional", Fore.RED)
        print_color("  Verifica la configuración de Nginx y los servicios backend", Fore.YELLOW)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        host = sys.argv[1]
    else:
        host = "108.129.139.119"
    
    diagnosticar_nginx(host)
