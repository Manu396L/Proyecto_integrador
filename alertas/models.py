# alertas/models.py
from django.db import models
from personal.models import Persona
from dispositivos.models import Dispositivo

class Alerta(models.Model):
    TIPO_ALERTA = [
        ('ACCESO_NO_AUTORIZADO', 'Acceso No Autorizado'),
        ('DISPOSITIVO_OFFLINE', 'Dispositivo Offline'),
        ('INTENTO_FALLIDO', 'Intento Fallido'),
        ('PUERTA_ABIERTA', 'Puerta Abierta'),
        ('MANTENIMIENTO', 'Mantenimiento Requerido'),
    ]
    
    NIVEL_ALERTA = [
        ('BAJA', 'Baja'),
        ('MEDIA', 'Media'),
        ('ALTA', 'Alta'),
        ('CRITICA', 'Crítica'),
    ]
    
    tipo = models.CharField(max_length=30, choices=TIPO_ALERTA, default='MANTENIMIENTO')
    nivel = models.CharField(max_length=10, choices=NIVEL_ALERTA, default='MEDIA')
    mensaje = models.TextField(default='')
    dispositivo = models.ForeignKey(Dispositivo, on_delete=models.CASCADE, null=True, blank=True)
    persona = models.ForeignKey(Persona, on_delete=models.CASCADE, null=True, blank=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    leida = models.BooleanField(default=False)
    resuelta = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.tipo} - {self.fecha_hora}"
    
    class Meta:
        verbose_name = 'Alerta'
        verbose_name_plural = 'Alertas'