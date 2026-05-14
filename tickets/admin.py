from django.contrib import admin
from .models import Ticket

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'estado', 'prioridad', 'creado_por', 'asignado_a', 'fecha_creacion')
    list_filter = ('estado', 'prioridad', 'fecha_creacion')
    search_fields = ('titulo', 'descripcion')
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')
    fieldsets = (
        ('Información Básica', {
            'fields': ('titulo', 'descripcion')
        }),
        ('Estado y Prioridad', {
            'fields': ('estado', 'prioridad')
        }),
        ('Asignación', {
            'fields': ('creado_por', 'asignado_a')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion')
        }),
    )
