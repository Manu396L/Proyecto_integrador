#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from personal.models import Persona
from sedes.models import Sede
from dispositivos.models import Dispositivo

print("📋 PERSONAL CREADO:")
for p in Persona.objects.all():
    print(f"  ✅ ID {p.id}: {p.nombre_completo} ({p.email})")

print("\n🏢 SEDES CREADAS:")
for s in Sede.objects.all():
    print(f"  ✅ ID {s.id}: {s.nombre} ({s.ciudad})")

print("\n🔧 DISPOSITIVOS CREADOS:")
for d in Dispositivo.objects.all():
    print(f"  ✅ ID {d.id}: {d.nombre} (IP: {d.direccion_ip})")
