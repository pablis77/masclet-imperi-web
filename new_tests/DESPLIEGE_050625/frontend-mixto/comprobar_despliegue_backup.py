import requests
import json
import re
from datetime import datetime
import sys
import os
import urllib.parse
from colorama import Fore, Style, init
from requests.exceptions import ConnectionError, Timeout, TooManyRedirects

# Inicializar colorama
init()

# Configuraciones para el servidor
TARGET_HOST = "3.253.32.134"  # IP o dominio principal del servidor
BASE_URL = f"http://{TARGET_HOST}"
API_URL = f"{BASE_URL}/api/v1"  # Ruta API base estándar

# Credenciales de administrador
USERNAME = "admin"
PASSWORD = "admin123"

# Configuración de la sesión para mantener cookies
session = requests.Session()
token = None
auth_success = False

# Configuraciones para diagnóstico
DIAGNOSTICO_COMPLETO = False  # Cambiar a True para diagnóstico exhaustivo

def print_header(text):
    print(f"\n{Fore.BLUE}{'=' * 60}")
    print(f"{Fore.BLUE}{text}")
    print(f"{Fore.BLUE}{'=' * 60}{Style.RESET_ALL}")

def print_success(text):
    print(f"{Fore.GREEN}✓ {text}{Style.RESET_ALL}")

def print_error(text):
    print(f"{Fore.RED}✗ {text}{Style.RESET_ALL}")

def print_warning(text):
    print(f"{Fore.YELLOW}⚠ {text}{Style.RESET_ALL}")

def print_info(text):
    print(f"{Fore.CYAN}ℹ {text}{Style.RESET_ALL}")

def print_response(response):
    status = response.status_code
    
    if status == 200:
        color = Fore.GREEN
    elif status >= 400 and status < 500:
        color = Fore.YELLOW
    else:
        color = Fore.RED
        
    print(f"{color}Status: {status}{Style.RESET_ALL}")
    
    try:
        data = json.dumps(response.json(), indent=2, ensure_ascii=False)
        print(f"Response: {data}")
    except:
        print("Response: No es un JSON válido")
        print(response.text[:200] + "..." if len(response.text) > 200 else response.text)
        
# Función de login optimizada enfocada solo en la ruta principal de autenticación
def login():
    print_header("1. Autenticación")
    print_info("Intentando inicio de sesión...")
    
    global token, session, auth_success
    auth_success = False
    
    # Método 1: OAuth2 con formulario (estándar de la aplicación)
    login_url = f"{API_URL}/auth/login"
    login_data = {
        "username": USERNAME, 
        "password": PASSWORD
    }
    
    try:
        print_info(f"Probando login OAuth2: {login_url}")
        response = session.post(
            login_url, 
            data=login_data, 
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            try:
                json_data = response.json()
                print_success("¡Login exitoso con OAuth2!")
                token = json_data.get("access_token")
                if token:
                    session.headers.update({"Authorization": f"Bearer {token}"})
                    print_success(f"Token obtenido y guardado en sesión")
                    auth_success = True
                    return True
                else:
                    print_warning("Token no encontrado en la respuesta JSON")
            except ValueError as json_error:
                print_warning(f"La respuesta no es JSON válido: {json_error}")
        else:
            print_warning(f"Fallo en login OAuth2. Código: {response.status_code}")
    except Exception as e:
        print_error(f"Error al intentar login OAuth2: {e}")
    
    # Método 2: API con formato JSON (alternativo)
    try:
        print_info(f"Probando login con JSON: {login_url}")
        response = session.post(login_url, json=login_data)
        
        if response.status_code == 200:
            try:
                json_data = response.json()
                print_success("¡Login exitoso con JSON!")
                token = json_data.get("access_token")
                if token:
                    session.headers.update({"Authorization": f"Bearer {token}"})
                    print_success(f"Token obtenido y guardado en sesión")
                    auth_success = True
                    return True
                else:
                    print_warning("Token no encontrado en la respuesta JSON")
            except ValueError:
                print_warning("La respuesta no es JSON válido")
        else:
            print_warning(f"Fallo en login JSON. Código: {response.status_code}")
    except Exception as e:
        print_error(f"Error al intentar login JSON: {e}")
    
    # Si ambos métodos fallan, probar URL alternativa
    alternative_url = f"{BASE_URL}/auth/login"
    try:
        print_info(f"Probando ruta alternativa: {alternative_url}")
        response = session.post(alternative_url, json=login_data)
        
        if response.status_code == 200:
            print_success(f"¡Login exitoso con ruta alternativa!")
            try:
                token = response.json().get("access_token")
                session.headers.update({"Authorization": f"Bearer {token}"})
                auth_success = True
                return True
            except Exception:
                print_warning("Error al procesar la respuesta")
    except Exception as e:
        print_error(f"Error al intentar ruta alternativa: {e}")
    
    # Si todo falla
    print_warning("No se ha podido autenticar, continuaremos el diagnóstico sin token")
    print_info("Esto permitirá diagnósticar problemas de rutas y disponibilidad, pero muchos endpoints fallarán por falta de autorización")
    return False

# Verificar archivos estáticos clave
def check_static_files():
    print_header("2. Verificación de archivos estáticos")
    
    # Lista de archivos estáticos clave para verificar
    static_files = [
        "/index.html",
        "/favicon.ico",
        "/assets/index.js", 
        "/assets/main.css",
    ]
    
    all_ok = True
    
    for file_path in static_files:
        print_info(f"Verificando archivo estático: {file_path}")
        try:
            response = requests.get(f"{BASE_URL}{file_path}", timeout=5)
            if response.status_code == 200:
                print_success(f"Archivo estático {file_path} disponible")
                # Verificar que el contenido parece válido
                if file_path.endswith('.html') and '<html' not in response.text.lower():
                    print_warning(f"El archivo {file_path} parece incompleto o inválido")
                elif file_path.endswith('.js') and len(response.text) < 100:
                    print_warning(f"El archivo JavaScript {file_path} parece demasiado pequeño")
                elif file_path.endswith('.css') and len(response.text) < 50:
                    print_warning(f"El archivo CSS {file_path} parece demasiado pequeño")
            else:
                print_error(f"Error al acceder a {file_path}: {response.status_code}")
                all_ok = False
        except Exception as e:
            print_error(f"Error al verificar {file_path}: {e}")
            all_ok = False
            
    # También intentar ruta de documentación API (para detectar si el backend está accesible)
    try:
        print_info("Verificando documentación API (Swagger/ReDoc)")
        swagger_url = f"{API_URL}/docs"
        redoc_url = f"{API_URL}/redoc"
        swagger_response = session.get(swagger_url, timeout=5)
        redoc_response = session.get(redoc_url, timeout=5)
        
        if swagger_response.status_code == 200 and ('swagger' in swagger_response.text.lower() or 'openapi' in swagger_response.text.lower()):
            print_success(f"Documentación Swagger disponible: {swagger_url}")
        elif redoc_response.status_code == 200 and ('redoc' in redoc_response.text.lower() or 'swagger' in redoc_response.text.lower()):
            print_success(f"Documentación ReDoc disponible: {redoc_url}")
        else:
            print_warning("Documentación API no encontrada")
    except Exception as e:
        print_warning(f"No se pudo acceder a la documentación API: {e}")
    
    return all_ok

# Verificar páginas específicas del frontend
def check_specific_pages():
    print_header("4. Verificando páginas específicas del frontend")
    
    # Lista de páginas clave para verificar (optimizada)
    pages = [
        # Páginas principales
        {"url": "/", "name": "Página principal", "critical": True},
        {"url": "/dashboard", "name": "Dashboard", "critical": True},
        
        # Páginas de gestión (solo las principales)
        {"url": "/animals", "name": "Animales", "critical": True},
        {"url": "/partos", "name": "Gestión de partos", "critical": False},
        
        # Herramientas principales
        {"url": "/imports", "name": "Importaciones", "critical": False}
    ]
    
    all_ok = True
    results = {}
    
    for page in pages:
        print_info(f"Verificando página {page['name']}: {page['url']}")
        try:
            response = requests.get(f"{BASE_URL}{page['url']}", timeout=10)
            
            # Para páginas frontend, el código 200 es lo esperado
            if response.status_code == 200:
                # Verificar que es HTML válido
                if '<html' in response.text.lower():
                    print_success(f"Página {page['name']} disponible")
                    
                    # Verificar elementos clave en la página
                    if '<title' in response.text.lower():
                        title_match = re.search(r'<title[^>]*>([^<]+)', response.text, re.IGNORECASE)
                        if title_match:
                            print_info(f"Título: {title_match.group(1).strip()}")
                    
                    # Verificar presencia de React
                    if 'react' in response.text.lower() or 'root' in response.text.lower():
                        print_info("La página parece utilizar React")
                    
                    results[page['name']] = "OK"
                else:
                    print_warning(f"La página {page['name']} no parece ser HTML válido")
                    if page['critical']:
                        all_ok = False
                    results[page['name']] = "WARN: No es HTML válido"
            else:
                print_error(f"Error en página {page['name']}: {response.status_code}")
                if page['critical']:
                    all_ok = False
                results[page['name']] = f"ERROR: {response.status_code}"
        except Exception as e:
            print_error(f"Error al acceder a la página {page['name']}: {e}")
            if page['critical']:
                all_ok = False
            results[page['name']] = f"ERROR: {str(e)}"
    
    # Resumen
    print_header("Resumen de páginas verificadas")
    for name, status in results.items():
        if "ERROR" in status:
            print_error(f"{name}: {status}")
        elif "WARN" in status:
            print_warning(f"{name}: {status}")
        else:
            print_success(f"{name}: {status}")
    
    return all_ok

# Verificar comunicación entre contenedores Docker
def check_docker_communication():
    print_header("5. Verificando comunicación entre contenedores Docker")
    
    all_ok = True
    
    # 1. Verificar endpoint especial de diagnóstico Docker
    print_info("Comprobando endpoint de diagnóstico Docker...")
    try:
        response = session.get(f"{BASE_URL}/docker-api-health", timeout=5)
        if response.status_code == 200:
            print_success("Endpoint de diagnóstico Docker disponible")
            try:
                data = response.json()
                if data.get('status') == 'active':
                    print_success("Estado del contenedor Docker: ACTIVO")
                else:
                    print_warning(f"Estado del contenedor Docker: {data.get('status', 'desconocido')}")
                
                # Buscar información sobre la red Docker
                if 'network' in data:
                    print_info(f"Red Docker: {data['network']}")
            except Exception:
                print_warning("No se pudo interpretar la respuesta del endpoint de diagnóstico")
                print_info(f"Contenido: {response.text[:200]}")
        else:
            print_warning(f"Endpoint de diagnóstico Docker no disponible: {response.status_code}")
            all_ok = False
    except Exception as e:
        print_error(f"Error al comprobar endpoint de diagnóstico Docker: {e}")
        all_ok = False
    
    # 2. Probar conectividad al backend
    print_info("Comprobando conectividad al backend...")
    try:
        # Usar parámetro especial para forzar prueba de conectividad al backend
        response = session.get(f"{BASE_URL}/docker-api-health?test=backend", timeout=10)
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get('backendConnected') == True:
                    print_success("Conexión al backend: OK")
                    if 'backendResponseTime' in data:
                        print_info(f"Tiempo de respuesta del backend: {data['backendResponseTime']}ms")
                else:
                    print_error("No se pudo conectar al backend")
                    all_ok = False
                    if 'backendError' in data:
                        print_error(f"Error reportado: {data['backendError']}")
            except Exception:
                print_warning("No se pudo interpretar la respuesta de la prueba de conectividad")
        else:
            print_error(f"Error en prueba de conectividad: {response.status_code}")
            all_ok = False
    except Exception as e:
        print_error(f"Error al comprobar conectividad al backend: {e}")
        all_ok = False
    
    # 3. Verificar resolución DNS directa (si el endpoint lo soporta)
    print_info("Probando resolución DNS entre contenedores...")
    try:
        response = session.get(f"{BASE_URL}/docker-api-health?test=dns", timeout=5)
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get('dnsResults'):
                    dns_results = data['dnsResults']
                    for host, result in dns_results.items():
                        if result.get('success'):
                            print_success(f"DNS {host}: OK -> {result.get('ip', 'IP no reportada')}")
                        else:
                            print_error(f"DNS {host}: ERROR - {result.get('error', 'Error desconocido')}")
                            if 'backend' in host.lower() or 'db' in host.lower(): # Solo marcar error en hosts críticos
                                all_ok = False
                else:
                    print_warning("El endpoint no devuelve resultados de prueba DNS")
            except Exception as e:
                print_warning(f"No se pudo interpretar la respuesta de la prueba DNS: {e}")
        else:
            print_warning(f"Endpoint de prueba DNS no disponible: {response.status_code}")
    except Exception as e:
        print_warning(f"Error al probar resolución DNS: {e}")
    
    return all_ok

# Función principal de diagnóstico
def run_diagnostics():
    print_header("DIAGNÓSTICO DE DESPLIEGUE MASCLET IMPERI")
    print_info(f"Servidor objetivo: {TARGET_HOST}")
    print_info(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_info("")
    
    # Resultados por sección
    results = {}
    
    # 1. Autenticación
    auth_result = login()
    results["Autenticación"] = auth_result
    
    # 2. Archivos estáticos
    static_result = check_static_files()
    results["Archivos estáticos"] = static_result
    
    # 3. API Endpoints
    api_result = check_api_endpoints()
    results["API Endpoints"] = api_result
    
    # 4. Páginas específicas
    pages_result = check_specific_pages()
    results["Páginas frontend"] = pages_result
    
    # 5. Comunicación Docker
    docker_result = check_docker_communication()
    results["Comunicación Docker"] = docker_result
    
    # Resumen final
    print_header("RESUMEN DE DIAGNÓSTICO")
    
    all_ok = True
    for section, result in results.items():
        if result:
            print_success(f"{section}: OK")
        else:
            print_error(f"{section}: ERROR")
            all_ok = False
    
    print("\n")
    if all_ok:
        print_success("==== DIAGNÓSTICO COMPLETADO SIN ERRORES =====")
        print_success("El despliegue parece estar funcionando correctamente.")
    else:
        print_error("==== DIAGNÓSTICO COMPLETADO CON ERRORES =====")
        print_warning("Se detectaron problemas en el despliegue que requieren atención.")
        print_info("Revisa los mensajes anteriores para más detalles sobre los problemas encontrados.")
    
    return all_ok

# Verificar endpoints API clave
def check_api_endpoints():
    print_header("3. Verificación de API endpoints")
    
    # Lista de endpoints clave para verificar (optimizada)
    endpoints = [
        {"path": "/api/v1/health", "method": "GET", "desc": "Estado de salud", "critical": True},
        {"path": "/api/v1/animales", "method": "GET", "desc": "Lista de Animales", "critical": True},
        {"path": "/api/v1/dashboard/summary", "method": "GET", "desc": "Resumen del Dashboard", "critical": True},
        {"path": "/api/v1/partos", "method": "GET", "desc": "Lista de Partos", "critical": False},
        {"path": "/api/v1/users/me", "method": "GET", "desc": "Información del usuario", "critical": False},
        {"path": "/api/v1/importaciones", "method": "GET", "desc": "Historial de Importaciones", "critical": False},
    ]
    
    # Comprobar endpoints Docker específicos
    docker_endpoints = [
        {"path": "/docker-api-health", "method": "GET", "desc": "Estado de salud Docker", "critical": True},
        {"path": "/api/docker-status", "method": "GET", "desc": "Estado de Docker", "critical": False},
    ]
    
    # Combinamos todos los endpoints a probar
    all_endpoints = endpoints + docker_endpoints
    all_ok = True
    
    for endpoint in all_endpoints:
        print_info(f"Verificando endpoint {endpoint['desc']}: {endpoint['path']}")
        try:
            response = session.request(endpoint['method'], BASE_URL + endpoint['path'], timeout=8)
            
            if response.status_code == 200:
                print_success(f"Endpoint {endpoint['desc']} disponible")
                try:
                    # Intentar procesar como JSON
                    json_data = response.json()
                    # Mostrar una vista previa si hay datos
                    if isinstance(json_data, dict) and len(json_data) > 0:
                        keys = list(json_data.keys())
                        print_info(f"Datos recibidos. Campos: {', '.join(keys[:5])}{'...' if len(keys) > 5 else ''}")
                    elif isinstance(json_data, list) and len(json_data) > 0:
                        print_info(f"Array recibido con {len(json_data)} elementos")
                except Exception:
                    # Si no es JSON, mostrar los primeros caracteres
                    preview = response.text[:100] + '...' if len(response.text) > 100 else response.text
                    print_info(f"Respuesta no-JSON: {preview}")
            elif response.status_code in [401, 403]:
                print_warning(f"Endpoint {endpoint['desc']} requiere autenticación: {response.status_code}")
                if not auth_success:
                    print_info("Este error es esperado ya que no estamos autenticados")
                else:
                    print_error("¡Error! Deberíamos estar autenticados pero el endpoint rechaza nuestra petición")
                    
                if endpoint['critical']:
                    all_ok = False
            else:
                print_error(f"Error en endpoint {endpoint['desc']}: {response.status_code}")
                if endpoint['critical']:
                    all_ok = False
                print_info(f"Detalles: {response.text[:100]}")
        except Exception as e:
            print_error(f"Error al acceder al endpoint {endpoint['desc']}: {e}")
            if endpoint['critical']:
                all_ok = False
    
    # Verificar comunicación entre contenedores Docker
    print_info("Comprobando comunicación entre contenedores Docker...")
    try:
        docker_health_url = f"{BASE_URL}/docker-api-health?test=backend"
        response = session.get(docker_health_url, timeout=10)
        if response.status_code == 200:
            try:
                result = response.json()
                if result.get('backendConnected') == True:
                    print_success("✅ Comunicación entre frontend y backend OK")
                else:
                    print_error("❌ Problema de comunicación entre frontend y backend")
                    all_ok = False
            except:
                print_warning("No se pudo interpretar la respuesta de la prueba de conectividad Docker")
        else:
            print_warning(f"Endpoint de diagnóstico Docker no disponible: {response.status_code}")
    except Exception as e:
        print_warning(f"Error al verificar comunicación entre contenedores: {e}")
    
    return all_ok

# Verificar páginas específicas del frontend
def check_specific_pages():
    print_header("4. Verificando páginas específicas del frontend")
    
    # Lista de páginas clave para verificar (optimizada)
    pages = [
        # Páginas principales
        {"url": "/", "name": "Página principal", "critical": True},
        {"url": "/dashboard", "name": "Dashboard", "critical": True},
        
        # Páginas de gestión (solo las principales)
        {"url": "/animals", "name": "Animales", "critical": True},
        {"url": "/partos", "name": "Gestión de partos", "critical": False},
        
        # Herramientas principales
        {"url": "/imports", "name": "Importaciones", "critical": False}
    ]
    
    all_ok = True
    results = {}
    
    for page in pages:
        print_info(f"Verificando página {page['name']}: {page['url']}")
        try:
            response = requests.get(f"{BASE_URL}{page['url']}", timeout=10)
            
            # Para páginas frontend, el código 200 es lo esperado
            if response.status_code == 200:
                # Verificar que es HTML válido
                if '<html' in response.text.lower():
                    print_success(f"Página {page['name']} disponible")
                    
                    # Verificar elementos clave en la página
                    if '<title' in response.text.lower():
                        title_match = re.search(r'<title[^>]*>([^<]+)', response.text, re.IGNORECASE)
                        if title_match:
                            print_info(f"Título: {title_match.group(1).strip()}")
                    
                    # Verificar presencia de React
                    if 'react' in response.text.lower() or 'root' in response.text.lower():
                        print_info("La página parece utilizar React")
                    
                    results[page['name']] = "OK"
                else:
                    print_warning(f"La página {page['name']} no parece ser HTML válido")
                    if page['critical']:
                        all_ok = False
                    results[page['name']] = "WARN: No es HTML válido"
            else:
                print_error(f"Error en página {page['name']}: {response.status_code}")
                if page['critical']:
                    all_ok = False
                results[page['name']] = f"ERROR: {response.status_code}"
        except Exception as e:
            print_error(f"Error al acceder a la página {page['name']}: {e}")
            if page['critical']:
                all_ok = False
            results[page['name']] = f"ERROR: {str(e)}"
    
    # Resumen
    print_header("Resumen de páginas verificadas")
    for name, status in results.items():
        if "ERROR" in status:
            print_error(f"{name}: {status}")
        elif "WARN" in status:
            print_warning(f"{name}: {status}")
        else:
            print_success(f"{name}: {status}")
    
    return all_ok

# Verificar comunicación entre contenedores Docker
def check_docker_communication():
    print_header("5. Verificando comunicación entre contenedores Docker")
    
    all_ok = True
    
    # 1. Verificar endpoint especial de diagnóstico Docker
    print_info("Comprobando endpoint de diagnóstico Docker...")
    try:
        response = session.get(f"{BASE_URL}/docker-api-health", timeout=5)
        if response.status_code == 200:
            print_success("Endpoint de diagnóstico Docker disponible")
            try:
                data = response.json()
                if data.get('status') == 'active':
                    print_success("Estado del contenedor Docker: ACTIVO")
                else:
                    print_warning(f"Estado del contenedor Docker: {data.get('status', 'desconocido')}")
                
                # Buscar información sobre la red Docker
                if 'network' in data:
                    print_info(f"Red Docker: {data['network']}")
            except Exception:
                print_warning("No se pudo interpretar la respuesta del endpoint de diagnóstico")
                print_info(f"Contenido: {response.text[:200]}")
        else:
            print_warning(f"Endpoint de diagnóstico Docker no disponible: {response.status_code}")
            all_ok = False
    except Exception as e:
        print_error(f"Error al comprobar endpoint de diagnóstico Docker: {e}")
        all_ok = False
    
    # 2. Probar conectividad al backend
    print_info("Comprobando conectividad al backend...")
    try:
        # Usar parámetro especial para forzar prueba de conectividad al backend
        response = session.get(f"{BASE_URL}/docker-api-health?test=backend", timeout=10)
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get('backendConnected') == True:
                    print_success("Conexión al backend: OK")
                    if 'backendResponseTime' in data:
                        print_info(f"Tiempo de respuesta del backend: {data['backendResponseTime']}ms")
                else:
                    print_error("No se pudo conectar al backend")
                    all_ok = False
                    if 'backendError' in data:
                        print_error(f"Error reportado: {data['backendError']}")
            except Exception:
                print_warning("No se pudo interpretar la respuesta de la prueba de conectividad")
        else:
            print_error(f"Error en prueba de conectividad: {response.status_code}")
            all_ok = False
    except Exception as e:
        print_error(f"Error al comprobar conectividad al backend: {e}")
        all_ok = False
    
    # 3. Verificar resolución DNS directa (si el endpoint lo soporta)
    print_info("Probando resolución DNS entre contenedores...")
    try:
        response = session.get(f"{BASE_URL}/docker-api-health?test=dns", timeout=5)
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get('dnsResults'):
                    dns_results = data['dnsResults']
                    for host, result in dns_results.items():
                        if result.get('success'):
                            print_success(f"DNS {host}: OK -> {result.get('ip', 'IP no reportada')}")
                        else:
                            print_error(f"DNS {host}: ERROR - {result.get('error', 'Error desconocido')}")
                            if 'backend' in host.lower() or 'db' in host.lower(): # Solo marcar error en hosts críticos
                                all_ok = False
                else:
                    print_warning("El endpoint no devuelve resultados de prueba DNS")
            except Exception as e:
                print_warning(f"No se pudo interpretar la respuesta de la prueba DNS: {e}")
        else:
            print_warning(f"Endpoint de prueba DNS no disponible: {response.status_code}")
    except Exception as e:
        print_warning(f"Error al probar resolución DNS: {e}")
    
    return all_ok

# Función principal de diagnóstico
def run_diagnostics():
    print_header("DIAGNÓSTICO DE DESPLIEGUE MASCLET IMPERI")
    print_info(f"Servidor objetivo: {TARGET_HOST}")
    print_info(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_info("")
    
    # Resultados por sección
    results = {}
    
    # 1. Autenticación
    auth_result = login()
    results["Autenticación"] = auth_result
    
    # 2. Archivos estáticos
    static_result = check_static_files()
    results["Archivos estáticos"] = static_result
    
    # 3. API Endpoints
    api_result = check_api_endpoints()
    results["API Endpoints"] = api_result
    
    # 4. Páginas específicas
    pages_result = check_specific_pages()
    results["Páginas frontend"] = pages_result
    
    # 5. Comunicación Docker
    docker_result = check_docker_communication()
    results["Comunicación Docker"] = docker_result
    
    # Resumen final
    print_header("RESUMEN DE DIAGNÓSTICO")
    
    all_ok = True
    for section, result in results.items():
        if result:
            print_success(f"{section}: OK")
        else:
            print_error(f"{section}: ERROR")
            all_ok = False
    
    print("\n")
    if all_ok:
        print_success("==== DIAGNÓSTICO COMPLETADO SIN ERRORES =====")
        print_success("El despliegue parece estar funcionando correctamente.")
    else:
        print_error("==== DIAGNÓSTICO COMPLETADO CON ERRORES =====")
        print_warning("Se detectaron problemas en el despliegue que requieren atención.")
        print_info("Revisa los mensajes anteriores para más detalles sobre los problemas encontrados.")
    
    return all_ok
