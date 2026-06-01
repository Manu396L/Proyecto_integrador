# alertas/urls.py
from django.urls import path
from . import views

app_name = 'alertas'

urlpatterns = [
    path('', views.lista_alertas, name='lista'),
    path('api/alertas/', views.api_alertas, name='api_alertas'),
    path('api/resolver/<int:alerta_id>/', views.marcar_alerta_resuelta, name='marcar_resuelta'),
    path('api/leida/<int:alerta_id>/', views.marcar_alerta_leida, name='marcar_leida'),
    path('reportar/', views.reportar_dispositivo, name='reportar'),
]