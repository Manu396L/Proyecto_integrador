#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from usuarios.models import SolicitudRegistro

# Crear usuario con email maria@test.com
user, created = User.objects.get_or_create(
    email='maria@test.com',
    defaults={'username': 'maria', 'first_name': 'Maria', 'last_name': 'Gonzalez'}
)

if created:
    user.set_password('password123')
    user.save()
    print(f"✅ Usuario creado: {user.username}, {user.email}")
else:
    print(f"ℹ️ Usuario ya existe: {user.username}, {user.email}")

# Mostrar todas las solicitudes de este email
solicitudes = SolicitudRegistro.objects.filter(email='maria@test.com')
print(f"\n📋 Solicitudes de maria@test.com: {solicitudes.count()}")
for s in solicitudes:
    print(f"   - ID: {s.id}, Departamento: {s.departamento}, Fecha: {s.fecha_solicitud}")

print("\n✅ Credenciales para login:")
print("   Usuario: maria")
print("   Email: maria@test.com")
print("   Contraseña: password123")
