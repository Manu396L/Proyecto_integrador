from django.contrib import admin
from .models import Sede, Area

@admin.register(Sede)
class SedeAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'codigo_unico', 'dispositivo_biometrico', 'nivel_seguridad', 'activo', 'fecha_creacion')
    list_filter = ('activo', 'nivel_seguridad', 'dispositivo_biometrico')
    search_fields = ('nombre', 'codigo_unico', 'direccion')
    readonly_fields = ('fecha_creacion',)
    fieldsets = (
        ('Información de la Sede', {
            'fields': ('nombre', 'codigo_unico', 'direccion')
        }),
        ('Configuración de Seguridad', {
            'fields': ('dispositivo_biometrico', 'nivel_seguridad')
        }),
        ('Estado', {
            'fields': ('activo', 'fecha_creacion')
        }),
    )

@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'sede', 'piso', 'dispositivo_biometrico', 'nivel_seguridad', 'codigo_acceso')
    list_filter = ('nivel_seguridad', 'dispositivo_biometrico', 'sede')
    search_fields = ('nombre', 'codigo_acceso')
    fieldsets = (
        ('Información del Área', {
            'fields': ('sede', 'nombre', 'piso', 'codigo_acceso')
        }),
        ('Configuración de Seguridad', {
            'fields': ('dispositivo_biometrico', 'nivel_seguridad')
        }),
    )