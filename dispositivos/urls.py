# dispositivos/urls.py
from django.urls import path
from . import views

app_name = 'dispositivos'

urlpatterns = [
    path('', views.lista_dispositivos, name='lista'),
    path('api/dispositivos/', views.api_dispositivos, name='api_lista'),
    path('api/dispositivos/<int:dispositivo_id>/', views.api_dispositivos, name='api_detalle'),
    path('api/acciones/<int:dispositivo_id>/<str:accion>/', views.api_acciones_dispositivo, name='api_accion'),
    path('api/cargar-modelos/', views.api_cargar_modelos, name='api_cargar_modelos'),
]