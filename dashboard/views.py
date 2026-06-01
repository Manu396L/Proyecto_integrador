from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from datetime import date, timedelta
import json
from personal.models import Persona, RegistroAcceso
from dispositivos.models import Dispositivo
from alertas.models import Alerta
from sedes.models import Sede, Area


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