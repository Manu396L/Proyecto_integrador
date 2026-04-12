from django.db import models

class Sede(models.Model):
    nombre = models.CharField(max_length=100)
    direccion = models.TextField()
    ciudad = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15)
    email = models.EmailField()
    encargado = models.CharField(max_length=100)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        verbose_name_plural = "Sedes"

class Area(models.Model):
    NIVEL_SEGURIDAD_CHOICES = [
        ('bajo', 'Bajo'),
        ('medio', 'Medio'),
        ('alto', 'Alto'),
    ]
    
    DISPOSITIVO_CHOICES = [
        ('huella', 'Lector de Huella Dactilar'),
        ('Tarjeta', 'Tarjeta de Acceso'),
        ('PIN', 'PIN'),
    ]
    
    sede = models.ForeignKey(Sede, on_delete=models.CASCADE, related_name='areas')
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    piso = models.IntegerField()
    codigo_acceso = models.CharField(max_length=20, blank=True)
    dispositivo_biometrico = models.CharField(max_length=20, choices=DISPOSITIVO_CHOICES, default='huella')
    nivel_seguridad = models.CharField(max_length=20, choices=NIVEL_SEGURIDAD_CHOICES, default='medio')
    
    def __str__(self):
        return f"{self.sede.nombre} - {self.nombre}"