"""
Script para verificar que el endpoint de partos está enviando datos correctos.
Este script simula una petición directa al API y verifica la respuesta.
"""
import os
import sys
import requests
import json
from datetime import datetime, date, timedelta

# Añadir la ruta del proyecto
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# URL del API - usar URL local
API_URL = "http://127.0.0.1:8000/api/v1"

# Token JWT para autenticación (solo como prueba)
JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcxNTQ1NzI0N30.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

def verificar_endpoint_partos():
    """Verifica que el endpoint de partos retorna datos correctos"""
    print("\n== VERIFICANDO ENDPOINT DE PARTOS ==")
    
    # Headers incluyendo autenticación
    headers = {
        "Authorization": f"Bearer {JWT_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Fecha actual y hace un año para los parámetros
    hoy = date.today()
    hace_un_anio = date(hoy.year - 1, hoy.month, hoy.day)
    
    # Parámetros de consulta
    params = {
        "fecha_inicio": hace_un_anio.isoformat(),
        "fecha_fin": hoy.isoformat()
    }
    
    try:
        # Hacer la petición al endpoint
        print(f"Consultando {API_URL}/dashboard/partos")
        print(f"Parámetros: {params}")
        
        response = requests.get(
            f"{API_URL}/dashboard/partos",
            headers=headers,
            params=params
        )
        
        # Verificar status code
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            # Convertir respuesta a JSON
            data = response.json()
            
            # Mostrar respuesta completa
            print("\nRespuesta del API:")
            print(json.dumps(data, indent=2))
            
            # Verificar campos clave
            print("\nVerificación de valores:")
            print(f"- Total de partos: {data.get('total', 'N/A')}")
            
            # Verificar distribución mensual
            if 'por_mes' in data:
                print("\nDistribución mensual:")
                for mes, valor in data['por_mes'].items():
                    print(f"  {mes}: {valor}")
                
                # Calcular total según la distribución mensual
                total_mensual = sum(data['por_mes'].values())
                print(f"\nTotal según distribución mensual: {total_mensual}")
                
                # Verificar si coincide con el total reportado
                if total_mensual == data.get('total', 0):
                    print("✅ El total coincide con la suma de los valores mensuales")
                else:
                    print("❌ El total NO coincide con la suma de los valores mensuales")
                    print(f"  Diferencia: {data.get('total', 0) - total_mensual}")
            
            # Verificar distribución anual
            if 'distribucion_anual' in data:
                print("\nDistribución anual:")
                for anio, valor in data['distribucion_anual'].items():
                    print(f"  {anio}: {valor}")
                
                # Calcular total según la distribución anual
                total_anual = sum(data['distribucion_anual'].values())
                print(f"\nTotal según distribución anual: {total_anual}")
                
                # Verificar si coincide con el total reportado
                if total_anual == data.get('total', 0):
                    print("✅ El total coincide con la suma de los valores anuales")
                else:
                    print("❌ El total NO coincide con la suma de los valores anuales")
                    print(f"  Diferencia: {data.get('total', 0) - total_anual}")
            
            # Buscar específicamente valores hardcodeados
            print("\nBuscando valores sospechosos...")
            if data.get('por_mes', {}).get('Ene') == 1 and data.get('por_mes', {}).get('Feb') == 2 and data.get('por_mes', {}).get('May') == 1:
                print("❌ ALERTA: Se detectaron valores hardcodeados en la distribución mensual (Ene:1, Feb:2, May:1)")
            else:
                print("✅ No se detectaron valores hardcodeados en la distribución mensual")
                
            return data
        else:
            print(f"❌ Error: {response.status_code}")
            try:
                print(response.json())
            except:
                print(response.text)
            return None
    
    except Exception as e:
        print(f"❌ Error al consultar el API: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print(f"=== TEST DE VERIFICACIÓN DE ENDPOINT DE PARTOS ===")
    print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Ejecutar la verificación
    resultado = verificar_endpoint_partos()
    
    print("\n=== FIN DEL TEST ===")
