from django.contrib import admin
from django.utils.html import format_html
from .models import RFIDCard


class RFIDCardAdmin(admin.ModelAdmin):
    list_display = ('user_info', 'tag_id', 'card_status_badge', 'assigned_to', 'issued_at', 'written_at', 'is_active')
    list_filter = ('card_status', 'is_active', 'assigned_to_personnel')
    search_fields = ('tag_id', 'user__email', 'user__username', 'user__first_name', 'user__last_name')
    readonly_fields = ('unique_identifier', 'issued_at', 'last_used_at', 'written_at')
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('RFID Information', {
            'fields': ('tag_id', 'unique_identifier', 'card_status', 'is_active')
        }),
        ('Assignment', {
            'fields': ('assigned_to_personnel', 'notes')
        }),
        ('Timestamps', {
            'fields': ('issued_at', 'written_at', 'last_used_at')
        }),
    )
    
    def user_info(self, obj):
        if obj.user:
            return format_html(
                '<strong>{}</strong><br><small>{}</small>',
                obj.user.get_full_name() or obj.user.username,
                obj.user.email
            )
        return "-"
    user_info.short_description = "User"
    
    def assigned_to(self, obj):
        if obj.assigned_to_personnel:
            return format_html(
                '{} {}',
                obj.assigned_to_personnel.first_name,
                obj.assigned_to_personnel.last_name
            )
        return "-"
    assigned_to.short_description = "Assigned To"
    
    def card_status_badge(self, obj):
        status_colors = {
            RFIDCard.STATUS_PENDING: 'secondary',
            RFIDCard.STATUS_ASSIGNED: 'info',
            RFIDCard.STATUS_WRITTEN: 'primary',
            RFIDCard.STATUS_ISSUED: 'success',
            RFIDCard.STATUS_LOST: 'danger',
            RFIDCard.STATUS_INACTIVE: 'warning',
        }
        color = status_colors.get(obj.card_status, 'secondary')
        return format_html(
            '<span style="background-color: var(--bs-{}); color: white; padding: 3px 8px; border-radius: 4px;">{}</span>',
            color,
            obj.get_card_status_display()
        )
    card_status_badge.short_description = "Status"
    
    def has_delete_permission(self, request, obj=None):
        # Only allow deletion of cards that are not issued
        if obj and obj.card_status == RFIDCard.STATUS_ISSUED:
            return False
        return super().has_delete_permission(request, obj)


admin.site.register(RFIDCard, RFIDCardAdmin) 