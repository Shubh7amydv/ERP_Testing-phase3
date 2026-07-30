from django.contrib import admin
from .models import (
    Hostel,
    HostelRoom,
    HostelAllocation,
    HostelFee,
    HostelAttendance,
    HostelVisitor,
    HostelMessMenu,
)


@admin.register(Hostel)
class HostelAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "type",
        "warden",
        "total_rooms",
        "capacity",
        "is_active",
    )


@admin.register(HostelRoom)
class HostelRoomAdmin(admin.ModelAdmin):
    list_display = (
        "hostel",
        "room_number",
        "floor",
        "room_type",
        "capacity",
        "occupied",
        "monthly_fee",
        "is_active",
    )


@admin.register(HostelAllocation)
class HostelAllocationAdmin(admin.ModelAdmin):
    list_display = (
        "hostel",
        "room",
        "student",
        "academic_year",
        "allocated_from",
        "allocated_to",
        "status",
    )


@admin.register(HostelFee)
class HostelFeeAdmin(admin.ModelAdmin):
    list_display = (
        "hostel",
        "academic_year",
        "room_type",
        "monthly_fee",
        "security_deposit",
        "is_active",
    )


@admin.register(HostelAttendance)
class HostelAttendanceAdmin(admin.ModelAdmin):
    list_display = (
        "hostel",
        "student",
        "date",
        "status",
        "check_in_time",
        "check_out_time",
    )


@admin.register(HostelVisitor)
class HostelVisitorAdmin(admin.ModelAdmin):
    list_display = (
        "hostel",
        "student",
        "visitor_name",
        "visitor_phone",
        "relation",
        "visit_date",
        "check_in",
        "check_out",
    )


@admin.register(HostelMessMenu)
class HostelMessMenuAdmin(admin.ModelAdmin):
    list_display = (
        "hostel",
        "day_of_week",
        "meal_type",
        "menu_items",
        "date",
    )