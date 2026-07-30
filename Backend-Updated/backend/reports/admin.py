from django.contrib import admin

from .models import SavedReport, ReportSchedule


@admin.register(SavedReport)
class SavedReportAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "school",
        "report_type",
        "is_public",
        "created_by",
        "created_at",
    )
    list_filter = (
        "report_type",
        "is_public",
        "school",
    )
    search_fields = ("name",)
    raw_id_fields = (
        "school",
        "created_by",
    )
    ordering = ("-created_at",)


@admin.register(ReportSchedule)
class ReportScheduleAdmin(admin.ModelAdmin):
    list_display = (
        "saved_report",
        "school",
        "frequency",
        "is_active",
        "last_sent",
        "next_send",
        "created_at",
    )
    list_filter = (
        "frequency",
        "is_active",
        "school",
    )
    raw_id_fields = (
        "school",
        "saved_report",
    )
    ordering = ("-created_at",)
