from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from personal.models import Persona, RegistroAcceso
from dispositivos.models import Dispositivo
from alertas.models import Alerta
from datetime import date
import json

@login_required
def dashboard(request):
    hoy = date.today()
    
    # Estadísticas
    total_personal = Persona.objects.filter(activo=True).count()
    accesos_hoy = RegistroAcceso.objects.filter(fecha_hora__date=hoy).count()
    dispositivos_activos = Dispositivo.objects.filter(estado='ACTIVO').count()
    alertas_activas = Alerta.objects.filter(leida=False, resuelta=False).count()
    
    # Datos para gráfico
    datos_grafico = []
    for hora in range(24):
        count = RegistroAcceso.objects.filter(
            fecha_hora__date=hoy,
            fecha_hora__hour=hora
        ).count()
        datos_grafico.append(count)
    
    # Últimos accesos
    ultimos_accesos = RegistroAcceso.objects.select_related('persona').order_by('-fecha_hora')[:10]
    
    context = {
        'total_personal': total_personal,
        'accesos_hoy': accesos_hoy,
        'dispositivos_activos': dispositivos_activos,
        'alertas_activas': alertas_activas,
        'datos_grafico': json.dumps(datos_grafico),
        'ultimos_accesos': ultimos_accesos,
    }
    
    return render(request, 'dashboard/index.html', context)