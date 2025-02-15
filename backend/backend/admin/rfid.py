from django.contrib import admin
from utilities.rfid_util.models import RFIDTag


class RFIDTagAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'tag_id', 'issued_at')
    search_fields = ('user__email', 'tag_id')

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "User Email"


models_to_register = [
    (RFIDTag, RFIDTagAdmin),
]
