from django.db import models

class TicketSoporte(models.Model):
    CATEGORIAS = [
        ('tecnico', 'Problema Técnico'),
        ('cuenta', 'Problema con la Cuenta'),
        ('biometrico', 'Problema con el biométrico'),
        ('funcionalidad', 'Error de Funcionalidad'),
        ('otro', 'Otro'),
    ]
    
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En Proceso'),
        ('resuelto', 'Resuelto'),
    ]
    
    nombre = models.CharField(max_length=100)
    email = models.EmailField()
    categoria = models.CharField(max_length=20, choices=CATEGORIAS)
    asunto = models.CharField(max_length=200)
    descripcion = models.TextField()
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.asunto} - {self.nombre}"