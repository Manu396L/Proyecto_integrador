from django.db import models

class Sede(models.Model):
    nombre = models.CharField(max_length=100)
    direccion = models.TextField(blank=True)
    ciudad = models.CharField(max_length=100, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        verbose_name = 'Sede'
        verbose_name_plural = 'Sedes'


class Area(models.Model):
    sede = models.ForeignKey(Sede, on_delete=models.CASCADE, related_name='areas')
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    piso = models.IntegerField(default=1)
    
    def __str__(self):
        return f"{self.sede.nombre} - {self.nombre}"
    
    class Meta:
        verbose_name = 'Área'
        verbose_name_plural = 'Áreas'