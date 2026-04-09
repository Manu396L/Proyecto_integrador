from django.urls import path
from . import views

app_name = 'sedes'

urlpatterns = [
    path('', views.lista_sedes, name='lista'),
]