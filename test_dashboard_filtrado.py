import requests
import json

# Token de autenticación
token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJVc2VyUm9sZS5BRE1JTiIsImV4cCI6MTc0MzQ5MTg2OH0.M8gnVprY-U7kAshHgpUGaSu4rwUl1vq56sx9ZxI5dYE'
headers = {'Authorization': f'Bearer {token}'}

# 1. Probar resumen global
print("\n=== RESUMEN GLOBAL ===")
resumen_url = 'http://localhost:8000/api/v1/dashboard/resumen/'
resumen_response = requests.get(resumen_url, headers=headers)
if resumen_response.status_code == 200:
    resumen = resumen_response.json()
    print(json.dumps(resumen, indent=2))
else:
    print(f"Error al obtener resumen global: {resumen_response.status_code}")
    print(resumen_response.text)

# 2. Probar el filtrado por explotación Gurans (ID 321)
print("\n=== RESUMEN FILTRADO POR EXPLOTACIÓN ID 321 (Gurans) ===")
gurans_url = 'http://localhost:8000/api/v1/dashboard/resumen/?explotacio=321'
gurans_response = requests.get(gurans_url, headers=headers)
if gurans_response.status_code == 200:
    resumen_gurans = gurans_response.json()
    print(json.dumps(resumen_gurans, indent=2))
else:
    print(f"Error al obtener resumen para Gurans: {gurans_response.status_code}")
    print(gurans_response.text)

# 3. Probar el filtrado por explotación Madrid (ID 325)
print("\n=== RESUMEN FILTRADO POR EXPLOTACIÓN ID 325 (Madrid) ===")
madrid_url = 'http://localhost:8000/api/v1/dashboard/resumen/?explotacio=325'
madrid_response = requests.get(madrid_url, headers=headers)
if madrid_response.status_code == 200:
    resumen_madrid = madrid_response.json()
    print(json.dumps(resumen_madrid, indent=2))
else:
    print(f"Error al obtener resumen para Madrid: {madrid_response.status_code}")
    print(madrid_response.text)

# 4. Probar el filtrado por explotación Guadalajara (ID 322)
print("\n=== RESUMEN FILTRADO POR EXPLOTACIÓN ID 322 (Guadalajara) ===")
guadalajara_url = 'http://localhost:8000/api/v1/dashboard/resumen/?explotacio=322'
guadalajara_response = requests.get(guadalajara_url, headers=headers)
if guadalajara_response.status_code == 200:
    resumen_guadalajara = guadalajara_response.json()
    print(json.dumps(resumen_guadalajara, indent=2))
else:
    print(f"Error al obtener resumen para Guadalajara: {guadalajara_response.status_code}")
    print(guadalajara_response.text)
