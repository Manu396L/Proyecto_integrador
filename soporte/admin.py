from django.contrib import admin
from .models import TicketSoporte

@admin.register(TicketSoporte)
class TicketSoporteAdmin(admin.ModelAdmin):
    list_display = ('asunto', 'nombre', 'categoria', 'estado', 'fecha_creacion')
    list_filter = ('estado', 'categoria', 'fecha_creacion')
    search_fields = ('nombre', 'email', 'asunto', 'descripcion')
    readonly_fields = ('fecha_creacion',)
    
    fieldsets = (
        ('Información del Usuario', {
            'fields': ('nombre', 'email')
        }),
        ('Ticket', {
            'fields': ('categoria', 'asunto', 'descripcion')
        }),
        ('Estado', {
            'fields': ('estado', 'fecha_creacion')
        }),
    )
