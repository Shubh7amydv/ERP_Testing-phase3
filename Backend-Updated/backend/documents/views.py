from django.http import FileResponse, HttpResponseNotFound

from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import DocumentCategory, Document, DocumentTemplate, TransferCertificate

from .serializers import (
    DocumentCategorySerializer,
    DocumentSerializer,
    DocumentTemplateSerializer,
    TransferCertificateSerializer,
)


# ─── Document Categories ─────────────────────────────────────────

class DocumentCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentCategorySerializer
    filterset_fields = ("school", "is_active")
    search_fields = ("name",)

    def get_queryset(self):
        return DocumentCategory.objects.filter(
            school=self.request.user.school
        ).order_by("name")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Category created successfully.", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Category updated.", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Category deleted."}, status=status.HTTP_204_NO_CONTENT)


# ─── Documents ───────────────────────────────────────────────────

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    filterset_fields = ("school", "category", "target_type", "is_public")
    search_fields = ("title", "description")

    def get_queryset(self):
        return Document.objects.filter(
            school=self.request.user.school
        ).select_related("category", "uploaded_by", "academic_year")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(
                {"message": "Document uploaded successfully.", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Document updated.", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Document deleted."}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        document = self.get_object()
        if document.file:
            response = FileResponse(document.file.open("rb"), content_type="application/octet-stream")
            response["Content-Disposition"] = f'attachment; filename="{document.file.name.split("/")[-1]}"'
            return response
        return HttpResponseNotFound("File not found.")

    @action(detail=False, methods=["get"], url_path=r"student/(?P<student_id>[^/.]+)")
    def student_documents(self, request, student_id=None):
        queryset = self.get_queryset().filter(
            target_type="student",
            target_id=student_id,
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path=r"staff/(?P<staff_id>[^/.]+)")
    def staff_documents(self, request, staff_id=None):
        queryset = self.get_queryset().filter(
            target_type="staff",
            target_id=staff_id,
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ─── Document Templates ──────────────────────────────────────────

class DocumentTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentTemplateSerializer
    filterset_fields = ("school", "category", "is_active")
    search_fields = ("name",)

    def get_queryset(self):
        return DocumentTemplate.objects.filter(
            school=self.request.user.school
        ).select_related("category")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Template created successfully.", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Template updated.", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Template deleted."}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def generate(self, request, pk=None):
        template = self.get_object()
        data = request.data.get("data", {})
        return Response({
            "message": f"Document generated from template '{template.name}'.",
            "template": template.name,
            "placeholders": template.placeholders,
            "provided_data": data,
        })


# ─── Transfer Certificates ───────────────────────────────────────

class TransferCertificateViewSet(viewsets.ModelViewSet):
    serializer_class = TransferCertificateSerializer
    filterset_fields = ("school", "student")
    search_fields = ("tc_number", "reason")

    def get_queryset(self):
        return TransferCertificate.objects.filter(
            school=self.request.user.school
        ).select_related("student", "issued_by", "document")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(issued_by=request.user)
            return Response(
                {"message": "Transfer Certificate issued successfully.", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        tc = self.get_object()
        if tc.document and tc.document.file:
            response = FileResponse(tc.document.file.open("rb"), content_type="application/octet-stream")
            response["Content-Disposition"] = f'attachment; filename="TC_{tc.tc_number}.pdf"'
            return response
        return HttpResponseNotFound("TC file not found.")

    @action(detail=False, methods=["get"], url_path=r"student/(?P<student_id>[^/.]+)")
    def student_tc(self, request, student_id=None):
        queryset = self.get_queryset().filter(student_id=student_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
