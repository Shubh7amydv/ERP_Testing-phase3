from django.contrib import admin

from .models import EventType, Event, ExamEvent, SchoolCalendar


@admin.register(EventType)
class EventTypeAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "school",
        "color",
        "is_active",
        "created_at",
    )
    list_filter = (
        "is_active",
        "school",
    )
    search_fields = (
        "name",
    )
    ordering = ("name",)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "school",
        "event_type",
        "start_date",
        "end_date",
        "is_holiday",
        "target_audience",
        "is_active",
        "created_at",
    )
    list_filter = (
        "is_holiday",
        "target_audience",
        "is_active",
        "school",
        "event_type",
    )
    search_fields = (
        "title",
        "description",
        "location",
    )
    raw_id_fields = (
        "school",
        "event_type",
        "created_by",
    )
    ordering = ("-created_at",)


@admin.register(ExamEvent)
class ExamEventAdmin(admin.ModelAdmin):
    list_display = (
        "event",
        "exam",
        "classes",
    )
    raw_id_fields = (
        "event",
        "exam",
    )


@admin.register(SchoolCalendar)
class SchoolCalendarAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "school",
        "academic_year",
        "year",
        "is_published",
        "published_at",
        "created_at",
    )
    list_filter = (
        "is_published",
        "school",
        "academic_year",
    )
    search_fields = (
        "name",
    )
    raw_id_fields = (
        "school",
        "academic_year",
    )
    ordering = ("-created_at",)
