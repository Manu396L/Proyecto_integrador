from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Persona
import json

@login_required
def lista_personal(request):
    personal = Persona.objects.all()
    return render(request, 'personal/lista.html', {'personal': personal})

def test_upload(request):
    """Página de prueba para upload de fotos"""
    return render(request, 'personal/test_upload.html')

@csrf_exempt
@require_http_methods(["GET", "POST", "PUT", "DELETE"])
def api_personal(request, persona_id=None):
    """API REST para gestionar personal"""
    
    if request.method == 'GET':
        if persona_id:
            persona = get_object_or_404(Persona, id=persona_id)
            data = {
                'id': persona.id,
                'nombre': persona.nombre_completo,
                'numero_documento': persona.numero_documento,
                'email': persona.email,
                'telefono': persona.telefono,
                'tipo_persona': persona.tipo_persona,
                'direccion': persona.direccion,
                'foto': persona.foto.url if persona.foto else None,
                'activo': persona.activo,
            }
            return JsonResponse(data)
        else:
            personas = Persona.objects.all()
            data = []
            for persona in personas:
                data.append({
                    'id': persona.id,
                    'nombre': persona.nombre_completo,
                    'numero_documento': persona.numero_documento,
                    'email': persona.email,
                    'telefono': persona.telefono,
                    'tipo_persona': persona.tipo_persona,
                    'activo': persona.activo,
                    'foto': persona.foto.url if persona.foto else None,
                    'cargo': persona.cargo,
                    'area': persona.area,
                    'tipo_sede': persona.tipo_sede,
                    'nombre_sede': persona.nombre_sede,
                    'dispositivo': persona.dispositivo_biometrico,
                    'nivel_seguridad': persona.nivel_seguridad,
                    'credencial': persona.credencial_biometrica,
                })
            return JsonResponse(data, safe=False)
    
    elif request.method == 'POST':
        try:
            # Obtener datos del formulario (multipart/form-data)
            email = request.POST.get('email', '').strip() if request.POST.get('email') else None
            numero_documento = request.POST.get('id', '').strip() if request.POST.get('id') else None
            nombre = request.POST.get('nombre', '').strip() if request.POST.get('nombre') else None
            
            if not numero_documento:
                return JsonResponse({'success': False, 'error': 'Número de documento requerido'}, status=400)
            if not nombre:
                return JsonResponse({'success': False, 'error': 'Nombre requerido'}, status=400)
            if not email:
                return JsonResponse({'success': False, 'error': 'Email requerido'}, status=400)
            
            # Dividir nombre en nombres y apellidos
            nombres_list = nombre.split()
            nombres = nombres_list[0] if nombres_list else ''
            apellidos = ' '.join(nombres_list[1:]) if len(nombres_list) > 1 else nombres
            
            persona = Persona.objects.create(
                tipo_documento=request.POST.get('tipo_documento', 'CC'),
                numero_documento=numero_documento,
                nombres=nombres,
                apellidos=apellidos,
                tipo_persona=request.POST.get('tipo_persona', 'EMP'),
                email=email,
                telefono=request.POST.get('telefono', '').strip(),
                direccion=request.POST.get('direccion', '').strip(),
                cargo=request.POST.get('cargo', '').strip(),
                area=request.POST.get('area'),
                tipo_sede=request.POST.get('tipo_sede', 'sede'),
                nombre_sede=request.POST.get('nombre_sede', 'Sede Central'),
                dispositivo_biometrico=request.POST.get('dispositivo', 'huella'),
                credencial_biometrica=request.POST.get('credencial', '').strip(),
                nivel_seguridad=request.POST.get('nivel_seguridad', 'medio'),
                activo=True,
            )
            
            # Manejar foto si existe en FILES
            if 'foto' in request.FILES:
                persona.foto = request.FILES['foto']
                persona.save()
            
            return JsonResponse({'success': True, 'id': persona.id, 'message': 'Personal registrado correctamente'})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    elif request.method == 'PUT':
        persona = get_object_or_404(Persona, id=persona_id)
        try:
            # Django no parsea request.POST para PUT, hay que parsearlo manualmente
            from django.http.multipartparser import MultiPartParser
            parser = MultiPartParser(request.META, request, request.upload_handlers)
            put_data, put_files = parser.parse()
            
            # Obtener datos del formulario (multipart/form-data)
            email = put_data.get('email', persona.email).strip()
            email_actual = persona.email.strip()
            
            # Solo validar si cambió el email
            if email.lower() != email_actual.lower():
                if Persona.objects.filter(email__iexact=email).exclude(id=persona_id).exists():
                    return JsonResponse({'success': False, 'error': 'Este email ya existe'}, status=400)
            
            # Actualizar campos
            if 'nombre' in put_data:
                nombres_apellidos = put_data.get('nombre', '').split()
                persona.nombres = nombres_apellidos[0] if nombres_apellidos else ''
                persona.apellidos = ' '.join(nombres_apellidos[1:]) if len(nombres_apellidos) > 1 else ''
            persona.numero_documento = put_data.get('numero_documento', persona.numero_documento)
            persona.email = email
            persona.telefono = put_data.get('telefono', persona.telefono)
            persona.tipo_persona = put_data.get('tipo_persona', persona.tipo_persona)
            persona.direccion = put_data.get('direccion', persona.direccion)
            persona.cargo = put_data.get('cargo', persona.cargo)
            persona.area = put_data.get('area', persona.area)
            persona.tipo_sede = put_data.get('tipo_sede', persona.tipo_sede)
            persona.nombre_sede = put_data.get('nombre_sede', persona.nombre_sede)
            persona.dispositivo_biometrico = put_data.get('dispositivo', persona.dispositivo_biometrico)
            persona.credencial_biometrica = put_data.get('credencial', persona.credencial_biometrica)
            persona.nivel_seguridad = put_data.get('nivel_seguridad', persona.nivel_seguridad)
            persona.activo = put_data.get('activo', persona.activo) in ['true', 'True', '1', 'on']
            
            # Manejar foto si existe en FILES
            if 'foto' in put_files:
                # Eliminar foto anterior si existe
                if persona.foto:
                    persona.foto.delete()
                persona.foto = put_files['foto']
            
            persona.save()
            return JsonResponse({'success': True, 'message': 'Personal actualizado correctamente'})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        persona = get_object_or_404(Persona, id=persona_id)
        persona.delete()
        return JsonResponse({'success': True, 'message': 'Personal eliminado correctamente'})
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)