from django.urls import path
from . import views

app_name = 'personal'

urlpatterns = [
    path('', views.lista_personal, name='lista'),
    path('test-upload/', views.test_upload, name='test_upload'),
    path('api/personal/', views.api_personal, name='api_personal'),
    path('api/personal/<int:persona_id>/', views.api_personal, name='api_personal_detail'),
]