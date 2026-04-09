from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Persona

@login_required
def lista_personal(request):
    personal = Persona.objects.all()
    return render(request, 'personal/lista.html', {'personal': personal})