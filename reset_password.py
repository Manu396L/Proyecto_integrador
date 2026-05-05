#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

# Resetear contraseña del usuario admin
user = User.objects.get(username='admin')
user.set_password('admin123')
user.save()
print("✓ Contraseña del usuario admin actualizada: admin123")
