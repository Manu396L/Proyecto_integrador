# acceso/models.py
from django.db import models
from personal.models import Persona
from dispositivos.models import Dispositivo

class RegistroAcceso(models.Model):
    TIPO_ACCESO = [
        ('ENTRADA', 'Entrada'),
        ('SALIDA', 'Salida'),
        ('DENEGADO', 'Denegado'),
    ]
    
    persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='accesos', null=True, blank=True)
    dispositivo = models.ForeignKey(Dispositivo, on_delete=models.CASCADE, null=True, blank=True)
    tipo_acceso = models.CharField(max_length=10, choices=TIPO_ACCESO, default='ENTRADA')
    fecha_hora = models.DateTimeField(auto_now_add=True)
    temperatura = models.FloatField(null=True, blank=True)
    motivo_denegado = models.CharField(max_length=200, blank=True, default='')
    
    def __str__(self):
        tipos = dict(self.TIPO_ACCESO)
        tipo_texto = tipos.get(self.tipo_acceso, self.tipo_acceso)
        return f"Acceso {tipo_texto} - {self.fecha_hora}"
    
    class Meta:
        verbose_name = 'Registro de Acceso'
        verbose_name_plural = 'Registros de Acceso'
        ordering = ['-fecha_hora']