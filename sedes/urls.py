from django.urls import path
from . import views

app_name = 'sedes'

urlpatterns = [
    path('', views.lista_sedes, name='lista'),
    # API Sedes
    path('api/sedes/', views.api_sedes, name='api_sedes'),
    path('api/sedes/<int:sede_id>/', views.api_sede_detail, name='api_sede_detail'),
    # API Areas
    path('api/areas/', views.api_areas, name='api_areas'),
    path('api/areas/<int:area_id>/', views.api_area_detail, name='api_area_detail'),
    # Exportar/Importar
    path('exportar/<str:formato>/', views.exportar_sedes, name='exportar_sedes'),
    path('importar/', views.importar_sedes, name='importar_sedes'),
]