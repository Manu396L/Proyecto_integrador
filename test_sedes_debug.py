#!/usr/bin/env python
"""
Script para debuggear problemas con sedes/areas
Proporciona instrucciones detalladas para diagnosticar el problema
"""
import os
import django
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from sedes.models import Sede, Area

def test_api_area_crear():
    """
    Test: POST a /sedes/api/areas/crear/
    Simula lo que hace el JavaScript frontend
    """
    print("\n" + "="*70)
    print("TEST 1: SIMULAR POST A /sedes/api/areas/crear/")
    print("="*70)
    
    # Obtener o crear una sede
    sede, created = Sede.objects.get_or_create(
        nombre='Sede Test Debug',
        defaults={
            'direccion': 'Test',
            'ciudad': 'Test',
            'email': 'test@test.com'
        }
    )
    print(f"✅ Sede: {sede.id} - {sede.nombre} {'(CREADA)' if created else '(EXISTENTE)'}")
    
    # Preparar datos como lo hace el JavaScript
    datos = {
        'sede_id': sede.id,
        'nombre': 'Área Test Debug',
        'descripcion': 'Test',
        'piso': 1,
        'codigo_acceso': 'TEST-DEBUG-001',
        'nivel_seguridad': 'alto'  # ← CAMPO CRÍTICO
    }
    
    print(f"\n📤 Datos a enviar:")
    print(json.dumps(datos, indent=2, ensure_ascii=False))
    
    # Enviar POST usando Django test client
    client = Client()
    response = client.post(
        '/sedes/api/areas/crear/',
        data=json.dumps(datos),
        content_type='application/json'
    )
    
    print(f"\n📥 Respuesta del servidor:")
    print(f"   Status: {response.status_code}")
    print(f"   Content-Type: {response.get('Content-Type', 'N/A')}")
    
    try:
        response_data = json.loads(response.content)
        print(f"   Body: {json.dumps(response_data, indent=2, ensure_ascii=False)}")
        
        if response_data.get('success'):
            print(f"\n✅ ÁREA CREADA EXITOSAMENTE")
            area_id = response_data.get('area_id')
            area = Area.objects.get(id=area_id)
            print(f"   ID: {area.id}")
            print(f"   Nombre: {area.nombre}")
            print(f"   Nivel Seguridad: {area.nivel_seguridad} ← VERIFICAR QUE SEA 'alto'")
        else:
            print(f"\n❌ ERROR: {response_data.get('message')}")
    except json.JSONDecodeError:
        print(f"   ❌ ERROR: Respuesta no es JSON válida")
        print(f"   Body: {response.content}")

def check_database():
    """Verificar qué hay en la base de datos"""
    print("\n" + "="*70)
    print("TEST 2: VERIFICAR BASE DE DATOS")
    print("="*70)
    
    sedes = Sede.objects.all()
    areas = Area.objects.all()
    
    print(f"\n📊 SEDES: {sedes.count()}")
    for sede in sedes:
        print(f"   ├─ ID {sede.id}: {sede.nombre}")
    
    print(f"\n📊 ÁREAS: {areas.count()}")
    for area in areas:
        print(f"   ├─ ID {area.id}: {area.nombre} (Nivel: {area.nivel_seguridad}, Sede: {area.sede_id})")
    
    if areas.count() == 0:
        print("\n   ⚠️  NO HAY ÁREAS EN LA BASE DE DATOS")

def test_api_get_areas():
    """Test: GET /sedes/api/areas/"""
    print("\n" + "="*70)
    print("TEST 3: GET /sedes/api/areas/")
    print("="*70)
    
    client = Client()
    response = client.get('/sedes/api/areas/')
    
    print(f"   Status: {response.status_code}")
    print(f"   Content-Length: {len(response.content)} bytes")
    
    try:
        data = json.loads(response.content)
        print(f"   Áreas retornadas: {len(data)}")
        if len(data) > 0:
            print(f"   ✅ Primer área: {data[0]}")
        else:
            print(f"   ⚠️  ARRAY VACÍO - No hay áreas")
    except:
        print(f"   Contenido: {response.content}")

if __name__ == '__main__':
    print("\n" + "█"*70)
    print("█ DEBUG SEDES/AREAS")
    print("█"*70)
    
    # 1. Verificar BD actual
    check_database()
    
    # 2. Intentar crear un área como lo hace el frontend
    test_api_area_crear()
    
    # 3. Verificar que se creó
    test_api_get_areas()
    
    print("\n" + "█"*70)
    print("█ FIN DE TESTS")
    print("█"*70 + "\n")
    
    print("""
📋 PRÓXIMOS PASOS:

1. Abre DevTools (F12) en el navegador
2. Ve a la pestaña "Console"
3. Ve a http://localhost:8000/sedes/
4. Llena el formulario:
   - Tipo: "Área Específica"
   - Nombre: "Test Debug"
   - Código: "TEST-DEBUG-001"
   - Nivel Seguridad: "Alto"
5. Haz clic en "Guardar Cambios"
6. Observa los logs en la consola del navegador

📊 BUSCA estos mensajes en orden:
   
   ✅ "===== GUARDAR UBICACION INICIADO ====="
      (Si no aparece → El formulario no se envía)
   
   ✅ "✅ Validación HTML PASADA"
      (Si no aparece → Falta un campo requerido)
   
   ✅ "--- LISTA PARA ENVIAR ---"
      (Si no aparece → Error antes del fetch)
      
   ✅ "--- RESPUESTA RECIBIDA DEL SERVIDOR ---"
      (Si no aparece → El servidor no recibe el request)

📝 Cuando veas estos logs, cópia los valores y reporta 
   exactamente qué valores tiene cada campo.
""")
