from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from datetime import datetime
from .models import Persona, RegistroAcceso
import json

@login_required
def lista_personal(request):
    personal = Persona.objects.all()
    return render(request, 'personal/lista.html', {'personal': personal})


@login_required
def historial_persona(request, persona_id):
    """Historial completo de ingresos y salidas de una persona puntual."""
    persona = get_object_or_404(Persona, id=persona_id)

    registros = RegistroAcceso.objects.filter(
        persona=persona
    ).select_related('dispositivo').order_by('-fecha_hora')

    fecha_inicio = request.GET.get('fecha_inicio', '')
    fecha_fin = request.GET.get('fecha_fin', '')
    tipo_acceso = request.GET.get('tipo_acceso', '')

    if fecha_inicio:
        try:
            fecha_inicio_dt = datetime.strptime(fecha_inicio, '%Y-%m-%d')
            registros = registros.filter(fecha_hora__date__gte=fecha_inicio_dt)
        except ValueError:
            pass

    if fecha_fin:
        try:
            fecha_fin_dt = datetime.strptime(fecha_fin, '%Y-%m-%d')
            registros = registros.filter(fecha_hora__date__lte=fecha_fin_dt)
        except ValueError:
            pass

    if tipo_acceso:
        registros = registros.filter(tipo_acceso=tipo_acceso)

    # Valores distintos de tipo_acceso realmente presentes en los datos de
    # esta persona (el campo no siempre respeta los choices declarados en
    # el modelo, así que se arma el filtro a partir de lo que hay en BD).
    tipos_disponibles = (
        RegistroAcceso.objects.filter(persona=persona)
        .order_by('tipo_acceso')
        .values_list('tipo_acceso', flat=True)
        .distinct()
    )

    total = registros.count()
    entradas = registros.filter(tipo_acceso__in=['ENTRADA', 'exitoso']).count()
    salidas = registros.filter(tipo_acceso='SALIDA').count()
    denegados = registros.filter(tipo_acceso__in=['DENEGADO', 'fallido']).count()

    context = {
        'persona': persona,
        'registros': registros,
        'total': total,
        'entradas': entradas,
        'salidas': salidas,
        'denegados': denegados,
        'fecha_inicio': fecha_inicio,
        'fecha_fin': fecha_fin,
        'tipo_acceso': tipo_acceso,
        'tipos_disponibles': tipos_disponibles,
    }
    return render(request, 'personal/historial.html', context)


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
                'cargo': persona.cargo,
                'area': persona.area,
                'tipo_sede': persona.tipo_sede,
                'nombre_sede': persona.nombre_sede,
                'dispositivo': persona.dispositivo_biometrico,
                'nivel_seguridad': persona.nivel_seguridad,
                'credencial': persona.credencial_biometrica,
                'metodo_adicional': persona.metodo_adicional,
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
                    'metodo_adicional': persona.metodo_adicional,
                })
            return JsonResponse(data, safe=False)
    
    elif request.method == 'POST':
        try:
            print("\n" + "="*60)
            print("POST RECIBIDO EN PERSONAL API")
            print("="*60)
            print(f"Content-Type: {request.content_type}")
            print(f"Method: {request.method}")
            print("-"*40)
            
            if request.content_type and 'multipart/form-data' in request.content_type:
                print("Procesando como FormData (con archivos)")
                email = (request.POST.get('email') or '').strip()
                numero_documento = (request.POST.get('numero_documento') or '').strip()
                nombre = (request.POST.get('nombre') or '').strip()
                cargo = (request.POST.get('cargo') or '').strip()
                area = (request.POST.get('area') or '').strip()
                tipo_sede = (request.POST.get('tipo_sede') or 'sede').strip()
                nombre_sede = (request.POST.get('nombre_sede') or 'Sede Central').strip()
                dispositivo = (request.POST.get('dispositivo') or 'huella').strip()
                nivel_seguridad = (request.POST.get('nivel_seguridad') or 'medio').strip()
                telefono = (request.POST.get('telefono') or '').strip()
                direccion = (request.POST.get('direccion') or '').strip()
                credencial = (request.POST.get('credencial') or '').strip()
                metodo_adicional_raw = request.POST.get('metodo_adicional')
                
                # CORREGIDO: Convertir metodo_adicional de string JSON a dict
                metodo_adicional = None
                if metodo_adicional_raw and metodo_adicional_raw != 'null':
                    try:
                        metodo_adicional = json.loads(metodo_adicional_raw)
                        print(f"  - metodo_adicional parseado: {metodo_adicional}")
                    except:
                        metodo_adicional = None
                
                if 'foto' in request.FILES:
                    print(f"Foto recibida: {request.FILES['foto'].name}")
                else:
                    print("No se recibio foto")
                    
            else:
                print("Procesando como JSON")
                try:
                    data = json.loads(request.body)
                except:
                    data = {}
                
                email = (data.get('email') or '').strip()
                numero_documento = (data.get('numero_documento') or '').strip()
                nombre = (data.get('nombre') or '').strip()
                cargo = (data.get('cargo') or '').strip()
                area = (data.get('area') or '').strip()
                tipo_sede = (data.get('tipo_sede') or 'sede').strip()
                nombre_sede = (data.get('nombre_sede') or 'Sede Central').strip()
                dispositivo = (data.get('dispositivo') or 'huella').strip()
                nivel_seguridad = (data.get('nivel_seguridad') or 'medio').strip()
                telefono = (data.get('telefono') or '').strip()
                direccion = (data.get('direccion') or '').strip()
                credencial = (data.get('credencial') or '').strip()
                metodo_adicional = data.get('metodo_adicional')
                request.FILES = {}
            
            print("-"*40)
            print("VALORES EXTRAIDOS:")
            print(f"  - numero_documento (DNI): '{numero_documento}' | longitud: {len(numero_documento)}")
            print(f"  - nombre: '{nombre}' | longitud: {len(nombre)}")
            print(f"  - email: '{email}' | longitud: {len(email)}")
            print(f"  - cargo: '{cargo}' | longitud: {len(cargo)}")
            print(f"  - area: '{area}' | longitud: {len(area)}")
            print(f"  - tipo_sede: '{tipo_sede}'")
            print(f"  - nombre_sede: '{nombre_sede}'")
            print(f"  - dispositivo: '{dispositivo}'")
            print(f"  - nivel_seguridad: '{nivel_seguridad}'")
            print(f"  - telefono: '{telefono}'")
            print(f"  - direccion: '{direccion}'")
            print(f"  - credencial: '{credencial}'")
            print(f"  - metodo_adicional: {metodo_adicional}")
            
            errores = []
            
            if not numero_documento:
                errores.append('Numero de documento (DNI) es requerido')
                print("ERROR: Numero de documento vacio")
            else:
                import re
                if not re.match(r'^\d{7,8}$', numero_documento):
                    errores.append('DNI invalido (debe tener 7 u 8 digitos)')
                    print("ERROR: Formato DNI invalido")
            
            if not nombre:
                errores.append('Nombre es requerido')
                print("ERROR: Nombre vacio")
            
            if not email:
                errores.append('Email es requerido')
                print("ERROR: Email vacio")
            elif '@' not in email:
                errores.append('Email invalido')
                print("ERROR: Email sin @")
            
            if not cargo:
                errores.append('Cargo es requerido')
                print("ERROR: Cargo vacio")
            
            if not area:
                errores.append('Area es requerida')
                print("ERROR: Area vacia")
            
            if errores:
                print("-"*40)
                print(f"ERRORES ENCONTRADOS: {len(errores)}")
                for err in errores:
                    print(f"  - {err}")
                print("="*60 + "\n")
                return JsonResponse({'success': False, 'error': ', '.join(errores)}, status=400)
            
            if Persona.objects.filter(numero_documento=numero_documento).exists():
                print("ERROR: Documento ya registrado en la base de datos")
                print("="*60 + "\n")
                return JsonResponse({'success': False, 'error': 'Este documento ya esta registrado'}, status=400)
            
            if Persona.objects.filter(email=email).exists():
                print("ERROR: Email ya registrado en la base de datos")
                print("="*60 + "\n")
                return JsonResponse({'success': False, 'error': 'Este email ya esta registrado'}, status=400)
            
            print("-"*40)
            print("TODAS LAS VALIDACIONES SUPERADAS")
            print("CREANDO PERSONA...")
            
            nombres_list = nombre.split()
            nombres = nombres_list[0] if nombres_list else ''
            apellidos = ' '.join(nombres_list[1:]) if len(nombres_list) > 1 else nombres
            
            persona = Persona.objects.create(
                tipo_documento='CC',
                numero_documento=numero_documento,
                nombres=nombres,
                apellidos=apellidos,
                tipo_persona='EMP',
                email=email,
                telefono=telefono,
                direccion=direccion,
                cargo=cargo,
                area=area,
                tipo_sede=tipo_sede,
                nombre_sede=nombre_sede,
                dispositivo_biometrico=dispositivo,
                credencial_biometrica=credencial,
                nivel_seguridad=nivel_seguridad,
                metodo_adicional=metodo_adicional,
                activo=True,
            )
            
            if 'foto' in request.FILES and request.FILES['foto']:
                persona.foto = request.FILES['foto']
                persona.save()
                print(f"Foto guardada: {persona.foto.name}")
            
            print(f"PERSONA CREADA EXITOSAMENTE")
            print(f"  - ID: {persona.id}")
            print(f"  - Nombre completo: {persona.nombre_completo}")
            print(f"  - Documento: {persona.numero_documento}")
            print("="*60 + "\n")
            
            return JsonResponse({
                'success': True, 
                'id': persona.id, 
                'message': 'Personal registrado correctamente'
            })
            
        except Exception as e:
            import traceback
            print("\n" + "="*60)
            print("EXCEPCION EN POST")
            print("="*60)
            print(f"Error: {str(e)}")
            print("-"*40)
            traceback.print_exc()
            print("="*60 + "\n")
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    elif request.method == 'PUT':
        persona = get_object_or_404(Persona, id=persona_id)
        try:
            print("\n" + "="*60)
            print("PUT RECIBIDO EN PERSONAL API")
            print("="*60)
            
            if request.content_type and 'application/json' in request.content_type:
                data = json.loads(request.body)
                print("Procesando como JSON")
            else:
                data = {}
                for key in request.POST:
                    data[key] = request.POST[key]
                print("Procesando como FormData")
                
                # CORREGIDO: Convertir metodo_adicional si viene como string
                if 'metodo_adicional' in data and data['metodo_adicional'] and data['metodo_adicional'] != 'null':
                    try:
                        data['metodo_adicional'] = json.loads(data['metodo_adicional'])
                    except:
                        pass
            
            email = data.get('email', persona.email).strip() if data.get('email') else persona.email
            numero_documento = data.get('numero_documento', persona.numero_documento)
            nombre = data.get('nombre', '')
            
            print(f"  - numero_documento: {numero_documento}")
            print(f"  - nombre: {nombre}")
            print(f"  - email: {email}")
            
            email_actual = persona.email.strip()
            
            if email.lower() != email_actual.lower():
                if Persona.objects.filter(email__iexact=email).exclude(id=persona_id).exists():
                    return JsonResponse({'success': False, 'error': 'Este email ya existe'}, status=400)
            
            if 'nombre' in data and data['nombre']:
                nombres_apellidos = data.get('nombre', '').split()
                persona.nombres = nombres_apellidos[0] if nombres_apellidos else ''
                persona.apellidos = ' '.join(nombres_apellidos[1:]) if len(nombres_apellidos) > 1 else ''
            
            persona.numero_documento = numero_documento
            persona.email = email
            persona.telefono = data.get('telefono', persona.telefono)
            persona.tipo_persona = data.get('tipo_persona', persona.tipo_persona)
            persona.direccion = data.get('direccion', persona.direccion)
            persona.cargo = data.get('cargo', persona.cargo)
            persona.area = data.get('area', persona.area)
            persona.tipo_sede = data.get('tipo_sede', persona.tipo_sede)
            persona.nombre_sede = data.get('nombre_sede', persona.nombre_sede)
            persona.dispositivo_biometrico = data.get('dispositivo', persona.dispositivo_biometrico)
            persona.credencial_biometrica = data.get('credencial', persona.credencial_biometrica)
            persona.nivel_seguridad = data.get('nivel_seguridad', persona.nivel_seguridad)
            
            # CORREGIDO: Guardar metodo_adicional correctamente
            if 'metodo_adicional' in data:
                persona.metodo_adicional = data.get('metodo_adicional')
            
            persona.activo = data.get('activo', persona.activo)
            
            if 'foto' in request.FILES:
                persona.foto = request.FILES['foto']
            
            persona.save()
            
            print(f"PERSONA ACTUALIZADA - ID: {persona.id}")
            print("="*60 + "\n")
            
            return JsonResponse({'success': True, 'message': 'Personal actualizado correctamente'})
        except Exception as e:
            print(f"ERROR EN PUT: {str(e)}")
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        persona = get_object_or_404(Persona, id=persona_id)
        persona.delete()
        return JsonResponse({'success': True, 'message': 'Personal eliminado correctamente'})
    
    return JsonResponse({'error': 'Metodo no permitido'}, status=405)