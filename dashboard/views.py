from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils import timezone
from datetime import date, timedelta
import json
import random
from personal.models import Persona, RegistroAcceso
from dispositivos.models import Dispositivo
from alertas.models import Alerta
from sedes.models import Sede, Area
from tickets.models import Ticket
from usuarios.models import Notificacion, SolicitudRegistro


@login_required
def dashboard(request):
    hoy = date.today()
    hace_7_dias = hoy - timedelta(days=7)
    ahora = timezone.now()
    hace_24_horas = ahora - timedelta(hours=24)
    
    # ========== ESTADÍSTICAS PRINCIPALES ==========
    total_personal = Persona.objects.filter(activo=True).count()
    accesos_hoy = RegistroAcceso.objects.filter(fecha_hora__date=hoy).count()
    
    # Dispositivos
    dispositivos_activos = Dispositivo.objects.filter(estado='activo').count()
    dispositivos_inactivos = Dispositivo.objects.filter(estado='inactivo').count()
    dispositivos_error = Dispositivo.objects.filter(estado__in=['error', 'sin_conexion', 'apagado']).count()
    
    # Alertas activas
    alertas_activas = Alerta.objects.filter(resuelta=False).count()
    
    # ========== ALERTAS POR NIVEL (para el gráfico) ==========
    alertas_criticas = Alerta.objects.filter(nivel__in=['CRITICA', 'ALTA'], resuelta=False).count()
    alertas_media = Alerta.objects.filter(nivel='MEDIA', resuelta=False).count()
    alertas_baja = Alerta.objects.filter(nivel='BAJA', resuelta=False).count()
    alertas_informativa = Alerta.objects.filter(nivel='INFORMATIVA', resuelta=False).count()
    
    total_alertas_no_resueltas = alertas_criticas + alertas_media + alertas_baja + alertas_informativa
    
    # Porcentajes para el gráfico
    if total_alertas_no_resueltas > 0:
        porcentaje_criticas = round((alertas_criticas / total_alertas_no_resueltas) * 100, 1)
        porcentaje_media = round((alertas_media / total_alertas_no_resueltas) * 100, 1)
        porcentaje_baja = round((alertas_baja / total_alertas_no_resueltas) * 100, 1)
        porcentaje_informativa = round((alertas_informativa / total_alertas_no_resueltas) * 100, 1)
    else:
        porcentaje_criticas = porcentaje_media = porcentaje_baja = porcentaje_informativa = 0
    
    # ========== GRÁFICO DE ACCESOS POR HORA ==========
    datos_grafico_horas = []
    for hora in range(24):
        count = RegistroAcceso.objects.filter(
            fecha_hora__date=hoy,
            fecha_hora__hour=hora
        ).count()
        datos_grafico_horas.append(count)
    
    # ========== GRÁFICO DE ACCESOS POR DÍA ==========
    datos_grafico_dias = []
    etiquetas_dias = []
    for i in range(7):
        dia = hoy - timedelta(days=6-i)
        count = RegistroAcceso.objects.filter(fecha_hora__date=dia).count()
        datos_grafico_dias.append(count)
        etiquetas_dias.append(dia.strftime('%d/%m'))
    
    # ========== LISTAS PARA TABLAS ==========
    ultimos_accesos = RegistroAcceso.objects.select_related('persona', 'dispositivo').order_by('-fecha_hora')[:10]
    personal_reciente = Persona.objects.filter(activo=True).order_by('-id')[:5]
    alertas_pendientes = Alerta.objects.filter(resuelta=False).select_related('dispositivo', 'persona').order_by('-fecha_hora')[:5]
    
    # Sedes
    sedes_lista = []
    for sede in Sede.objects.all():
        sedes_lista.append({
            'id': sede.id,
            'nombre': sede.nombre,
            'codigo': sede.codigo_unico or f"SED-{sede.id:03d}",
            'areas_count': Area.objects.filter(sede=sede).count(),
            'activo': sede.activo,
        })
    
    context = {
        # Estadísticas principales
        'total_personal': total_personal,
        'accesos_hoy': accesos_hoy,
        'dispositivos_activos': dispositivos_activos,
        'dispositivos_inactivos': dispositivos_inactivos,
        'dispositivos_error': dispositivos_error,
        'alertas_activas': alertas_activas,
        
        # Datos para gráficos
        'datos_grafico_horas': json.dumps(datos_grafico_horas),
        'datos_grafico_dias': json.dumps(datos_grafico_dias),
        'etiquetas_grafico_dias': json.dumps(etiquetas_dias),
        
        # Datos para gráfico de alertas
        'alertas_criticas': alertas_criticas,
        'alertas_media': alertas_media,
        'alertas_baja': alertas_baja,
        'alertas_informativa': alertas_informativa,
        'porcentaje_criticas': porcentaje_criticas,
        'porcentaje_media': porcentaje_media,
        'porcentaje_baja': porcentaje_baja,
        'porcentaje_informativa': porcentaje_informativa,
        'total_alertas_no_resueltas': total_alertas_no_resueltas,
        
        # Listas para tablas
        'ultimos_accesos': ultimos_accesos,
        'personal_reciente': personal_reciente,
        'alertas_pendientes': alertas_pendientes,
        'sedes': sedes_lista,
    }
    
    return render(request, 'dashboard/index.html', context)


# ========== SIMULADOR DE ACCESOS EN TIEMPO REAL ==========
@csrf_exempt
@login_required
def simular_acceso(request):
    """API para recibir accesos simulados en tiempo real"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            print(f"📡 Acceso simulado recibido: {data.get('usuario')} - {data.get('tipo_acceso')}")
            
            nombre_completo = data.get('usuario', 'Usuario Simulado')
            nombres = nombre_completo.split()[0] if ' ' in nombre_completo else nombre_completo
            apellidos = ' '.join(nombre_completo.split()[1:]) if ' ' in nombre_completo else 'Simulado'
            
            persona, _ = Persona.objects.get_or_create(
                numero_documento=f"SIM_{data.get('id', 0)}",
                defaults={
                    'nombres': nombres,
                    'apellidos': apellidos,
                    'email': f"simulado_{data.get('id', 0)}@simulacion.com",
                    'activo': True
                }
            )
            
            dispositivo_nombre = data.get('dispositivo', 'Terminal Simulada')
            dispositivo, _ = Dispositivo.objects.get_or_create(
                nombre=dispositivo_nombre,
                defaults={
                    'estado': 'activo',
                    'tipo_dispositivo': 'huella',
                    'direccion_ip': '127.0.0.1',
                    'numero_serie': f"SIM_{data.get('id', 0)}"
                }
            )
            
            acceso = RegistroAcceso.objects.create(
                persona=persona,
                dispositivo=dispositivo,
                tipo_acceso=data.get('tipo_acceso', 'exitoso'),
                fecha_hora=timezone.now(),
                motivo_denegado=data.get('mensaje', '') if data.get('tipo_acceso') == 'fallido' else ''
            )
            
            return JsonResponse({'success': True, 'acceso_id': acceso.id})
        except Exception as e:
            print(f"Error en simulación: {e}")
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)


# ========== SIMULADOR DE DISPOSITIVOS ==========
@csrf_exempt
@login_required
def simular_dispositivo(request):
    """Simula cambios de estado en dispositivos"""
    if request.method == 'POST':
        try:
            estados = ['activo', 'inactivo', 'error', 'sin_conexion']
            estado = random.choice(estados)
            
            nombres_dispositivos = [
                'Terminal Recepción', 'Terminal Oficinas', 'Terminal Laboratorio',
                'Terminal Planta Baja', 'Terminal Piso 2', 'Terminal Gerencia'
            ]
            dispositivo_nombre = random.choice(nombres_dispositivos)
            
            dispositivo, _ = Dispositivo.objects.get_or_create(
                nombre=dispositivo_nombre,
                defaults={
                    'estado': estado,
                    'tipo_dispositivo': random.choice(['huella', 'tarjeta', 'pin']),
                    'direccion_ip': f"192.168.{random.randint(1,255)}.{random.randint(1,255)}",
                    'numero_serie': f"SIM_{random.randint(1000,9999)}"
                }
            )
            
            dispositivo.estado = estado
            dispositivo.save()
            
            if estado in ['error', 'sin_conexion']:
                Alerta.objects.create(
                    tipo='DISPOSITIVO_OFFLINE',
                    nivel='ALTA',
                    mensaje=f"Dispositivo '{dispositivo.nombre}' cambió a estado: {estado}",
                    dispositivo=dispositivo,
                )
            
            return JsonResponse({
                'success': True, 
                'dispositivo': dispositivo.nombre,
                'estado': estado,
                'mensaje': f"Dispositivo {dispositivo.nombre} ahora está: {estado}"
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    return JsonResponse({'success': False}, status=405)


# ========== SIMULADOR DE ALERTAS ==========
@csrf_exempt
@login_required
def simular_alerta(request):
    """Simula la creación de alertas automáticas"""
    if request.method == 'POST':
        try:
            tipos_alerta = [
                ('ACCESO_NO_AUTORIZADO', 'CRITICA'),
                ('DISPOSITIVO_OFFLINE', 'ALTA'),
                ('INTENTO_FALLIDO', 'MEDIA'),
                ('PUERTA_ABIERTA', 'ALTA'),
                ('MANTENIMIENTO', 'BAJA'),
            ]
            
            tipo, nivel = random.choice(tipos_alerta)
            
            mensajes = {
                'ACCESO_NO_AUTORIZADO': 'Intento de acceso no autorizado detectado',
                'DISPOSITIVO_OFFLINE': 'Dispositivo sin comunicación',
                'INTENTO_FALLIDO': 'Múltiples intentos fallidos de autenticación',
                'PUERTA_ABIERTA': 'Puerta detectada abierta fuera de horario',
                'MANTENIMIENTO': 'Mantenimiento programado requerido',
            }
            
            alerta = Alerta.objects.create(
                tipo=tipo,
                nivel=nivel,
                mensaje=mensajes[tipo],
            )
            
            return JsonResponse({
                'success': True,
                'alerta_id': alerta.id,
                'tipo': tipo,
                'nivel': nivel,
                'mensaje': mensajes[tipo]
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    return JsonResponse({'success': False}, status=405)


# ========== SIMULADOR DE TICKETS ==========
@csrf_exempt
@login_required
def simular_ticket(request):
    """Simula la creación de tickets de soporte"""
    if request.method == 'POST':
        try:
            asuntos = [
                'Problema con lector biométrico',
                'No puedo acceder a mi cuenta',
                'Dispositivo no responde',
                'Error en registro de huella',
                'Solicitud de nuevo usuario',
                'Problema de conectividad',
            ]
            
            prioridades = ['baja', 'media', 'alta', 'urgente']
            
            ticket = Ticket.objects.create(
                titulo=random.choice(asuntos),
                descripcion=f"Reporte automático. Por favor revisar el sistema.",
                prioridad=random.choice(prioridades),
                estado='abierto',
                remitente_nombre=f"Usuario_{random.randint(1,100)}",
                remitente_email=f"usuario{random.randint(1,100)}@biometrika.com"
            )
            
            return JsonResponse({
                'success': True,
                'ticket_id': ticket.id,
                'titulo': ticket.titulo,
                'prioridad': ticket.prioridad
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    return JsonResponse({'success': False}, status=405)


# ========== SIMULADOR DE SEDES ==========
@csrf_exempt
@login_required
def simular_sede(request):
    """Simula la creación/actualización de sedes"""
    if request.method == 'POST':
        try:
            nombres_sedes = [
                'Sede Tecnológica', 'Centro de Innovación', 'Oficina Comercial',
                'Planta Industrial Norte', 'Centro Logístico Sur', 'Torre Corporativa'
            ]
            
            nombre = random.choice(nombres_sedes)
            sede, created = Sede.objects.get_or_create(
                nombre=nombre,
                defaults={
                    'codigo_unico': f"SED-{random.randint(100,999)}",
                    'direccion': f"Calle {random.randint(1,100)} #{random.randint(1000,9999)}",
                    'activo': True
                }
            )
            
            if created:
                Area.objects.create(
                    sede=sede,
                    nombre="Recepción",
                    piso=1,
                    nivel_seguridad=random.choice(['bajo', 'medio', 'alto']),
                    dispositivo_biometrico=random.choice(['huella', 'tarjeta', 'pin'])
                )
            
            return JsonResponse({
                'success': True,
                'created': created,
                'sede_id': sede.id,
                'nombre': sede.nombre,
                'accion': 'creada' if created else 'ya existía'
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    return JsonResponse({'success': False}, status=405)


# ========== SIMULADOR DE NOTIFICACIONES ==========
@csrf_exempt
@login_required
def simular_notificacion(request):
    """Simula la creación de notificaciones del sistema"""
    if request.method == 'POST':
        try:
            titulos = [
                ('📱 Nuevo dispositivo registrado', 'DISPOSITIVO'),
                ('⚠️ Alerta de seguridad', 'SEGURIDAD'),
                ('👤 Nueva solicitud de registro', 'PERSONAL'),
                ('📊 Reporte generado', 'REPORTE'),
                ('💾 Backup completado', 'BACKUP'),
            ]
            
            titulo, tipo = random.choice(titulos)
            prioridades = ['informativa', 'baja', 'media', 'alta', 'critica']
            prioridad = random.choice(prioridades)
            
            notificacion = Notificacion.objects.create(
                titulo=titulo,
                mensaje=f"Evento simulado: {titulo}. Revise el sistema.",
                tipo=tipo,
                prioridad=prioridad,
                usuario_destino=request.user
            )
            
            return JsonResponse({
                'success': True,
                'notificacion_id': notificacion.id,
                'titulo': titulo,
                'prioridad': prioridad
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    return JsonResponse({'success': False}, status=405)


# ========== SIMULADOR DE USUARIOS NUEVOS ==========
@csrf_exempt
@login_required
def simular_usuario_nuevo(request):
    """Simula la solicitud de registro de nuevos usuarios"""
    if request.method == 'POST':
        try:
            nombres = [
                'Juan Carlos Pérez', 'María Elena Gómez', 'Carlos Andrés López',
                'Ana Patricia Martínez', 'Luis Fernando Rodríguez', 'Laura Isabel Fernández'
            ]
            
            nombre = random.choice(nombres)
            base_nombre = nombre.split()[0].lower()
            dni = f"{random.randint(10000000, 99999999)}"
            
            solicitud = SolicitudRegistro.objects.create(
                nombre=nombre,
                dni=dni,
                email=f"{base_nombre}.{random.randint(1,999)}@biometrika.com",
                telefono=f"11{random.randint(10000000, 99999999)}",
                departamento=random.choice(['TI', 'RH', 'Ventas', 'Marketing']),
                puesto=random.choice(['Analista', 'Coordinador', 'Asistente', 'Gerente']),
                superior=f"Supervisor {random.choice(['García', 'Rodríguez', 'López'])}",
                estado='pendiente'
            )
            
            Ticket.objects.create(
                titulo=f"Solicitud de registro - {nombre} (DNI: {dni})",
                descripcion=f"Solicitud de nuevo usuario: {nombre}\nDNI: {dni}\nEmail: {solicitud.email}",
                prioridad='media',
                estado='abierto',
                remitente_nombre=nombre,
                remitente_email=solicitud.email
            )
            
            return JsonResponse({
                'success': True,
                'solicitud_id': solicitud.id,
                'nombre': nombre,
                'dni': dni
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    return JsonResponse({'success': False}, status=405)