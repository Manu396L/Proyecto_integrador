from django.urls import path
from . import views

app_name = 'personal'

urlpatterns = [
    path('', views.lista_personal, name='lista'),
]