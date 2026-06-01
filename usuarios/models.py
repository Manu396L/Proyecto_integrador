from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class SolicitudRegistro(models.Model):
    """Modelo para almacenar las solicitudes de registro de nuevos usuarios"""
    nombre = models.CharField(max_length=150)
    dni = models.CharField(max_length=20, verbose_name='DNI')
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
        return f"{self.nombre} - {self.dni} - {self.estado}"

class Notificacion(models.Model):
    TIPO_NOTIFICACION = [
        ('ALERTA', 'Alerta del Sistema'),
        ('DISPOSITIVO', 'Dispositivo'),
        ('PERSONAL', 'Personal'),
        ('SEDE', 'Sede/Área'),
        ('REPORTE', 'Reporte'),
        ('BACKUP', 'Backup'),
        ('CONFIGURACION', 'Configuración'),
        ('SEGURIDAD', 'Seguridad'),
        ('MANTENIMIENTO', 'Mantenimiento'),
    ]
    
    PRIORIDAD = [
        ('critica', 'Crítica'),
        ('alta', 'Alta'),
        ('media', 'Media'),
        ('baja', 'Baja'),
        ('informativa', 'Informativa'),
    ]
    
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField()
    tipo = models.CharField(max_length=20, choices=TIPO_NOTIFICACION)
    prioridad = models.CharField(max_length=20, choices=PRIORIDAD, default='informativa')
    leida = models.BooleanField(default=False)
    usuario_destino = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    datos_extra = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name_plural = "Notificaciones"
    
    def __str__(self):
        return f"{self.titulo} - {self.fecha_creacion}"


class ConfiguracionNotificacion(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='config_notificaciones')
    
    notificar_alertas = models.BooleanField(default=True)
    notificar_dispositivos = models.BooleanField(default=True)
    notificar_personal = models.BooleanField(default=True)
    notificar_sedes = models.BooleanField(default=True)
    notificar_reportes = models.BooleanField(default=True)
    notificar_backup = models.BooleanField(default=True)
    notificar_configuracion = models.BooleanField(default=True)
    notificar_seguridad = models.BooleanField(default=True)
    
    prioridad_minima = models.CharField(max_length=20, choices=Notificacion.PRIORIDAD, default='baja')
    email_notificaciones = models.BooleanField(default=False)
    email_destino = models.EmailField(blank=True, null=True)
    
    def __str__(self):
        return f"Configuración de {self.usuario.username}"