from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('api/simular-acceso/', views.simular_acceso, name='simular_acceso'),
    path('api/simular-dispositivo/', views.simular_dispositivo, name='simular_dispositivo'),
    path('api/simular-alerta/', views.simular_alerta, name='simular_alerta'),
    path('api/simular-ticket/', views.simular_ticket, name='simular_ticket'),
    path('api/simular-sede/', views.simular_sede, name='simular_sede'),
    path('api/simular-notificacion/', views.simular_notificacion, name='simular_notificacion'),
    path('api/simular-usuario/', views.simular_usuario_nuevo, name='simular_usuario'),
]