# dispositivos/models.py
from django.db import models
import uuid

class Dispositivo(models.Model):
    TIPO_DISPOSITIVO = [
        ('huella', 'Lector de Huella'),
        ('tarjeta', 'Lector de Tarjeta'),
        ('facial', 'Reconocimiento Facial'),
        ('iris', 'Escáner de Iris'),
        ('multi', 'Multibiométrico'),
    ]
    
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('pausado', 'Pausado'),
        ('error', 'Error'),
        ('sin_conexion', 'Sin Conexión'),
        ('apagado', 'Apagado'),
    ]
    
    nombre = models.CharField(max_length=100, default='Dispositivo')
    numero_serie = models.CharField(max_length=50, unique=True, blank=True, null=True)  # ← Permitir nulo temporalmente
    tipo_sede = models.CharField(max_length=20, default='sede')
    area = models.CharField(max_length=100, default='General')
    direccion = models.CharField(max_length=200, blank=True, default='')
    direccion_ip = models.GenericIPAddressField(default='192.168.1.1')
    zona_horaria = models.CharField(max_length=50, default='America/Buenos_Aires')
    intervalo_solicitud = models.IntegerField(default=5)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo')
    tipo_dispositivo = models.CharField(max_length=20, choices=TIPO_DISPOSITIVO, default='huella')
    observaciones = models.TextField(blank=True, default='')
    ultima_conexion = models.DateTimeField(auto_now=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    api_key = models.CharField(max_length=100, unique=True, blank=True, default='')
    
    def save(self, *args, **kwargs):
        if not self.api_key:
            self.api_key = str(uuid.uuid4()).replace('-', '')[:32]
        if not self.numero_serie:
            self.numero_serie = f"SN-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.nombre} - {self.numero_serie}"
    
    class Meta:
        verbose_name = 'Dispositivo'
        verbose_name_plural = 'Dispositivos'