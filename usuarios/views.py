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
from django.db import models
import json
import re
from .models import SolicitudRegistro
from tickets.models import Ticket  # <-- Importar modelo de tickets

# ===== FUNCIÓN PARA CREAR TICKET AUTOMÁTICAMENTE =====

def crear_ticket_solicitud(solicitud):
    """Crea un ticket automáticamente cuando se recibe una solicitud de registro"""
    try:
        # Crear título del ticket
        titulo_ticket = f"Solicitud de registro - {solicitud.nombre} (DNI: {solicitud.dni})"
        
        # Crear descripción detallada
        descripcion_ticket = f"""
📋 **NUEVA SOLICITUD DE REGISTRO**

**Datos personales:**
- Nombre completo: {solicitud.nombre}
- DNI: {solicitud.dni}
- Email: {solicitud.email}
- Teléfono: {solicitud.telefono}

**Datos laborales:**
- Departamento: {solicitud.departamento}
- Puesto: {solicitud.puesto}
- Superior: {solicitud.superior or 'No especificado'}
- Fecha de ingreso: {solicitud.fecha_ingreso or 'No especificada'}

**Fecha de solicitud:** {solicitud.fecha_solicitud.strftime('%d/%m/%Y %H:%M')}

**Estado actual:** Pendiente de revisión

---
*Este ticket fue generado automáticamente por el sistema de registro de usuarios.*
        """
        
        # Crear el ticket
        ticket = Ticket.objects.create(
            titulo=titulo_ticket,
            descripcion=descripcion_ticket,
            prioridad='media',
            estado='abierto',
            remitente_nombre=solicitud.nombre,
            remitente_email=solicitud.email
        )
        
        print(f" Ticket creado automáticamente - ID: {ticket.id}")
        return ticket
    except Exception as e:
        print(f" Error al crear ticket: {e}")
        return None

# ===== VISTAS CON LOGIN =====

# ===== PERFIL HTML  ======
@login_required
def perfil(request):
    """Vista de perfil del usuario logueado con datos reales"""
    from personal.models import Persona, RegistroAcceso
    from dispositivos.models import Dispositivo
    
    usuario = request.user
    
    # Buscar la persona asociada al usuario
    try:
        persona = Persona.objects.get(usuario=usuario)
    except Persona.DoesNotExist:
        persona = None
    
    # Obtener accesos recientes del usuario
    accesos_recientes = []
    if persona:
        accesos_recientes = RegistroAcceso.objects.filter(
            persona=persona
        ).order_by('-fecha_hora')[:10]
    
    # Calcular estadísticas
    accesos_mes = 0
    promedio_diario = 0
    if persona:
        from django.utils import timezone
        from datetime import timedelta
        
        hace_30_dias = timezone.now() - timedelta(days=30)
        accesos_mes = RegistroAcceso.objects.filter(
            persona=persona,
            fecha_hora__gte=hace_30_dias
        ).count()
        promedio_diario = round(accesos_mes / 30, 1) if accesos_mes > 0 else 0
    
    # Determinar estado del badge
    if persona and persona.activo:
        estado_badge = '<span class="badge status-activo"><i class="fa-solid fa-circle"></i> Activo</span>'
    else:
        estado_badge = '<span class="badge status-inactivo"><i class="fa-solid fa-circle"></i> Inactivo</span>'
    
    # Nivel de seguridad
    nivel_seguridad = persona.nivel_seguridad if persona and persona.nivel_seguridad else 'medio'
    nivel_texto = {'bajo': 'Bajo', 'medio': 'Medio', 'alto': 'Alto'}.get(nivel_seguridad, 'Medio')
    
    # Método de acceso principal
    metodo_acceso = persona.dispositivo_biometrico if persona else 'huella'
    metodo_texto = {'huella': 'Lector de Huella Dactilar', 'tarjeta': 'Tarjeta de Acceso', 'pin': 'PIN'}.get(metodo_acceso, 'Huella Digital')
    
    # Credencial asignada
    credencial = persona.credencial_biometrica if persona and persona.credencial_biometrica else 'Huella registrada'
    
    context = {
        'usuario': usuario,
        'persona': persona,
        'accesos_recientes': accesos_recientes,
        'accesos_mes': accesos_mes,
        'promedio_diario': promedio_diario,
        'estado_badge': estado_badge,
        'nivel_seguridad_texto': nivel_texto,
        'metodo_acceso_texto': metodo_texto,
        'credencial_asignada': credencial,
    }
    
    return render(request, 'usuarios/perfil.html', context)


@login_required
def api_perfil(request):
    """API para obtener datos del perfil en tiempo real"""
    from personal.models import Persona, RegistroAcceso
    from django.utils import timezone
    from datetime import timedelta
    
    usuario = request.user
    
    try:
        persona = Persona.objects.get(usuario=usuario)
    except Persona.DoesNotExist:
        persona = None
    
    # Datos básicos
    data = {
        'success': True,
        'id': usuario.id,
        'username': usuario.username,
        'email': usuario.email,
        'first_name': usuario.first_name,
        'last_name': usuario.last_name,
    }
    
    if persona:
        data['persona'] = {
            'id': persona.id,
            'nombres': persona.nombres,
            'apellidos': persona.apellidos,
            'numero_documento': persona.numero_documento,
            'cargo': persona.cargo,
            'area': persona.area,
            'area_display': persona.get_area_display() if persona.area else 'N/A',
            'tipo_sede': persona.tipo_sede,
            'nombre_sede': persona.nombre_sede,
            'dispositivo_biometrico': persona.dispositivo_biometrico,
            'dispositivo_display': persona.get_dispositivo_biometrico_display() if persona.dispositivo_biometrico else 'N/A',
            'nivel_seguridad': persona.nivel_seguridad,
            'nivel_display': persona.get_nivel_seguridad_display() if persona.nivel_seguridad else 'Medio',
            'credencial_biometrica': persona.credencial_biometrica or 'Huella registrada',
            'activo': persona.activo,
            'foto': persona.foto.url if persona.foto else None,
            'telefono': persona.telefono,
            'direccion': persona.direccion,
            'fecha_creacion': persona.fecha_registro.strftime('%d/%m/%Y') if persona.fecha_registro else '',
        }
        
        # Calcular estadísticas
        hace_30_dias = timezone.now() - timedelta(days=30)
        accesos_mes = RegistroAcceso.objects.filter(
            persona=persona,
            fecha_hora__gte=hace_30_dias
        ).count()
        promedio_diario = round(accesos_mes / 30, 1) if accesos_mes > 0 else 0
        
        data['estadisticas'] = {
            'accesos_mes': accesos_mes,
            'promedio_diario': promedio_diario,
        }
        
        # Últimos accesos
        ultimos_accesos = RegistroAcceso.objects.filter(
            persona=persona
        ).order_by('-fecha_hora')[:5]
        
        data['ultimos_accesos'] = []
        for acceso in ultimos_accesos:
            data['ultimos_accesos'].append({
                'id': acceso.id,
                'tipo_acceso': acceso.tipo_acceso,
                'tipo_display': 'Exitoso' if acceso.tipo_acceso == 'exitoso' else 'Fallido',
                'fecha_hora': acceso.fecha_hora.strftime('%d/%m/%Y %H:%M:%S'),
                'dispositivo': acceso.dispositivo.nombre if acceso.dispositivo else 'N/A',
                'clase': 'success' if acceso.tipo_acceso == 'exitoso' else 'danger',
            })
    
    return JsonResponse(data)



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
    """Vista para mostrar notificaciones del usuario"""
    from .models import Notificacion, ConfiguracionNotificacion
    
    # Obtener o crear configuración
    config, _ = ConfiguracionNotificacion.objects.get_or_create(usuario=request.user)
    
    # Obtener notificaciones del usuario
    notificaciones = Notificacion.objects.filter(usuario_destino=request.user)
    
    # Aplicar filtros según configuración
    if not config.notificar_alertas:
        notificaciones = notificaciones.exclude(tipo='ALERTA')
    if not config.notificar_dispositivos:
        notificaciones = notificaciones.exclude(tipo='DISPOSITIVO')
    if not config.notificar_personal:
        notificaciones = notificaciones.exclude(tipo='PERSONAL')
    if not config.notificar_sedes:
        notificaciones = notificaciones.exclude(tipo='SEDE')
    if not config.notificar_reportes:
        notificaciones = notificaciones.exclude(tipo='REPORTE')
    if not config.notificar_backup:
        notificaciones = notificaciones.exclude(tipo='BACKUP')
    if not config.notificar_configuracion:
        notificaciones = notificaciones.exclude(tipo='CONFIGURACION')
    if not config.notificar_seguridad:
        notificaciones = notificaciones.exclude(tipo='SEGURIDAD')
    
    # Filtrar por prioridad mínima
    prioridades = ['informativa', 'baja', 'media', 'alta', 'critica']
    prioridad_min = config.prioridad_minima
    prioridades_permitidas = prioridades[prioridades.index(prioridad_min):]
    notificaciones = notificaciones.filter(prioridad__in=prioridades_permitidas)
    
    notificaciones = notificaciones.order_by('-fecha_creacion')
    
    # Estadísticas (AHORA timezone está importado)
    total_no_leidas = notificaciones.filter(leida=False).count()
    total_criticas = notificaciones.filter(prioridad='critica', leida=False).count()
    total_hoy = notificaciones.filter(fecha_creacion__date=timezone.now().date()).count()
    total_general = notificaciones.count()
    
    context = {
        'notificaciones': notificaciones[:50],
        'total_no_leidas': total_no_leidas,
        'total_criticas': total_criticas,
        'total_hoy': total_hoy,
        'total_general': total_general,
        'configuracion': config,
    }
    
    return render(request, 'usuarios/notificaciones.html', context)
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
            
            if not re.match(r'^\d{7,8}$', dni):
                return JsonResponse({'success': False, 'message': 'DNI inválido'}, status=400)
            
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
                return JsonResponse({'success': False, 'message': 'Email inválido'}, status=400)
            
            try:
                user = User.objects.get(email=email)
                return JsonResponse({'success': True, 'message': 'Correo enviado correctamente'})
            except User.DoesNotExist:
                return JsonResponse({'success': True, 'message': 'Si los datos son correctos, recibirás un correo con instrucciones'})
                
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Datos inválidos'}, status=400)
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)

# ===== VISTAS PARA REGISTRO DE USUARIOS =====

def registro_usuario(request):
    """Vista para registro de nuevo usuario (sin login requerido)"""
    return render(request, 'registration/registro_usuario.html')

@csrf_exempt
def api_registro_usuario(request):
    """API para registrar solicitud de nuevo usuario y CREAR TICKET AUTOMÁTICAMENTE"""
    if request.method == 'POST':
        try:
            print("\n" + "="*60)
            print(" INTENTANDO GUARDAR SOLICITUD")
            print("="*60)
            
            data = json.loads(request.body)
            print(f" Datos recibidos: {data}")
            
            nombre = data.get('nombre', '').strip()
            dni = data.get('dni', '').strip()
            email = data.get('email', '').strip()
            telefono = data.get('telefono', '').strip()
            departamento = data.get('departamento', '').strip()
            puesto = data.get('puesto', '').strip()
            superior = data.get('superior', '').strip()
            fecha_ingreso = data.get('fecha_ingreso', '').strip()
            
            # Validar campos obligatorios
            if not nombre or not dni or not email or not telefono or not departamento or not puesto:
                return JsonResponse({
                    'success': False, 
                    'message': 'Por favor, complete todos los campos obligatorios'
                }, status=400)
            
            # Validar DNI (7-8 dígitos)
            if not re.match(r'^\d{7,8}$', dni):
                return JsonResponse({
                    'success': False, 
                    'message': 'Por favor, ingrese un DNI válido (solo números, 7-8 dígitos)'
                }, status=400)
            
            # Validar email
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
                return JsonResponse({
                    'success': False, 
                    'message': 'Por favor, ingrese un correo electrónico válido'
                }, status=400)
            
            # Validar teléfono
            if not re.match(r'^[\+]?[0-9\s\-\(\)]{8,}$', telefono):
                return JsonResponse({
                    'success': False, 
                    'message': 'Por favor, ingrese un número de teléfono válido'
                }, status=400)
            
            # Verificar si ya existe una solicitud pendiente
            solicitud_existente = SolicitudRegistro.objects.filter(
                estado='pendiente'
            ).filter(models.Q(dni=dni) | models.Q(email=email)).first()
            
            if solicitud_existente:
                return JsonResponse({
                    'success': False, 
                    'message': 'Ya existe una solicitud pendiente con este DNI o correo electrónico'
                }, status=400)
            
            # GUARDAR SOLICITUD EN BASE DE DATOS
            solicitud = SolicitudRegistro.objects.create(
                nombre=nombre,
                dni=dni,
                email=email,
                telefono=telefono,
                departamento=departamento,
                puesto=puesto,
                superior=superior if superior else None,
                fecha_ingreso=fecha_ingreso if fecha_ingreso else None,
                estado='pendiente'
            )
            
            print(f" SOLICITUD GUARDADA - ID: {solicitud.id}")
            print(f"  Nombre: {solicitud.nombre}")
            print(f"  DNI: {solicitud.dni}")
            print(f"  Email: {solicitud.email}")
            
            #  CREAR TICKET AUTOMÁTICAMENTE
            ticket = crear_ticket_solicitud(solicitud)
            
            if ticket:
                print(f" TICKET CREADO - ID: {ticket.id}")
                print(f"  Título: {ticket.titulo}")
            
            print("="*60 + "\n")
            
            # Enviar email de notificación al administrador
            try:
                send_mail(
                    'Nueva solicitud de registro - Biometrika',
                    f'Se ha recibido una nueva solicitud de registro:\n\n'
                    f'Nombre: {nombre}\n'
                    f'DNI: {dni}\n'
                    f'Email: {email}\n'
                    f'Teléfono: {telefono}\n'
                    f'Departamento: {departamento}\n'
                    f'Puesto: {puesto}\n'
                    f'Superior: {superior or "No especificado"}\n'
                    f'Fecha Ingreso: {fecha_ingreso or "No especificada"}\n\n'
                    f'Se ha creado un ticket automáticamente con ID: {ticket.id if ticket else "N/A"}\n\n'
                    f'Por favor, revise la solicitud en el panel de administración.',
                    settings.DEFAULT_FROM_EMAIL,
                    ['admin@biometrika.com'],
                    fail_silently=True,
                )
                print(" Email de notificación enviado")
            except Exception as e:
                print(f" Error al enviar email: {e}")
            
            return JsonResponse({
                'success': True, 
                'message': 'Solicitud enviada correctamente. Se ha creado un ticket de seguimiento.',
                'solicitud_id': solicitud.id,
                'ticket_id': ticket.id if ticket else None
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Datos inválidos'}, status=400)
        except Exception as e:
            print(f" ERROR: {str(e)}")
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)

# ===== VISTAS PARA VER SOLICITUDES =====

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
    
# usuarios/views.py - Agrega al final del archivo:

@login_required
def api_notificaciones(request):
    """API para obtener notificaciones en JSON"""
    from .models import Notificacion, ConfiguracionNotificacion
    from django.utils import timezone
    from datetime import timedelta
    
    if request.method == 'GET':
        config, _ = ConfiguracionNotificacion.objects.get_or_create(usuario=request.user)
        
        hace_7_dias = timezone.now() - timedelta(days=7)
        notificaciones = Notificacion.objects.filter(
            usuario_destino=request.user,
            fecha_creacion__gte=hace_7_dias
        ).order_by('-fecha_creacion')[:50]
        
        # Aplicar filtros de configuración
        if not config.notificar_alertas:
            notificaciones = notificaciones.exclude(tipo='ALERTA')
        if not config.notificar_dispositivos:
            notificaciones = notificaciones.exclude(tipo='DISPOSITIVO')
        if not config.notificar_personal:
            notificaciones = notificaciones.exclude(tipo='PERSONAL')
        if not config.notificar_sedes:
            notificaciones = notificaciones.exclude(tipo='SEDE')
        
        data = []
        for n in notificaciones:
            # Tiempo relativo
            delta = timezone.now() - n.fecha_creacion
            if delta.days > 0:
                fecha_rel = f"hace {delta.days} día{'s' if delta.days > 1 else ''}"
            elif delta.seconds > 3600:
                horas = delta.seconds // 3600
                fecha_rel = f"hace {horas} hora{'s' if horas > 1 else ''}"
            elif delta.seconds > 60:
                minutos = delta.seconds // 60
                fecha_rel = f"hace {minutos} minuto{'s' if minutos > 1 else ''}"
            else:
                fecha_rel = "hace unos segundos"
            
            data.append({
                'id': n.id,
                'titulo': n.titulo,
                'mensaje': n.mensaje,
                'tipo': n.get_tipo_display(),
                'prioridad': n.prioridad,
                'leida': n.leida,
                'fecha': n.fecha_creacion.strftime('%d/%m/%Y %H:%M'),
                'fecha_relative': fecha_rel,
            })
        
        return JsonResponse({'success': True, 'notificaciones': data})
    
    return JsonResponse({'success': False}, status=405)


@login_required
@csrf_exempt
def api_marcar_notificacion_leida(request, notificacion_id):
    """Marcar notificación como leída"""
    from .models import Notificacion
    
    if request.method == 'POST':
        try:
            notificacion = Notificacion.objects.get(id=notificacion_id, usuario_destino=request.user)
            notificacion.leida = True
            notificacion.save()
            return JsonResponse({'success': True})
        except Notificacion.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Notificación no encontrada'}, status=404)
    
    return JsonResponse({'success': False}, status=405)


@login_required
@csrf_exempt
def api_marcar_todas_leidas(request):
    """Marcar todas las notificaciones como leídas"""
    from .models import Notificacion
    
    if request.method == 'POST':
        Notificacion.objects.filter(usuario_destino=request.user, leida=False).update(leida=True)
        return JsonResponse({'success': True})
    
    return JsonResponse({'success': False}, status=405)


@login_required
@csrf_exempt
def api_guardar_config_notificaciones(request):
    """Guardar configuración de notificaciones"""
    from .models import ConfiguracionNotificacion
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            config, _ = ConfiguracionNotificacion.objects.get_or_create(usuario=request.user)
            
            config.notificar_alertas = data.get('notificar_alertas', config.notificar_alertas)
            config.notificar_dispositivos = data.get('notificar_dispositivos', config.notificar_dispositivos)
            config.notificar_personal = data.get('notificar_personal', config.notificar_personal)
            config.notificar_sedes = data.get('notificar_sedes', config.notificar_sedes)
            config.notificar_reportes = data.get('notificar_reportes', config.notificar_reportes)
            config.notificar_backup = data.get('notificar_backup', config.notificar_backup)
            config.notificar_configuracion = data.get('notificar_configuracion', config.notificar_configuracion)
            config.notificar_seguridad = data.get('notificar_seguridad', config.notificar_seguridad)
            config.prioridad_minima = data.get('prioridad_minima', config.prioridad_minima)
            config.email_notificaciones = data.get('email_notificaciones', config.email_notificaciones)
            config.email_destino = data.get('email_destino', config.email_destino)
            
            config.save()
            return JsonResponse({'success': True, 'message': 'Configuración guardada'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=400)
    
    return JsonResponse({'success': False}, status=405)


@login_required
def api_obtener_config_notificaciones(request):
    """Obtener configuración de notificaciones"""
    from .models import ConfiguracionNotificacion
    
    if request.method == 'GET':
        config, _ = ConfiguracionNotificacion.objects.get_or_create(usuario=request.user)
        return JsonResponse({
            'success': True,
            'notificar_alertas': config.notificar_alertas,
            'notificar_dispositivos': config.notificar_dispositivos,
            'notificar_personal': config.notificar_personal,
            'notificar_sedes': config.notificar_sedes,
            'notificar_reportes': config.notificar_reportes,
            'notificar_backup': config.notificar_backup,
            'notificar_configuracion': config.notificar_configuracion,
            'notificar_seguridad': config.notificar_seguridad,
            'prioridad_minima': config.prioridad_minima,
            'email_notificaciones': config.email_notificaciones,
            'email_destino': config.email_destino or '',
        })
    
    return JsonResponse({'success': False}, status=405)