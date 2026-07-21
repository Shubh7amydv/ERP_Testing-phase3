from django.contrib import admin
from .models import (
    AttendancePeriod,
    AttendanceRecord,
    AttendanceSummary,
    Holiday,
    LeaveApplication,
    ClassAttendanceDay,
)


@admin.register(AttendancePeriod)
class AttendancePeriodAdmin(admin.ModelAdmin):
    list_display = ["name", "start_time", "end_time", "period_order", "is_active"]
    list_filter = ["school", "is_active"]
    search_fields = ["name"]


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ["student", "date", "status", "period", "marked_by", "source"]
    list_filter = ["school", "date", "status", "source"]
    search_fields = ["student__first_name", "student__last_name", "student__admission_no"]


@admin.register(AttendanceSummary)
class AttendanceSummaryAdmin(admin.ModelAdmin):
    list_display = ["student", "academic_year", "total_days", "present_days", "attendance_pct"]
    list_filter = ["school", "academic_year"]
    search_fields = ["student__first_name", "student__last_name", "student__admission_no"]


@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ["name", "date", "holiday_type", "is_active"]
    list_filter = ["school", "holiday_type", "is_active"]
    search_fields = ["name"]


@admin.register(LeaveApplication)
class LeaveApplicationAdmin(admin.ModelAdmin):
    list_display = ["student", "start_date", "end_date", "status", "approved_by"]
    list_filter = ["school", "status"]
    search_fields = ["student__first_name", "student__last_name", "student__admission_no"]


@admin.register(ClassAttendanceDay)
class ClassAttendanceDayAdmin(admin.ModelAdmin):
    list_display = ["class_obj", "section", "date", "total_students", "present", "absent", "is_finalized"]
    list_filter = ["school", "date", "is_finalized"]