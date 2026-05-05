#!/usr/bin/env python
import requests
import os

image_path = r"C:\Users\dz09d\Downloads\VentaGarage\geles refri.png"

# Primero hacer una solicitud GET al personal para obtener CSRF token
session = requests.Session()

# Simulando un POST a la API
url = "http://localhost:8000/personal/api/personal/"

# Datos del empleado
data = {
    'id': 'EMP-999',
    'nombre': 'Test Employee',
    'email': 'test@biometrika.com',
    'cargo': 'Tester',
    'area': 'ti',
    'tipo_sede': 'sede',
    'nombre_sede': 'Sede Central',
    'dispositivo': 'huella',
    'nivel_seguridad': 'medio',
    'credencial': 'test_credential',
}

# Preparar archivos
files = {
    'foto': open(image_path, 'rb'),
}

print("Enviando solicitud POST a:", url)
print("Datos:", data)
print("Imagen:", image_path)

try:
    response = session.post(url, data=data, files=files)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
finally:
    files['foto'].close()
