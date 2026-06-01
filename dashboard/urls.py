from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('api/simular-acceso/', views.simular_acceso, name='simular_acceso'),
]