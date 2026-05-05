#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from personal.models import Persona

# Verificar personas recientes
personas = Persona.objects.all().order_by('-id')[:5]

print("=" * 60)
print("ÚLTIMAS 5 PERSONAS REGISTRADAS")
print("=" * 60)

for p in personas:
    print(f"\nID: {p.id}")
    print(f"Nombre: {p.nombre_completo}")
    print(f"Foto: {p.foto}")
    if p.foto:
        print(f"  ✓ Foto guardada: SI")
        print(f"  Path: {p.foto.path}")
        print(f"  URL: {p.foto.url}")
        print(f"  Tamaño: {p.foto.size} bytes")
    else:
        print(f"  ✗ Foto guardada: NO")
