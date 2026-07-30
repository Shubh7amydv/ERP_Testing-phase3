from rest_framework import serializers

from .models import BusRoute, Bus, BusRouteFee, AdmissionBusDetail


class BusRouteSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = BusRoute
        fields = [
            "id",
            "school",
            "name",
            "start_point",
            "end_point",
            "distance_km",
            "stops",
            "morning_time",
            "evening_time",
            "is_active",
            "created_at",
            "updated_at",
            "student_count",
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def get_student_count(self, obj):
        return obj.student_assignments.filter(is_active=True).count()


class BusSerializer(serializers.ModelSerializer):
    assigned_students = serializers.SerializerMethodField()

    class Meta:
        model = Bus
        fields = [
            "id",
            "school",
            "bus_number",
            "capacity",
            "driver_name",
            "driver_phone",
            "conductor_name",
            "conductor_phone",
            "status",
            "is_active",
            "created_at",
            "assigned_students",
        ]
        read_only_fields = ("id", "created_at")

    def get_assigned_students(self, obj):
        return obj.student_assignments.filter(is_active=True).count()


class BusRouteFeeSerializer(serializers.ModelSerializer):
    route_name = serializers.CharField(source="route.name", read_only=True)
    academic_year_name = serializers.CharField(
        source="academic_year.name", read_only=True
    )

    class Meta:
        model = BusRouteFee
        fields = [
            "id",
            "route",
            "route_name",
            "academic_year",
            "academic_year_name",
            "monthly_fee",
            "quarterly_fee",
            "annual_fee",
            "created_at",
        ]
        read_only_fields = ("id", "created_at")


class AdmissionBusDetailSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_admission_no = serializers.CharField(
        source="student.admission_no", read_only=True
    )
    route_name = serializers.CharField(source="route.name", read_only=True)
    bus_number = serializers.CharField(source="bus.bus_number", read_only=True, default=None)

    class Meta:
        model = AdmissionBusDetail
        fields = [
            "id",
            "student",
            "student_name",
            "student_admission_no",
            "route",
            "route_name",
            "bus",
            "bus_number",
            "pickup_point",
            "drop_point",
            "payment_mode",
            "fee_amount",
            "is_active",
            "assigned_date",
            "created_at",
        ]
        read_only_fields = ("id", "assigned_date", "created_at")

    def get_student_name(self, obj):
        s = obj.student
        return f"{s.first_name} {s.last_name}".strip() if s else None
