# acceso/admin.py
from django.contrib import admin
from .models import RegistroAcceso

@admin.register(RegistroAcceso)
class RegistroAccesoAdmin(admin.ModelAdmin):
    list_display = ['persona', 'tipo_acceso', 'dispositivo', 'fecha_hora']
    list_filter = ['tipo_acceso', 'fecha_hora']
    search_fields = ['persona__nombres', 'persona__apellidos']
    readonly_fields = ['fecha_hora']