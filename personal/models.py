# personal/models.py
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
    tipo_documento = models.CharField(max_length=3, choices=TIPO_DOCUMENTO, default='CC')
    numero_documento = models.CharField(max_length=20, unique=True, default='00000000')
    nombres = models.CharField(max_length=100, default='')
    apellidos = models.CharField(max_length=100, default='')
    tipo_persona = models.CharField(max_length=3, choices=TIPO_PERSONA, default='EMP')
    email = models.EmailField(default='')
    telefono = models.CharField(max_length=15, default='')
    direccion = models.TextField(blank=True, default='')
    foto = models.ImageField(upload_to='fotos/', null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.nombres} {self.apellidos}"
    
    @property
    def nombre_completo(self):
        return f"{self.nombres} {self.apellidos}"
    
    class Meta:
        verbose_name = 'Persona'
        verbose_name_plural = 'Personas'