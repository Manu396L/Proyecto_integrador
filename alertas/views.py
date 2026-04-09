# alertas/views.py
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from dispositivos.models import Dispositivo

@login_required
def lista_alertas(request):
    # Obtener todos los dispositivos
    dispositivos = Dispositivo.objects.select_related('sede', 'area').all()
    
    # Datos para la tabla (simulados - luego los conectas con tus modelos reales)
    datos_dispositivos = [
        {
            'id': 'BIO-001',
            'nombre': 'BIO-001',
            'sede': 'Sede Central',
            'oficina': 'Recepcion Principal',
            'ubicacion': 'Planta Baja - Entrada A',
            'ultimo_registro': '15/03/2024 08:30:45',
            'tipo_auth': 'huella',
            'estado': 'caido'
        },
        {
            'id': 'BIO-045',
            'nombre': 'BIO-045',
            'sede': 'Sede Norte',
            'oficina': 'RH - Piso 3',
            'ubicacion': 'Oficina 301 - Pasillo Central',
            'ultimo_registro': '14/03/2024 17:15:22',
            'tipo_auth': 'tarjeta',
            'estado': 'caido'
        },
        {
            'id': 'BIO-128',
            'nombre': 'BIO-128',
            'sede': 'Sede Sur',
            'oficina': 'Almacén',
            'ubicacion': 'Zona de Carga - Puerta 2',
            'ultimo_registro': '15/03/2024 07:45:18',
            'tipo_auth': 'pin',
            'estado': 'inestable'
        },
        {
            'id': 'BIO-067',
            'nombre': 'BIO-067',
            'sede': 'Sede Este',
            'oficina': 'Desarrollo',
            'ubicacion': 'Piso 5 - Área Creativa',
            'ultimo_registro': '13/03/2024 14:20:33',
            'tipo_auth': 'huella',
            'estado': 'caido'
        },
        {
            'id': 'BIO-092',
            'nombre': 'BIO-092',
            'sede': 'Sede Oeste',
            'oficina': 'Mantenimiento',
            'ubicacion': 'Sótano - Sala Técnica',
            'ultimo_registro': '15/03/2024 09:10:05',
            'tipo_auth': 'facial',
            'estado': 'inestable'
        },
        {
            'id': 'BIO-153',
            'nombre': 'BIO-153',
            'sede': 'Sede Central',
            'oficina': 'Gerencia',
            'ubicacion': 'Piso 8 - Sala de Juntas',
            'ultimo_registro': '12/03/2024 16:45:12',
            'tipo_auth': 'tarjeta',
            'estado': 'caido'
        },
        {
            'id': 'BIO-201',
            'nombre': 'BIO-201',
            'sede': 'Sede Norte',
            'oficina': 'Ventas',
            'ubicacion': 'Piso 2 - Cubículo B12',
            'ultimo_registro': '15/03/2024 10:30:28',
            'tipo_auth': 'pin',
            'estado': 'online'
        },
        {
            'id': 'BIO-078',
            'nombre': 'BIO-078',
            'sede': 'Sede Sur',
            'oficina': 'Calidad',
            'ubicacion': 'Piso 4 - Laboratorio B',
            'ultimo_registro': '14/03/2024 13:15:47',
            'tipo_auth': 'huella',
            'estado': 'caido'
        },
    ]
    
    # Contadores
    criticos = sum(1 for d in datos_dispositivos if d['estado'] == 'caido')
    problemas = sum(1 for d in datos_dispositivos if d['estado'] == 'inestable')
    estables = sum(1 for d in datos_dispositivos if d['estado'] == 'online')
    
    # Lista de sedes para filtros
    sedes = list(set(d['sede'] for d in datos_dispositivos))
    
    context = {
        'dispositivos': datos_dispositivos,
        'criticos': criticos,
        'problemas': problemas,
        'estables': estables,
        'sedes': sedes,
    }
    
    return render(request, 'alertas/lista.html', context)

@login_required
def reportar_dispositivo(request, dispositivo_id):
    """API endpoint para reportar un dispositivo"""
    if request.method == 'POST':
        # Aquí iría la lógica para reportar el dispositivo
        # Por ahora solo respondemos éxito
        return JsonResponse({'success': True, 'message': f'Dispositivo {dispositivo_id} reportado'})
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)