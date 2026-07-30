from django.contrib import admin
from .models import (
    Department,
    Designation,
    Staff,
    StaffAttendance,
    LeaveType,
    StaffLeave,
    PayrollMonth,
    SalarySlip,
    SalaryComponent,
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "school", "head", "is_active")
    list_filter = ("school", "is_active")
    search_fields = ("name",)


@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ("name", "level", "is_active")
    list_filter = ("level", "is_active")
    search_fields = ("name",)


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = (
        "employee_id",
        "full_name",
        "department",
        "designation",
        "status",
        "is_active",
    )
    list_filter = (
        "department",
        "designation",
        "status",
        "is_active",
    )
    search_fields = (
        "employee_id",
        "first_name",
        "last_name",
    )


@admin.register(StaffAttendance)
class StaffAttendanceAdmin(admin.ModelAdmin):
    list_display = (
        "staff",
        "date",
        "status",
        "check_in",
        "check_out",
        "overtime_hours",
    )
    list_filter = ("status", "date")


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "days_per_year",
        "is_carry_forward",
        "is_active",
    )


@admin.register(StaffLeave)
class StaffLeaveAdmin(admin.ModelAdmin):
    list_display = (
        "staff",
        "leave_type",
        "start_date",
        "end_date",
        "total_days",
        "status",
    )
    list_filter = ("status",)


@admin.register(PayrollMonth)
class PayrollMonthAdmin(admin.ModelAdmin):
    list_display = (
        "month",
        "year",
        "status",
        "processed_by",
        "processed_at",
    )


@admin.register(SalarySlip)
class SalarySlipAdmin(admin.ModelAdmin):
    list_display = (
        "staff",
        "payroll_month",
        "gross_salary",
        "total_deductions",
        "net_salary",
        "payment_status",
    )
    list_filter = ("payment_status",)


@admin.register(SalaryComponent)
class SalaryComponentAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "type",
        "calculation",
        "value",
        "is_active",
    )
    list_filter = ("type", "is_active")