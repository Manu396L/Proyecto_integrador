from django.urls import path
from . import views

app_name = 'alertas'

urlpatterns = [
    path('', views.lista_alertas, name='lista'),
    path('reportar/', views.reportar_dispositivo, name='reportar'),
]