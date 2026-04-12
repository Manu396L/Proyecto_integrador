from django.urls import path
from . import views

app_name = 'usuarios'

urlpatterns = [
    path('perfil/', views.perfil, name='perfil'),
    path('cambiar-password/', views.cambiar_password, name='cambiar_password'),
    path('configuracion/', views.configuracion, name='configuracion'),
    path('notificaciones/', views.notificaciones, name='notificaciones'),
    path('recuperar-contraseña/', views.recuperar_contraseña, name='recuperar_contraseña'),
    path('api/recuperar-contraseña/', views.api_recuperar_contraseña, name='api_recuperar_contraseña'),
    path('registro/', views.registro_usuario, name='registro_usuario'),
    path('api/registro/', views.api_registro_usuario, name='api_registro_usuario'),
]