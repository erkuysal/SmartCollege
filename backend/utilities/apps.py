from django.apps import AppConfig


class UtilitiesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'utilities'
    
    def ready(self):
        # Import any signals or other initialization code here
        pass 