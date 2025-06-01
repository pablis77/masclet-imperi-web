import requests
import time
import json
import sys
import argparse
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
from colorama import init, Fore, Style

# Inicializar colorama
init()

def color_print(message, color=Fore.WHITE, end='\n'):
    print(f"{color}{message}{Style.RESET_ALL}", end=end)
    sys.stdout.flush()

def log_info(message):
    color_print(f"ℹ {message}", Fore.BLUE)

def log_success(message):
    color_print(f"✓ {message}", Fore.GREEN)

def log_warning(message):
    color_print(f"⚠ {message}", Fore.YELLOW)

def log_error(message):
    color_print(f"✗ {message}", Fore.RED)

def prueba_login(base_url, username="admin", password="admin123"):
    log_info(f"PRUEBA DE LOGIN DIRECTO - Usuario: {username}")
    
    # Lista de posibles URL de login para probar
    login_urls = [
        f"{base_url}/api/auth/login",
        f"{base_url}/api/v1/auth/login",
        f"{base_url}/api/api/v1/auth/login",  # Posible duplicación de prefijo
        f"{base_url}/auth/login"
    ]
    
    session = requests.Session()
    
    # Intentar autenticación con cada URL
    for login_url in login_urls:
        log_info(f"Probando login en: {login_url}")
        
        # Intentar OAuth2 Password Flow
        try:
            oauth_data = {
                "username": username,
                "password": password,
                "grant_type": "password"
            }
            headers = {
                "Content-Type": "application/x-www-form-urlencoded"
            }
            
            response = session.post(login_url, data=oauth_data, headers=headers)
            
            if response.status_code == 200:
                try:
                    token_data = response.json()
                    if "access_token" in token_data:
                        log_success(f"¡Login exitoso en {login_url}!")
                        log_info(f"Token: {token_data['access_token'][:20]}...")
                        
                        # Guardar la sesión y token para pruebas posteriores
                        session.headers.update({
                            "Authorization": f"Bearer {token_data['access_token']}"
                        })
                        
                        return True, session, token_data
                    else:
                        log_warning(f"Respuesta sin token: {response.text[:100]}...")
                except:
                    log_warning(f"Respuesta no es JSON: {response.text[:100]}...")
            else:
                log_warning(f"Status: {response.status_code} - {response.text[:100]}...")
                
        except Exception as e:
            log_error(f"Error al intentar login: {str(e)}")
    
    # Si llegamos aquí, ninguna URL funcionó
    log_error("No se pudo completar el login con ninguna de las URLs probadas")
    return False, None, None

def probar_acceso_endpoints(session, base_url):
    """Prueba acceso a endpoints protegidos con la sesión autenticada"""
    log_info("\nPRUEBA DE ACCESO A ENDPOINTS PROTEGIDOS")
    
    endpoints = [
        "/api/users",
        "/api/v1/users",
        "/api/api/v1/users",
        "/api/animals",
        "/api/v1/animals",
        "/api/api/v1/animals",
        "/api/explotaciones",
        "/api/v1/explotaciones",
        "/api/api/v1/explotaciones",
    ]
    
    resultados = []
    
    for endpoint in endpoints:
        url = urljoin(base_url, endpoint)
        log_info(f"Probando acceso a: {url}")
        
        try:
            response = session.get(url)
            
            if response.status_code == 200:
                log_success(f"Acceso exitoso a {endpoint}")
                resultados.append((endpoint, True, response.status_code, response.text[:50] + "..."))
            else:
                log_warning(f"Error al acceder a {endpoint}: Status {response.status_code}")
                resultados.append((endpoint, False, response.status_code, response.text[:50] + "..."))
                
        except Exception as e:
            log_error(f"Excepción al acceder a {endpoint}: {str(e)}")
            resultados.append((endpoint, False, 0, str(e)))
    
    return resultados

def probar_paginas_frontend(session, base_url):
    """Prueba acceso a páginas del frontend que deberían requerir autenticación"""
    log_info("\nPRUEBA DE ACCESO A PÁGINAS FRONTEND")
    
    paginas = [
        "/dashboard",
        "/users",
        "/animals",
        "/explotaciones-react",
        "/imports",
        "/partos",
        "/settings"
    ]
    
    resultados = []
    
    for pagina in paginas:
        url = urljoin(base_url, pagina)
        log_info(f"Probando acceso a página: {url}")
        
        try:
            response = session.get(url)
            
            if response.status_code == 200:
                # Verificar si redirecciona a login (indica que no se aceptó la autenticación)
                if "/login" in response.url:
                    log_warning(f"Página {pagina} redirecciona a login - Autenticación rechazada")
                    resultados.append((pagina, False, response.status_code, "Redirecciona a login"))
                else:
                    # Comprobar si el contenido es HTML y contiene elementos del dashboard
                    soup = BeautifulSoup(response.text, 'html.parser')
                    title = soup.title.text if soup.title else "Sin título"
                    
                    if "login" in response.text.lower() and "contraseña" in response.text.lower():
                        log_warning(f"Página {pagina} muestra formulario de login - Autenticación rechazada")
                        resultados.append((pagina, False, response.status_code, f"Muestra login - {title}"))
                    else:
                        log_success(f"Acceso exitoso a página {pagina} - {title}")
                        resultados.append((pagina, True, response.status_code, title))
            else:
                log_warning(f"Error al acceder a página {pagina}: Status {response.status_code}")
                resultados.append((pagina, False, response.status_code, response.text[:50] + "..."))
                
        except Exception as e:
            log_error(f"Excepción al acceder a página {pagina}: {str(e)}")
            resultados.append((pagina, False, 0, str(e)))
    
    return resultados

def probar_navegacion_simulada(session, base_url):
    """Simula el proceso de navegación manual para detectar problemas con la autenticación"""
    log_info("\nPRUEBA DE NAVEGACIÓN SIMULADA")
    
    # 1. Acceder a la página de login
    login_url = urljoin(base_url, "/login")
    log_info(f"1. Accediendo a página de login: {login_url}")
    
    try:
        response = session.get(login_url)
        if response.status_code == 200:
            log_success("Página de login cargada correctamente")
        else:
            log_warning(f"Error al cargar página de login: Status {response.status_code}")
            return False
    except Exception as e:
        log_error(f"Excepción al acceder a página de login: {str(e)}")
        return False
    
    # 2. Extraer el token CSRF o cualquier otro elemento necesario para el formulario
    soup = BeautifulSoup(response.text, 'html.parser')
    csrf_token = None
    try:
        # Buscar token CSRF en formulario (podría no ser necesario)
        csrf_input = soup.find('input', {'name': '_csrf'})
        if csrf_input and 'value' in csrf_input.attrs:
            csrf_token = csrf_input['value']
            log_info(f"Token CSRF encontrado: {csrf_token[:10]}...")
    except:
        log_warning("No se encontró token CSRF en el formulario")
    
    # 3. Enviar petición de login simulando el envío del formulario
    log_info("2. Enviando formulario de login")
    
    login_post_url = urljoin(base_url, "/api/api/v1/auth/login")  # Usando la URL que sabemos que funciona
    
    login_data = {
        "username": "admin",
        "password": "admin123",
        "grant_type": "password"
    }
    
    if csrf_token:
        login_data['_csrf'] = csrf_token
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": login_url
    }
    
    try:
        response = session.post(login_post_url, data=login_data, headers=headers)
        
        if response.status_code == 200:
            try:
                token_data = response.json()
                if "access_token" in token_data:
                    log_success("Login enviado con éxito, token recibido")
                    
                    # Actualizar la sesión con el token
                    session.headers.update({
                        "Authorization": f"Bearer {token_data['access_token']}"
                    })
                    
                    # Guardar token en localStorage simulado
                    local_storage = {
                        'token': token_data['access_token'],
                        'token_type': token_data.get('token_type', 'bearer')
                    }
                    
                    log_info(f"Token almacenado: {token_data['access_token'][:20]}...")
                else:
                    log_warning(f"Respuesta sin token: {response.text[:100]}...")
                    return False
            except:
                log_warning(f"Respuesta no es JSON: {response.text[:100]}...")
                return False
        else:
            log_warning(f"Error en envío de login: Status {response.status_code}")
            log_info(f"Respuesta: {response.text[:100]}...")
            return False
    except Exception as e:
        log_error(f"Excepción al enviar login: {str(e)}")
        return False
    
    # 4. Intentar acceder al dashboard después del login
    dashboard_url = urljoin(base_url, "/dashboard")
    log_info(f"3. Accediendo al dashboard después del login: {dashboard_url}")
    
    try:
        # Agregar el token a los headers y cookies para asegurar autenticación
        dashboard_headers = {
            "Authorization": f"Bearer {token_data['access_token']}",
            "X-Auth-Token": token_data['access_token'],  # Algunas aplicaciones usan esto
            "Referer": login_url
        }
        
        # Crear cookies para el token (algunas apps usan esto)
        session.cookies.set("auth_token", token_data['access_token'], domain=urlparse(base_url).netloc)
        
        response = session.get(dashboard_url, headers=dashboard_headers)
        
        if response.status_code == 200:
            # Verificar si realmente estamos en el dashboard o nos redirigió a login
            if "/login" in response.url:
                log_warning("Redirigido a login a pesar de tener token - Autenticación no persistente")
                return False
            
            soup = BeautifulSoup(response.text, 'html.parser')
            title = soup.title.text if soup.title else "Sin título"
            
            if "login" in response.text.lower() and "contraseña" in response.text.lower():
                log_warning(f"Se muestra formulario de login a pesar de tener token - {title}")
                return False
            else:
                log_success(f"Acceso exitoso al dashboard después del login - {title}")
                log_info("Navegación simulada completada correctamente")
                return True
        else:
            log_warning(f"Error al acceder al dashboard: Status {response.status_code}")
            return False
    except Exception as e:
        log_error(f"Excepción al acceder al dashboard: {str(e)}")
        return False

def diagnóstico_autenticación_completo(base_url):
    """Ejecuta una serie de pruebas para diagnosticar problemas de autenticación"""
    print("\n" + "=" * 60)
    color_print("DIAGNÓSTICO COMPLETO DE AUTENTICACIÓN", Fore.CYAN)
    print("=" * 60)
    
    log_info(f"Iniciando diagnóstico en {base_url}")
    
    # 1. Prueba de login directo con API
    login_exitoso, session, token_data = prueba_login(base_url)
    
    if not login_exitoso or not session:
        log_error("No se pudo completar la autenticación. Abortando pruebas adicionales.")
        return False
    
    # 2. Prueba de acceso a endpoints protegidos
    resultados_endpoints = probar_acceso_endpoints(session, base_url)
    
    # 3. Prueba de acceso a páginas frontend
    resultados_paginas = probar_paginas_frontend(session, base_url)
    
    # 4. Prueba de navegación simulada (simulando el proceso manual)
    navegacion_exitosa = probar_navegacion_simulada(session, base_url)
    
    # 5. Resumen de resultados
    print("\n" + "=" * 60)
    color_print("RESUMEN DE RESULTADOS", Fore.CYAN)
    print("=" * 60)
    
    # Resumen de endpoints
    print("\n[ENDPOINTS API]")
    endpoints_ok = sum(1 for r in resultados_endpoints if r[1])
    print(f"✓ Endpoints accesibles: {endpoints_ok}/{len(resultados_endpoints)}")
    
    for endpoint, exito, status, detalles in resultados_endpoints:
        if exito:
            color_print(f"  ✓ {endpoint}", Fore.GREEN)
        else:
            color_print(f"  ✗ {endpoint} (Status: {status})", Fore.RED)
    
    # Resumen de páginas
    print("\n[PÁGINAS FRONTEND]")
    paginas_ok = sum(1 for r in resultados_paginas if r[1])
    print(f"✓ Páginas accesibles: {paginas_ok}/{len(resultados_paginas)}")
    
    for pagina, exito, status, detalles in resultados_paginas:
        if exito:
            color_print(f"  ✓ {pagina}", Fore.GREEN)
        else:
            color_print(f"  ✗ {pagina} (Status: {status}) - {detalles}", Fore.RED)
    
    # Resumen final
    print("\n" + "=" * 60)
    color_print("CONCLUSIÓN DEL DIAGNÓSTICO", Fore.CYAN)
    print("=" * 60)
    
    if navegacion_exitosa and paginas_ok > len(resultados_paginas) / 2:
        log_success("✅ La autenticación funciona correctamente")
        resultado_final = True
    elif login_exitoso and paginas_ok > 0:
        log_warning("⚠️ La autenticación funciona parcialmente")
        log_warning("   → Se obtiene token pero algunas páginas no son accesibles")
        resultado_final = "Parcial"
    else:
        log_error("❌ Problemas graves con la autenticación")
        log_error("   → Posiblemente el token no se almacena o gestiona correctamente")
        resultado_final = False
    
    # Recomendaciones
    print("\n" + "=" * 60)
    color_print("RECOMENDACIONES", Fore.CYAN)
    print("=" * 60)
    
    if resultado_final is False:
        log_info("1. Revisar el almacenamiento del token en localStorage en el frontend")
        log_info("2. Verificar que el token recibido tiene el formato correcto")
        log_info("3. Confirmar que el backend valida correctamente el token")
        log_info("4. Comprobar las rutas de redirección después del login")
    elif resultado_final == "Parcial":
        log_info("1. Revisar la propagación del token entre páginas")
        log_info("2. Verificar los mecanismos de autorización para páginas específicas")
        log_info("3. Comprobar si hay diferencias en cómo distintas rutas validan el token")
    else:
        log_info("El sistema de autenticación parece funcionar correctamente.")
    
    return resultado_final

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Diagnóstico específico de autenticación para Masclet Imperi')
    parser.add_argument('-u', '--url', default='http://108.129.139.119', help='URL base del servidor')
    
    args = parser.parse_args()
    diagnóstico_autenticación_completo(args.url)
