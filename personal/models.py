from django.db import models
from django.contrib.auth.models import User

class Persona(models.Model):
    TIPO_DOCUMENTO = [
        ('CC', 'Cédula'),
        ('CE', 'Cédula Extranjería'),
        ('PAS', 'Pasaporte'),
    ]
    
    TIPO_PERSONA = [
        ('RES', 'Residente'),
        ('VIS', 'Visitante'),
        ('EMP', 'Empleado'),
        ('ADM', 'Administrador'),
    ]
    
    AREA_CHOICES = [
        ('ti', 'TI'),
        ('rh', 'RH'),
        ('finanzas', 'Finanzas'),
        ('operaciones', 'Operaciones'),
        ('marketing', 'Marketing'),
        ('ventas', 'Ventas'),
    ]
    
    TIPO_SEDE = [
        ('sede', 'Sede Principal'),
        ('oficina', 'Oficina'),
        ('area', 'Área Específica'),
    ]
    
    DISPOSITIVO_BIOMETRICO = [
        ('huella', 'Huella'),
        ('tarjeta', 'Tarjeta'),
        ('pin', 'PIN'),
    ]
    
    NIVEL_SEGURIDAD = [
        ('bajo', 'Bajo'),
        ('medio', 'Medio'),
        ('alto', 'Alto'),
    ]
    
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    tipo_documento = models.CharField(max_length=3, choices=TIPO_DOCUMENTO)
    numero_documento = models.CharField(max_length=20, unique=True)
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    tipo_persona = models.CharField(max_length=3, choices=TIPO_PERSONA)
    email = models.EmailField()
    telefono = models.CharField(max_length=15)
    direccion = models.TextField()
    foto = models.ImageField(upload_to='fotos/', null=True, blank=True)
    
    # Campos nuevos para gestión de personal
    cargo = models.CharField(max_length=100, null=True, blank=True)
    area = models.CharField(max_length=50, choices=AREA_CHOICES, null=True, blank=True)
    tipo_sede = models.CharField(max_length=20, choices=TIPO_SEDE, default='sede')
    nombre_sede = models.CharField(max_length=100, default='Sede Central')
    dispositivo_biometrico = models.CharField(max_length=20, choices=DISPOSITIVO_BIOMETRICO, default='huella')
    credencial_biometrica = models.CharField(max_length=200, blank=True)
    nivel_seguridad = models.CharField(max_length=20, choices=NIVEL_SEGURIDAD, default='medio')
    
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.nombres} {self.apellidos} - {self.numero_documento}"
    
    @property
    def nombre_completo(self):
        return f"{self.nombres} {self.apellidos}"
    
    class Meta:
        verbose_name_plural = "Personas"
        

class RegistroAcceso(models.Model):
    TIPO_ACCESO = [
        ('ENTRADA', 'Entrada'),
        ('SALIDA', 'Salida'),
        ('DENEGADO', 'Denegado'),
    ]
    
    persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='accesos')
    dispositivo = models.ForeignKey('dispositivos.Dispositivo', on_delete=models.CASCADE)
    tipo_acceso = models.CharField(max_length=10, choices=TIPO_ACCESO)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    temperatura = models.FloatField(null=True, blank=True)
    motivo_denegado = models.CharField(max_length=200, blank=True)
    
    def __str__(self):
        return f"{self.persona.nombre_completo} - {self.get_tipo_acceso_display()} - {self.fecha_hora}"