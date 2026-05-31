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
        ('GENERAL', 'Reporte General del Sistema'),
        ('SEGURIDAD', 'Reporte de Seguridad'),
        ('USUARIOS', 'Reporte de Usuarios'),
        ('TICKETS', 'Reporte de Tickets'),
        ('ALERTAS', 'Reporte de Alertas'),
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
    
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_generacion = models.DateTimeField(null=True, blank=True)
    
    dispositivo = models.ForeignKey(Dispositivo, on_delete=models.SET_NULL, null=True, blank=True)
    persona = models.ForeignKey(Persona, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Métricas generales
    total_registros = models.IntegerField(default=0)
    accesos_exitosos = models.IntegerField(default=0)
    accesos_fallidos = models.IntegerField(default=0)
    
    # Métricas de usuarios
    usuarios_nuevos = models.IntegerField(default=0)
    usuarios_eliminados = models.IntegerField(default=0)
    usuarios_modificados = models.IntegerField(default=0)
    usuarios_activos = models.IntegerField(default=0)
    usuarios_inactivos = models.IntegerField(default=0)
    
    # Métricas de sedes y áreas
    sedes_nuevas = models.IntegerField(default=0)
    sedes_eliminadas = models.IntegerField(default=0)
    sedes_modificadas = models.IntegerField(default=0)
    areas_nuevas = models.IntegerField(default=0)
    areas_eliminadas = models.IntegerField(default=0)
    
    # Métricas de dispositivos
    dispositivos_nuevos = models.IntegerField(default=0)
    dispositivos_eliminados = models.IntegerField(default=0)
    dispositivos_modificados = models.IntegerField(default=0)
    dispositivos_activos = models.IntegerField(default=0)
    dispositivos_inactivos = models.IntegerField(default=0)
    dispositivos_conectados = models.IntegerField(default=0)
    dispositivos_desconectados = models.IntegerField(default=0)
    
    # Métricas de tickets/soporte
    tickets_totales = models.IntegerField(default=0)
    tickets_pendientes = models.IntegerField(default=0)
    tickets_en_proceso = models.IntegerField(default=0)
    tickets_solucionados = models.IntegerField(default=0)
    tickets_cerrados = models.IntegerField(default=0)
    
    # Métricas de solicitudes de soporte
    solicitudes_soporte_totales = models.IntegerField(default=0)
    solicitudes_soporte_pendientes = models.IntegerField(default=0)
    solicitudes_soporte_atendidas = models.IntegerField(default=0)
    
    # Métricas de alertas
    alertas_criticas = models.IntegerField(default=0)
    alertas_problematicas = models.IntegerField(default=0)
    alertas_estables = models.IntegerField(default=0)
    alertas_informativas = models.IntegerField(default=0)
    alertas_totales = models.IntegerField(default=0)
    
    # Métricas de seguridad
    inicios_sesion_exitosos = models.IntegerField(default=0)
    inicios_sesion_fallidos = models.IntegerField(default=0)
    intentos_bloqueados = models.IntegerField(default=0)
    
    # Métricas de rendimiento
    tiempo_promedio_respuesta = models.FloatField(default=0)  # en segundos
    tasa_exito_global = models.FloatField(default=0)  # porcentaje
    
    # Archivo
    archivo = models.FileField(upload_to='reportes/', null=True, blank=True)
    datos_json = models.JSONField(default=dict, blank=True)  # Guarda datos estructurados
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.fecha_creacion.strftime('%d/%m/%Y')}"
    
    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name_plural = 'Reportes'


class ConfiguracionReporte(models.Model):
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