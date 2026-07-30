from rest_framework import serializers

from .models import DocumentCategory, Document, DocumentTemplate, TransferCertificate


class DocumentCategorySerializer(serializers.ModelSerializer):
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = DocumentCategory
        fields = [
            "id",
            "school",
            "name",
            "description",
            "is_active",
            "created_at",
            "document_count",
        ]
        read_only_fields = ("id", "created_at")

    def get_document_count(self, obj):
        return obj.documents.count()

    def validate_name(self, value):
        school = self.context["request"].user.school
        qs = DocumentCategory.objects.filter(school=school, name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Category with this name already exists.")
        return value


class DocumentSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id",
            "school",
            "category",
            "category_name",
            "title",
            "description",
            "file",
            "file_size",
            "uploaded_by",
            "uploaded_by_name",
            "target_type",
            "target_id",
            "academic_year",
            "is_public",
            "tags",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def get_uploaded_by_name(self, obj):
        user = obj.uploaded_by
        if user.first_name or user.last_name:
            return f"{user.first_name} {user.last_name}".strip()
        return user.email


class DocumentTemplateSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = DocumentTemplate
        fields = [
            "id",
            "school",
            "category",
            "category_name",
            "name",
            "template_file",
            "placeholders",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")


class TransferCertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    issued_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TransferCertificate
        fields = [
            "id",
            "school",
            "student",
            "student_name",
            "tc_number",
            "issue_date",
            "reason",
            "conduct",
            "class_studied",
            "last_exam_passed",
            "remarks",
            "issued_by",
            "issued_by_name",
            "document",
            "created_at",
        ]
        read_only_fields = ("id", "created_at")

    def get_student_name(self, obj):
        s = obj.student
        return f"{s.first_name} {s.last_name}".strip() if s else None

    def get_issued_by_name(self, obj):
        user = obj.issued_by
        if user.first_name or user.last_name:
            return f"{user.first_name} {user.last_name}".strip()
        return user.email
