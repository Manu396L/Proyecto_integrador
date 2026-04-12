from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from personal.models import RegistroAcceso
from dispositivos.models import Dispositivo

@login_required
def index(request):
    """Vista para mostrar reportes de acceso biométrico con datos reales"""
    # Filtros
    fecha_inicio = request.GET.get('fecha_inicio')
    fecha_fin = request.GET.get('fecha_fin')
    dispositivo_id = request.GET.get('dispositivo_id')
    tipo_acceso = request.GET.get('tipo_acceso')
    
    # Registros base
    registros = RegistroAcceso.objects.select_related('persona', 'dispositivo').all()
    
    # Aplicar filtros
    if fecha_inicio:
        registros = registros.filter(fecha_hora__gte=fecha_inicio)
    if fecha_fin:
        registros = registros.filter(fecha_hora__lte=fecha_fin)
    if dispositivo_id:
        registros = registros.filter(dispositivo_id=dispositivo_id)
    if tipo_acceso:
        registros = registros.filter(tipo_acceso=tipo_acceso)
    
    # Estadísticas
    total_registros = registros.count()
    accesos_exitosos = registros.filter(tipo_acceso='exitoso').count()
    accesos_fallidos = registros.filter(tipo_acceso='fallido').count()
    
    # Últimos 7 días
    hace_7_dias = timezone.now() - timedelta(days=7)
    registros_semana = registros.filter(fecha_hora__gte=hace_7_dias)
    
    # Dispositivos
    dispositivos = Dispositivo.objects.all()
    
    # Ordenar registros más recientes primero
    registros = registros.order_by('-fecha_hora')[:200]
    
    context = {
        'registros': registros,
        'dispositivos': dispositivos,
        'total_registros': total_registros,
        'accesos_exitosos': accesos_exitosos,
        'accesos_fallidos': accesos_fallidos,
        'registros_semana': registros_semana.count(),
        'fecha_inicio': fecha_inicio,
        'fecha_fin': fecha_fin,
        'dispositivo_id': dispositivo_id,
        'tipo_acceso': tipo_acceso,
    }
    
    return render(request, 'reportes/index.html', context)