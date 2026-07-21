from django.contrib import admin
from .models import (
    School,
    AcademicYear,
    SchoolSettings,
    SchoolHoliday,
    SchoolNotificationTemplate,
)


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "city", "state", "is_active"]
    search_fields = ["name", "code"]
    list_filter = ["is_active", "state"]


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ["school", "year", "start_date", "end_date", "is_current"]
    list_filter = ["school", "is_current"]


@admin.register(SchoolSettings)
class SchoolSettingsAdmin(admin.ModelAdmin):
    list_display = ["school", "currency", "timezone"]


@admin.register(SchoolHoliday)
class SchoolHolidayAdmin(admin.ModelAdmin):
    list_display = ["school", "name", "date", "holiday_type"]
    list_filter = ["school", "holiday_type"]


@admin.register(SchoolNotificationTemplate)
class SchoolNotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ["school", "template_type", "subject", "is_active"]
    list_filter = ["school", "template_type"]