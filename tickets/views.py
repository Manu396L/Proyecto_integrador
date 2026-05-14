from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import json
from .models import Ticket

@login_required
def lista_tickets(request):
    tickets = Ticket.objects.all()
    return render(request, 'tickets/lista.html', {'tickets': tickets})

@csrf_exempt
def api_crear_ticket(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            remitente_nombre = data.get('remitente_nombre', request.user.get_full_name() or request.user.username)
            remitente_email = data.get('remitente_email', request.user.email)
            
            ticket = Ticket.objects.create(
                titulo=data['titulo'],
                descripcion=data['descripcion'],
                prioridad=data.get('prioridad', 'media'),
                creado_por=request.user,
                remitente_nombre=remitente_nombre,
                remitente_email=remitente_email
            )
            return JsonResponse({
                'success': True,
                'message': 'Ticket creado correctamente',
                'ticket_id': ticket.id
            })
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)

def api_tickets(request):
    if request.method == 'GET':
        tickets = Ticket.objects.all().values(
            'id', 'titulo', 'descripcion', 'estado', 'prioridad',
            'creado_por__username', 'fecha_creacion', 
            'remitente_nombre', 'remitente_email', 'solucion'
        )
        return JsonResponse(list(tickets), safe=False)

@csrf_exempt
def api_actualizar_ticket(request, ticket_id):
    if request.method == 'PUT':
        try:
            ticket = Ticket.objects.get(id=ticket_id)
            data = json.loads(request.body)
            ticket.titulo = data.get('titulo', ticket.titulo)
            ticket.descripcion = data.get('descripcion', ticket.descripcion)
            ticket.estado = data.get('estado', ticket.estado)
            ticket.prioridad = data.get('prioridad', ticket.prioridad)
            ticket.remitente_nombre = data.get('remitente_nombre', ticket.remitente_nombre)
            ticket.remitente_email = data.get('remitente_email', ticket.remitente_email)
            ticket.save()
            return JsonResponse({'success': True, 'message': 'Ticket actualizado'})
        except Ticket.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Ticket no encontrado'}, status=404)
    elif request.method == 'DELETE':
        try:
            ticket = Ticket.objects.get(id=ticket_id)
            ticket.delete()
            return JsonResponse({'success': True, 'message': 'Ticket eliminado'})
        except Ticket.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Ticket no encontrado'}, status=404)

@csrf_exempt
def api_resolver_ticket(request, ticket_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        
        if ticket.estado in ['resuelto', 'cerrado']:
            return JsonResponse({'error': 'Este ticket ya está resuelto o cerrado'}, status=400)
        
        data = json.loads(request.body)
        solucion = data.get('solucion', '')
        enviar_email = data.get('enviar_email', True)
        
        ticket.estado = 'resuelto'
        ticket.solucion = solucion
        ticket.fecha_resolucion = timezone.now()
        ticket.save()
        
        email_enviado = False
        if enviar_email and ticket.remitente_email:
            email_enviado = enviar_email_resolucion(ticket, solucion)
        
        return JsonResponse({
            'success': True,
            'message': 'Ticket resuelto correctamente',
            'email_enviado': email_enviado
        })
        
    except Ticket.DoesNotExist:
        return JsonResponse({'error': 'Ticket no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def enviar_email_resolucion(ticket, solucion):
    try:
        from django.core.mail import send_mail
        from django.conf import settings
        
        asunto = f"Resolución de su ticket #{ticket.id} - {ticket.titulo}"
        mensaje = f"""
Estimado/a {ticket.remitente_nombre or ticket.creado_por.get_full_name() or ticket.creado_por.username},

Su ticket #{ticket.id} - "{ticket.titulo}" ha sido resuelto.

Solución proporcionada:
{solucion}

Fecha de resolución: {ticket.fecha_resolucion.strftime('%d/%m/%Y %H:%M')}

Atentamente,
Equipo de Soporte Técnico
Sistema Biométrico
        """
        
        send_mail(
            asunto,
            mensaje,
            settings.DEFAULT_FROM_EMAIL or 'soporte@biometrika.com',
            [ticket.remitente_email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error al enviar email: {e}")
        return False