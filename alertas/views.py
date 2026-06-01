# alertas/views.py
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from dispositivos.models import Dispositivo
from sedes.models import Sede
from personal.models import RegistroAcceso, Persona
from .models import Alerta
import json


@login_required
def lista_alertas(request):
    """Vista para mostrar alertas con datos reales"""
    
    # Obtener todos los dispositivos
    dispositivos = Dispositivo.objects.all()
    sedes = Sede.objects.all()
    
    # === 1. GENERAR ALERTAS POR ESTADO DE DISPOSITIVOS ===
    from datetime import timedelta
    
    # Dispositivos sin conexión (última conexión > 5 minutos)
    hace_5_min = timezone.now() - timedelta(minutes=5)
    dispositivos_offline = dispositivos.filter(ultima_conexion__lt=hace_5_min)
    
    for dispositivo in dispositivos_offline:
        alerta_existente = Alerta.objects.filter(
            dispositivo=dispositivo,
            tipo='DISPOSITIVO_OFFLINE',
            resuelta=False
        ).first()
        
        if not alerta_existente:
            Alerta.objects.create(
                tipo='DISPOSITIVO_OFFLINE',
                nivel='ALTA',
                mensaje=f"Dispositivo '{dispositivo.nombre}' sin conexión",
                dispositivo=dispositivo,
            )
    
    # Dispositivos en estado error
    dispositivos_error = dispositivos.filter(estado__in=['error', 'sin_conexion', 'apagado'])
    
    for dispositivo in dispositivos_error:
        alerta_existente = Alerta.objects.filter(
            dispositivo=dispositivo,
            tipo='DISPOSITIVO_OFFLINE',
            resuelta=False
        ).first()
        
        if not alerta_existente:
            Alerta.objects.create(
                tipo='DISPOSITIVO_OFFLINE',
                nivel='CRITICA',
                mensaje=f"Dispositivo '{dispositivo.nombre}' en estado: {dispositivo.get_estado_display()}",
                dispositivo=dispositivo,
            )
    
    # === 2. GENERAR ALERTAS POR INTENTOS FALLIDOS EXCESIVOS ===
    hace_10_min = timezone.now() - timedelta(minutes=10)
    
    # Agrupar intentos fallidos por persona
    from django.db.models import Count
    
    intentos_sospechosos = RegistroAcceso.objects.filter(
        tipo_acceso='fallido',
        fecha_hora__gte=hace_10_min
    ).values('persona').annotate(total=Count('id')).filter(total__gte=3)
    
    for item in intentos_sospechosos:
        persona = Persona.objects.filter(id=item['persona']).first()
        if persona:
            alerta_existente = Alerta.objects.filter(
                persona=persona,
                tipo='INTENTO_FALLIDO',
                resuelta=False
            ).first()
            
            if not alerta_existente:
                Alerta.objects.create(
                    tipo='INTENTO_FALLIDO',
                    nivel='MEDIA',
                    mensaje=f"La persona '{persona.nombre_completo}' tiene {item['total']} intentos fallidos en los últimos 10 minutos",
                    persona=persona,
                )
    
    # === 3. CONTAR ALERTAS POR NIVEL ===
    alertas_criticas = Alerta.objects.filter(nivel__in=['ALTA', 'CRITICA'], resuelta=False).count()
    alertas_media = Alerta.objects.filter(nivel='MEDIA', resuelta=False).count()
    alertas_baja = Alerta.objects.filter(nivel='BAJA', resuelta=False).count()
    
    # Obtener alertas recientes
    alertas = Alerta.objects.select_related('dispositivo', 'persona').order_by('-fecha_hora')[:100]
    
    # Estadísticas de dispositivos
    dispositivos_activos = dispositivos.filter(estado='activo').count()
    dispositivos_pausados = dispositivos.filter(estado='pausado').count()
    dispositivos_error_count = dispositivos.filter(estado__in=['error', 'sin_conexion', 'apagado']).count()
    
    context = {
        'sedes': sedes,
        'alertas': alertas,
        'criticos': alertas_criticas,
        'problemas': alertas_media,
        'estables': dispositivos_activos,
        'total_dispositivos': dispositivos.count(),
        'dispositivos_activos': dispositivos_activos,
        'dispositivos_pausados': dispositivos_pausados,
        'dispositivos_error': dispositivos_error_count,
    }
    
    return render(request, 'alertas/lista.html', context)


@csrf_exempt
@login_required
def marcar_alerta_resuelta(request, alerta_id):
    """API para marcar una alerta como resuelta"""
    if request.method == 'POST':
        try:
            alerta = get_object_or_404(Alerta, id=alerta_id)
            alerta.resuelta = True
            alerta.save()
            return JsonResponse({'success': True, 'message': 'Alerta resuelta'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=400)
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)


@csrf_exempt
@login_required
def marcar_alerta_leida(request, alerta_id):
    """API para marcar una alerta como leída"""
    if request.method == 'POST':
        try:
            alerta = get_object_or_404(Alerta, id=alerta_id)
            alerta.leida = True
            alerta.save()
            return JsonResponse({'success': True, 'message': 'Alerta marcada como leída'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=400)
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)


@csrf_exempt
@login_required
def reportar_dispositivo(request):
    """API para reportar problemas de dispositivos manualmente"""
    if request.method == 'POST':
        try:
            dispositivo_id = request.POST.get('dispositivo_id')
            descripcion = request.POST.get('descripcion', '')
            
            dispositivo = get_object_or_404(Dispositivo, id=dispositivo_id)
            
            # Crear alerta por reporte manual
            alerta = Alerta.objects.create(
                tipo='MANTENIMIENTO',
                nivel='MEDIA',
                mensaje=f"Reporte manual: {descripcion} - Dispositivo: {dispositivo.nombre}",
                dispositivo=dispositivo,
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Reporte enviado correctamente'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'message': 'Método no permitido'
    }, status=405)


@csrf_exempt
@login_required
def api_alertas(request):
    """API para obtener alertas en formato JSON"""
    if request.method == 'GET':
        alertas = Alerta.objects.select_related('dispositivo', 'persona').order_by('-fecha_hora')[:50]
        data = []
        for alerta in alertas:
            data.append({
                'id': alerta.id,
                'tipo': alerta.get_tipo_display(),
                'nivel': alerta.get_nivel_display(),
                'nivel_clave': alerta.nivel,
                'mensaje': alerta.mensaje,
                'dispositivo': alerta.dispositivo.nombre if alerta.dispositivo else None,
                'persona': alerta.persona.nombre_completo if alerta.persona else None,
                'fecha_hora': alerta.fecha_hora.strftime('%Y-%m-%d %H:%M:%S'),
                'leida': alerta.leida,
                'resuelta': alerta.resuelta,
            })
        return JsonResponse({'success': True, 'alertas': data})
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)