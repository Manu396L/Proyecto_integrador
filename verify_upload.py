#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from personal.models import Persona

p = Persona.objects.get(id=5)
print(f"Persona: {p.nombre_completo}")
print(f"Foto guardada: {p.foto}")
print(f"Foto existe: {bool(p.foto)}")
if p.foto:
    print(f"Foto path: {p.foto.path}")
    print(f"Foto URL: {p.foto.url}")
    print(f"Foto tamaño: {p.foto.size}")
