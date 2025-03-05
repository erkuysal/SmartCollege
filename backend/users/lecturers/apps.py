from django.apps import AppConfig


class LecturersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users.lecturers'
    
    def ready(self):
        """Import signals when Django is ready to ensure they're connected"""
        import users.lecturers.signals
