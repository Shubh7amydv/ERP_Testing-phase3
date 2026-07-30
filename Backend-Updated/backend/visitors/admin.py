from django.contrib import admin

from .models import VisitorCategory, Visitor, VisitorPass


@admin.register(VisitorCategory)
class VisitorCategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "school",
        "badge_color",
        "is_active",
        "created_at",
    )
    list_filter = (
        "is_active",
        "school",
    )
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "phone",
        "school",
        "category",
        "badge_no",
        "check_in",
        "check_out",
        "is_inside",
        "created_at",
    )
    list_filter = (
        "category",
        "id_type",
        "meeting_with_type",
        "school",
    )
    search_fields = (
        "name",
        "phone",
        "badge_no",
        "vehicle_no",
        "meeting_with",
    )
    raw_id_fields = (
        "school",
        "category",
        "approved_by",
    )
    ordering = ("-check_in",)
    readonly_fields = ("is_inside",)


@admin.register(VisitorPass)
class VisitorPassAdmin(admin.ModelAdmin):
    list_display = (
        "pass_no",
        "visitor",
        "school",
        "valid_from",
        "valid_to",
        "is_active",
        "created_at",
    )
    list_filter = (
        "is_active",
        "school",
    )
    search_fields = (
        "pass_no",
        "purpose",
    )
    raw_id_fields = (
        "school",
        "visitor",
    )
    ordering = ("-created_at",)
