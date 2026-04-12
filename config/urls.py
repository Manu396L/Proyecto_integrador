from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from django.shortcuts import redirect

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', lambda request: redirect('login')),
    path('dashboard/', include('dashboard.urls')),
    path('sedes/', include('sedes.urls')),
    path('personal/', include('personal.urls')),
    path('dispositivos/', include('dispositivos.urls')),
    path('reportes/', include('reportes.urls')),
    path('alertas/', include('alertas.urls')),
    path('soporte/', include('soporte.urls')),
    path('usuarios/', include('usuarios.urls')),
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(template_name='registration/logout.html'), name='logout'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)