from django.contrib.admin import AdminSite
from django.contrib import admin
from django.urls import reverse

# Import admin configurations
from backend.admin.academics import models_to_register as academics_models
from backend.admin.users import models_to_register as user_models
from backend.admin.rfid import models_to_register as rfid_models
from backend.admin.college import models_to_register as college_models


class CustomAdmin(AdminSite):
    site_header = "Smart College Admin"
    site_title = "College Management"
    index_title = "Dashboard"

    def get_app_list(self, request):
        """ Override Django admin panel to group models dynamically. """
        app_list = super().get_app_list(request)

        def get_admin_url(model):
            """Dynamically get admin URL for a model instead of hardcoding"""
            return reverse("admin:%s_%s_changelist" % (model._meta.app_label, model._meta.model_name))

        grouped_sections = [
            {
                'name': '📚 Academics',
                'models': [{'name': model._meta.verbose_name_plural, 'admin_url': get_admin_url(model)}
                           for model, _ in academics_models]
            },
            {
                'name': '👨‍🎓 Users & RFID',
                'models': [{'name': model._meta.verbose_name_plural, 'admin_url': get_admin_url(model)}
                           for model, _ in user_models + rfid_models]
            },
            {
                'name': '🏫 College Infrastructure',
                'models': [{'name': model._meta.verbose_name_plural, 'admin_url': get_admin_url(model)}
                           for model, _ in college_models]
            }
        ]

        return grouped_sections + app_list


# Create an instance of the custom admin site
custom_admin_site = CustomAdmin(name="custom_admin")


# Register all models from each module
for models in [academics_models, user_models, rfid_models, college_models]:
    for model, model_admin in models:
        custom_admin_site.register(model, model_admin)