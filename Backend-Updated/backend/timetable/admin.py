from django.contrib import admin
from .models import (
    TimeSlot,
    Timetable,
    TimetableEntry,
    TeacherTimetable,
    SubstituteTeacher,
    Room,
)


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ["name", "start_time", "end_time", "slot_order", "is_break", "is_active"]
    list_filter = ["school", "is_break", "is_active"]
    search_fields = ["name"]


@admin.register(Timetable)
class TimetableAdmin(admin.ModelAdmin):
    list_display = ["name", "class_obj", "section", "academic_year", "effective_from", "effective_to", "is_active"]
    list_filter = ["school", "academic_year", "class_obj", "section", "is_active"]
    search_fields = ["name"]


@admin.register(TimetableEntry)
class TimetableEntryAdmin(admin.ModelAdmin):
    list_display = ["timetable", "day_of_week", "time_slot", "subject", "teacher", "room_no"]
    list_filter = ["day_of_week", "time_slot", "subject", "is_active"]
    search_fields = ["subject__name", "teacher__first_name", "teacher__last_name", "room_no"]


@admin.register(TeacherTimetable)
class TeacherTimetableAdmin(admin.ModelAdmin):
    list_display = ["teacher", "day_of_week", "time_slot", "class_obj", "section", "subject"]
    list_filter = ["day_of_week", "time_slot", "class_obj", "section", "subject", "is_active"]
    search_fields = ["teacher__first_name", "teacher__last_name", "subject__name"]


@admin.register(SubstituteTeacher)
class SubstituteTeacherAdmin(admin.ModelAdmin):
    list_display = ["date", "original_teacher", "substitute_teacher", "timetable_entry", "approved_by"]
    list_filter = ["school", "date"]
    search_fields = ["original_teacher__first_name", "substitute_teacher__first_name", "reason"]


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ["room_no", "building", "capacity", "room_type", "is_active"]
    list_filter = ["school", "room_type", "is_active"]
    search_fields = ["room_no", "building"]