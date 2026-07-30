from django.db.models import Count, Sum

from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import BusRoute, Bus, BusRouteFee, AdmissionBusDetail

from .serializers import (
    BusRouteSerializer,
    BusSerializer,
    BusRouteFeeSerializer,
    AdmissionBusDetailSerializer,
)


# ─── Bus Routes ──────────────────────────────────────────────────

class BusRouteViewSet(viewsets.ModelViewSet):
    serializer_class = BusRouteSerializer
    filterset_fields = ("school", "is_active")
    search_fields = ("name", "start_point", "end_point")

    def get_queryset(self):
        return BusRoute.objects.filter(
            school=self.request.user.school
        ).order_by("name")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Route created successfully.", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Route updated.", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Route deleted."}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get"])
    def students(self, request, pk=None):
        route = self.get_object()
        students = AdmissionBusDetail.objects.filter(
            route=route, is_active=True
        ).select_related("student", "bus")
        serializer = AdmissionBusDetailSerializer(students, many=True)
        return Response(serializer.data)


# ─── Buses ───────────────────────────────────────────────────────

class BusViewSet(viewsets.ModelViewSet):
    serializer_class = BusSerializer
    filterset_fields = ("school", "status", "is_active")
    search_fields = ("bus_number", "driver_name", "driver_phone")

    def get_queryset(self):
        return Bus.objects.filter(
            school=self.request.user.school
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Bus created successfully.", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Bus updated.", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Bus deleted."}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get"])
    def students(self, request, pk=None):
        bus = self.get_object()
        students = AdmissionBusDetail.objects.filter(
            bus=bus, is_active=True
        ).select_related("student", "route")
        serializer = AdmissionBusDetailSerializer(students, many=True)
        return Response(serializer.data)


# ─── Route Fees ──────────────────────────────────────────────────

class BusRouteFeeViewSet(viewsets.ModelViewSet):
    serializer_class = BusRouteFeeSerializer
    filterset_fields = ("route", "academic_year")

    def get_queryset(self):
        return BusRouteFee.objects.filter(
            route__school=self.request.user.school
        ).select_related("route", "academic_year")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Route fee created successfully.", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Route fee updated.", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Route fee deleted."}, status=status.HTTP_204_NO_CONTENT)


# ─── Student Bus Assignments ─────────────────────────────────────

class AdmissionBusDetailViewSet(viewsets.ModelViewSet):
    serializer_class = AdmissionBusDetailSerializer
    filterset_fields = ("route", "bus", "payment_mode", "is_active")
    search_fields = (
        "student__first_name",
        "student__last_name",
        "student__admission_no",
        "pickup_point",
        "drop_point",
    )

    def get_queryset(self):
        return AdmissionBusDetail.objects.filter(
            route__school=self.request.user.school
        ).select_related("student", "route", "bus")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Student assigned to transport successfully.", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Assignment updated.", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Assignment removed."}, status=status.HTTP_204_NO_CONTENT)


# ─── Transport Reports ───────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def route_wise_students_report(request):
    data = (
        AdmissionBusDetail.objects.filter(
            route__school=request.user.school,
            is_active=True,
        )
        .values("route__name", "route__start_point", "route__end_point")
        .annotate(count=Count("id"))
        .order_by("-count")
    )
    return Response(list(data))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def transport_collection_report(request):
    data = (
        AdmissionBusDetail.objects.filter(
            route__school=request.user.school,
            is_active=True,
        )
        .values("route__name")
        .annotate(
            total_students=Count("id"),
            total_collection=Sum("fee_amount"),
        )
        .order_by("-total_collection")
    )
    return Response(list(data))
