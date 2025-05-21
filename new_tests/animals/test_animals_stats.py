#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Test para verificar los datos reales de animales.
Este test obtiene directamente desde la base de datos:
1. Total de animales
2. Animales activos (estado=OK)
3. Animales fallecidos (estado=DEF)
4. Total de machos (activos)
5. Total de hembras (activas)
6. Vacas con diferentes estados de amamantamiento (alletar=0,1,2)
"""

import os
import sys
import psycopg2
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

def get_total_animales():
    """Obtener el número total de animales."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT COUNT(*) 
    FROM "animal"
    """
    
    cursor.execute(query)
    total = cursor.fetchone()[0]
    
    cursor.close()
    conn.close()
    
    return total

def get_animales_por_estado():
    """Obtener número de animales por estado (OK/DEF)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT estado, COUNT(*) 
    FROM "animal"
    GROUP BY estado
    """
    
    cursor.execute(query)
    estados = {row[0]: row[1] for row in cursor.fetchall()}
    
    cursor.close()
    conn.close()
    
    # Asegurar que tenemos valores para ambos estados
    estados['OK'] = estados.get('OK', 0)
    estados['DEF'] = estados.get('DEF', 0)
    
    return estados

def get_animales_por_genero():
    """Obtener número de animales por género (M/F)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT genere, COUNT(*) 
    FROM "animal"
    WHERE estado = 'OK'
    GROUP BY genere
    """
    
    cursor.execute(query)
    generos = {row[0]: row[1] for row in cursor.fetchall()}
    
    cursor.close()
    conn.close()
    
    # Asegurar que tenemos valores para ambos géneros
    generos['M'] = generos.get('M', 0)
    generos['F'] = generos.get('F', 0)
    
    return generos

def get_vacas_por_alletar():
    """Obtener número de vacas por estado de amamantamiento (alletar=0,1,2)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT alletar, COUNT(*) 
    FROM "animal"
    WHERE genere = 'F' AND estado = 'OK'
    GROUP BY alletar
    """
    
    cursor.execute(query)
    alletar = {row[0]: row[1] for row in cursor.fetchall()}
    
    cursor.close()
    conn.close()
    
    # Asegurar que tenemos valores para todos los estados
    alletar[0] = alletar.get(0, 0)
    alletar[1] = alletar.get(1, 0)
    alletar[2] = alletar.get(2, 0)
    
    return alletar

def main():
    """Función principal que ejecuta el test."""
    print("==== TEST DE DATOS DE ANIMALES ====")
    
    # Obtener datos directamente de la base de datos
    total_animales = get_total_animales()
    estados = get_animales_por_estado()
    generos = get_animales_por_genero()
    alletar = get_vacas_por_alletar()
    
    # Calcular ratios
    ratio_m_h = generos['M'] / generos['F'] if generos['F'] > 0 else 0
    
    print("\n-- DATOS DIRECTOS DE LA BASE DE DATOS --")
    print(f"Total de animales: {total_animales}")
    print(f"Animales activos (OK): {estados['OK']}")
    print(f"Animales fallecidos (DEF): {estados['DEF']}")
    print(f"Machos activos: {generos['M']}")
    print(f"Hembras activas: {generos['F']}")
    print(f"Ratio M/H: {ratio_m_h:.2f}")
    print(f"Vacas sin amamantar (alletar=0): {alletar[0]}")
    print(f"Vacas amamantando 1 ternero (alletar=1): {alletar[1]}")
    print(f"Vacas amamantando 2 terneros (alletar=2): {alletar[2]}")
    
    # Obtener valores necesarios para actualizar el Dashboard
    print("\n-- VALORES PARA ACTUALIZAR EL DASHBOARD --")
    print("Datos para adaptarDatosResumen:")
    print(f"const totalAnimales = {total_animales};")
    print(f"const totalActivos = {estados['OK']};")
    print(f"const totalFallecidos = {estados['DEF']};")
    print(f"const machos = {generos['M']};")
    print(f"const hembras = {generos['F']};")
    print(f"const alletar0 = {alletar[0]};")
    print(f"const alletar1 = {alletar[1]};")
    print(f"const alletar2 = {alletar[2]};")
    print(f"const ratio_m_h = {ratio_m_h:.2f};")

if __name__ == "__main__":
    main()
