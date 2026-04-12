# soporte/models.py
from django.db import models

class TicketSoporte(models.Model):
    CATEGORIAS = [
        ('tecnico', 'Problema Técnico'),
        ('cuenta', 'Problema con la Cuenta'),
        ('biometrico', 'Problema con el biométrico'),
        ('funcionalidad', 'Error de Funcionalidad'),
        ('otro', 'Otro'),
    ]
    
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En Proceso'),
        ('resuelto', 'Resuelto'),
    ]
    
    nombre = models.CharField(max_length=100, verbose_name='Nombre Completo')
    email = models.EmailField(verbose_name='Correo Electrónico')
    categoria = models.CharField(max_length=20, choices=CATEGORIAS, verbose_name='Categoría')
    asunto = models.CharField(max_length=200, verbose_name='Asunto')
    descripcion = models.TextField(verbose_name='Descripción')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente', verbose_name='Estado')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    
    def __str__(self):
        return f"{self.asunto} - {self.nombre}"
    
    class Meta:
        verbose_name = 'Ticket de Soporte'
        verbose_name_plural = 'Tickets de Soporte'
        ordering = ['-fecha_creacion']