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

# Configuraciones posibles para probar
TARGET_HOST = "108.129.139.119" # IP o dominio del servidor
ALT_HOST = "mascletimperi.com" # Dominio alternativo (si existe)

# URL base del servidor desplegado (se autodetectará la mejor configuración)
BASE_URL = f"http://{TARGET_HOST}"
API_URL = f"{BASE_URL}/api/v1" # Valor inicial, se actualizará automáticamente

# Posibles rutas base de API para probar
API_BASE_PATHS = [
    "/api/v1",
    "/api",
    "/v1",
    "/", 
]

# Posibles rutas de autenticación para probar
AUTH_PATHS = [
    "/api/v1/auth/login",
    "/api/auth/login",
    "/auth/login",
    "/api/v1/login",
    "/api/login",
    "/login"
]

# Banderas para problemas conocidos
DUPLICATED_API_PREFIX = False

# Credenciales de administrador
USERNAME = "admin"
PASSWORD = "admin123"

# Configuración de la sesión para mantener cookies
session = requests.Session()

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

def login():
    print_header("1. Autenticación")
    print_info("Intentando inicio de sesión...")
    
    global token, session, auth_success
    
    auth_success = False
    session = requests.Session()
    last_response = None
    
    try:
        # Preparar datos de login en diferentes formatos
        login_data_dict = {
            "username": USERNAME, 
            "password": PASSWORD
        }
        
        login_data_form = {
            "username": USERNAME,
            "password": PASSWORD,
            "grant_type": "password"  # OAuth2 puede requerir este campo
        }
        
        # Headers para diferentes formatos
        headers_json = {"Content-Type": "application/json"}
        headers_form = {"Content-Type": "application/x-www-form-urlencoded"}
        
        # Detectar posible problema de duplicación de rutas API
        if "/api/v1" in API_URL and API_URL.endswith("/api/v1"):
            duplicate_check = API_URL + "/api/v1/auth/login"
            print_warning(f"⚠ Posible problema de duplicación de rutas: {duplicate_check}")
            print_warning("Esto causaría una ruta incorrecta como /api/v1/api/v1/auth/login")
            global DUPLICATED_API_PREFIX
            DUPLICATED_API_PREFIX = True
            
        # Lista de combinaciones URL/método para probar
        auth_attempts = [
            # Rutas estándar esperadas
            {"url": f"{API_URL}/auth/login", "data": login_data_form, "headers": headers_form, "desc": "OAuth2 estándar"},
            # Si hay duplicación, prueba con URL ajustada
            {"url": f"{BASE_URL}/api/v1/auth/login", "data": login_data_form, "headers": headers_form, "desc": "Ruta absoluta completa"},
            {"url": f"{API_URL}/auth/login", "data": login_data_dict, "headers": None, "desc": "Estándar JSON"},
            # Variantes de ruta
            {"url": f"{API_URL.replace('/api/v1', '')}/api/v1/auth/login", "data": login_data_form, "headers": headers_form, "desc": "Reemplazando posible prefijo duplicado"},
            {"url": f"{BASE_URL}/auth/login", "data": login_data_dict, "headers": None, "desc": "Sin prefijo api/v1"},
            {"url": f"{BASE_URL}/api/auth/login", "data": login_data_dict, "headers": None, "desc": "Prefijo api sin versión"},
            {"url": f"{BASE_URL}/login", "data": login_data_dict, "headers": None, "desc": "Ruta simple"},
            {"url": f"{BASE_URL}/token", "data": login_data_form, "headers": headers_form, "desc": "OAuth2 token estándar"},
            {"url": f"{API_URL}/token", "data": login_data_form, "headers": headers_form, "desc": "OAuth2 con prefijo API"},
        ]
        
        # Intentar cada combinación hasta encontrar una que funcione
        success = False
        
        for attempt in auth_attempts:
            print_info(f"Probando login ({attempt['desc']}): {attempt['url']}")
            try:
                response = session.post(attempt['url'], data=attempt['data'], headers=attempt['headers'])
                last_response = response
                
                if response.status_code == 200:
                    print_success(f"¡Login exitoso con método {attempt['desc']}!")
                    try:
                        json_data = response.json()
                        print_info(f"Respuesta JSON recibida: {str(json_data)[:200]}")
                        token = json_data.get("access_token")
                        if token:
                            session.headers.update({"Authorization": f"Bearer {token}"})
                            print_info(f"Token obtenido: {token[:10]}...")
                            success = True
                            break
                        else:
                            print_warning("Token no encontrado en la respuesta JSON")
                    except ValueError as json_error:
                        print_warning(f"La respuesta no es JSON válido: {json_error}")
                        print_info(f"Contenido de la respuesta (primeros 200 chars):")
                        print_info(f"{response.text[:200]}")
                        
                        # Si parece HTML y contiene un formulario de login, podría ser la página de login
                        if "<html" in response.text.lower() and ("login" in response.text.lower() or "form" in response.text.lower()):
                            print_info("Parece ser la página HTML de login, no un endpoint API")
                else:
                    print_warning(f"Intento {attempt['desc']} fallido: Status {response.status_code}")
                    print_info(f"Detalles: {response.text[:100]}")
            except Exception as e:
                print_warning(f"Error en intento {attempt['desc']}: {e}")
                
        # Intentar también con datos JSON
        if not success:
            print_info("Probando con datos en formato JSON")
            try:
                response = session.post(f"{API_URL}/auth/login", json=login_data_dict)
                last_response = response
                if response.status_code == 200:
                    print_success("¡Login exitoso con JSON data!")
                    token = response.json().get("access_token")
                    session.headers.update({"Authorization": f"Bearer {token}"})
                    success = True
            except Exception as e:
                print_warning(f"Error con JSON data: {e}")
        
        if success:
            print_success("Inicio de sesión exitoso")
            return True
        else:
            print_error("Error en el inicio de sesión")
            if last_response:
                print_response(last_response)
                
            # Preguntar si queremos continuar en modo diagnóstico
            print_warning("No se ha podido autenticar, pero continuaremos el diagnóstico sin token")
            print_warning("Esto permitirá diagnósticar problemas de rutas y disponibilidad, pero muchos endpoints fallarán por falta de autorización")
            
            # En modo automatizado, siempre continuamos
            print_info("Continuando con diagnóstico en modo sin autenticación...")
            return False
                
    except Exception as e:
        print_error(f"Excepción general durante el login: {e}")
        return False

def check_static_files():
    print_header("2. Verificando archivos estáticos")
    
    files_to_check = [
        "/",  # Página principal
        "/assets/vendor-react.DbrpvmvF.js",  # React
        "/assets/vendor-charts.DXYh0qXP.js",  # Chart.js
        "/assets/RoleGuard.BxpbTjaZ.js",  # RoleGuard
        "/assets/AnimalTable.Bv6EmpGa.js",  # AnimalTable
        "/favicon.ico"  # Favicon
    ]
    
    all_ok = True
    
    for file in files_to_check:
        try:
            response = requests.get(f"{BASE_URL}{file}")
            if response.status_code == 200:
                print_success(f"Archivo encontrado: {file}")
            else:
                print_error(f"Error al acceder a {file}: Status {response.status_code}")
                all_ok = False
        except Exception as e:
            print_error(f"Excepción al acceder a {file}: {e}")
            all_ok = False
    
    return all_ok

def check_api_endpoints():
    print_header("3. Verificación de API endpoints")
    
    endpoints = [
        {"path": "/api/v1/dashboard", "method": "GET", "desc": "Dashboard"},
        {"path": "/api/v1/animales", "method": "GET", "desc": "Lista de Animales"},
        {"path": "/api/v1/explotaciones", "method": "GET", "desc": "Lista de Explotaciones"},
        {"path": "/api/v1/users", "method": "GET", "desc": "Lista de Usuarios"},
        {"path": "/api/v1/importaciones", "method": "GET", "desc": "Historial de Importaciones"},
        {"path": "/api/v1/backups", "method": "GET", "desc": "Backups"},
        {"path": "/api/v1/notificaciones", "method": "GET", "desc": "Notificaciones"},
        {"path": "/api/v1/diagnostico", "method": "GET", "desc": "Diagnóstico"}
    ]
    
    # Añadir pruebas adicionales para encontrar la raíz API correcta
    additional_api_roots = [
        "/api",
        "/backend/api",
        "/api/v1",
        "/api/v2",
        "/v1",
        "/v1/api"
    ]
    
    # Primero intentar detectar la raíz de API
    print_info("Intentando detectar la raíz de API correcta...")
    api_root_found = False
    working_api_root = "/api/v1"  # Por defecto
    
    # Probar endpoints específicos que podrían funcionar
    common_api_endpoints = [
        "/health", "/api/health", "/api/v1/health", 
        "/api", "/api/v1", 
        "/ping", "/api/ping", 
        "/info", "/api/info",
        "/status", "/api/status", 
        "/version", "/api/version"
    ]
    
    # Primero intentar con endpoints comunes de salud/ping
    for endpoint in common_api_endpoints:
        try:
            test_url = f"{BASE_URL}{endpoint}"
            print_info(f"Probando endpoint API: {test_url}")
            response = session.get(test_url)
            if response.status_code == 200:
                print_success(f"Endpoint API funcionando: {endpoint}")
                if "/api/v1/" in endpoint:
                    working_api_root = "/api/v1"
                    api_root_found = True
                elif "/api/" in endpoint:
                    working_api_root = "/api"
                    api_root_found = True
                break
            elif response.status_code != 404:  # Si no es 404, podría ser que la ruta exista pero necesite auth
                print_info(f"Posible endpoint API (código {response.status_code}): {endpoint}")
        except Exception as e:
            print_info(f"Error probando endpoint API {endpoint}: {e}")
            
    # Intentar con diferentes raíces de API
    if not api_root_found:
        for api_root in additional_api_roots:
            try:
                # Intentar detectar si hay algún servicio FastAPI en esta raíz
                test_url = f"{BASE_URL}{api_root}/docs"
                print_info(f"Buscando documentación Swagger en: {test_url}")
                response = session.get(test_url)
                if response.status_code == 200 and ("swagger" in response.text.lower() or "openapi" in response.text.lower()):
                    print_success(f"¡Documentación API encontrada en: {api_root}/docs!")
                    api_root_found = True
                    working_api_root = api_root
                    break
                    
                # También probar con /redoc que es común en FastAPI
                test_url = f"{BASE_URL}{api_root}/redoc"
                print_info(f"Buscando documentación ReDoc en: {test_url}")
                response = session.get(test_url)
                if response.status_code == 200 and ("redoc" in response.text.lower() or "swagger" in response.text.lower()):
                    print_success(f"¡Documentación API encontrada en: {api_root}/redoc!")
                    api_root_found = True
                    working_api_root = api_root
                    break
            except Exception as e:
                print_info(f"Error buscando documentación API en {api_root}: {e}")
    
    if not api_root_found:
        print_warning("No se pudo detectar automáticamente la raíz de API. Usando /api/v1 por defecto")
    
    # Ahora probar los endpoints estándar con la raíz detectada
    for endpoint in endpoints:
        # Probar varias combinaciones de rutas para cada endpoint
        base_endpoint = endpoint['path'].split('/')[-1]  # Obtener la última parte de la ruta (ej: 'dashboard', 'animales')
        
        # Lista de posibles rutas para probar basadas en patrones comunes
        paths_to_try = [
            endpoint['path'],  # Ruta original (/api/v1/something)
            f"{working_api_root}/{base_endpoint}",  # Con la raíz detectada
            f"/api/{base_endpoint}",  # Directamente en /api/
            f"/{base_endpoint}",  # Directamente en la raíz
        ]
        
        # Añadir variantes plurales/singulares para mayor robustez
        if base_endpoint.endswith('s'):
            # Si es plural (ej: 'animales'), probar también singular
            singular = base_endpoint[:-1]
            paths_to_try.append(f"{working_api_root}/{singular}")
            paths_to_try.append(f"/api/{singular}")
        else:
            # Si es singular, probar plural
            plural = f"{base_endpoint}s"
            paths_to_try.append(f"{working_api_root}/{plural}")
            paths_to_try.append(f"/api/{plural}")
            
        # Eliminar duplicados
        paths_to_try = list(set(paths_to_try))
        
        endpoint_success = False
        for path in paths_to_try:
            print_info(f"Verificando endpoint {endpoint['desc']}: {path}")
            try:
                response = session.request(endpoint['method'], BASE_URL + path)
                if response.status_code == 200:
                    print_success(f"Endpoint {endpoint['desc']} disponible")
                    print_info(f"Respuesta: {response.text[:200]}")
                    endpoint_success = True
                    break
                elif response.status_code == 401 or response.status_code == 403:
                    print_warning(f"Endpoint {endpoint['desc']} requiere autenticación: {response.status_code}")
                    if not auth_success:
                        print_info("Este error es esperado ya que no estamos autenticados")
                    else:
                        print_error("¡Error! Deberíamos estar autenticados pero el endpoint rechaza nuestra petición")
                else:
                    print_warning(f"Error en endpoint {endpoint['desc']}: {response.status_code}")
                    print_info(f"Detalles: {response.text[:100]}")
            except Exception as e:
                print_error(f"Error al acceder al endpoint {endpoint['desc']}: {e}")
        
        if not endpoint_success:
            print_warning(f"No se pudo acceder al endpoint {endpoint['desc']} en ninguna ruta probada")
            all_ok = False
    
    return all_ok

def check_specific_pages():
    print_header("4. Verificando páginas específicas")
    
    pages = [
        # Páginas principales
        {"url": "/", "name": "Página principal"},
        {"url": "/dashboard", "name": "Dashboard"},
        
        # Páginas de gestión
        {"url": "/explotaciones-react", "name": "Explotaciones"},
        {"url": "/animals", "name": "Animales"},
        {"url": "/animals/create", "name": "Crear animal"},
        {"url": "/partos", "name": "Gestión de partos"},
        
        # Herramientas de trabajo
        {"url": "/imports", "name": "Importaciones"},
        {"url": "/listados", "name": "Listados"},
        
        # Configuración y administración
        {"url": "/settings", "name": "Configuración"},
        {"url": "/users", "name": "Usuarios"},
        {"url": "/backups", "name": "Copias de seguridad"},
        
        # Informes y análisis
        {"url": "/reports", "name": "Informes"},
        {"url": "/estadisticas", "name": "Estadísticas"},
        
        # Ayuda y documentación
        {"url": "/help", "name": "Ayuda"},
        {"url": "/api/v1/docs", "name": "Documentación API"}
    ]
    
    # Añadir más información detallada para páginas problemáticas
    detailed_checks = {
        "/explotaciones-react": {
            "depends_on": ["jspdf", "jspdf-autotable"],
            "alternatives": ["/dashboard"],
            "critical": True
        },
        "/animals": {
            "critical": True
        },
        "/dashboard": {
            "critical": True
        }
    }
    
    all_ok = True
    
    results = {}
    critical_pages_status = {}
    
    for page in pages:
        url = f"{BASE_URL}{page['url']}"
        print_info(f"Verificando página {page['name']} [{url}]")
        
        is_critical = False
        detail_info = {}
        
        # Comprobar si esta página tiene información detallada
        if page['url'] in detailed_checks:
            detail_info = detailed_checks[page['url']]
            is_critical = detail_info.get("critical", False)
        
        try:
            start_time = datetime.now()
            response = session.get(url)
            load_time = (datetime.now() - start_time).total_seconds()
            
            results[page['name']] = {
                "url": page['url'],
                "status_code": response.status_code,
                "load_time": load_time,
                "is_critical": is_critical
            }
            
            if response.status_code == 200:
                print_success(f"Página OK: {page['name']} (cargada en {load_time:.2f} segundos)")
                if is_critical:
                    critical_pages_status[page['name']] = "✅ OK"
                    
                # Verificar si hay elementos esperados en la respuesta
                if "jspdf" in response.text:
                    print_info(f"  - jspdf detectado en página {page['name']}")
                if "jspdf-autotable" in response.text:
                    print_info(f"  - jspdf-autotable detectado en página {page['name']}")
                if "React" in response.text:
                    print_info(f"  - React detectado en página {page['name']}")
            else:
                error_msg = f"Error en página {page['name']}: Status {response.status_code}"
                print_error(error_msg)
                if is_critical:
                    critical_pages_status[page['name']] = f"❌ ERROR ({response.status_code})"
                all_ok = False
        
        except Exception as e:
            error_msg = f"Excepción al acceder a {page['name']}: {e}"
            print_error(error_msg)
            results[page['name']] = {
                "url": page['url'],
                "error": str(e),
                "is_critical": is_critical
            }
            if is_critical:
                critical_pages_status[page['name']] = f"❌ ERROR (Excepción: {str(e)[:30]}...)"
            all_ok = False
    
    # Generar resumen final
    print("\n" + "=" * 60)
    print(f"✅ RESUMEN DE VERIFICACIÓN DE PÁGINAS")
    print("=" * 60)
    print(f"Total de páginas verificadas: {len(pages)}")
    print(f"Páginas con estado 200 OK: {sum(1 for r in results.values() if r.get('status_code') == 200)}")
    print(f"Páginas con errores: {sum(1 for r in results.values() if r.get('status_code', 0) != 200 or 'error' in r)}")
    
    # Mostrar estado de páginas críticas
    print("\nEstado de páginas críticas:")
    for name, status in critical_pages_status.items():
        print(f"  {name}: {status}")
    
    return all_ok

def check_env_configuration():
    print_header("5. Verificando configuración de entorno")
    
    # Si existe el archivo .env en el directorio del servidor, mostrarlo
    try:
        # Verificar si podemos acceder a la URL que debería devolver algún indicio de la configuración
        response = session.get(f"{API_URL}/system/info")
        
        if response.status_code == 200:
            print_success("Configuración del sistema disponible")
            print_response(response)
            return True
        else:
            print_warning("No se pudo acceder a la información del sistema (puede ser normal)")
            return False
    except Exception as e:
        print_warning(f"Error al verificar configuración: {e}")
        return False

def discover_api_base():
    print_header("0. DETECCIÓN AUTOMÁTICA DE API")
    print_info("Intentando descubrir la configuración correcta de la API...")
    
    # Puntos comunes para verificar que un backend está vivo
    health_endpoints = [
        "/health", 
        "/ping",
        "/api/health",
        "/api/ping",
        "/api/v1/health",
        "/api/docs",
        "/docs",
        "/api/v1/docs",
        "/openapi.json",
        "/api/openapi.json",
        "/api/v1/openapi.json"
    ]
    
    # Probar diferentes combinaciones de hosts (HTTP/HTTPS) y endpoints
    best_config = {
        "protocol": "http",
        "host": TARGET_HOST,
        "api_base": "/api/v1",
        "found": False,
        "status_code": 0,
        "response_type": ""
    }
    
    protocols = ["http", "https"]
    hosts = [TARGET_HOST]
    if ALT_HOST and ALT_HOST != TARGET_HOST:
        hosts.append(ALT_HOST)
    
    print_info(f"Probando {len(protocols) * len(hosts) * len(health_endpoints)} combinaciones posibles...")
    
    for protocol in protocols:
        for host in hosts:
            for endpoint in health_endpoints:
                test_url = f"{protocol}://{host}{endpoint}"
                try:
                    print_info(f"Probando {test_url}")
                    response = requests.get(test_url, timeout=5, allow_redirects=True)
                    
                    # Analizar el tipo de respuesta
                    content_type = response.headers.get('content-type', '')
                    response_type = "desconocido"
                    if 'application/json' in content_type:
                        response_type = "JSON"
                    elif 'text/html' in content_type:
                        response_type = "HTML"
                    elif 'text/plain' in content_type:
                        response_type = "texto"
                    
                    print_info(f"Respuesta: {response.status_code} ({response_type})")
                    
                    # Guardar la mejor configuración encontrada
                    if response.status_code < 400:
                        best_config["protocol"] = protocol
                        best_config["host"] = host
                        best_config["found"] = True
                        best_config["status_code"] = response.status_code
                        best_config["response_type"] = response_type
                        
                        # Detectar la base de la API basada en el endpoint que respondió
                        if "/api/v1/" in endpoint:
                            best_config["api_base"] = "/api/v1"
                        elif "/api/" in endpoint:
                            best_config["api_base"] = "/api"
                        elif "/v1/" in endpoint:
                            best_config["api_base"] = "/v1"
                            
                        print_success(f"Se encontró un endpoint activo: {test_url}")
                        # No salimos del bucle para tener más información
                        
                except (ConnectionError, Timeout, TooManyRedirects) as e:
                    print_warning(f"No se pudo conectar a {test_url}: {str(e)}")
    
    # Actualizar las variables globales con la mejor configuración
    global BASE_URL, API_URL
    if best_config["found"]:
        BASE_URL = f"{best_config['protocol']}://{best_config['host']}"
        API_URL = f"{BASE_URL}{best_config['api_base']}"
        print_success(f"Configuración detectada: {BASE_URL} con API en {API_URL}")
    else:
        print_warning(f"No se pudo detectar automáticamente la API. Usando valores por defecto: {BASE_URL} y {API_URL}")
    
    return best_config["found"]

def run_diagnostics():
    print_header("DIAGNÓSTICO DE DESPLIEGUE MASCLET IMPERI")
    print_info(f"Ejecutando diagnóstico en {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_info(f"Objetivo: {BASE_URL} | API predeterminada: {API_URL}")
    
    # Descubrir la configuración real primero
    discover_api_base()
    
    # Ejecutar diagnósticos
    auth_result = login()
    check_static_files()
    check_api_endpoints()
    check_specific_pages()
    check_env_configuration()
    
    # Resumen
    print_header("RESUMEN DEL DIAGNÓSTICO")
    print_info(f"Servidor: {BASE_URL}")
    print_info(f"API URL detectada: {API_URL}")
    
    if auth_result:
        print_success("✅ Autenticación: CORRECTA")
    else:
        print_error("❌ Autenticación: FALLIDA")
    
    # Sugerencias basadas en resultados
    print_header("RECOMENDACIONES")
    
    if not auth_result:
        if DUPLICATED_API_PREFIX:
            print_warning("1. PROBLEMA DETECTADO: Duplicación de rutas API")
            print_warning("   Este problema causa que las URLs sean incorrectas como: /api/v1/api/v1/auth/login")
            print_warning("   Solución: Editar frontend/src/services/authService.ts para corregir la construcción de URLs")
            print_warning("   Específicamente:")  
            print_warning("     1. Evitar duplicar /api/v1 en la URL de login")
            print_warning("     2. Verificar que API_URL no tiene /api/v1 duplicado")
            print_warning("     3. En backend, asegurar que OAuth2PasswordBearer use rutas absolutas en tokenUrl")
        else:
            print_warning("1. Verifique las credenciales de administrador")
            print_warning("2. Asegúrese que el endpoint de login es accesible")
            print_warning("3. Revise los logs del backend para errores de autenticación")
    
    print_info("\nDiagnóstico completado.")
    
    # Generar informe detallado
    try:
        report_dir = os.path.dirname(os.path.abspath(__file__))
        report_path = os.path.join(report_dir, f"diagnostico_despliegue_{TARGET_HOST.replace('.', '_')}.txt")
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(f"DIAGNÓSTICO DE DESPLIEGUE MASCLET IMPERI\n")
            f.write(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Servidor: {BASE_URL}\n")
            f.write(f"API URL: {API_URL}\n")
            f.write(f"Autenticación: {'CORRECTA' if auth_result else 'FALLIDA'}\n")
            f.write(f"Problema de duplicación API: {'SÍ' if DUPLICATED_API_PREFIX else 'NO'}\n")
            
        print_info(f"Informe guardado en: {report_path}\n")  
    except Exception as e:
        print_warning(f"No se pudo guardar el informe: {e}\n")

if __name__ == "__main__":
    run_diagnostics()
