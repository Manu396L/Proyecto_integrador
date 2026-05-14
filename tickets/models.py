from django.db import models
from django.contrib.auth.models import User

class Ticket(models.Model):
    ESTADO_CHOICES = [
        ('abierto', 'Abierto'),
        ('en_progreso', 'En Progreso'),
        ('resuelto', 'Resuelto'),
        ('cerrado', 'Cerrado'),
    ]
    
    PRIORIDAD_CHOICES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    ]
    
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='abierto')
    prioridad = models.CharField(max_length=20, choices=PRIORIDAD_CHOICES, default='media')
    creado_por = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets_creados', null=True, blank=True)
    asignado_a = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_asignados')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    remitente_nombre = models.CharField(max_length=200, blank=True, null=True)
    remitente_email = models.EmailField(blank=True, null=True)
    solucion = models.TextField(blank=True, null=True)
    fecha_resolucion = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"#{self.id} - {self.titulo}"
    
    class Meta:
        ordering = ['-fecha_creacion']