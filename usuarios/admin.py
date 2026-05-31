from django.contrib import admin
from .models import SolicitudRegistro

@admin.register(SolicitudRegistro)
class SolicitudRegistroAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'dni', 'email', 'departamento', 'fecha_solicitud', 'estado']
    list_filter = ['estado', 'departamento', 'fecha_solicitud']
    search_fields = ['nombre', 'dni', 'email', 'telefono']
    readonly_fields = ['fecha_solicitud']
    list_per_page = 20
    
    fieldsets = (
        ('Datos Personales', {
            'fields': ('nombre', 'dni', 'email', 'telefono')
        }),
        ('Datos Laborales', {
            'fields': ('departamento', 'puesto', 'superior', 'fecha_ingreso')
        }),
        ('Estado de la Solicitud', {
            'fields': ('estado', 'observaciones')
        }),
        ('Información del Sistema', {
            'fields': ('fecha_solicitud',),
            'classes': ('collapse',)
        }),
    )