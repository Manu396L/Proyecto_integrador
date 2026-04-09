from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Sede

@login_required
def lista_sedes(request):
    sedes = Sede.objects.all()
    return render(request, 'sedes/lista.html', {'sedes': sedes})