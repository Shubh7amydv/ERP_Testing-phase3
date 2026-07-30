from rest_framework import serializers
from .models import (
    AttendancePeriod, AttendanceRecord, AttendanceSummary,
    Holiday, LeaveApplication, ClassAttendanceDay
)


class AttendancePeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendancePeriod
        fields = ['id', 'school', 'name', 'start_time', 'end_time', 'period_order', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    marked_by_name = serializers.CharField(source='marked_by.email', read_only=True)
    period_name = serializers.CharField(source='period.name', read_only=True, default=None)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'school', 'student', 'student_name', 'date', 'status', 'period',
            'period_name', 'marked_by', 'marked_by_name', 'remarks', 'source',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class AttendanceSummarySerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    academic_year_name = serializers.CharField(source='academic_year.year', read_only=True)

    class Meta:
        model = AttendanceSummary
        fields = [
            'id', 'school', 'student', 'student_name', 'academic_year', 'academic_year_name',
            'total_days', 'present_days', 'absent_days', 'late_days', 'half_days',
            'excused_days', 'attendance_pct', 'updated_at',
        ]
        read_only_fields = ['updated_at', 'attendance_pct']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = ['id', 'school', 'name', 'date', 'holiday_type', 'description', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class LeaveApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    approved_by_name = serializers.CharField(source='approved_by.email', read_only=True, default=None)
    total_days = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaveApplication
        fields = [
            'id', 'school', 'student', 'student_name', 'start_date', 'end_date',
            'reason', 'status', 'approved_by', 'approved_by_name', 'remarks',
            'attachment', 'total_days', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'status']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class ClassAttendanceDaySerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_obj.get_admission_class_display', read_only=True)
    section_name = serializers.CharField(source='section.section', read_only=True)
    finalized_by_name = serializers.CharField(source='finalized_by.email', read_only=True, default=None)

    class Meta:
        model = ClassAttendanceDay
        fields = [
            'id', 'school', 'class_obj', 'class_name', 'section', 'section_name',
            'date', 'total_students', 'present', 'absent', 'late',
            'is_finalized', 'finalized_by', 'finalized_by_name',
            'created_at',
        ]
        read_only_fields = ['created_at']


class BulkMarkAttendanceSerializer(serializers.Serializer):
    class_id = serializers.IntegerField()
    section_id = serializers.IntegerField()
    date = serializers.DateField()
    period_id = serializers.IntegerField(required=False, allow_null=True)
    attendance = serializers.ListField(
        child=serializers.DictField(child=serializers.Field())
    )


class MarkSingleAttendanceSerializer(serializers.Serializer):
    student_id = serializers.UUIDField()
    date = serializers.DateField()
    status = serializers.ChoiceField(choices=['present', 'absent', 'late', 'half_day', 'excused'])
    period_id = serializers.IntegerField(required=False, allow_null=True)
    remarks = serializers.CharField(required=False, allow_blank=True)
    source = serializers.ChoiceField(choices=['manual', 'biometric', 'face'], default='manual')
