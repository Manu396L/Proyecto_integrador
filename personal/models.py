from django.db import models

# Create your models here.
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