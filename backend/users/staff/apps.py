from django.apps import AppConfig


class StaffConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users.staff'
    
    def ready(self):
        """Import signals when Django is ready to ensure they're connected"""
        import users.staff.signals
