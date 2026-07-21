from django.contrib import admin

from .models import (
    Notification,
    SMSLog,
    EmailLog,
    Circular,
    EventReminder,
    ParentCommunication,
)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "school",
        "notification_type",
        "target_audience",
        "is_read",
        "created_at",
    )
    list_filter = (
        "notification_type",
        "target_audience",
        "is_read",
        "school",
    )
    search_fields = (
        "title",
        "message",
    )
    ordering = ("-created_at",)


@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    list_display = (
        "phone_number",
        "status",
        "school",
        "sent_by",
        "created_at",
    )
    list_filter = (
        "status",
        "school",
    )
    search_fields = (
        "phone_number",
        "message",
    )
    ordering = ("-created_at",)


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = (
        "to_email",
        "subject",
        "status",
        "school",
        "created_at",
    )
    list_filter = (
        "status",
        "school",
    )
    search_fields = (
        "to_email",
        "subject",
    )
    ordering = ("-created_at",)


@admin.register(Circular)
class CircularAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "school",
        "target_audience",
        "published",
        "created_by",
        "created_at",
    )
    list_filter = (
        "published",
        "target_audience",
        "school",
    )
    search_fields = (
        "title",
        "content",
    )
    ordering = ("-created_at",)


@admin.register(EventReminder)
class EventReminderAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "event_date",
        "reminder_days",
        "sent",
    )
    list_filter = (
        "sent",
        "school",
    )
    search_fields = (
        "title",
    )
    ordering = ("event_date",)


@admin.register(ParentCommunication)
class ParentCommunicationAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "subject",
        "communication_type",
        "sent_by",
        "sent_at",
    )
    list_filter = (
        "communication_type",
        "school",
    )
    search_fields = (
        "subject",
        "message",
    )
    ordering = ("-sent_at",)