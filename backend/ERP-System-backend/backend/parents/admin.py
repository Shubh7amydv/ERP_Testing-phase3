from django.contrib import admin

from .models import ParentProfile, ParentStudentLink, ParentFeedback


@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    list_display = (
        "first_name",
        "last_name",
        "phone",
        "email",
        "school",
        "relationship",
        "is_primary",
        "is_active",
        "created_at",
    )
    list_filter = (
        "relationship",
        "is_primary",
        "is_active",
        "school",
    )
    search_fields = (
        "first_name",
        "last_name",
        "phone",
        "email",
    )
    raw_id_fields = (
        "user",
        "school",
    )
    ordering = ("-created_at",)


@admin.register(ParentStudentLink)
class ParentStudentLinkAdmin(admin.ModelAdmin):
    list_display = (
        "parent",
        "student",
        "is_primary",
        "created_at",
    )
    list_filter = ("is_primary",)
    raw_id_fields = (
        "parent",
        "student",
    )
    ordering = ("-created_at",)


@admin.register(ParentFeedback)
class ParentFeedbackAdmin(admin.ModelAdmin):
    list_display = (
        "subject",
        "parent",
        "student",
        "feedback_type",
        "status",
        "responded_by",
        "created_at",
    )
    list_filter = (
        "feedback_type",
        "status",
    )
    search_fields = (
        "subject",
        "message",
        "response",
    )
    raw_id_fields = (
        "parent",
        "student",
        "responded_by",
    )
    ordering = ("-created_at",)
