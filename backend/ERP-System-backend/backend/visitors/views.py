import datetime

from django.db.models import Count, Q
from django.http import HttpResponse
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from .models import VisitorCategory, Visitor, VisitorPass

from .serializers import (
    VisitorCategorySerializer,
    VisitorSerializer,
    VisitorPassSerializer,
)


class VisitorCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = VisitorCategorySerializer
    filterset_fields = ("school", "is_active")
    search_fields = ("name",)

    def get_queryset(self):
        return VisitorCategory.objects.filter(
            school=self.request.user.school
        ).order_by("name")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Visitor category created successfully.",
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
                    "message": "Visitor category updated successfully.",
                    "data": serializer.data,
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()

        return Response(
            {"message": "Visitor category deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class VisitorViewSet(viewsets.ModelViewSet):
    serializer_class = VisitorSerializer
    filterset_fields = ("school", "category", "id_type", "meeting_with_type")
    search_fields = ("name", "phone", "badge_no", "vehicle_no", "meeting_with")

    def get_queryset(self):
        return Visitor.objects.filter(
            school=self.request.user.school
        ).select_related("category", "approved_by").prefetch_related("passes")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save(approved_by=request.user)

            return Response(
                {
                    "message": "Visitor registered successfully.",
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
                    "message": "Visitor updated successfully.",
                    "data": serializer.data,
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()

        return Response(
            {"message": "Visitor deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=True, methods=["post"])
    def checkout(self, request, pk=None):
        visitor = self.get_object()

        if visitor.check_out:
            return Response(
                {"message": "Visitor has already checked out."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        visitor.check_out = timezone.now()
        visitor.save()

        return Response(
            {
                "message": "Visitor checked out successfully.",
                "data": VisitorSerializer(visitor).data,
            }
        )

    @action(detail=False, methods=["get"])
    def today(self, request):
        today = timezone.now().date()
        queryset = self.get_queryset().filter(
            check_in__date=today,
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def active(self, request):
        queryset = self.get_queryset().filter(
            check_out__isnull=True,
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def reports_daily(self, request):
        date_str = request.query_params.get("date")
        if date_str:
            try:
                target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            target_date = timezone.now().date()

        visitors = Visitor.objects.filter(
            school=request.user.school,
            check_in__date=target_date,
        )

        total = visitors.count()
        checked_out = visitors.filter(check_out__isnull=False).count()
        still_inside = visitors.filter(check_out__isnull=True).count()

        category_breakdown = (
            visitors.values("category__name")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        return Response(
            {
                "date": str(target_date),
                "total_visitors": total,
                "checked_out": checked_out,
                "still_inside": still_inside,
                "category_breakdown": list(category_breakdown),
            }
        )

    @action(detail=False, methods=["get"])
    def reports_category_wise(self, request):
        date_str = request.query_params.get("date")
        if date_str:
            try:
                target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            visitors = Visitor.objects.filter(
                school=request.user.school,
                check_in__date=target_date,
            )
        else:
            visitors = Visitor.objects.filter(
                school=request.user.school,
            )

        category_data = (
            visitors.values("category__name", "category__badge_color")
            .annotate(
                total=Count("id"),
                still_inside=Count("id", filter=Q(check_out__isnull=True)),
            )
            .order_by("-total")
        )

        return Response(list(category_data))


class VisitorPassViewSet(viewsets.ModelViewSet):
    serializer_class = VisitorPassSerializer
    filterset_fields = ("school", "visitor", "is_active")
    search_fields = ("pass_no", "purpose")

    def get_queryset(self):
        return VisitorPass.objects.filter(
            school=self.request.user.school
        ).select_related("visitor")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Visitor pass created successfully.",
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
                    "message": "Visitor pass updated successfully.",
                    "data": serializer.data,
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()

        return Response(
            {"message": "Visitor pass deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=True, methods=["post"])
    def revoke(self, request, pk=None):
        visitor_pass = self.get_object()

        if not visitor_pass.is_active:
            return Response(
                {"message": "Pass is already revoked."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        visitor_pass.is_active = False
        visitor_pass.save()

        return Response(
            {
                "message": "Visitor pass revoked successfully.",
                "data": VisitorPassSerializer(visitor_pass).data,
            }
        )
