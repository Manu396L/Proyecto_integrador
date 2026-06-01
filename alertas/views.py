from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from datetime import timedelta
from dispositivos.models import Dispositivo
from sedes.models import Sede
from personal.models import RegistroAcceso, Persona
from .models import Alerta


@login_required
def lista_alertas(request):
    """Vista principal de alertas"""
    
    # === VERIFICAR DISPOSITIVOS SIN CONEXIÓN ===
    hace_5_min = timezone.now() - timedelta(minutes=5)
    dispositivos = Dispositivo.objects.all()
    
    for dispositivo in dispositivos:
        if dispositivo.ultima_conexion and dispositivo.ultima_conexion < hace_5_min:
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
    
    # === VERIFICAR INTENTOS FALLIDOS ===
    hace_10_min = timezone.now() - timedelta(minutes=10)
    
    from django.db.models import Count
    personas_sospechosas = RegistroAcceso.objects.filter(
        tipo_acceso='fallido',
        fecha_hora__gte=hace_10_min
    ).values('persona').annotate(total=Count('id')).filter(total__gte=3)
    
    for item in personas_sospechosas:
        persona = Persona.objects.filter(id=item['persona']).first()
        if persona:
            alerta_existente = Alerta.objects.filter(
                persona=persona,
                tipo='INTENTO_FALLIDO',
                resuelta=False,
                fecha_hora__gte=hace_10_min
            ).first()
            
            if not alerta_existente:
                Alerta.objects.create(
                    tipo='INTENTO_FALLIDO',
                    nivel='MEDIA',
                    mensaje=f"{item['total']} intentos fallidos de '{persona.nombre_completo}'",
                    persona=persona,
                )
    
    # === CONTAR DISPOSITIVOS POR ESTADO ===
    dispositivos_criticos = dispositivos.filter(
        estado__in=['error', 'sin_conexion', 'apagado', 'inactivo']
    ).count()
    
    dispositivos_problemas = dispositivos.filter(estado='pausado').count()
    dispositivos_estables = dispositivos.filter(estado='activo').count()
    
    # === CONTAR ALERTAS ===
    alertas_criticas = Alerta.objects.filter(nivel__in=['ALTA', 'CRITICA'], resuelta=False).count()
    alertas_media = Alerta.objects.filter(nivel='MEDIA', resuelta=False).count()
    alertas_baja = Alerta.objects.filter(nivel='BAJA', resuelta=False).count()
    
    # === OBTENER DATOS PARA LA TABLA ===
    sedes = Sede.objects.all()
    alertas = Alerta.objects.select_related('dispositivo', 'persona').order_by('-fecha_hora')[:100]
    
    context = {
        'sedes': sedes,
        'alertas': alertas,
        'criticos': dispositivos_criticos,
        'problemas': dispositivos_problemas,
        'estables': dispositivos_estables,
        'alertas_criticas': alertas_criticas,
        'alertas_media': alertas_media,
        'alertas_baja': alertas_baja,
        'total_alertas': alertas.count(),
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
    """API para reportar problemas manualmente"""
    if request.method == 'POST':
        try:
            dispositivo_id = request.POST.get('dispositivo_id')
            descripcion = request.POST.get('descripcion', '')
            
            dispositivo = get_object_or_404(Dispositivo, id=dispositivo_id)
            
            Alerta.objects.create(
                tipo='MANTENIMIENTO',
                nivel='MEDIA',
                mensaje=f"Reporte manual: {descripcion}",
                dispositivo=dispositivo,
            )
            
            return JsonResponse({'success': True, 'message': 'Reporte enviado'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=400)
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)


@csrf_exempt
@login_required
def api_alertas(request):
    """API para obtener alertas en JSON"""
    if request.method == 'GET':
        alertas = Alerta.objects.select_related('dispositivo', 'persona').order_by('-fecha_hora')[:50]
        data = []
        for alerta in alertas:
            data.append({
                'id': alerta.id,
                'tipo': alerta.get_tipo_display(),
                'nivel': alerta.get_nivel_display(),
                'mensaje': alerta.mensaje,
                'dispositivo': alerta.dispositivo.nombre if alerta.dispositivo else None,
                'persona': alerta.persona.nombre_completo if alerta.persona else None,
                'fecha_hora': alerta.fecha_hora.strftime('%Y-%m-%d %H:%M:%S'),
                'leida': alerta.leida,
                'resuelta': alerta.resuelta,
            })
        return JsonResponse({'success': True, 'alertas': data})
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)