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
            dispositivos = Dispositivo.objects.all()
            data = []
            for d in dispositivos:
                data.append({
                    'id': d.id,
                    'nombre': d.nombre,
                    'numero_serie': d.numero_serie,
                    'tipo_sede': d.tipo_sede,
                    'area': d.area,
                    'direccion': d.direccion,
                    'direccion_ip': d.direccion_ip,
                    'zona_horaria': d.zona_horaria,
                    'intervalo_solicitud': d.intervalo_solicitud,
                    'estado': d.estado,
                    'tipo_dispositivo': d.tipo_dispositivo,
                    'observaciones': d.observaciones,
                    'ultima_conexion': d.ultima_conexion.strftime('%d/%m/%Y, %H:%M') if d.ultima_conexion else '',
                })
            return JsonResponse(data, safe=False)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validar campos requeridos
            nombre = data.get('nombre', '').strip()
            numero_serie = data.get('numero_serie', '').strip()
            tipo_sede = data.get('tipo_sede', '').strip()
            area = data.get('area', '').strip()
            direccion_ip = data.get('direccion_ip', '').strip()
            zona_horaria = data.get('zona_horaria', 'America/Argentina/Buenos_Aires')
            
            if not nombre:
                return JsonResponse({'success': False, 'error': 'Nombre del dispositivo requerido'}, status=400)
            if not numero_serie:
                return JsonResponse({'success': False, 'error': 'Número de serie requerido'}, status=400)
            if not tipo_sede:
                return JsonResponse({'success': False, 'error': 'Tipo de sede requerido'}, status=400)
            if not area:
                return JsonResponse({'success': False, 'error': 'Área requerida'}, status=400)
            if not direccion_ip:
                return JsonResponse({'success': False, 'error': 'Dirección IP requerida'}, status=400)
            
            dispositivo = Dispositivo.objects.create(
                nombre=nombre,
                numero_serie=numero_serie,
                tipo_sede=tipo_sede,
                area=area,
                direccion=data.get('direccion', '').strip(),
                direccion_ip=direccion_ip,
                zona_horaria=zona_horaria,
                intervalo_solicitud=int(data.get('intervalo', 5)),
                estado=data.get('estado', 'activo'),
                tipo_dispositivo=data.get('tipo_dispositivo', 'huella'),
                observaciones=data.get('observaciones', '').strip(),
            )
            return JsonResponse({'success': True, 'id': dispositivo.id, 'message': 'Dispositivo creado correctamente'})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    elif request.method == 'PUT':
        dispositivo = get_object_or_404(Dispositivo, id=dispositivo_id)
        try:
            data = json.loads(request.body)
            
            # Validar si el numero_serie ya existe en otro dispositivo
            numero_serie = data.get('numero_serie', dispositivo.numero_serie).strip()
            numero_serie_actual = dispositivo.numero_serie.strip()
            
            # Solo validar si cambió el número de serie
            if numero_serie.lower() != numero_serie_actual.lower():
                if Dispositivo.objects.filter(numero_serie__iexact=numero_serie).exclude(id=dispositivo_id).exists():
                    return JsonResponse({'success': False, 'error': 'Este número de serie ya existe'}, status=400)
            
            # Actualizar campos
            dispositivo.nombre = data.get('nombre', dispositivo.nombre)
            dispositivo.numero_serie = numero_serie
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