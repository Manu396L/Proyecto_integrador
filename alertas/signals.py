# alertas/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Alerta
from dispositivos.models import Dispositivo
from personal.models import Persona, RegistroAcceso
from sedes.models import Sede, Area


@receiver(post_save, sender=Dispositivo)
def alerta_cambio_estado_dispositivo(sender, instance, created, **kwargs):
    """Genera alerta cuando un dispositivo cambia de estado"""
    
    if not created:
        # Obtener el estado anterior (esto requiere un poco más de trabajo)
        # Por simplicidad, comparamos con el estado actual
        pass
    
    # Alerta por dispositivo offline (última conexión > 5 minutos)
    if instance.ultima_conexion:
        tiempo_sin_conexion = timezone.now() - instance.ultima_conexion
        if tiempo_sin_conexion > timedelta(minutes=5):
            # Verificar si ya existe una alerta similar no resuelta
            alerta_existente = Alerta.objects.filter(
                dispositivo=instance,
                tipo='DISPOSITIVO_OFFLINE',
                resuelta=False
            ).first()
            
            if not alerta_existente:
                Alerta.objects.create(
                    tipo='DISPOSITIVO_OFFLINE',
                    nivel='ALTA',
                    mensaje=f"Dispositivo '{instance.nombre}' sin conexión desde hace {tiempo_sin_conexion.seconds//60} minutos",
                    dispositivo=instance,
                )
    
    # Alerta por dispositivo en estado error
    if instance.estado in ['error', 'sin_conexion', 'apagado']:
        alerta_existente = Alerta.objects.filter(
            dispositivo=instance,
            tipo='DISPOSITIVO_OFFLINE',
            resuelta=False
        ).first()
        
        if not alerta_existente:
            Alerta.objects.create(
                tipo='DISPOSITIVO_OFFLINE',
                nivel='CRITICA',
                mensaje=f"Dispositivo '{instance.nombre}' está en estado: {instance.get_estado_display()}",
                dispositivo=instance,
            )


@receiver(post_save, sender=RegistroAcceso)
def alerta_intentos_fallidos(sender, instance, created, **kwargs):
    """Genera alerta cuando hay múltiples intentos fallidos de una persona"""
    
    if instance.tipo_acceso == 'fallido' and created:
        # Contar intentos fallidos en los últimos 10 minutos
        hace_10_min = timezone.now() - timedelta(minutes=10)
        intentos_fallidos = RegistroAcceso.objects.filter(
            persona=instance.persona,
            tipo_acceso='fallido',
            fecha_hora__gte=hace_10_min
        ).count()
        
        # Si hay más de 3 intentos fallidos en 10 minutos
        if intentos_fallidos >= 3:
            alerta_existente = Alerta.objects.filter(
                persona=instance.persona,
                tipo='INTENTO_FALLIDO',
                resuelta=False,
                fecha_hora__gte=hace_10_min
            ).first()
            
            if not alerta_existente:
                Alerta.objects.create(
                    tipo='INTENTO_FALLIDO',
                    nivel='MEDIA',
                    mensaje=f"La persona '{instance.persona.nombre_completo}' tiene {intentos_fallidos} intentos fallidos en los últimos 10 minutos",
                    persona=instance.persona,
                    dispositivo=instance.dispositivo,
                )


@receiver(post_save, sender=Sede)
def alerta_sede_creada(sender, instance, created, **kwargs):
    """Genera alerta informativa cuando se crea una nueva sede"""
    if created:
        Alerta.objects.create(
            tipo='MANTENIMIENTO',
            nivel='BAJA',
            mensaje=f"Nueva sede creada: '{instance.nombre}'",
        )


@receiver(post_save, sender=Area)
def alerta_area_creada(sender, instance, created, **kwargs):
    """Genera alerta informativa cuando se crea una nueva área"""
    if created:
        Alerta.objects.create(
            tipo='MANTENIMIENTO',
            nivel='BAJA',
            mensaje=f"Nueva área '{instance.nombre}' creada en la sede '{instance.sede.nombre}'",
        )


@receiver(post_save, sender=Persona)
def alerta_persona_creada(sender, instance, created, **kwargs):
    """Genera alerta informativa cuando se registra una nueva persona"""
    if created:
        Alerta.objects.create(
            tipo='MANTENIMIENTO',
            nivel='BAJA',
            mensaje=f"Nuevo personal registrado: '{instance.nombre_completo}' - Área: {instance.get_area_display()}",
        )