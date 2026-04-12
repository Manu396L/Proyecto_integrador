from django.urls import path
from . import views

app_name = 'alertas'

urlpatterns = [
    path('', views.lista_alertas, name='lista'),
]