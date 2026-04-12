from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Dispositivo

@login_required
def lista_dispositivos(request):
    dispositivos = Dispositivo.objects.all()
    return render(request, 'dispositivos/lista.html', {'dispositivos': dispositivos})