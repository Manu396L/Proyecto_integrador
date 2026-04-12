from django.urls import path
from . import views

app_name = 'dispositivos'

urlpatterns = [
    path('', views.lista_dispositivos, name='lista'),
]