#!/usr/bin/env python
import os
import django
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from personal.models import Persona

# Ruta de la imagen
image_path = r"C:\Users\dz09d\Downloads\VentaGarage\geles refri.png"

# Verificar que la imagen existe
if not os.path.exists(image_path):
    print(f"ERROR: La imagen no existe en {image_path}")
    exit(1)

print(f"✓ Imagen encontrada: {image_path}")

# Intentar obtener la persona con ID 5
try:
    persona = Persona.objects.get(id=5)
    print(f"✓ Persona encontrada: {persona.nombre_completo} (ID: {persona.id})")
except Persona.DoesNotExist:
    print("ERROR: No existe persona con ID 5")
    print("\nPersonas disponibles:")
    for p in Persona.objects.all():
        print(f"  - ID {p.id}: {p.nombre_completo}")
    exit(1)

# Cargar la imagen
try:
    with open(image_path, 'rb') as f:
        file_content = ContentFile(f.read(), name='geles_refri.png')
        persona.foto = file_content
        persona.save()
    
    print(f"✓ Imagen guardada exitosamente")
    print(f"  Ubicación: {persona.foto.path}")
    print(f"  URL: {persona.foto.url}")
    print(f"  Tamaño: {persona.foto.size} bytes")
    
except Exception as e:
    print(f"ERROR al guardar: {e}")
    import traceback
    traceback.print_exc()
    exit(1)
