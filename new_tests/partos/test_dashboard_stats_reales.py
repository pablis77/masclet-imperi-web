#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Test para verificar los datos reales del dashboard de partos.
Este test obtiene directamente desde la base de datos:
1. Total de partos
2. Partos del año en curso (2025)
3. Partos del último mes (Mayo 2025)
4. Tasa de supervivencia
5. Ratio de géneros (machos/hembras/esforrada)

Luego compara con lo que devuelve el endpoint de dashboard para asegurar coherencia.
"""

import os
import sys
import json
import psycopg2
import requests
from datetime import datetime
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Configuración de la base de datos
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5433"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASS", "1234"),
    "database": os.getenv("DB_NAME", "masclet_imperi")
}

# URL base para la API
API_URL = "http://localhost:8000/api/v1"

def get_db_connection():
    """Establecer conexión con la base de datos PostgreSQL."""
    try:
        conn = psycopg2.connect(
            host=DB_CONFIG["host"],
            port=DB_CONFIG["port"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
            database=DB_CONFIG["database"]
        )
        return conn
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")
        sys.exit(1)

def get_partos_total():
    """Obtener el número total de partos."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT COUNT(*) 
    FROM "part"
    """
    
    cursor.execute(query)
    total = cursor.fetchone()[0]
    
    cursor.close()
    conn.close()
    
    return total

def get_partos_anio_actual():
    """Obtener el número de partos del año actual (2025)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    anio_actual = 2025
    
    query = """
    SELECT COUNT(*) 
    FROM "part"
    WHERE EXTRACT(YEAR FROM "part") = %s
    """
    
    cursor.execute(query, (anio_actual,))
    total = cursor.fetchone()[0]
    
    cursor.close()
    conn.close()
    
    return total

def get_partos_mes_actual():
    """Obtener el número de partos del mes actual (Mayo 2025)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    mes_actual = 5  # Mayo
    anio_actual = 2025
    
    query = """
    SELECT COUNT(*) 
    FROM "part"
    WHERE EXTRACT(MONTH FROM "part") = %s AND EXTRACT(YEAR FROM "part") = %s
    """
    
    cursor.execute(query, (mes_actual, anio_actual))
    total = cursor.fetchone()[0]
    
    cursor.close()
    conn.close()
    
    return total

def get_tasa_supervivencia():
    """Calcular tasa de supervivencia en partos."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN "EstadoT" = 'OK' THEN 1 ELSE 0 END) as supervivientes
    FROM "part"
    WHERE "EstadoT" IS NOT NULL
    """
    
    cursor.execute(query)
    result = cursor.fetchone()
    total = result[0]
    supervivientes = result[1]
    
    cursor.close()
    conn.close()
    
    if total == 0:
        return 0
    
    return supervivientes / total

def get_ratio_generos():
    """Obtener distribución por género de las crías."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT "GenereT", COUNT(*) as total
    FROM "part"
    WHERE "GenereT" IS NOT NULL
    GROUP BY "GenereT"
    """
    
    cursor.execute(query)
    results = cursor.fetchall()
    
    generos = {
        "M": 0,
        "F": 0,
        "esforrada": 0
    }
    
    for row in results:
        genere = row[0]
        total = row[1]
        if genere in generos:
            generos[genere] = total
    
    cursor.close()
    conn.close()
    
    return generos

def get_dashboard_api_data():
    """Obtener datos del endpoint de dashboard."""
    try:
        response = requests.get(f"{API_URL}/dashboard/stats")
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error al obtener datos de la API: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error en la petición a la API: {e}")
        return None

def main():
    """Función principal que ejecuta el test."""
    print("==== TEST DE DATOS DEL DASHBOARD DE PARTOS ====")
    
    # Obtener datos directamente de la base de datos
    total_partos = get_partos_total()
    partos_2025 = get_partos_anio_actual()
    partos_mayo = get_partos_mes_actual()
    tasa_supervivencia = get_tasa_supervivencia()
    ratio_generos = get_ratio_generos()
    
    print("\n-- DATOS DIRECTOS DE LA BASE DE DATOS --")
    print(f"Total de partos: {total_partos}")
    print(f"Partos en 2025: {partos_2025}")
    print(f"Partos en Mayo 2025: {partos_mayo}")
    print(f"Tasa de supervivencia: {tasa_supervivencia:.3f} ({tasa_supervivencia*100:.1f}%)")
    print(f"Ratio géneros: Machos={ratio_generos['M']}, Hembras={ratio_generos['F']}, Esforrada={ratio_generos['esforrada']}")
    
    # Obtener datos de la API
    api_data = get_dashboard_api_data()
    
    if api_data:
        print("\n-- DATOS OBTENIDOS DE LA API --")
        api_total = api_data.get("partos", {}).get("total", 0)
        api_ultimo_mes = api_data.get("partos", {}).get("ultimo_mes", 0)
        api_supervivencia = api_data.get("partos", {}).get("tasa_supervivencia", 0)
        api_generos = api_data.get("partos", {}).get("por_genero_cria", {})
        
        print(f"Total de partos API: {api_total}")
        print(f"Partos último mes API: {api_ultimo_mes}")
        print(f"Tasa supervivencia API: {api_supervivencia:.3f} ({api_supervivencia*100:.1f}%)")
        print(f"Géneros API: {json.dumps(api_generos, indent=2)}")
        
        # Verificar coincidencia
        print("\n-- COMPARACIÓN DE RESULTADOS --")
        print(f"Total partos coincide: {'✅' if total_partos == api_total else '❌'} (DB: {total_partos}, API: {api_total})")
        print(f"Partos último mes coincide: {'✅' if partos_mayo == api_ultimo_mes else '❌'} (DB: {partos_mayo}, API: {api_ultimo_mes})")
        print(f"Tasa supervivencia coincide: {'✅' if abs(tasa_supervivencia - api_supervivencia) < 0.01 else '❌'} (DB: {tasa_supervivencia:.3f}, API: {api_supervivencia:.3f})")
        
        for genero, total in ratio_generos.items():
            api_total_genero = api_generos.get(genero, 0)
            print(f"Género {genero} coincide: {'✅' if total == api_total_genero else '❌'} (DB: {total}, API: {api_total_genero})")
    
        # Obtener valores necesarios para actualizar el PartosSection
        print("\n-- VALORES PARA ACTUALIZAR EL DASHBOARD --")
        print(f"statsData.partos.total = {total_partos}")
        print(f"statsData.partos.ultimo_mes = {partos_mayo}")
        print(f"2025 (valor año actual) = {partos_2025}")
        print(f"statsData.partos.tasa_supervivencia = {tasa_supervivencia}")
        print(f"statsData.partos.por_genero_cria.M = {ratio_generos['M']}")
        print(f"statsData.partos.por_genero_cria.F = {ratio_generos['F']}")
        print(f"statsData.partos.por_genero_cria.esforrada = {ratio_generos['esforrada']}")

if __name__ == "__main__":
    main()
