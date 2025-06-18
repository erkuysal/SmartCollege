from django.contrib import admin
from .models import RFIDTag


@admin.register(RFIDTag)
class RFIDTagAdmin(admin.ModelAdmin):
    list_display = ('tag_id', 'user')
    search_fields = ('tag_id', 'user__first_name', 'user__last_name')
    raw_id_fields = ('user',)
