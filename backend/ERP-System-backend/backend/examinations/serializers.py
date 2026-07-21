from rest_framework import serializers
from django.db import transaction

from .models import (
    ExamType, Subject, ClassSubject, Exam, ExamSchedule,
    ExamResult, GradingSystem, ReportCard, ClassResultSummary,
    calculate_grade, generate_report_card,
)
from students.models import AcademicClass, Section, Admission
from schools.models import School, AcademicYear
from accounts.models import User


class ExamTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamType
        fields = [
            'id', 'school', 'name', 'description', 'weightage',
            'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['school'] = str(instance.school_id) if instance.school_id else None
        data['school_name'] = instance.school.name if instance.school else None
        return data


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = [
            'id', 'school', 'name', 'code', 'type', 'max_marks',
            'passing_marks', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['school'] = str(instance.school_id) if instance.school_id else None
        data['school_name'] = instance.school.name if instance.school else None
        return data


class ClassSubjectSerializer(serializers.ModelSerializer):
    class_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = ClassSubject
        fields = [
            'id', 'school', 'class_obj', 'subject', 'teacher',
            'is_active', 'created_at',
            'class_name', 'subject_name', 'teacher_name',
        ]
        read_only_fields = ['id', 'created_at']

    def get_class_name(self, obj):
        return obj.class_obj.admission_class if obj.class_obj else None

    def get_subject_name(self, obj):
        return obj.subject.name if obj.subject else None

    def get_teacher_name(self, obj):
        if obj.teacher:
            return f"{obj.teacher.first_name} {obj.teacher.last_name}".strip()
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['school'] = str(instance.school_id) if instance.school_id else None
        data['class_obj'] = str(instance.class_obj_id) if instance.class_obj_id else None
        data['subject'] = str(instance.subject_id) if instance.subject_id else None
        data['teacher'] = str(instance.teacher_id) if instance.teacher_id else None
        return data


class ExamSerializer(serializers.ModelSerializer):
    exam_type_name = serializers.SerializerMethodField()
    academic_year_name = serializers.SerializerMethodField()
    published_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            'id', 'school', 'exam_type', 'name', 'academic_year',
            'start_date', 'end_date', 'result_date', 'is_published',
            'published_by', 'created_at', 'updated_at',
            'exam_type_name', 'academic_year_name', 'published_by_name',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'published_by']

    def get_exam_type_name(self, obj):
        return obj.exam_type.name if obj.exam_type else None

    def get_academic_year_name(self, obj):
        return obj.academic_year.year if obj.academic_year else None

    def get_published_by_name(self, obj):
        if obj.published_by:
            return f"{obj.published_by.first_name} {obj.published_by.last_name}".strip()
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['school'] = str(instance.school_id) if instance.school_id else None
        data['exam_type'] = str(instance.exam_type_id) if instance.exam_type_id else None
        data['academic_year'] = str(instance.academic_year_id) if instance.academic_year_id else None
        return data


class ExamScheduleSerializer(serializers.ModelSerializer):
    subject_name = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()
    exam_name = serializers.SerializerMethodField()

    class Meta:
        model = ExamSchedule
        fields = [
            'id', 'school', 'exam', 'subject', 'class_obj',
            'date', 'start_time', 'end_time', 'max_marks',
            'passing_marks', 'room_no', 'instructions', 'created_at',
            'subject_name', 'class_name', 'exam_name',
        ]
        read_only_fields = ['id', 'created_at']

    def get_subject_name(self, obj):
        return obj.subject.name if obj.subject else None

    def get_class_name(self, obj):
        return obj.class_obj.admission_class if obj.class_obj else None

    def get_exam_name(self, obj):
        return obj.exam.name if obj.exam else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['school'] = str(instance.school_id) if instance.school_id else None
        data['exam'] = str(instance.exam_id) if instance.exam_id else None
        data['subject'] = str(instance.subject_id) if instance.subject_id else None
        data['class_obj'] = str(instance.class_obj_id) if instance.class_obj_id else None
        return data


class ExamResultSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    graded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ExamResult
        fields = [
            'id', 'school', 'exam', 'student', 'schedule',
            'marks_obtained', 'grade', 'remarks', 'is_absent',
            'graded_by', 'created_at', 'updated_at',
            'student_name', 'subject_name', 'graded_by_name',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'graded_by', 'grade']

    def get_student_name(self, obj):
        if obj.student:
            return f"{obj.student.first_name} {obj.student.last_name}".strip()
        return None

    def get_subject_name(self, obj):
        if obj.schedule and obj.schedule.subject:
            return obj.schedule.subject.name
        return None

    def get_graded_by_name(self, obj):
        if obj.graded_by:
            return f"{obj.graded_by.first_name} {obj.graded_by.last_name}".strip()
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['school'] = str(instance.school_id) if instance.school_id else None
        data['exam'] = str(instance.exam_id) if instance.exam_id else None
        data['student'] = str(instance.student_id) if instance.student_id else None
        data['schedule'] = str(instance.schedule_id) if instance.schedule_id else None
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'pk'):
            validated_data['graded_by'] = request.user

        result = super().create(validated_data)

        if not result.grade and not result.is_absent and result.marks_obtained is not None:
            grading_system = GradingSystem.objects.filter(
                school=result.school, is_default=True, is_active=True
            ).first()
            if grading_system:
                result.grade = calculate_grade(
                    result.marks_obtained, result.schedule.max_marks, grading_system
                )
                result.save(update_fields=['grade'])

        return result

    def update(self, instance, validated_data):
        result = super().update(instance, validated_data)

        if not result.is_absent and result.marks_obtained is not None:
            grading_system = GradingSystem.objects.filter(
                school=result.school, is_default=True, is_active=True
            ).first()
            if grading_system:
                result.grade = calculate_grade(
                    result.marks_obtained, result.schedule.max_marks, grading_system
                )
                result.save(update_fields=['grade'])

        return result


class GradingSystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradingSystem
        fields = [
            'id', 'school', 'name', 'grades', 'is_default',
            'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['school'] = str(instance.school_id) if instance.school_id else None
        data['school_name'] = instance.school.name if instance.school else None
        return data


class ReportCardSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    exam_name = serializers.SerializerMethodField()

    class Meta:
        model = ReportCard
        fields = [
            'id', 'school', 'exam', 'student', 'total_marks',
            'marks_obtained', 'percentage', 'grade', 'rank',
            'status', 'remarks', 'generated_at',
            'student_name', 'exam_name',
        ]
        read_only_fields = ['id', 'generated_at']

    def get_student_name(self, obj):
        if obj.student:
            return f"{obj.student.first_name} {obj.student.last_name}".strip()
        return None

    def get_exam_name(self, obj):
        return obj.exam.name if obj.exam else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['school'] = str(instance.school_id) if instance.school_id else None
        data['exam'] = str(instance.exam_id) if instance.exam_id else None
        data['student'] = str(instance.student_id) if instance.student_id else None
        return data


class ClassResultSummarySerializer(serializers.ModelSerializer):
    class_name = serializers.SerializerMethodField()
    section_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()

    class Meta:
        model = ClassResultSummary
        fields = [
            'id', 'school', 'exam', 'class_obj', 'section', 'subject',
            'total_students', 'appeared', 'passed', 'failed',
            'pass_pct', 'highest', 'lowest', 'average', 'created_at',
            'class_name', 'section_name', 'subject_name',
        ]
        read_only_fields = ['id', 'created_at']

    def get_class_name(self, obj):
        return obj.class_obj.admission_class if obj.class_obj else None

    def get_section_name(self, obj):
        return obj.section.section if obj.section else None

    def get_subject_name(self, obj):
        return obj.subject.name if obj.subject else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['school'] = str(instance.school_id) if instance.school_id else None
        data['exam'] = str(instance.exam_id) if instance.exam_id else None
        data['class_obj'] = str(instance.class_obj_id) if instance.class_obj_id else None
        data['section'] = str(instance.section_id) if instance.section_id else None
        data['subject'] = str(instance.subject_id) if instance.subject_id else None
        return data


class BulkEnterResultsSerializer(serializers.Serializer):
    exam_id = serializers.IntegerField()
    class_id = serializers.IntegerField()
    section_id = serializers.IntegerField()
    schedule_id = serializers.IntegerField()
    results = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
    )

    def validate_results(self, value):
        for item in value:
            if 'student_id' not in item:
                raise serializers.ValidationError("Each result must have 'student_id'.")
        return value


class BulkCreateScheduleSerializer(serializers.Serializer):
    exam_id = serializers.IntegerField()
    class_id = serializers.IntegerField()
    schedules = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
    )

    def validate_schedules(self, value):
        for item in value:
            required_fields = ['subject_id', 'date', 'start_time', 'end_time', 'max_marks', 'passing_marks']
            for field in required_fields:
                if field not in item:
                    raise serializers.ValidationError(f"Each schedule must have '{field}'.")
        return value
