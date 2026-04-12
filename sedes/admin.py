from django.contrib import admin
from .models import Sede, Area

@admin.register(Sede)
class SedeAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'ciudad', 'email', 'activo', 'fecha_creacion')
    list_filter = ('activo', 'ciudad', 'fecha_creacion')
    search_fields = ('nombre', 'ciudad', 'email')
    readonly_fields = ('fecha_creacion',)
    fieldsets = (
        ('Información General', {
            'fields': ('nombre', 'direccion', 'ciudad', 'email')
        }),
        ('Contacto', {
            'fields': ('telefono', 'encargado')
        }),
        ('Estado', {
            'fields': ('activo', 'fecha_creacion')
        }),
    )

@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'sede', 'piso', 'nivel_seguridad', 'codigo_acceso')
    list_filter = ('nivel_seguridad', 'piso', 'sede')
    search_fields = ('nombre', 'codigo_acceso', 'descripcion')
    fieldsets = (
        ('Información General', {
            'fields': ('sede', 'nombre', 'descripcion', 'piso')
        }),
        ('Seguridad y Acceso', {
            'fields': ('codigo_acceso', 'nivel_seguridad')
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """Override para hacer logging cuando se guarda"""
        print(f"✅ Guardando área: {obj.nombre}")
        print(f"   Nivel de seguridad: {obj.nivel_seguridad}")
        super().save_model(request, obj, form, change)
        print(f"   ✅ Guardada con éxito")
