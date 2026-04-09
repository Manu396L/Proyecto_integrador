# dispositivos/views.py
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Dispositivo
import json

@login_required
def lista_dispositivos(request):
    """Vista principal de gestión de dispositivos"""
    dispositivos = Dispositivo.objects.all()
    
    context = {
        'dispositivos': dispositivos,
        'total_activos': dispositivos.filter(estado='activo').count(),
        'total_pausados': dispositivos.filter(estado='pausado').count(),
        'total_error': dispositivos.filter(estado='error').count(),
    }
    
    return render(request, 'dispositivos/lista.html', context)

@csrf_exempt
@require_http_methods(["GET", "POST", "PUT", "DELETE"])
def api_dispositivos(request, dispositivo_id=None):
    """API REST para gestionar dispositivos"""
    
    if request.method == 'GET':
        if dispositivo_id:
            dispositivo = get_object_or_404(Dispositivo, id=dispositivo_id)
            data = {
                'id': dispositivo.id,
                'nombre': dispositivo.nombre,
                'numero_serie': dispositivo.numero_serie,
                'tipo_sede': dispositivo.tipo_sede,
                'area': dispositivo.area,
                'direccion': dispositivo.direccion,
                'direccion_ip': dispositivo.direccion_ip,
                'zona_horaria': dispositivo.zona_horaria,
                'intervalo': dispositivo.intervalo_solicitud,
                'estado': dispositivo.estado,
                'tipo_dispositivo': dispositivo.tipo_dispositivo,
                'observaciones': dispositivo.observaciones,
                'ultima_conexion': dispositivo.ultima_conexion.strftime('%d/%m/%Y, %H:%M'),
                'api_key': dispositivo.api_key,
            }
            return JsonResponse(data)
        else:
            dispositivos = Dispositivo.objects.all().values(
                'id', 'nombre', 'numero_serie', 'tipo_sede', 'area',
                'direccion_ip', 'estado', 'ultima_conexion', 'tipo_dispositivo'
            )
            data = []
            for d in dispositivos:
                d['ultima_conexion'] = d['ultima_conexion'].strftime('%d/%m/%Y, %H:%M') if d['ultima_conexion'] else ''
                data.append(d)
            return JsonResponse(data, safe=False)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            dispositivo = Dispositivo.objects.create(
                nombre=data.get('nombre'),
                numero_serie=data.get('numero_serie'),
                tipo_sede=data.get('tipo_sede'),
                area=data.get('area'),
                direccion=data.get('direccion', ''),
                direccion_ip=data.get('direccion_ip'),
                zona_horaria=data.get('zona_horaria'),
                intervalo_solicitud=data.get('intervalo', 5),
                estado=data.get('estado'),
                tipo_dispositivo=data.get('tipo_dispositivo', 'huella'),
                observaciones=data.get('observaciones', ''),
            )
            return JsonResponse({'success': True, 'id': dispositivo.id, 'message': 'Dispositivo creado correctamente'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    elif request.method == 'PUT':
        dispositivo = get_object_or_404(Dispositivo, id=dispositivo_id)
        try:
            data = json.loads(request.body)
            dispositivo.nombre = data.get('nombre', dispositivo.nombre)
            dispositivo.numero_serie = data.get('numero_serie', dispositivo.numero_serie)
            dispositivo.tipo_sede = data.get('tipo_sede', dispositivo.tipo_sede)
            dispositivo.area = data.get('area', dispositivo.area)
            dispositivo.direccion = data.get('direccion', dispositivo.direccion)
            dispositivo.direccion_ip = data.get('direccion_ip', dispositivo.direccion_ip)
            dispositivo.zona_horaria = data.get('zona_horaria', dispositivo.zona_horaria)
            dispositivo.intervalo_solicitud = data.get('intervalo', dispositivo.intervalo_solicitud)
            dispositivo.estado = data.get('estado', dispositivo.estado)
            dispositivo.tipo_dispositivo = data.get('tipo_dispositivo', dispositivo.tipo_dispositivo)
            dispositivo.observaciones = data.get('observaciones', dispositivo.observaciones)
            dispositivo.save()
            return JsonResponse({'success': True, 'message': 'Dispositivo actualizado correctamente'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        dispositivo = get_object_or_404(Dispositivo, id=dispositivo_id)
        dispositivo.delete()
        return JsonResponse({'success': True, 'message': 'Dispositivo eliminado correctamente'})
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
@require_http_methods(["POST"])
def api_acciones_dispositivo(request, dispositivo_id, accion):
    """API para acciones especiales sobre dispositivos"""
    dispositivo = get_object_or_404(Dispositivo, id=dispositivo_id)
    
    if accion == 'reiniciar':
        # Simular reinicio
        dispositivo.estado = 'activo'
        dispositivo.save()
        return JsonResponse({'success': True, 'message': f'Dispositivo {dispositivo.nombre} reiniciado'})
    
    elif accion == 'actualizar-firmware':
        return JsonResponse({'success': True, 'message': f'Firmware actualizado para {dispositivo.nombre}'})
    
    elif accion == 'leer-info':
        info = {
            'nombre': dispositivo.nombre,
            'numero_serie': dispositivo.numero_serie,
            'ip': dispositivo.direccion_ip,
            'estado': dispositivo.estado,
            'ultima_conexion': dispositivo.ultima_conexion.strftime('%d/%m/%Y %H:%M'),
            'firmware': 'v2.1.4',
            'api_key': dispositivo.api_key[:8] + '...',
        }
        return JsonResponse({'success': True, 'info': info})
    
    return JsonResponse({'error': 'Acción no válida'}, status=400)