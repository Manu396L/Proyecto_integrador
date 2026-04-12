from django.db import models
from personal.models import Persona, RegistroAcceso
from dispositivos.models import Dispositivo

class Reporte(models.Model):
    TIPO_REPORTE = [
        ('ACCESO_DIARIO', 'Acceso Diario'),
        ('ACCESO_SEMANAL', 'Acceso Semanal'),
        ('ACCESO_MENSUAL', 'Acceso Mensual'),
        ('DISPOSITIVO', 'Estado de Dispositivos'),
        ('INCIDENTES', 'Incidentes de Seguridad'),
        ('CUMPLIMIENTO', 'Cumplimiento'),
        ('PERSONALIZADO', 'Personalizado'),
    ]
    
    ESTADO_REPORTE = [
        ('PENDIENTE', 'Pendiente'),
        ('PROCESANDO', 'Procesando'),
        ('COMPLETADO', 'Completado'),
        ('ERROR', 'Error'),
    ]
    
    titulo = models.CharField(max_length=200)
    tipo = models.CharField(max_length=20, choices=TIPO_REPORTE)
    estado = models.CharField(max_length=20, choices=ESTADO_REPORTE, default='PENDIENTE')
    descripcion = models.TextField(blank=True)
    
    # Rango de fechas
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_generacion = models.DateTimeField(null=True, blank=True)
    
    # Filtros
    dispositivo = models.ForeignKey(Dispositivo, on_delete=models.SET_NULL, null=True, blank=True)
    persona = models.ForeignKey(Persona, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Métricas
    total_registros = models.IntegerField(default=0)
    accesos_exitosos = models.IntegerField(default=0)
    accesos_fallidos = models.IntegerField(default=0)
    
    # Archivo
    archivo = models.FileField(upload_to='reportes/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.fecha_creacion.strftime('%d/%m/%Y')}"
    
    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name_plural = 'Reportes'


class ConfiguracionReporte(models.Model):
    """Almacena configuraciones de reportes periódicos automáticos"""
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=Reporte.TIPO_REPORTE)
    frecuencia = models.CharField(max_length=20, choices=[
        ('DIARIA', 'Diaria'),
        ('SEMANAL', 'Semanal'),
        ('MENSUAL', 'Mensual'),
    ])
    activa = models.BooleanField(default=True)
    email_destino = models.EmailField()
    
    def __str__(self):
        return f"{self.nombre} - {self.get_frecuencia_display()}"
    
    class Meta:
        verbose_name_plural = 'Configuraciones de Reportes'
