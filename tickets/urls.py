from django.urls import path
from . import views

app_name = 'tickets'

urlpatterns = [
    path('', views.lista_tickets, name='lista'),
    path('api/tickets/', views.api_tickets, name='api_tickets'),
    path('api/crear/', views.api_crear_ticket, name='api_crear'),
    path('api/tickets/<int:ticket_id>/', views.api_actualizar_ticket, name='api_actualizar_ticket'),
    path('api/tickets/<int:ticket_id>/resolver/', views.api_resolver_ticket, name='api_resolver_ticket'),
]