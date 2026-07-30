from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from .models import ParentProfile, ParentStudentLink, ParentFeedback

from .serializers import (
    ParentProfileSerializer,
    ParentStudentLinkSerializer,
    ParentFeedbackSerializer,
)


class ParentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ParentProfileSerializer
    filterset_fields = ("school", "relationship", "is_primary", "is_active")
    search_fields = ("first_name", "last_name", "phone", "email")

    def get_queryset(self):
        return ParentProfile.objects.filter(
            school=self.request.user.school
        ).prefetch_related("student_links__student__academic_class")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Parent profile created successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Parent profile updated successfully.",
                    "data": serializer.data,
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()

        return Response(
            {"message": "Parent profile deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=True, methods=["get"])
    def children(self, request, pk=None):
        parent = self.get_object()
        links = ParentStudentLink.objects.filter(
            parent=parent
        ).select_related("student", "student__academic_class")

        serializer = ParentStudentLinkSerializer(links, many=True)
        return Response(serializer.data)


class ParentStudentLinkViewSet(viewsets.ModelViewSet):
    serializer_class = ParentStudentLinkSerializer
    filterset_fields = ("parent", "student", "is_primary")

    def get_queryset(self):
        return ParentStudentLink.objects.filter(
            parent__school=self.request.user.school
        ).select_related("parent", "student", "student__academic_class")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Parent linked to student successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()

        return Response(
            {"message": "Parent unlinked from student successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class ParentFeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = ParentFeedbackSerializer
    filterset_fields = ("parent", "student", "feedback_type", "status")
    search_fields = ("subject", "message")

    def get_queryset(self):
        return ParentFeedback.objects.filter(
            parent__school=self.request.user.school
        ).select_related("parent", "student", "responded_by")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Feedback submitted successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Feedback updated successfully.",
                    "data": serializer.data,
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()

        return Response(
            {"message": "Feedback deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=True, methods=["post"])
    def respond(self, request, pk=None):
        feedback = self.get_object()
        response_text = request.data.get("response", "")

        if not response_text:
            return Response(
                {"error": "Response text is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        feedback.response = response_text
        feedback.responded_by = request.user
        feedback.status = "in_progress"
        feedback.save()

        return Response(
            {
                "message": "Response submitted successfully.",
                "data": ParentFeedbackSerializer(feedback).data,
            }
        )

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        feedback = self.get_object()

        if feedback.status == "resolved":
            return Response(
                {"message": "Feedback is already resolved."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        feedback.status = "resolved"
        feedback.save()

        return Response(
            {
                "message": "Feedback marked as resolved.",
                "data": ParentFeedbackSerializer(feedback).data,
            }
        )
