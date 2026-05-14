# dispositivos/models.py
from django.db import models
import uuid

class Dispositivo(models.Model):
    TIPO_DISPOSITIVO_CHOICES = [
        ('pin', 'Solo PIN'),
        ('huella', 'Solo Huella Digital'),
        ('tarjeta', 'Solo Tarjeta RFID'),
        ('pin_huella', 'PIN + Huella'),
        ('pin_tarjeta', 'PIN + Tarjeta'),
        ('huella_tarjeta', 'Huella + Tarjeta'),
    ]
    
    MODELO_DISPOSITIVO_CHOICES = [
        ('reloj_ip65', 'Control de Acceso por Huella – Reloj – IP – IP65'),
        ('molinete_zk', 'Molinete Biométrico ZK TS2022'),
    ]
    
    TIPO_SEDE_CHOICES = [
        ('sede', 'Sede Principal'),
        ('oficina', 'Oficina'),
        ('area', 'Área Específica'),
        ('almacen', 'Almacén'),
    ]
    
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('pausado', 'Pausado'),
        ('error', 'Error'),
        ('sin_conexion', 'Sin Conexión'),
        ('apagado', 'Apagado'),
    ]
    
    ZONA_HORARIA_CHOICES = [
        ('America/Mexico_City', 'CDMX (UTC-6)'),
        ('America/Bogota', 'Bogotá (UTC-5)'),
        ('America/Buenos_Aires', 'Buenos Aires (UTC-3)'),
        ('America/Lima', 'Lima (UTC-5)'),
        ('America/Santiago', 'Santiago (UTC-4)'),
    ]
    
    # Información Básica
    nombre = models.CharField(max_length=100, verbose_name='Nombre del Dispositivo')
    numero_serie = models.CharField(max_length=50, unique=True, verbose_name='Número de Serie')
    tipo_sede = models.CharField(max_length=20, choices=TIPO_SEDE_CHOICES, verbose_name='Tipo de Sede')
    area = models.CharField(max_length=100, verbose_name='Área/Ubicación')
    direccion = models.CharField(max_length=200, blank=True, verbose_name='Dirección Física')
    
    # Configuración de Red
    direccion_ip = models.GenericIPAddressField(verbose_name='Dirección IP')
    zona_horaria = models.CharField(max_length=50, choices=ZONA_HORARIA_CHOICES, verbose_name='Zona Horaria')
    intervalo_solicitud = models.IntegerField(default=5, verbose_name='Intervalo de Solicitud (minutos)')
    
    # Estado y Configuración
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo', verbose_name='Estado')
    tipo_dispositivo = models.CharField(max_length=20, choices=TIPO_DISPOSITIVO_CHOICES, default='pin_huella', verbose_name='Tipo de Dispositivo')
    modelo_dispositivo = models.CharField(max_length=50, choices=MODELO_DISPOSITIVO_CHOICES, default='reloj_ip65', verbose_name='Modelo del Dispositivo')
    observaciones = models.TextField(blank=True, verbose_name='Observaciones')
    
    # Modelos cargados manualmente (solo para dispositivos con huella)
    modelos_cargados = models.TextField(blank=True, verbose_name='Modelos Cargados (JSON)')
    ultima_carga_modelos = models.DateTimeField(blank=True, null=True, verbose_name='Última Carga de Modelos')
    
    # Auditoría
    ultima_conexion = models.DateTimeField(auto_now=True, verbose_name='Última Conexión')
    fecha_registro = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Registro')
    api_key = models.CharField(max_length=100, unique=True, blank=True, verbose_name='API Key')
    
    def save(self, *args, **kwargs):
        if not self.api_key:
            self.api_key = str(uuid.uuid4()).replace('-', '')[:32]
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.nombre} - {self.numero_serie}"
    
    class Meta:
        verbose_name = 'Dispositivo'
        verbose_name_plural = 'Dispositivos'
        ordering = ['nombre']