from rest_framework import serializers
from .models import School, AcademicYear, SchoolSettings, SchoolHoliday, SchoolNotificationTemplate


class SchoolSerializer(serializers.ModelSerializer):
    academic_years_count = serializers.SerializerMethodField()
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = [
            'id', 'name', 'code', 'address', 'city', 'state', 'pincode',
            'phone', 'email', 'website', 'logo', 'established', 'affiliation',
            'is_active', 'created_at', 'updated_at',
            'academic_years_count', 'students_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_academic_years_count(self, obj):
        return obj.academic_years.count()

    def get_students_count(self, obj):
        return obj.users.count()


class SchoolListSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['id', 'name', 'code', 'city', 'state', 'is_active']


class AcademicYearSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model = AcademicYear
        fields = ['id', 'school', 'school_name', 'year', 'start_date', 'end_date', 'is_current', 'created_at']
        read_only_fields = ['id', 'created_at', 'school']


class SchoolSettingsSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model = SchoolSettings
        fields = [
            'id', 'school', 'school_name', 'timezone', 'currency', 'currency_symbol',
            'academic_start_month', 'passing_percentage', 'max_students_per_section',
            'enable_biometric', 'sms_enabled', 'email_enabled',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SchoolHolidaySerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model = SchoolHoliday
        fields = ['id', 'school', 'school_name', 'name', 'date', 'holiday_type', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class SchoolNotificationTemplateSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model = SchoolNotificationTemplate
        fields = ['id', 'school', 'school_name', 'template_type', 'subject', 'body', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
