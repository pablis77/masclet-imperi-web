import requests
import time

print("Probando conexión al frontend...")
try:
    resp = requests.get('http://108.129.139.119/', timeout=5)
    print(f'Código: {resp.status_code}')
    print(f'Respuesta: {resp.text[:100]}...')
except Exception as e:
    print(f'Error: {e}')

print("\nProbando conexión a la API a través de Nginx...")
try:
    resp = requests.get('http://108.129.139.119/api/v1/health', timeout=5)
    print(f'Código: {resp.status_code}')
    print(f'Respuesta: {resp.text}')
except Exception as e:
    print(f'Error: {e}')
