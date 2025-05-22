import requests
import json
import os
from datetime import datetime
from pprint import pprint

# Configuración
BASE_URL = "http://localhost:8000/api/v1"  # URL base del backend local
ENDPOINTS = [
    # Endpoints principales del dashboard
    "/dashboard/stats",
    "/dashboard/resumen/",
    "/dashboard/partos",
    "/dashboard/combined",
    "/dashboard/recientes",
    
    # Endpoints de diagnóstico (más detallados)
    "/diagnostico/dashboard-debug",
    "/diagnostico/partos-debug"
]

# Credenciales correctas proporcionadas por el usuario
CREDENCIALES = {
    "username": "admin",
    "password": "admin123"
}

def guardar_resultados(nombre, datos):
    """Guarda los resultados en un archivo JSON con timestamp"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    directorio = "resultados"
    
    # Crear directorio si no existe
    if not os.path.exists(directorio):
        os.makedirs(directorio)
        
    nombre_archivo = f"{directorio}/{nombre}_{timestamp}.json"
    
    with open(nombre_archivo, "w", encoding="utf-8") as f:
        json.dump(datos, f, indent=2, ensure_ascii=False)
    
    return nombre_archivo

def obtener_token():
    """Obtiene un token JWT mediante inicio de sesión"""
    # Usar la ruta de autenticación correcta según el listado de endpoints
    url = f"{BASE_URL}/auth/login"
    print(f"🔑 Intentando obtener token JWT desde {url}...")
    
    try:
        # FastAPI usa form data para login, no JSON
        response = requests.post(
            url, 
            data=CREDENCIALES,
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
            if response.status_code == 401:
                print("  ⚠️ Posible error de credenciales. Verifica username/password.")
            
            # Intentar mostrar detalles del error
            try:
                error_detail = response.json()
                print(f"  Detalle del error: {error_detail}")
            except:
                pass
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Error al conectar con el endpoint de autenticación: {e}")
    
    print("🚨 No se pudo obtener token JWT. Intentando sin autenticación...")
    return None

def probar_endpoint(endpoint, token=None):
    """Prueba un endpoint y devuelve los resultados"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n🔍 Probando endpoint: {url}")
    
    # Intentar primero con autenticación si hay token
    if token:
        print("  Intentando con autenticación JWT...")
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                datos = response.json()
                print(f"✅ Respuesta exitosa con autenticación (status {response.status_code})")
                
                # Guardar resultados
                nombre_archivo = guardar_resultados(endpoint.replace("/", "_")[1:], datos)
                print(f"💾 Datos guardados en: {nombre_archivo}")
                
                # Analizar estructura de datos
                analizar_estructura(datos)
                
                return datos
            else:
                print(f"  ⚠️ Respuesta con autenticación: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"  ⚠️ Error con autenticación: {e}")
    
    # Si no hay token o falló con autenticación, intentar sin autenticación
    print("  Intentando sin autenticación...")
    try:
        response = requests.get(url)
        
        if response.status_code == 200:
            datos = response.json()
            print(f"✅ Respuesta exitosa sin autenticación (status {response.status_code})")
            
            # Guardar resultados
            nombre_archivo = guardar_resultados(endpoint.replace("/", "_")[1:], datos)
            print(f"💾 Datos guardados en: {nombre_archivo}")
            
            # Analizar estructura de datos
            analizar_estructura(datos)
            
            return datos
        else:
            print(f"❌ Error sin autenticación: status {response.status_code}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error sin autenticación: {e}")
        return None

def analizar_estructura(datos, prefijo="", max_profundidad=3, profundidad_actual=0):
    """Analiza y muestra la estructura de los datos recibidos"""
    # Evitar exploraciones demasiado profundas
    if profundidad_actual > max_profundidad:
        print(f"  ⚠️ Estructura demasiado profunda en {prefijo}. Limitando análisis.")
        return
    
    if isinstance(datos, dict):
        for clave, valor in datos.items():
            ruta = f"{prefijo}.{clave}" if prefijo else clave
            
            if isinstance(valor, (dict, list)):
                if isinstance(valor, dict) and len(valor) <= 5:
                    print(f"📊 {ruta}: {valor}")
                else:
                    tipo = type(valor).__name__
                    longitud = len(valor)
                    print(f"📂 {ruta}: {tipo} con {longitud} elementos")
                    
                    # Para valores significativos en el dashboard, mostrar más detalles
                    if clave in ['animales', 'por_alletar', 'por_edad', 'por_genero', 'partos']:
                        print(f"  ℹ️ Detalle importante para el dashboard: {clave}")
                        print(f"  {valor}")
                    else:
                        analizar_estructura(valor, ruta, max_profundidad, profundidad_actual + 1)
            else:
                print(f"📄 {ruta}: {valor}")
    
    elif isinstance(datos, list):
        if len(datos) > 0:
            print(f"📋 {prefijo} (Lista con {len(datos)} elementos)")
            
            # Mostrar el primer elemento como ejemplo
            if datos and isinstance(datos[0], (dict, list)):
                print(f"📌 Ejemplo (primer elemento):")
                analizar_estructura(datos[0], f"{prefijo}[0]", max_profundidad, profundidad_actual + 1)
            else:
                print(f"📌 Primeros elementos: {datos[:min(3, len(datos))]}")
        else:
            print(f"📋 {prefijo} (Lista vacía)")

def verificar_conteos(resultados):
    """Verifica y compara conteos entre diferentes endpoints"""
    stats = resultados.get("/dashboard/stats", {})
    resumen = resultados.get("/dashboard/resumen/", {})
    debug = resultados.get("/diagnostico/dashboard-debug", {})
    
    print("\n📊 VERIFICACIÓN DE CONTEOS EN DASHBOARD 📊")
    print("============================================")
    
    # Extraer datos de animales de los diferentes endpoints
    animales_stats = stats.get('animales', {})
    
    if animales_stats:
        print("\n🐄 RESUMEN DE ANIMALES (de /dashboard/stats)")
        print(f"  Total de animales: {animales_stats.get('total', 0)}")
        print(f"  Toros activos: {animales_stats.get('toros_activos', 0)}")
        print(f"  Toros fallecidos: {animales_stats.get('toros_fallecidos', 0)}")
        print(f"  Vacas activas: {animales_stats.get('vacas_activas', 0)}")
        print(f"  Vacas fallecidas: {animales_stats.get('vacas_fallecidas', 0)}")
        
        # Verificar si los totales cuadran
        total_calculado = (
            animales_stats.get('toros_activos', 0) + 
            animales_stats.get('toros_fallecidos', 0) + 
            animales_stats.get('vacas_activas', 0) + 
            animales_stats.get('vacas_fallecidas', 0)
        )
        
        total_reportado = animales_stats.get('total', 0)
        
        if total_calculado != total_reportado:
            print(f"  ⚠️ INCONSISTENCIA: Total reportado ({total_reportado}) != suma de categorías ({total_calculado})")
        else:
            print(f"  ✅ Los totales cuadran correctamente")
    
    # Comparar con datos de debug si están disponibles
    if debug:
        print("\n🔧 DATOS DE DIAGNÓSTICO (de /diagnostico/dashboard-debug)")
        # Aquí añadir lógica específica de análisis de datos de debug

def main():
    """Función principal"""
    print("🔎 DIAGNÓSTICO DE ENDPOINTS DE DASHBOARD 🔎")
    print("===========================================")
    
    # Crear directorio para resultados
    if not os.path.exists("resultados"):
        os.makedirs("resultados")
        print("📂 Directorio 'resultados' creado para guardar datos")
    
    # Obtener token JWT
    token = obtener_token()
    
    resultados = {}
    
    for endpoint in ENDPOINTS:
        resultado = probar_endpoint(endpoint, token)
        if resultado:
            resultados[endpoint] = resultado
    
    if not resultados:
        print("❌ No se pudo obtener datos de ningún endpoint. Verifique que el servidor esté ejecutándose.")
        return
    
    # Verificar conteos en los resultados
    verificar_conteos(resultados)
    
    # Guardar todos los resultados combinados para análisis posterior
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_archivo = f"resultados/todos_los_endpoints_{timestamp}.json"
    with open(nombre_archivo, "w", encoding="utf-8") as f:
        json.dump(resultados, f, indent=2, ensure_ascii=False)
    print(f"\n💾 Todos los resultados guardados en: {nombre_archivo}")
    
    print("\n✨ Diagnóstico completado ✨")

if __name__ == "__main__":
    main()
