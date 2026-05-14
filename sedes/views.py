from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Sede, Area

@login_required
def lista_sedes(request):
    sedes = Sede.objects.all()
    return render(request, 'sedes/lista.html', {'sedes': sedes})

@csrf_exempt
def api_crear_sede(request):
    """API para crear nuevas sedes"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            nombre = data.get('nombre', '').strip()
            direccion = data.get('direccion', '').strip() or 'No especificada'
            ciudad = data.get('ciudad', '').strip() or 'N/A'
            telefono = data.get('telefono', '').strip() or 'N/A'
            email = data.get('email', '').strip()
            encargado = data.get('encargado', '').strip() or 'No asignado'
            
            if not nombre:
                return JsonResponse({'success': False, 'message': 'Nombre de sede requerido'}, status=400)
            if not email:
                return JsonResponse({'success': False, 'message': 'Email requerido'}, status=400)
            
            sede = Sede.objects.create(
                nombre=nombre,
                direccion=direccion,
                ciudad=ciudad,
                telefono=telefono,
                email=email,
                encargado=encargado,
                activo=True
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Sede creada correctamente',
                'sede_id': sede.id
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'JSON inválido'}, status=400)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)

@csrf_exempt
def api_crear_area(request):
    """API para crear nuevas áreas dentro de una sede"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(f"📥 Datos recibidos: {data}")
            
            sede_id = data.get('sede_id')
            nombre = data.get('nombre', '').strip()
            piso = data.get('piso', 1)
            codigo_acceso = data.get('codigo_acceso', '').strip()
            dispositivo = data.get('dispositivo', 'huella')
            nivel_seguridad = data.get('nivel_seguridad', 'bajo')
            
            if not sede_id or not nombre:
                return JsonResponse({'success': False, 'message': 'Faltan campos requeridos'}, status=400)
            
            if isinstance(nivel_seguridad, str):
                nivel_seguridad = nivel_seguridad.strip().lower()
            if nivel_seguridad not in ['bajo', 'medio', 'alto']:
                nivel_seguridad = 'bajo'
            
            try:
                sede = Sede.objects.get(id=sede_id)
            except Sede.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Sede no encontrada'}, status=404)
            
            area = Area.objects.create(
                sede=sede,
                nombre=nombre,
                piso=int(piso),
                codigo_acceso=codigo_acceso,
                dispositivo_biometrico=dispositivo,
                nivel_seguridad=nivel_seguridad
            )
            
            print(f"✅ Área creada: ID {area.id}")
            
            return JsonResponse({
                'success': True,
                'message': 'Área creada correctamente',
                'area_id': area.id
            })
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)

@csrf_exempt
def api_sedes(request):
    """API para obtener todas las sedes"""
    if request.method == 'GET':
        try:
            sedes = Sede.objects.all()
            data = []
            for sede in sedes:
                data.append({
                    'id': sede.id,
                    'nombre': sede.nombre,
                    'direccion': sede.direccion,
                    'ciudad': sede.ciudad,
                    'telefono': sede.telefono,
                    'email': sede.email,
                    'encargado': sede.encargado,
                    'activo': sede.activo
                })
            return JsonResponse(data, safe=False)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    
    elif request.method == 'POST':
        return api_crear_sede(request)
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)

@csrf_exempt
def api_areas(request):
    """API para obtener todas las áreas"""
    if request.method == 'GET':
        try:
            areas = Area.objects.select_related('sede').all()
            data = []
            for area in areas:
                data.append({
                    'id': area.id,
                    'sede_id': area.sede.id,
                    'sede_nombre': area.sede.nombre,
                    'nombre': area.nombre,
                    'descripcion': area.descripcion,
                    'piso': area.piso,
                    'codigo_acceso': area.codigo_acceso,
                    'dispositivo_biometrico': area.dispositivo_biometrico,
                    'nivel_seguridad': area.nivel_seguridad
                })
            return JsonResponse(data, safe=False)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    
    elif request.method == 'POST':
        return api_crear_area(request)
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)

@csrf_exempt
def api_actualizar_sede(request, sede_id):
    """API para obtener, actualizar o eliminar una sede"""
    if request.method == 'GET':
        try:
            sede = Sede.objects.get(id=sede_id)
            return JsonResponse({
                'id': sede.id,
                'nombre': sede.nombre,
                'direccion': sede.direccion,
                'ciudad': sede.ciudad,
                'telefono': sede.telefono,
                'email': sede.email,
                'encargado': sede.encargado,
                'activo': sede.activo
            })
        except Sede.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Sede no encontrada'}, status=404)
    
    elif request.method == 'PUT':
        try:
            sede = Sede.objects.get(id=sede_id)
            data = json.loads(request.body)
            
            sede.nombre = data.get('nombre', sede.nombre).strip()
            sede.direccion = data.get('direccion', sede.direccion).strip()
            sede.ciudad = data.get('ciudad', sede.ciudad).strip()
            sede.telefono = data.get('telefono', sede.telefono).strip()
            sede.email = data.get('email', sede.email).strip()
            sede.encargado = data.get('encargado', sede.encargado).strip()
            sede.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Sede actualizada correctamente',
                'sede_id': sede.id
            })
        except Sede.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Sede no encontrada'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    
    elif request.method == 'DELETE':
        try:
            sede = Sede.objects.get(id=sede_id)
            sede.delete()
            return JsonResponse({'success': True, 'message': 'Sede eliminada correctamente'})
        except Sede.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Sede no encontrada'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)

@csrf_exempt
def api_actualizar_area(request, area_id):
    """API para obtener, actualizar o eliminar un área"""
    if request.method == 'GET':
        try:
            area = Area.objects.get(id=area_id)
            return JsonResponse({
                'id': area.id,
                'sede_id': area.sede.id,
                'nombre': area.nombre,
                'descripcion': area.descripcion,
                'piso': area.piso,
                'codigo_acceso': area.codigo_acceso,
                'dispositivo_biometrico': area.dispositivo_biometrico,
                'nivel_seguridad': area.nivel_seguridad
            })
        except Area.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Área no encontrada'}, status=404)
    
    elif request.method == 'PUT':
        try:
            area = Area.objects.get(id=area_id)
            data = json.loads(request.body)
            
            area.nombre = data.get('nombre', area.nombre).strip()
            area.descripcion = data.get('descripcion', area.descripcion).strip()
            area.piso = int(data.get('piso', area.piso))
            area.codigo_acceso = data.get('codigo_acceso', area.codigo_acceso).strip()
            
            dispositivo = data.get('dispositivo')
            if dispositivo:
                valid_devices = ['huella', 'Tarjeta', 'PIN']
                if dispositivo in valid_devices:
                    area.dispositivo_biometrico = dispositivo
            
            nivel_seguridad = data.get('nivel_seguridad') or area.nivel_seguridad
            if nivel_seguridad and isinstance(nivel_seguridad, str):
                nivel_seguridad = nivel_seguridad.strip().lower()
            
            valid_levels = ['bajo', 'medio', 'alto']
            if nivel_seguridad in valid_levels:
                area.nivel_seguridad = nivel_seguridad
            
            area.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Área actualizada correctamente',
                'area_id': area.id,
                'area': {
                    'id': area.id,
                    'nombre': area.nombre,
                    'codigo_acceso': area.codigo_acceso,
                    'dispositivo_biometrico': area.dispositivo_biometrico,
                    'nivel_seguridad': area.nivel_seguridad,
                    'piso': area.piso
                }
            })
        except Area.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Área no encontrada'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    
    elif request.method == 'DELETE':
        try:
            area = Area.objects.get(id=area_id)
            area.delete()
            return JsonResponse({'success': True, 'message': 'Área eliminada correctamente'})
        except Area.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Área no encontrada'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)