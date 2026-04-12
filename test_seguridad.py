#!/usr/bin/env python
"""
Script para testear el guardado del nivel_seguridad en sedes/áreas
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from sedes.models import Sede, Area

print("\n" + "="*60)
print("TEST: Guardar nivel de seguridad en áreas")
print("="*60)

# Obtener o crear una sede de prueba
sede, created = Sede.objects.get_or_create(
    nombre='Sede Test',
    defaults={
        'direccion': 'Calle Test',
        'ciudad': 'Test City',
        'telefono': '1234567890',
        'email': 'test@test.com',
        'encargado': 'Test User'
    }
)
print(f"\n✅ Sede: {sede.nombre} (ID: {sede.id})")

# Crear área con nivel alto
print("\n📝 Creando área con nivel_seguridad='alto'...")
area = Area.objects.create(
    sede=sede,
    nombre='Área Test Alto',
    descripcion='Test area',
    piso=1,
    codigo_acceso='TEST-ALT',
    nivel_seguridad='alto'
)
print(f"✅ Área creada: {area.nombre}")

# Verificar que se guardó correctamente
area_db = Area.objects.get(id=area.id)
print(f"\n🔍 Verificando datos en BD:")
print(f"   Nombre: {area_db.nombre}")
print(f"   Código: {area_db.codigo_acceso}")
print(f"   Nivel (desde ORM): {area_db.nivel_seguridad}")
print(f"   Choices disponibles: {Area._meta.get_field('nivel_seguridad').choices}")

# Verificar que se devuelve correctamente en API
print(f"\n📊 Simulando respuesta API:")
from django.http import JsonResponse
import json

api_response = {
    'id': area_db.id,
    'sede_id': area_db.sede.id,
    'nombre': area_db.nombre,
    'codigo_acceso': area_db.codigo_acceso,
    'nivel_seguridad': area_db.nivel_seguridad,
    'piso': area_db.piso
}

print(f"   JSON que iría a frontend: {json.dumps(api_response, indent=2)}")

# Test actualización
print(f"\n📝 Actualizando a nivel_seguridad='bajo'...")
area_db.nivel_seguridad = 'bajo'
area_db.save()

area_actualizada = Area.objects.get(id=area.id)
print(f"✅ Actualizada: {area_actualizada.nivel_seguridad}")

# Cleanup
print(f"\n🗑️  Limpiando...")
area_db.delete()
sede.delete()
print("✅ Test completado\n")
