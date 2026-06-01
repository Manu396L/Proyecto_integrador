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
    """Genera alerta cuando un dispositivo cambia de estado o se crea"""
    
    if created:
        Alerta.objects.create(
            tipo='MANTENIMIENTO',
            nivel='BAJA',
            mensaje=f" Nuevo dispositivo registrado: '{instance.nombre}'",
            dispositivo=instance,
        )
        return
    
    if instance.estado in ['error', 'sin_conexion', 'apagado', 'inactivo']:
        alerta_existente = Alerta.objects.filter(
            dispositivo=instance,
            tipo='DISPOSITIVO_OFFLINE',
            resuelta=False
        ).first()
        
        if not alerta_existente:
            Alerta.objects.create(
                tipo='DISPOSITIVO_OFFLINE',
                nivel='CRITICA',
                mensaje=f" DISPOSITIVO CRÍTICO: '{instance.nombre}' - Estado: {instance.get_estado_display()}",
                dispositivo=instance,
            )
    
    elif instance.estado == 'pausado':
        alerta_existente = Alerta.objects.filter(
            dispositivo=instance,
            tipo='MANTENIMIENTO',
            resuelta=False
        ).first()
        
        if not alerta_existente:
            Alerta.objects.create(
                tipo='MANTENIMIENTO',
                nivel='MEDIA',
                mensaje=f"🔧 Dispositivo '{instance.nombre}' en mantenimiento",
                dispositivo=instance,
            )


@receiver(post_save, sender=RegistroAcceso)
def alerta_intentos_fallidos(sender, instance, created, **kwargs):
    """Genera alerta cuando hay múltiples intentos fallidos"""
    
    if instance.tipo_acceso == 'fallido' and created:
        hace_10_min = timezone.now() - timedelta(minutes=10)
        intentos_fallidos = RegistroAcceso.objects.filter(
            persona=instance.persona,
            tipo_acceso='fallido',
            fecha_hora__gte=hace_10_min
        ).count()
        
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
                    mensaje=f" {intentos_fallidos} intentos fallidos de '{instance.persona.nombre_completo}'",
                    persona=instance.persona,
                    dispositivo=instance.dispositivo,
                )


@receiver(post_save, sender=Sede)
def alerta_cambio_sede(sender, instance, created, **kwargs):
    if created:
        Alerta.objects.create(
            tipo='MANTENIMIENTO',
            nivel='BAJA',
            mensaje=f" Nueva sede creada: '{instance.nombre}'",
        )


@receiver(post_save, sender=Area)
def alerta_cambio_area(sender, instance, created, **kwargs):
    if created:
        Alerta.objects.create(
            tipo='MANTENIMIENTO',
            nivel='BAJA',
            mensaje=f" Nueva área '{instance.nombre}' en sede '{instance.sede.nombre}'",
        )


@receiver(post_save, sender=Persona)
def alerta_cambio_personal(sender, instance, created, **kwargs):
    if created:
        Alerta.objects.create(
            tipo='MANTENIMIENTO',
            nivel='BAJA',
            mensaje=f"👤 Nuevo personal: '{instance.nombre_completo}'",
        )


@receiver(post_delete, sender=Dispositivo)
def alerta_dispositivo_eliminado(sender, instance, **kwargs):
    Alerta.objects.create(
        tipo='MANTENIMIENTO',
        nivel='BAJA',
        mensaje=f" Dispositivo eliminado: '{instance.nombre}'",
    )