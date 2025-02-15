from django.contrib import admin

from .models import Facility


@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'location', 'capacity', 'is_active', 'created_at')
    list_filter = ('type', 'is_active')
    search_fields = ('name', 'location')

