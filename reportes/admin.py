from django.contrib import admin
from .models import Reporte, ConfiguracionReporte

@admin.register(Reporte)
class ReporteAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'tipo', 'estado', 'fecha_creacion', 'total_registros', 'accesos_exitosos', 'accesos_fallidos')
    list_filter = ('tipo', 'estado', 'fecha_creacion')
    search_fields = ('titulo', 'descripcion')
    readonly_fields = ('fecha_creacion', 'fecha_generacion', 'total_registros', 'accesos_exitosos', 'accesos_fallidos')
    fieldsets = (
        ('Información General', {
            'fields': ('titulo', 'tipo', 'descripcion', 'estado')
        }),
        ('Rango de Fechas', {
            'fields': ('fecha_inicio', 'fecha_fin', 'fecha_creacion', 'fecha_generacion')
        }),
        ('Filtros', {
            'fields': ('dispositivo', 'persona')
        }),
        ('Métricas', {
            'fields': ('total_registros', 'accesos_exitosos', 'accesos_fallidos'),
        }),
        ('Archivo', {
            'fields': ('archivo',),
            'classes': ('collapse',)
        }),
    )

@admin.register(ConfiguracionReporte)
class ConfiguracionReporteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo', 'frecuencia', 'activa', 'email_destino')
    list_filter = ('tipo', 'frecuencia', 'activa')
    search_fields = ('nombre', 'email_destino')