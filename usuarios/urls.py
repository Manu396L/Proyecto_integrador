# usuarios/urls.py
from django.urls import path
from . import views

app_name = 'usuarios'

urlpatterns = [
    path('perfil/', views.perfil, name='perfil'),
    path('cambiar-password/', views.cambiar_password, name='cambiar_password'),
    path('configuracion/', views.configuracion, name='configuracion'),
    path('notificaciones/', views.notificaciones, name='notificaciones'),
]

# URLs para recuperación de contraseña
password_urls = [
    path('recuperar-contraseña/', views.recuperar_contraseña, name='recuperar_contraseña'),
    path('api/recuperar-contraseña/', views.api_recuperar_contraseña, name='api_recuperar_contraseña'),
]

# URLs para registro de nuevos usuarios
registro_urls = [
    path('registro/', views.registro_usuario, name='registro_usuario'),
    path('api/registro/', views.api_registro_usuario, name='api_registro_usuario'),
]

# URLs para ver solicitudes
solicitudes_urls = [
    path('mis-solicitudes/', views.mis_solicitudes, name='mis_solicitudes'),
    path('todas-solicitudes/', views.todas_solicitudes, name='todas_solicitudes'),
]

urlpatterns += password_urls
urlpatterns += registro_urls
urlpatterns += solicitudes_urls