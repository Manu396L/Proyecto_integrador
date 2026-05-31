from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from personal.models import Persona, RegistroAcceso
from dispositivos.models import Dispositivo
from alertas.models import Alerta
from sedes.models import Sede, Area
from datetime import date, timedelta
import json

@login_required
def dashboard(request):
    hoy = date.today()
    hace_7_dias = hoy - timedelta(days=7)
    
    # Estadísticas ACTUALES
    total_personal = Persona.objects.filter(activo=True).count()
    accesos_hoy = RegistroAcceso.objects.filter(fecha_hora__date=hoy).count()
    dispositivos_activos = Dispositivo.objects.filter(estado='ACTIVO').count()
    alertas_activas = Alerta.objects.filter(leida=False, resuelta=False).count()
    
    # Personal recientemente agregado
    personal_reciente = Persona.objects.all().order_by('-id')[:5]
    
    # Alertas no resueltas
    alertas_pendientes = Alerta.objects.filter(resuelta=False).order_by('-fecha_hora')[:5]
    
    # Dispositivos con problemas
    dispositivos_problemas = Dispositivo.objects.filter(estado='INACTIVO').count()
    
    # Datos para gráfico de accesos por hora
    datos_grafico = []
    for hora in range(24):
        count = RegistroAcceso.objects.filter(
            fecha_hora__date=hoy,
            fecha_hora__hour=hora
        ).count()
        datos_grafico.append(count)
    
    # Últimos accesos
    ultimos_accesos = RegistroAcceso.objects.select_related('persona').order_by('-fecha_hora')[:10]
    
    # Estadísticas por sede - Usando solo campos que existen
    sedes = Sede.objects.all()
    areas_por_sede = {}
    sedes_lista = []
    
    for sede in sedes:
        # Contar áreas por sede
        areas_count = Area.objects.filter(sede=sede).count()
        areas_por_sede[str(sede.id)] = areas_count
        
        # Crear lista de sedes para el template (SIN ciudad)
        sedes_lista.append({
            'id': sede.id,
            'nombre': sede.nombre,
            'direccion': sede.direccion,
            'activo': sede.activo,
            'areas_count': areas_count,
            'codigo': sede.codigo_unico or f"SED-{sede.id:03d}"
        })
    
    # Actividad de la semana
    accesos_semana = RegistroAcceso.objects.filter(
        fecha_hora__date__gte=hace_7_dias,
        fecha_hora__date__lte=hoy
    ).count()
    
    context = {
        'total_personal': total_personal,
        'accesos_hoy': accesos_hoy,
        'accesos_semana': accesos_semana,
        'dispositivos_activos': dispositivos_activos,
        'dispositivos_inactivos': dispositivos_problemas,
        'alertas_activas': alertas_activas,
        'datos_grafico': json.dumps(datos_grafico),
        'ultimos_accesos': ultimos_accesos,
        'personal_reciente': personal_reciente,
        'alertas_pendientes': alertas_pendientes,
        'sedes': sedes_lista,
        'areas_por_sede': json.dumps(areas_por_sede),
    }
    
    return render(request, 'dashboard/index.html', context)