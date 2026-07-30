from django.utils import timezone
from rest_framework import serializers

from .models import ParentProfile, ParentStudentLink, ParentFeedback


class ParentStudentLinkSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_class = serializers.SerializerMethodField()

    class Meta:
        model = ParentStudentLink
        fields = [
            "id",
            "parent",
            "student",
            "student_name",
            "student_class",
            "is_primary",
            "created_at",
        ]
        read_only_fields = ("id", "created_at")

    def get_student_name(self, obj):
        s = obj.student
        return f"{s.first_name} {s.last_name}".strip() if s else None

    def get_student_class(self, obj):
        if obj.student and obj.student.academic_class:
            return str(obj.student.academic_class)
        return None


class ParentProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    children = ParentStudentLinkSerializer(many=True, read_only=True)
    children_count = serializers.SerializerMethodField()

    class Meta:
        model = ParentProfile
        fields = [
            "id",
            "user",
            "school",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "email",
            "occupation",
            "relationship",
            "is_primary",
            "is_active",
            "children",
            "children_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def get_children_count(self, obj):
        return obj.student_links.count()


class ParentFeedbackSerializer(serializers.ModelSerializer):
    parent_name = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    responded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ParentFeedback
        fields = [
            "id",
            "parent",
            "parent_name",
            "student",
            "student_name",
            "subject",
            "message",
            "feedback_type",
            "status",
            "response",
            "responded_by",
            "responded_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def get_parent_name(self, obj):
        return obj.parent.full_name if obj.parent else None

    def get_student_name(self, obj):
        if obj.student:
            return f"{obj.student.first_name} {obj.student.last_name}".strip()
        return None

    def get_responded_by_name(self, obj):
        if not obj.responded_by:
            return None
        user = obj.responded_by
        if user.first_name or user.last_name:
            return f"{user.first_name} {user.last_name}".strip()
        return user.email
