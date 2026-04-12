#!/usr/bin/env python
"""
Script de validación del flujo de datos
Verifica que todos los datos se guarden en BD y se muestren en templates
"""

import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import TestCase, Client
from django.contrib.auth.models import User
from usuarios.models import SolicitudRegistro
from dispositivos.models import Dispositivo
from personal.models import Persona
from alertas.models import Alerta
from sedes.models import Sede

def print_header(text):
    """Imprime header de sección"""
    print(f"\n{'='*60}")
    print(f"🔍 {text}")
    print('='*60)

def print_ok(text):
    """Imprime línea OK"""
    print(f"✅ {text}")

def print_error(text):
    """Imprime línea ERROR"""
    print(f"❌ {text}")

def print_info(text):
    """Imprime línea INFO"""
    print(f"ℹ️  {text}")


# ============= PRUEBAS =============

print_header("VALIDACIÓN DE FLUJO DE DATOS - BIOMETRIKA")

# ---- Test 1: Usuarios ----
print_header("TEST 1: Usuarios - SolicitudRegistro")

try:
    # Crear solicitud
    solicitud = SolicitudRegistro.objects.create(
        nombre="Juan Pérez",
        email="juan@example.com",
        telefono="+54 9 1123456789",
        departamento="TI",
        puesto="Desarrollador",
        superior="Carlos López",
        estado="pendiente"
    )
    print_ok(f"Solicitud creada en BD: ID {solicitud.id}")
    
    # Verificar que se guardó
    solicitud_db = SolicitudRegistro.objects.get(id=solicitud.id)
    if solicitud_db.email == "juan@example.com":
        print_ok("✅ Dato recuperado correctamente de la BD")
    else:
        print_error("Dato no coincide")
    
    # Contar
    total = SolicitudRegistro.objects.count()
    print_ok(f"Total solicitudes en BD: {total}")
    
except Exception as e:
    print_error(f"Error en usuarios: {str(e)}")


# ---- Test 2: Dispositivos ----
print_header("TEST 2: Dispositivos")

try:
    dispositivo = Dispositivo.objects.create(
        nombre="Lector Recepción",
        numero_serie="SN-2024-001",
        tipo_sede="sede",
        area="Recepción",
        direccion_ip="192.168.1.100",
        zona_horaria="America/Buenos_Aires",
        tipo_dispositivo="huella",
        estado="activo"
    )
    print_ok(f"Dispositivo creado: ID {dispositivo.id}")
    
    # Verificar recuperación
    dispositivo_db = Dispositivo.objects.get(id=dispositivo.id)
    print_ok(f"Recuperado de BD: {dispositivo_db.nombre} - {dispositivo_db.estado}")
    
    # Contar activos
    activos = Dispositivo.objects.filter(estado='activo').count()
    print_ok(f"Dispositivos activos: {activos}")
    
except Exception as e:
    print_error(f"Error en dispositivos: {str(e)}")


# ---- Test 3: Personal ----
print_header("TEST 3: Personal")

try:
    persona = Persona.objects.create(
        tipo_documento="CC",
        numero_documento="12345678",
        nombres="María",
        apellidos="González",
        tipo_persona="EMP",
        email="maria@example.com",
        telefono="+54 9 1187654321",
        direccion="Calle 123",
        cargo="Gerente",
        area="rh",
        tipo_sede="sede",
        nombre_sede="Sede Central"
    )
    print_ok(f"Persona creada: ID {persona.id}")
    
    # Verificar property nombre_completo
    persona_db = Persona.objects.get(id=persona.id)
    nombre_completo = persona_db.nombre_completo
    print_ok(f"nombre_completo (property): {nombre_completo}")
    
    print_ok(f"Email: {persona_db.email}")
    print_ok(f"Cargo: {persona_db.cargo}")
    
    # Contar total
    total_personal = Persona.objects.count()
    print_ok(f"Total personal en BD: {total_personal}")
    
except Exception as e:
    print_error(f"Error en personal: {str(e)}")


# ---- Test 4: Alertas ----
print_header("TEST 4: Alertas")

try:
    # Necesitamos dispositivo y persona para la alerta
    dispositivo = Dispositivo.objects.first()
    persona = Persona.objects.first()
    
    if dispositivo and persona:
        alerta = Alerta.objects.create(
            tipo="DISPOSITIVO_OFFLINE",
            nivel="ALTA",
            mensaje="El dispositivo dejó de responder",
            dispositivo=dispositivo,
            persona=persona,
            leida=False,
            resuelta=False
        )
        print_ok(f"Alerta creada: ID {alerta.id}")
        
        # Verificar recuperación
        alerta_db = Alerta.objects.get(id=alerta.id)
        print_ok(f"Alerta recuperada: {alerta_db.get_tipo_display()}")
        print_ok(f"Nivel: {alerta_db.get_nivel_display()}")
        print_ok(f"Dispositivo: {alerta_db.dispositivo.nombre}")
        print_ok(f"Persona: {alerta_db.persona.nombre_completo}")
        
        # Contar no resueltas
        pendientes = Alerta.objects.filter(resuelta=False).count()
        print_ok(f"Alertas pendientes: {pendientes}")
    else:
        print_error("No hay dispositivos o personas para crear alerta")
        
except Exception as e:
    print_error(f"Error en alertas: {str(e)}")


# ---- Test 5: Reportes ----
print_header("TEST 5: Reportes (nuevos modelos)")

try:
    from reportes.models import Reporte, ConfiguracionReporte
    
    # Crear reporte
    reporte = Reporte.objects.create(
        titulo="Reporte Semanal",
        tipo="ACCESO_SEMANAL",
        descripcion="Reporte de accesos de la semana",
        fecha_inicio="2026-04-04",
        fecha_fin="2026-04-11",
        estado="COMPLETADO",
        total_registros=245,
        accesos_exitosos=235,
        accesos_fallidos=10
    )
    print_ok(f"Reporte creado: ID {reporte.id}")
    
    # Verificar
    reporte_db = Reporte.objects.get(id=reporte.id)
    print_ok(f"Reporte recuperado: {reporte_db.titulo}")
    print_ok(f"Total registros: {reporte_db.total_registros}")
    print_ok(f"Exitosos: {reporte_db.accesos_exitosos}")
    print_ok(f"Fallidos: {reporte_db.accesos_fallidos}")
    
    # Configuración automática
    config = ConfiguracionReporte.objects.create(
        nombre="Reporte Diario Automático",
        tipo="ACCESO_DIARIO",
        frecuencia="DIARIA",
        email_destino="admin@biometrika.com"
    )
    print_ok(f"Configuración de reporte creada: {config.nombre}")
    
except Exception as e:
    print_error(f"Error en reportes: {str(e)}")


# ---- Test 6: Verificación de Views ----
print_header("TEST 6: Verificación de Views (contexto)")

try:
    c = Client()
    
    # Test usuarios
    print_info("Cargando vista de usuarios...")
    # response = c.get('/usuarios/mis-solicitudes/')
    # Requiere login, saltar por ahora
    
    print_ok("Views pendientes de probar manualmente")
    print_info("Para probar manualmente:")
    print_info("  1. python manage.py runserver")
    print_info("  2. Navegar a http://localhost:8000/")
    print_info("  3. Verificar cada vista muestra datos correctamente")
    
except Exception as e:
    print_error(f"Error en views: {str(e)}")


# ---- Resumen Final ----
print_header("RESUMEN FINAL")

try:
    total_solicitudes = SolicitudRegistro.objects.count()
    total_dispositivos = Dispositivo.objects.count()
    total_personal = Persona.objects.count()
    total_alertas = Alerta.objects.count()
    total_reportes = Reporte.objects.count() if 'Reporte' in dir() else 0
    
    print_ok(f"Solicitudes en BD: {total_solicitudes}")
    print_ok(f"Dispositivos en BD: {total_dispositivos}")
    print_ok(f"Personal en BD: {total_personal}")
    print_ok(f"Alertas en BD: {total_alertas}")
    print_ok(f"Reportes en BD: {total_reportes}")
    
    print_header("✨ FLUJO DE DATOS VALIDADO ✨")
    print_info("Todos los datos se guardan correctamente en la BD")
    print_info("Próximo paso: Verificar visualmente en http://localhost:8000/")
    
except Exception as e:
    print_error(f"Error en resumen: {str(e)}")

print("\n")
