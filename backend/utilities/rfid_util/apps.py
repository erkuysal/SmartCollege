from django.apps import AppConfig


class RfidUtilConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'utilities.rfid_util'
    
    def ready(self):
        """
        Import signals when the app is ready to ensure they are registered.
        """
        import utilities.rfid_util.signals
