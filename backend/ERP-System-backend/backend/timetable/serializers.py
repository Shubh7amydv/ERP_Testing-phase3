from rest_framework import serializers
from .models import (
    TimeSlot, Timetable, TimetableEntry,
    TeacherTimetable, SubstituteTeacher, Room,
)


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = [
            'id', 'school', 'name', 'start_time', 'end_time',
            'slot_order', 'is_break', 'is_active', 'created_at',
        ]
        read_only_fields = ['created_at']


class TimetableSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_obj.get_admission_class_display', read_only=True)
    section_name = serializers.CharField(source='section.section', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.year', read_only=True)

    class Meta:
        model = Timetable
        fields = [
            'id', 'school', 'academic_year', 'academic_year_name',
            'class_obj', 'class_name', 'section', 'section_name',
            'name', 'effective_from', 'effective_to', 'is_active', 'created_at',
        ]
        read_only_fields = ['created_at']


class TimetableEntrySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    teacher_name = serializers.CharField(source='teacher.name', read_only=True, default=None)
    time_slot_name = serializers.CharField(source='time_slot.name', read_only=True)
    time_slot_start = serializers.TimeField(source='time_slot.start_time', read_only=True)
    time_slot_end = serializers.TimeField(source='time_slot.end_time', read_only=True)
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = TimetableEntry
        fields = [
            'id', 'timetable', 'day_of_week', 'day_display',
            'time_slot', 'time_slot_name', 'time_slot_start', 'time_slot_end',
            'subject', 'subject_name', 'subject_code',
            'teacher', 'teacher_name', 'room_no',
            'is_active', 'created_at',
        ]
        read_only_fields = ['created_at']


class TeacherTimetableSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    class_name = serializers.CharField(source='class_obj.get_admission_class_display', read_only=True)
    section_name = serializers.CharField(source='section.section', read_only=True)
    time_slot_name = serializers.CharField(source='time_slot.name', read_only=True)
    time_slot_start = serializers.TimeField(source='time_slot.start_time', read_only=True)
    time_slot_end = serializers.TimeField(source='time_slot.end_time', read_only=True)
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = TeacherTimetable
        fields = [
            'id', 'teacher', 'teacher_name', 'day_of_week', 'day_display',
            'time_slot', 'time_slot_name', 'time_slot_start', 'time_slot_end',
            'class_obj', 'class_name', 'section', 'section_name',
            'subject', 'subject_name', 'subject_code',
            'is_active', 'created_at',
        ]
        read_only_fields = ['created_at']


class SubstituteTeacherSerializer(serializers.ModelSerializer):
    original_teacher_name = serializers.CharField(source='original_teacher.name', read_only=True)
    substitute_teacher_name = serializers.CharField(source='substitute_teacher.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.email', read_only=True, default=None)

    class Meta:
        model = SubstituteTeacher
        fields = [
            'id', 'school', 'date', 'original_teacher', 'original_teacher_name',
            'substitute_teacher', 'substitute_teacher_name',
            'timetable_entry', 'reason',
            'approved_by', 'approved_by_name', 'created_at',
        ]
        read_only_fields = ['created_at']


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = [
            'id', 'school', 'room_no', 'building', 'capacity',
            'room_type', 'facilities', 'is_active', 'created_at',
        ]
        read_only_fields = ['created_at']


class BulkTimetableEntrySerializer(serializers.Serializer):
    timetable_id = serializers.IntegerField()
    entries = serializers.ListField(
        child=serializers.DictField(child=serializers.Field())
    )
