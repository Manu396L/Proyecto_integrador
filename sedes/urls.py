from django.urls import path
from . import views

app_name = 'sedes'

urlpatterns = [
    path('', views.lista_sedes, name='lista'),
    # API Sedes
    path('api/sedes/', views.api_sedes, name='api_sedes'),
    path('api/crear/', views.api_crear_sede, name='api_crear'),
    path('api/sedes/<int:sede_id>/', views.api_actualizar_sede, name='api_actualizar_sede'),
    # API Áreas
    path('api/areas/crear/', views.api_crear_area, name='api_crear_area'),
    path('api/areas/', views.api_areas, name='api_areas'),
    path('api/areas/<int:area_id>/', views.api_actualizar_area, name='api_actualizar_area'),
]