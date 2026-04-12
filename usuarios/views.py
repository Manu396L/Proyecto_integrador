from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import update_session_auth_hash
from django.contrib import messages
from django.contrib.auth.forms import PasswordChangeForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
import json
import re

@login_required
def perfil(request):
    return render(request, 'usuarios/perfil.html')

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
    return render(request, 'usuarios/notificaciones.html')

def recuperar_contraseña(request):
    return render(request, 'registration/recuperar_contraseña.html')

@csrf_exempt
def api_recuperar_contraseña(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email', '').strip()
            return JsonResponse({'success': True, 'message': 'Correo enviado correctamente'})
        except:
            return JsonResponse({'success': False, 'message': 'Error'}, status=400)
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)

def registro_usuario(request):
    return render(request, 'registration/registro_usuario.html')

@csrf_exempt
def api_registro_usuario(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            return JsonResponse({'success': True, 'message': 'Solicitud enviada correctamente'})
        except:
            return JsonResponse({'success': False, 'message': 'Error'}, status=400)
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)