from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Alerta

@login_required
def lista_alertas(request):
    alertas = Alerta.objects.filter(leida=False).order_by('-fecha_hora')
    return render(request, 'alertas/lista.html', {'alertas': alertas})