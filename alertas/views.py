# alertas/views.py
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone
from dispositivos.models import Dispositivo
from .models import Alerta

@login_required
def lista_alertas(request):
    """Vista para mostrar alertas de dispositivos con datos reales de BD"""
    # Obtener todos los dispositivos
    dispositivos = Dispositivo.objects.all()
    
    # Contar dispositivos por estado
    dispositivos_activos = dispositivos.filter(estado='activo').count()
    dispositivos_pausados = dispositivos.filter(estado='pausado').count()
    dispositivos_error = dispositivos.filter(estado__in=['error', 'sin_conexion', 'apagado']).count()
    
    # Obtener alertas recientes
    alertas = Alerta.objects.select_related('dispositivo', 'persona').order_by('-fecha_hora')[:100]
    
    # Preparar contexto con datos reales
    context = {
        'dispositivos': dispositivos,
        'alertas': alertas,
        'criticos': dispositivos_error,
        'problemas': dispositivos_pausados,
        'estables': dispositivos_activos,
        'total_dispositivos': dispositivos.count(),
    }
    
    return render(request, 'alertas/lista.html', context)


@login_required
def reportar_dispositivo(request):
    """API para reportar problemas de dispositivos"""
    if request.method == 'POST':
        try:
            dispositivo_id = request.POST.get('dispositivo_id')
            descripcion = request.POST.get('descripcion', '')
            
            dispositivo = Dispositivo.objects.get(id=dispositivo_id)
            
            # Crear alerta
            alerta = Alerta.objects.create(
                tipo='DISPOSITIVO_OFFLINE',
                nivel='ALTA',
                mensaje=f"Reporte manual: {descripcion}",
                dispositivo=dispositivo
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Dispositivo reportado correctamente'
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