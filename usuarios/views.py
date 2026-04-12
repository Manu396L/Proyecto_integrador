# usuarios/views.py
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import update_session_auth_hash
from django.contrib import messages
from django.contrib.auth.forms import PasswordChangeForm
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.utils import timezone
import json
import re
from .models import SolicitudRegistro
from .forms import SolicitudRegistroForm

# ===== VISTAS CON LOGIN =====

@login_required
def perfil(request):
    return render(request, 'usuarios/perfil.html')

@login_required
def cambiar_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            messages.success(request, '¡Contraseña actualizada correctamente!')
            return redirect('usuarios:perfil')
        else:
            messages.error(request, 'Por favor corrige los errores.')
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'usuarios/cambiar_password.html', {'form': form})

@login_required
def configuracion(request):
    return render(request, 'usuarios/configuracion.html')

@login_required
def notificaciones(request):
    return render(request, 'usuarios/notificaciones.html')

# ===== VISTAS SIN LOGIN (RECUPERACIÓN) =====

def recuperar_contraseña(request):
    """Vista para recuperar contraseña"""
    return render(request, 'registration/recuperar_contraseña.html')

@csrf_exempt
def api_recuperar_contraseña(request):
    """API para procesar la solicitud de recuperación de contraseña"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            dni = data.get('dni', '').strip()
            email = data.get('email', '').strip()
            
            # Validar DNI
            if not re.match(r'^\d{7,8}$', dni):
                return JsonResponse({'success': False, 'message': 'DNI inválido'}, status=400)
            
            # Validar email
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
                return JsonResponse({'success': False, 'message': 'Email inválido'}, status=400)
            
            # Buscar usuario por email
            try:
                user = User.objects.get(email=email)
                # Aquí puedes agregar lógica adicional para enviar email
                return JsonResponse({'success': True, 'message': 'Correo enviado correctamente'})
                
            except User.DoesNotExist:
                # Por seguridad, no revelamos si el email existe o no
                return JsonResponse({'success': True, 'message': 'Si los datos son correctos, recibirás un correo con instrucciones'})
                
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Datos inválidos'}, status=400)
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)

# ===== NUEVAS VISTAS PARA REGISTRO DE USUARIOS =====

def registro_usuario(request):
    """Vista para registro de nuevo usuario (sin login requerido)"""
    return render(request, 'registration/registro_usuario.html')

@csrf_exempt
def api_registro_usuario(request):
    """API para registrar solicitud de nuevo usuario y GUARDAR EN BASE DE DATOS"""
    if request.method == 'POST':
        try:
            print("\n" + "="*60)
            print("🔍 INTENTANDO GUARDAR USUARIO")
            print("="*60)
            
            data = json.loads(request.body)
            print(f"✅ Datos recibidos: {data}")
            
            nombre = data.get('nombre', '').strip()
            email = data.get('email', '').strip()
            telefono = data.get('telefono', '').strip()
            departamento = data.get('departamento', '').strip()
            puesto = data.get('puesto', '').strip()
            superior = data.get('superior', '').strip()
            fecha_ingreso = data.get('fecha_ingreso', '').strip()
            
            print(f"Nombre: {nombre}")
            print(f"Email: {email}")
            print(f"Departamento: {departamento}")
            
            # Validar campos obligatorios
            if not nombre or not email or not telefono or not departamento or not puesto:
                print("❌ Faltan campos obligatorios")
                return JsonResponse({
                    'success': False, 
                    'message': 'Por favor, complete todos los campos obligatorios'
                }, status=400)
            
            # Validar formato de email
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
                print("❌ Email inválido")
                return JsonResponse({
                    'success': False, 
                    'message': 'Por favor, ingrese un correo electrónico válido'
                }, status=400)
            
            # Validar teléfono (básico)
            if not re.match(r'^[\+]?[0-9\s\-\(\)]{8,}$', telefono):
                print("❌ Teléfono inválido")
                return JsonResponse({
                    'success': False, 
                    'message': 'Por favor, ingrese un número de teléfono válido'
                }, status=400)
            
            # ✅ AHORA GUARDA EN LA BASE DE DATOS
            print("\n📝 GUARDANDO EN BD...")
            solicitud = SolicitudRegistro.objects.create(
                nombre=nombre,
                email=email,
                telefono=telefono,
                departamento=departamento,
                puesto=puesto,
                superior=superior if superior else None,
                fecha_ingreso=fecha_ingreso if fecha_ingreso else None,
                estado='pendiente'
            )
            
            print(f"✅✅✅ SOLICITUD GUARDADA - ID: {solicitud.id}")
            print(f"  Nombre: {solicitud.nombre}")
            print(f"  Email: {solicitud.email}")
            print(f"  Departamento: {solicitud.departamento}")
            print("="*60 + "\n")
            
            # Opcional: Enviar email de notificación al administrador
            try:
                send_mail(
                    'Nueva solicitud de registro - Biometrika',
                    f'Se ha recibido una nueva solicitud de registro:\n\n'
                    f'Nombre: {nombre}\n'
                    f'Email: {email}\n'
                    f'Teléfono: {telefono}\n'
                    f'Departamento: {departamento}\n'
                    f'Puesto: {puesto}\n'
                    f'Superior: {superior or "No especificado"}\n'
                    f'Fecha Ingreso: {fecha_ingreso or "No especificada"}\n\n'
                    f'Por favor, revise la solicitud en el panel de administración.',
                    settings.DEFAULT_FROM_EMAIL,
                    ['admin@biometrika.com'],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"⚠️ Advertencia: Error al enviar email: {e}")
            
            return JsonResponse({
                'success': True, 
                'message': 'Solicitud enviada correctamente. Nos pondremos en contacto con usted.',
                'solicitud_id': solicitud.id
            })
            
        except json.JSONDecodeError as e:
            print(f"❌ Error JSON: {e}")
            return JsonResponse({
                'success': False, 
                'message': 'Datos inválidos'
            }, status=400)
        except Exception as e:
            print(f"❌ ERROR AL GUARDAR: {str(e)}")
            print(f"Tipo de error: {type(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({
                'success': False, 
                'message': f'Error al procesar la solicitud: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False, 
        'message': 'Método no permitido'
    }, status=405)


# ===== VISTAS PARA VER LAS SOLICITUDES =====

@login_required
def mis_solicitudes(request):
    """Vista para que el usuario vea sus solicitudes de registro"""
    solicitudes = SolicitudRegistro.objects.filter(email=request.user.email).order_by('-fecha_solicitud')
    return render(request, 'usuarios/mis_solicitudes.html', {'solicitudes': solicitudes})


@login_required
def todas_solicitudes(request):
    """Vista para admin: ver TODAS las solicitudes de registro"""
    if not request.user.is_staff:
        return redirect('dashboard:index')
    
    estado = request.GET.get('estado', '')
    solicitudes = SolicitudRegistro.objects.all().order_by('-fecha_solicitud')
    
    if estado:
        solicitudes = solicitudes.filter(estado=estado)
    
    estados = SolicitudRegistro._meta.get_field('estado').choices
    
    return render(request, 'usuarios/todas_solicitudes.html', {
        'solicitudes': solicitudes,
        'estados': estados,
        'estado_filtro': estado
    })