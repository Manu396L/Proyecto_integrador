from django.contrib import admin
from .models import SolicitudRegistro

@admin.register(SolicitudRegistro)
class SolicitudRegistroAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'email', 'departamento', 'estado', 'fecha_solicitud')
    list_filter = ('estado', 'fecha_solicitud', 'departamento')
    search_fields = ('nombre', 'email', 'departamento')
    readonly_fields = ('fecha_solicitud',)
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('nombre', 'email', 'telefono')
        }),
        ('Información Laboral', {
            'fields': ('departamento', 'puesto', 'superior', 'fecha_ingreso')
        }),
        ('Estado', {
            'fields': ('estado', 'fecha_solicitud')
        }),
    )
