from django.urls import path
from . import views

app_name = 'soporte'

urlpatterns = [
    path('', views.index, name='index'),
    path('api/crear-ticket/', views.api_crear_ticket, name='api_crear_ticket'),
    path('mis-tickets/', views.mis_tickets, name='mis_tickets'),
    path('todos-tickets/', views.todos_tickets, name='todos_tickets'),
]