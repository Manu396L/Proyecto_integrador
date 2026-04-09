# dispositivos/urls.py
from django.urls import path
from . import views

app_name = 'dispositivos'

urlpatterns = [
    path('', views.lista_dispositivos, name='lista'),
    path('api/', views.api_dispositivos, name='api_lista'),
    path('api/<int:dispositivo_id>/', views.api_dispositivos, name='api_detalle'),
    path('api/<int:dispositivo_id>/<str:accion>/', views.api_acciones_dispositivo, name='api_accion'),
]