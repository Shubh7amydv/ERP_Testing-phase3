from django.contrib import admin

from .models import DocumentCategory, Document, DocumentTemplate, TransferCertificate


@admin.register(DocumentCategory)
class DocumentCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "school", "is_active", "created_at")
    list_filter = ("is_active", "school")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "school",
        "category",
        "target_type",
        "target_id",
        "is_public",
        "uploaded_by",
        "file_size",
        "created_at",
    )
    list_filter = ("target_type", "is_public", "category", "school")
    search_fields = ("title", "description")
    raw_id_fields = ("school", "category", "uploaded_by", "academic_year")
    ordering = ("-created_at",)


@admin.register(DocumentTemplate)
class DocumentTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "school", "category", "is_active", "created_at")
    list_filter = ("is_active", "category", "school")
    search_fields = ("name",)
    raw_id_fields = ("school", "category")
    ordering = ("name",)


@admin.register(TransferCertificate)
class TransferCertificateAdmin(admin.ModelAdmin):
    list_display = (
        "tc_number",
        "student",
        "school",
        "issue_date",
        "issued_by",
        "created_at",
    )
    list_filter = ("school", "issue_date")
    search_fields = ("tc_number", "reason")
    raw_id_fields = ("school", "student", "issued_by", "document")
    ordering = ("-created_at",)
