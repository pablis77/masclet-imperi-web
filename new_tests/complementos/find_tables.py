#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para listar todas las tablas en la base de datos
"""

import os
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

def list_tables():
    """Listar todas las tablas en la base de datos."""
    try:
        conn = psycopg2.connect(
            host=DB_CONFIG["host"],
            port=DB_CONFIG["port"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
            database=DB_CONFIG["database"]
        )
        
        cursor = conn.cursor()
        
        # Consulta para obtener todas las tablas
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        
        tables = cursor.fetchall()
        
        print("Tablas encontradas en la base de datos:")
        for table in tables:
            print(f"- {table[0]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error al conectar o consultar la base de datos: {e}")

if __name__ == "__main__":
    list_tables()
