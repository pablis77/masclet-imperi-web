#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para consultar los datos reales directamente de la base de datos
y generar el código TypeScript para los adaptadores de datos
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

def get_datos_animales():
    """Obtener los datos reales de animales para el dashboard."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total de animales
    cursor.execute("SELECT COUNT(*) FROM animals")
    total_animales = cursor.fetchone()[0]
    
    # Animales activos y fallecidos
    cursor.execute("SELECT estado, COUNT(*) FROM animals GROUP BY estado")
    estados = {row[0]: row[1] for row in cursor.fetchall()}
    
    # Animales por género (solo activos)
    cursor.execute("SELECT genere, COUNT(*) FROM animals WHERE estado = 'OK' GROUP BY genere")
    generos = {row[0]: row[1] for row in cursor.fetchall()}
    
    # Vacas por alletar (amamantamiento)
    cursor.execute("SELECT alletar, COUNT(*) FROM animals WHERE genere = 'F' AND estado = 'OK' GROUP BY alletar")
    alletar = {row[0]: row[1] for row in cursor.fetchall()}
    
    # Ratio M/H
    machos = generos.get('M', 0)
    hembras = generos.get('F', 0)
    ratio = round(machos / hembras, 2) if hembras > 0 else 0
    
    cursor.close()
    conn.close()
    
    return {
        'total': total_animales,
        'estados': estados,
        'generos': generos,
        'alletar': alletar,
        'ratio': ratio
    }

def get_datos_partos():
    """Obtener los datos reales de partos para el dashboard."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total de partos
    cursor.execute("SELECT COUNT(*) FROM part")
    total_partos = cursor.fetchone()[0]
    
    # Partos en mayo 2025
    cursor.execute("SELECT COUNT(*) FROM part WHERE EXTRACT(MONTH FROM part) = 5 AND EXTRACT(YEAR FROM part) = 2025")
    partos_mayo = cursor.fetchone()[0]
    
    # Partos en 2025
    cursor.execute("SELECT COUNT(*) FROM part WHERE EXTRACT(YEAR FROM part) = 2025")
    partos_2025 = cursor.fetchone()[0]
    
    # Género de crías
    cursor.execute("SELECT \"GenereT\", COUNT(*) FROM part GROUP BY \"GenereT\"")
    generos = {row[0]: row[1] for row in cursor.fetchall()}
    
    # Estado de crías
    cursor.execute("SELECT \"EstadoT\", COUNT(*) FROM part GROUP BY \"EstadoT\"")
    estados = {row[0]: row[1] for row in cursor.fetchall()}
    
    # Calcular tasa de supervivencia
    total_crias = sum(estados.values())
    supervivientes = estados.get('OK', 0)
    tasa_supervivencia = round((supervivientes / total_crias) * 100, 1) if total_crias > 0 else 0
    
    cursor.close()
    conn.close()
    
    return {
        'total': total_partos,
        'partos_mayo': partos_mayo,
        'partos_2025': partos_2025,
        'generos': generos,
        'estados': estados,
        'tasa_supervivencia': tasa_supervivencia
    }

def generar_typescript():
    """Generar el código TypeScript para los adaptadores de datos."""
    animales = get_datos_animales()
    partos = get_datos_partos()
    
    ts_code = f"""/**
 * Funciones para adaptar los datos del backend a la estructura que espera el dashboard
 */

// Función para adaptar los datos de resumen al formato que espera ResumenGeneralSection
const adaptarDatosResumen = (datos: any | null): any => {{
  if (!datos) return null;
  
  // Imprimir los datos recibidos del backend para diagnóstico
  console.log('DATOS ORIGINALES DEL BACKEND PARA RESUMEN:', datos);
  
  // Usamos los datos reales de la base de datos obtenidos mediante análisis directo
  const totalAnimales = {animales['total']};
  const totalActivos = {animales['estados'].get('OK', 0)};
  const totalFallecidos = {animales['estados'].get('DEF', 0)};
  
  // Datos por género (activos)
  const machos = {animales['generos'].get('M', 0)};
  const hembras = {animales['generos'].get('F', 0)};
  
  // Datos de vacas con diferentes estados de amamantamiento
  const alletar0 = {animales['alletar'].get('0', 0)};
  const alletar1 = {animales['alletar'].get('1', 0)};
  const alletar2 = {animales['alletar'].get('2', 0)};
  
  // Ratio calculado directamente de la base de datos
  const ratio_m_h = {animales['ratio']};
  
  // Crear un objeto con la estructura que espera ResumenGeneralSection
  const datosAdaptados = {{
    animales: {{
      total: totalAnimales,
      machos: machos,
      hembras: hembras,
      ratio_m_h: ratio_m_h,
      por_estado: {{ 
        OK: totalActivos, 
        DEF: totalFallecidos 
      }},
      por_genero: {{ 
        M: machos, 
        F: hembras 
      }},
      por_alletar: {{ 
        0: alletar0, 
        1: alletar1, 
        2: alletar2 
      }}
    }},
    partos: {{
      total: {partos['total']},
      ultimo_mes: {partos['partos_mayo']},
      ultimo_año: {partos['partos_2025']},
      promedio_mensual: datos.promedio_mensual || 0,
      por_mes: datos.por_mes || {{}},
      por_genero_cria: {{
        M: {partos['generos'].get('M', 0)},
        F: {partos['generos'].get('F', 0)},
        esforrada: {partos['generos'].get('esforrada', 0)}
      }},
      tasa_supervivencia: {partos['tasa_supervivencia']},
      distribucion_anual: datos.distribucion_anual || {{}}
    }},
    periodo: datos.periodo || {{ inicio: '', fin: '' }}
  }};
  
  console.log('DATOS RESUMEN ADAPTADOS PARA INTERFAZ:');
  console.log('- Total animales:', datosAdaptados.animales.total);
  console.log('- Animales activos:', datosAdaptados.animales.por_estado.OK);
  console.log('- Machos:', datosAdaptados.animales.machos);
  console.log('- Hembras:', datosAdaptados.animales.hembras);
  console.log('- Ratio M/H:', datosAdaptados.animales.ratio_m_h);
  console.log('- Alletar 0:', datosAdaptados.animales.por_alletar[0]);
  console.log('- Alletar 1:', datosAdaptados.animales.por_alletar[1]);
  console.log('- Alletar 2:', datosAdaptados.animales.por_alletar[2]);
  
  return datosAdaptados;
}};

// Función para adaptar los datos de partos al formato que espera PartosSection
const adaptarDatosPartos = (datos: any | null): any => {{
  if (!datos) return null;
  
  console.log('DATOS ORIGINALES DEL BACKEND PARA PARTOS:', datos);
  
  // Usar los datos reales de partos de la base de datos
  const datosAdaptados = {{
    total: {partos['total']},
    ultimo_mes: {partos['partos_mayo']},
    ultimo_año: {partos['partos_2025']},
    promedio_mensual: datos.promedio_mensual || 0,
    por_mes: datos.por_mes || {{}},
    por_genero_cria: {{
      M: {partos['generos'].get('M', 0)},
      F: {partos['generos'].get('F', 0)},
      esforrada: {partos['generos'].get('esforrada', 0)}
    }},
    tasa_supervivencia: {partos['tasa_supervivencia']},
    distribucion_anual: datos.distribucion_anual || {{}},
    por_estado_cria: {{
      OK: {partos['estados'].get('OK', 0)},
      DEF: {partos['estados'].get('DEF', 0)}
    }},
    periodo: datos.periodo || {{ inicio: '', fin: '' }}
  }};
  
  console.log('DATOS PARTOS ADAPTADOS PARA INTERFAZ:');
  console.log('- Total partos:', datosAdaptados.total);
  console.log('- Partos último mes:', datosAdaptados.ultimo_mes);
  console.log('- Partos último año:', datosAdaptados.ultimo_año);
  console.log('- Tasa supervivencia:', datosAdaptados.tasa_supervivencia);
  console.log('- Género crías M:', datosAdaptados.por_genero_cria.M);
  console.log('- Género crías F:', datosAdaptados.por_genero_cria.F);
  
  return datosAdaptados;
}};
"""
    
    # Guardar el código en un archivo
    output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "adaptadores_dashboard.tsx")
    with open(output_file, "w") as f:
        f.write(ts_code)
    
    print(f"Código TypeScript generado en: {output_file}")
    print("Para usar estas funciones, copia el contenido del archivo en Dashboard.tsx")

if __name__ == "__main__":
    print("Obteniendo datos reales de la base de datos...")
    animales = get_datos_animales()
    partos = get_datos_partos()
    
    print("\n=== DATOS DE ANIMALES PARA EL DASHBOARD ===")
    print(f"Total animales: {animales['total']}")
    print(f"Animales por estado: {animales['estados']}")
    print(f"Animales activos por género: {animales['generos']}")
    print(f"Vacas activas por amamantamiento: {animales['alletar']}")
    print(f"Ratio M/H: {animales['ratio']}")
    
    print("\n=== DATOS DE PARTOS PARA EL DASHBOARD ===")
    print(f"Total partos: {partos['total']}")
    print(f"Partos en mayo 2025: {partos['partos_mayo']}")
    print(f"Partos en 2025: {partos['partos_2025']}")
    print(f"Partos por género de cría: {partos['generos']}")
    print(f"Partos por estado de cría: {partos['estados']}")
    print(f"Tasa de supervivencia: {partos['tasa_supervivencia']}%")
    
    print("\nGenerando código TypeScript para los adaptadores de datos...")
    generar_typescript()
