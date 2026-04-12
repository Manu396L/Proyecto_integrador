from django.db import models
from django.utils import timezone

class SolicitudRegistro(models.Model):
    """Modelo para almacenar las solicitudes de registro de nuevos usuarios"""
    nombre = models.CharField(max_length=150)
    email = models.EmailField()
    telefono = models.CharField(max_length=20)
    departamento = models.CharField(max_length=100)
    puesto = models.CharField(max_length=100)
    superior = models.CharField(max_length=150, blank=True, null=True)
    fecha_ingreso = models.DateField(blank=True, null=True)
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(
        max_length=20,
        choices=[
            ('pendiente', 'Pendiente'),
            ('aprobado', 'Aprobado'),
            ('rechazado', 'Rechazado'),
        ],
        default='pendiente'
    )
    
    class Meta:
        verbose_name = 'Solicitud de Registro'
        verbose_name_plural = 'Solicitudes de Registro'
        ordering = ['-fecha_solicitud']
    
    def __str__(self):
        return f"{self.nombre} - {self.estado}"
