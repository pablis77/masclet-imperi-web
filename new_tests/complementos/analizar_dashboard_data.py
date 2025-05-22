import requests
import json
import os
from datetime import datetime
from pprint import pprint
import sys

# Configuración
BASE_URL = "http://localhost:8000/api/v1"
CREDENCIALES = {
    "username": "admin",
    "password": "admin123"
}

ENDPOINTS = {
    "stats": "/dashboard/stats",
    "resumen": "/dashboard/resumen/",
    "partos": "/dashboard/partos",
    "debug": "/diagnostico/dashboard-debug",
}

def obtener_token():
    """Obtiene un token JWT mediante inicio de sesión"""
    url = f"{BASE_URL}/auth/login"
    print(f"🔑 Obteniendo token JWT desde {url}...")
    
    try:
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
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error al conectar con el endpoint de autenticación: {e}")
    
    print("❌ No se pudo obtener token JWT. Abortando.")
    sys.exit(1)

def obtener_datos(endpoint, token):
    """Obtiene datos de un endpoint específico"""
    url = f"{BASE_URL}{endpoint}"
    print(f"📡 Obteniendo datos de: {url}")
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Error al obtener datos: {response.status_code}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {e}")
        return None

def guardar_datos(nombre, datos):
    """Guarda los datos en un archivo JSON"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    directorio = "resultados"
    
    if not os.path.exists(directorio):
        os.makedirs(directorio)
        
    nombre_archivo = f"{directorio}/{nombre}_{timestamp}.json"
    
    with open(nombre_archivo, "w", encoding="utf-8") as f:
        json.dump(datos, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Datos guardados en: {nombre_archivo}")
    return nombre_archivo

def mostrar_tabla(titulo, datos, cabeceras=None):
    """Muestra datos en formato de tabla simple sin dependencias externas"""
    print(f"\n📊 {titulo.upper()} 📊")
    print("="*50)
    
    # Si no hay cabeceras, usar formato simple
    if not cabeceras:
        for fila in datos:
            print("  ".join([str(celda) for celda in fila]))
        print("\n")
        return
    
    # Calcular ancho de columnas basado en contenido
    anchos = [len(str(h)) for h in cabeceras]
    for fila in datos:
        for i, celda in enumerate(fila):
            if i < len(anchos):
                anchos[i] = max(anchos[i], len(str(celda)))
    
    # Imprimir cabecera
    header_row = "  ".join([str(h).ljust(anchos[i]) for i, h in enumerate(cabeceras)])
    print(header_row)
    print("-" * len(header_row))
    
    # Imprimir filas
    for fila in datos:
        row_str = "  ".join([str(celda).ljust(anchos[i]) if i < len(anchos) else str(celda) 
                            for i, celda in enumerate(fila)])
        print(row_str)
    
    print("\n")

def analizar_animales(datos_stats, datos_debug=None):
    """Analiza los datos de animales del dashboard"""
    print("\n🐄 ANÁLISIS DE DATOS DE ANIMALES 🐄")
    print("="*50)
    
    animales = datos_stats.get("animales", {})
    
    # Datos generales
    print("\n📌 CONTEOS GENERALES")
    conteos_generales = [
        ["Total animales", animales.get("total", 0)],
        ["Machos", animales.get("machos", 0)],
        ["Hembras", animales.get("hembras", 0)],
        ["Ratio M/H", animales.get("ratio_m_h", 0)],
    ]
    for fila in conteos_generales:
        print(f"{fila[0]}: {fila[1]}")
    
    # Datos por estado
    print("\n📌 POR ESTADO")
    por_estado = animales.get("por_estado", {})
    print("Estado  Cantidad")
    print("------  --------")
    for estado, cantidad in por_estado.items():
        print(f"{estado}      {cantidad}")
    
    # Datos por amamantamiento
    print("\n📌 POR AMAMANTAMIENTO")
    por_alletar = animales.get("por_alletar", {})
    print("Estado  Cantidad")
    print("------  --------")
    for estado, cantidad in por_alletar.items():
        print(f"{estado}      {cantidad}")
    
    # Verificar inconsistencias
    print("\n📌 VERIFICACIÓN DE CONTEOS")
    
    # Calcular total a partir de machos y hembras
    total_por_genero = animales.get("machos", 0) + animales.get("hembras", 0)
    
    # Calcular total por estado
    total_por_estado = sum(por_estado.values())
    
    # Datos de debug si están disponibles
    debug_machos = 0
    debug_hembras = 0
    if datos_debug:
        debug_machos = datos_debug.get("total_machos", 0)
        debug_hembras = datos_debug.get("total_hembras", 0)
    
    print("Concepto         Valor   Concuerda")
    print("---------------  ------  ---------")
    print(f"Total reportado    {animales.get('total', 0)}")
    print(f"Total por género   {total_por_genero}     {'OK' if total_por_genero == animales.get('total', 0) else 'NO'}")
    print(f"Total por estado   {total_por_estado}     {'OK' if total_por_estado == animales.get('total', 0) else 'NO'}")
    print(f"Debug: machos      {debug_machos}     {'OK' if debug_machos == animales.get('machos', 0) else 'NO'}")
    print(f"Debug: hembras     {debug_hembras}     {'OK' if debug_hembras == animales.get('hembras', 0) else 'NO'}")

def analizar_partos(datos_stats, datos_partos=None):
    """Analiza los datos de partos del dashboard"""
    print("\n🐣 ANÁLISIS DE DATOS DE PARTOS 🐣")
    print("="*50)
    
    partos = datos_stats.get("partos", {})
    
    # Datos generales
    print("\n📌 CONTEOS GENERALES")
    print(f"Total partos:      {partos.get('total', 0)}")
    print(f"Último mes:        {partos.get('ultimo_mes', 0)}")
    print(f"Último año:        {partos.get('ultimo_anio', 0)}")
    print(f"Promedio mensual:  {partos.get('promedio_mensual', 0)}")
    
    # Datos por género de cría
    print("\n📌 POR GÉNERO DE CRÍA")
    por_genero = partos.get("por_genero_cria", {})
    print("Género  Cantidad")
    print("------  --------")
    for genero, cantidad in por_genero.items():
        print(f"{genero}      {cantidad}")
    
    # Verificar inconsistencias
    print("\n📌 VERIFICACIÓN DE CONTEOS")
    
    # Calcular total por género
    total_por_genero = sum(por_genero.values())
    
    print("Concepto         Valor   Concuerda")
    print("---------------  ------  ---------")
    print(f"Total reportado    {partos.get('total', 0)}")
    print(f"Total por género   {total_por_genero}     {'OK' if total_por_genero == partos.get('total', 0) else 'NO'}")

    

def analizar_periodo(datos_stats):
    """Analiza el período de análisis del dashboard"""
    print("\n📅 ANÁLISIS DEL PERÍODO 📅")
    print("="*50)
    
    periodo = datos_stats.get("periodo", {})
    
    print(f"Fecha de inicio: {periodo.get('inicio', 'No disponible')}")
    print(f"Fecha de fin: {periodo.get('fin', 'No disponible')}")
    
    # Verificar si la fecha de inicio es 1900-01-01 (valor por defecto)
    if periodo.get('inicio') == "1900-01-01":
        print("⚠️ La fecha de inicio está usando el valor por defecto (1900-01-01)")
        print("   Esto podría afectar a los cálculos de estadísticas históricas.")

def main():
    print("🔍 ANÁLISIS DETALLADO DEL DASHBOARD 🔍")
    print("="*50)
    
    # Obtener token JWT
    token = obtener_token()
    
    # Obtener datos de cada endpoint
    datos = {}
    for nombre, endpoint in ENDPOINTS.items():
        resultado = obtener_datos(endpoint, token)
        if resultado:
            datos[nombre] = resultado
    
    if not datos:
        print("❌ No se pudo obtener datos. Abortando.")
        return
    
    # Guardar datos combinados
    guardar_datos("analisis_dashboard", datos)
    
    # Analizar datos de animales
    if "stats" in datos:
        analizar_animales(datos["stats"], datos.get("debug"))
        analizar_partos(datos["stats"], datos.get("partos"))
        analizar_periodo(datos["stats"])
    
    print("\n✨ Análisis completado ✨")

if __name__ == "__main__":
    main()
