from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import re
from .models import TicketSoporte
from .forms import TicketSoporteForm


@login_required
def index(request):
    return render(request, 'soporte/index.html')


@login_required
def mis_tickets(request):
    """Vista para que el usuario vea sus tickets de soporte"""
    tickets = TicketSoporte.objects.filter(email=request.user.email).order_by('-fecha_creacion')
    return render(request, 'soporte/mis_tickets.html', {'tickets': tickets})


@login_required
def todos_tickets(request):
    """Vista para admin: ver TODOS los tickets de soporte"""
    if not request.user.is_staff:
        from django.shortcuts import redirect
        return redirect('dashboard:index')
    
    estado = request.GET.get('estado', '')
    categoria = request.GET.get('categoria', '')
    
    tickets = TicketSoporte.objects.all().order_by('-fecha_creacion')
    
    if estado:
        tickets = tickets.filter(estado=estado)
    if categoria:
        tickets = tickets.filter(categoria=categoria)
    
    estados = TicketSoporte._meta.get_field('estado').choices
    categorias = TicketSoporte._meta.get_field('categoria').choices
    
    return render(request, 'soporte/todos_tickets.html', {
        'tickets': tickets,
        'estados': estados,
        'categorias': categorias,
        'estado_filtro': estado,
        'categoria_filtro': categoria
    })


@csrf_exempt
def api_crear_ticket(request):
    """API para crear tickets de soporte y GUARDAR EN BASE DE DATOS"""
    if request.method == 'POST':
        try:
            print("\n" + "="*60)
            print("🔍 INTENTANDO GUARDAR TICKET SOPORTE")
            print("="*60)
            
            data = json.loads(request.body)
            print(f"✅ Datos recibidos: {data}")
            
            nombre = data.get('nombre', '').strip()
            email = data.get('email', '').strip()
            categoria = data.get('categoria', '').strip()
            asunto = data.get('asunto', '').strip()
            descripcion = data.get('descripcion', '').strip()
            
            print(f"Nombre: {nombre}")
            print(f"Email: {email}")
            print(f"Categoría: {categoria}")
            
            # Validar campos obligatorios
            if not nombre or not email or not categoria or not asunto or not descripcion:
                print("❌ Faltan campos obligatorios")
                return JsonResponse({
                    'success': False,
                    'message': 'Por favor, complete todos los campos'
                }, status=400)
            
            # Validar email
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
                print("❌ Email inválido")
                return JsonResponse({
                    'success': False,
                    'message': 'Por favor, ingrese un correo electrónico válido'
                }, status=400)
            
            # Validar categoría
            categorias_validas = ['tecnico', 'cuenta', 'biometrico', 'funcionalidad', 'otro']
            if categoria not in categorias_validas:
                print(f"❌ Categoría inválida: {categoria}")
                return JsonResponse({
                    'success': False,
                    'message': 'Categoría inválida'
                }, status=400)
            
            # ✅ AHORA GUARDA EN LA BASE DE DATOS
            print("\n📝 GUARDANDO EN BD...")
            ticket = TicketSoporte.objects.create(
                nombre=nombre,
                email=email,
                categoria=categoria,
                asunto=asunto,
                descripcion=descripcion,
                estado='pendiente'
            )
            
            print(f"✅✅✅ TICKET GUARDADO - ID: {ticket.id}")
            print(f"  Nombre: {ticket.nombre}")
            print(f"  Email: {ticket.email}")
            print(f"  Categoría: {ticket.categoria}")
            print("="*60 + "\n")
            
            return JsonResponse({
                'success': True,
                'message': 'Ticket creado correctamente. Nos pondremos en contacto pronto.',
                'ticket_id': ticket.id
            })
            
        except json.JSONDecodeError as e:
            print(f"❌ Error JSON: {e}")
            return JsonResponse({
                'success': False,
                'message': 'Datos inválidos'
            }, status=400)
        except Exception as e:
            print(f"❌ ERROR AL GUARDAR: {str(e)}")
            print(f"Tipo de error: {type(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({
                'success': False,
                'message': f'Error al crear el ticket: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'message': 'Método no permitido'
    }, status=405)