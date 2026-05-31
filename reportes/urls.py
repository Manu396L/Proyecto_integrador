from django.urls import path
from . import views

app_name = 'reportes'

urlpatterns = [
    path('', views.index, name='index'),
    path('guardados/', views.reportes_guardados, name='guardados'),
    path('detalle/<int:reporte_id>/', views.detalle_reporte, name='detalle'),
    
    path('api/generar/', views.generar_reporte, name='generar_reporte'),
    path('api/eliminar/<int:reporte_id>/', views.eliminar_reporte, name='eliminar_reporte'),
    path('api/estadisticas/', views.estadisticas_api, name='estadisticas_api'),
    
    path('exportar/<str:formato>/', views.exportar_datos, name='exportar_datos'),
    path('exportar/<int:reporte_id>/<str:formato>/', views.exportar_reporte, name='exportar_reporte'),
]