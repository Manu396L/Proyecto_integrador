from django.urls import path
from . import views

app_name = 'soporte'

urlpatterns = [
    path('', views.index, name='index'),
]