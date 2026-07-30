from django.contrib import admin

from .models import BusRoute, Bus, BusRouteFee, AdmissionBusDetail


@admin.register(BusRoute)
class BusRouteAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "school",
        "start_point",
        "end_point",
        "distance_km",
        "morning_time",
        "evening_time",
        "is_active",
        "created_at",
    )
    list_filter = ("is_active", "school")
    search_fields = ("name", "start_point", "end_point")
    ordering = ("name",)


@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = (
        "bus_number",
        "school",
        "capacity",
        "driver_name",
        "driver_phone",
        "status",
        "is_active",
        "created_at",
    )
    list_filter = ("status", "is_active", "school")
    search_fields = ("bus_number", "driver_name", "driver_phone")
    ordering = ("bus_number",)


@admin.register(BusRouteFee)
class BusRouteFeeAdmin(admin.ModelAdmin):
    list_display = (
        "route",
        "academic_year",
        "monthly_fee",
        "quarterly_fee",
        "annual_fee",
        "created_at",
    )
    list_filter = ("academic_year", "route__school")
    raw_id_fields = ("route", "academic_year")
    ordering = ("-created_at",)


@admin.register(AdmissionBusDetail)
class AdmissionBusDetailAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "route",
        "bus",
        "pickup_point",
        "drop_point",
        "payment_mode",
        "fee_amount",
        "is_active",
        "assigned_date",
    )
    list_filter = ("payment_mode", "is_active", "route__school")
    search_fields = (
        "student__first_name",
        "student__last_name",
        "student__admission_no",
        "pickup_point",
        "drop_point",
    )
    raw_id_fields = ("student", "route", "bus")
    ordering = ("-assigned_date",)
