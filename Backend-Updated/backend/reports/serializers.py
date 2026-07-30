from rest_framework import serializers

from .models import SavedReport, ReportSchedule


class SavedReportSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = SavedReport
        fields = [
            "id",
            "school",
            "name",
            "report_type",
            "parameters",
            "created_by",
            "created_by_name",
            "is_public",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def get_created_by_name(self, obj):
        user = obj.created_by
        if user.first_name or user.last_name:
            return f"{user.first_name} {user.last_name}".strip()
        return user.email


class ReportScheduleSerializer(serializers.ModelSerializer):
    saved_report_name = serializers.CharField(
        source="saved_report.name", read_only=True
    )

    class Meta:
        model = ReportSchedule
        fields = [
            "id",
            "school",
            "saved_report",
            "saved_report_name",
            "frequency",
            "day_of_week",
            "day_of_month",
            "recipients",
            "is_active",
            "last_sent",
            "next_send",
            "created_at",
        ]
        read_only_fields = ("id", "created_at", "last_sent", "next_send")
