# usuarios/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Notificacion
from django.contrib.auth.models import User
from dispositivos.models import Dispositivo
from personal.models import Persona, RegistroAcceso
from sedes.models import Sede, Area
from reportes.models import Reporte


def crear_notificacion_para_todos(titulo, mensaje, tipo, prioridad, datos_extra=None):
    usuarios = User.objects.filter(is_active=True)
    for usuario in usuarios:
        Notificacion.objects.create(
            titulo=titulo,
            mensaje=mensaje,
            tipo=tipo,
            prioridad=prioridad,
            usuario_destino=usuario,
            datos_extra=datos_extra or {}
        )


@receiver(post_save, sender=Dispositivo)
def notificacion_dispositivo(sender, instance, created, **kwargs):
    if created:
        crear_notificacion_para_todos(
            titulo=" Nuevo dispositivo registrado",
            mensaje=f"Se ha registrado el dispositivo '{instance.nombre}'",
            tipo="DISPOSITIVO",
            prioridad="baja",
            datos_extra={'dispositivo_id': instance.id}
        )
    else:
        try:
            old = sender.objects.get(id=instance.id)
            if old.estado != instance.estado:
                prioridad = "critica" if instance.estado in ['error', 'sin_conexion'] else "media"
                crear_notificacion_para_todos(
                    titulo=" Estado de dispositivo cambiado",
                    mensaje=f"Dispositivo '{instance.nombre}' cambió a estado: {instance.get_estado_display()}",
                    tipo="DISPOSITIVO",
                    prioridad=prioridad,
                    datos_extra={'dispositivo_id': instance.id}
                )
        except:
            pass


@receiver(post_delete, sender=Dispositivo)
def notificacion_dispositivo_eliminado(sender, instance, **kwargs):
    crear_notificacion_para_todos(
        titulo=" Dispositivo eliminado",
        mensaje=f"Se ha eliminado el dispositivo '{instance.nombre}'",
        tipo="DISPOSITIVO",
        prioridad="media",
        datos_extra={}
    )


@receiver(post_save, sender=Persona)
def notificacion_personal(sender, instance, created, **kwargs):
    if created:
        crear_notificacion_para_todos(
            titulo="👤 Nuevo personal registrado",
            mensaje=f"Se ha registrado a {instance.nombre_completo}",
            tipo="PERSONAL",
            prioridad="baja",
            datos_extra={'persona_id': instance.id}
        )
    else:
        try:
            old = sender.objects.get(id=instance.id)
            if old.activo != instance.activo:
                estado = "activado" if instance.activo else "desactivado"
                crear_notificacion_para_todos(
                    titulo=" Estado de personal cambiado",
                    mensaje=f"{instance.nombre_completo} ha sido {estado}",
                    tipo="PERSONAL",
                    prioridad="media",
                    datos_extra={'persona_id': instance.id}
                )
        except:
            pass


@receiver(post_save, sender=Sede)
def notificacion_sede(sender, instance, created, **kwargs):
    if created:
        crear_notificacion_para_todos(
            titulo=" Nueva sede creada",
            mensaje=f"Se ha creado la sede '{instance.nombre}'",
            tipo="SEDE",
            prioridad="baja",
            datos_extra={'sede_id': instance.id}
        )


@receiver(post_save, sender=Area)
def notificacion_area(sender, instance, created, **kwargs):
    if created:
        crear_notificacion_para_todos(
            titulo=" Nueva área creada",
            mensaje=f"Se ha creado el área '{instance.nombre}' en sede '{instance.sede.nombre}'",
            tipo="SEDE",
            prioridad="baja",
            datos_extra={'area_id': instance.id}
        )


@receiver(post_save, sender=RegistroAcceso)
def notificacion_acceso_fallido(sender, instance, created, **kwargs):
    if created and instance.tipo_acceso == 'fallido':
        hace_10_min = timezone.now() - timedelta(minutes=10)
        intentos = RegistroAcceso.objects.filter(
            persona=instance.persona,
            tipo_acceso='fallido',
            fecha_hora__gte=hace_10_min
        ).count()
        
        if intentos >= 3:
            crear_notificacion_para_todos(
                titulo=" Múltiples intentos fallidos",
                mensaje=f"{instance.persona.nombre_completo} tiene {intentos} intentos fallidos",
                tipo="SEGURIDAD",
                prioridad="alta",
                datos_extra={'persona_id': instance.persona.id, 'intentos': intentos}
            )


@receiver(post_save, sender=Reporte)
def notificacion_reporte(sender, instance, created, **kwargs):
    if created:
        crear_notificacion_para_todos(
            titulo=" Reporte generado",
            mensaje=f"Se ha generado el reporte '{instance.titulo}'",
            tipo="REPORTE",
            prioridad="informativa",
            datos_extra={'reporte_id': instance.id}
        )