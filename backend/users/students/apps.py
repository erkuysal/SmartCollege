from django.apps import AppConfig


class StudentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users.students'
    
    def ready(self):
        """Import signals when Django is ready to ensure they're connected"""
        import users.students.signals
