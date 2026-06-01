from django.apps import AppConfig


class AlertasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'alertas'
# alertas/apps.py

    def ready(self):
        # Importar signals para que se registren
        import alertas.signals