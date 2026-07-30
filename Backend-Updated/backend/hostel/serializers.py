from rest_framework import serializers
from .models import (
    Hostel, HostelRoom, HostelAllocation, HostelFee,
    HostelAttendance, HostelVisitor, HostelMessMenu
)


class HostelSerializer(serializers.ModelSerializer):
    occupied_rooms = serializers.IntegerField(read_only=True)
    occupancy_percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = Hostel
        fields = ['id', 'school', 'name', 'type', 'address', 'warden', 'contact',
                  'total_rooms', 'capacity', 'is_active', 'occupied_rooms',
                  'occupancy_percentage', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class HostelRoomSerializer(serializers.ModelSerializer):
    hostel_name = serializers.CharField(source='hostel.name', read_only=True)
    available_beds = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = HostelRoom
        fields = ['id', 'hostel', 'hostel_name', 'room_number', 'floor', 'room_type',
                  'capacity', 'occupied', 'available_beds', 'is_full', 'monthly_fee',
                  'facilities', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class HostelAllocationSerializer(serializers.ModelSerializer):
    hostel_name = serializers.CharField(source='hostel.name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    student_name = serializers.SerializerMethodField()
    admission_no = serializers.CharField(source='student.admission_no', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = HostelAllocation
        fields = ['id', 'hostel', 'hostel_name', 'room', 'room_number', 'student',
                  'student_name', 'admission_no', 'academic_year', 'academic_year_name',
                  'allocated_from', 'allocated_to', 'status', 'remarks',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class HostelFeeSerializer(serializers.ModelSerializer):
    hostel_name = serializers.CharField(source='hostel.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = HostelFee
        fields = ['id', 'hostel', 'hostel_name', 'academic_year', 'academic_year_name',
                  'room_type', 'monthly_fee', 'security_deposit', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class HostelAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    admission_no = serializers.CharField(source='student.admission_no', read_only=True)
    room_number = serializers.SerializerMethodField()

    class Meta:
        model = HostelAttendance
        fields = ['id', 'hostel', 'student', 'student_name', 'admission_no',
                  'room_number', 'date', 'check_in_time', 'check_out_time',
                  'status', 'remarks', 'created_at']
        read_only_fields = ['created_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

    def get_room_number(self, obj):
        allocation = HostelAllocation.objects.filter(
            student=obj.student,
            status='active'
        ).first()
        return allocation.room.room_number if allocation else None


class HostelVisitorSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    admission_no = serializers.CharField(source='student.admission_no', read_only=True)

    class Meta:
        model = HostelVisitor
        fields = ['id', 'hostel', 'student', 'student_name', 'admission_no',
                  'visitor_name', 'visitor_phone', 'relation', 'id_proof',
                  'visit_date', 'check_in', 'check_out', 'purpose', 'created_at']
        read_only_fields = ['created_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class HostelMessMenuSerializer(serializers.ModelSerializer):
    hostel_name = serializers.CharField(source='hostel.name', read_only=True)

    class Meta:
        model = HostelMessMenu
        fields = ['id', 'hostel', 'hostel_name', 'day_of_week', 'meal_type',
                  'menu_items', 'date', 'created_at']
        read_only_fields = ['created_at']


class BulkAttendanceSerializer(serializers.Serializer):
    date = serializers.DateField()
    attendance = serializers.ListField(
        child=serializers.DictField(
            child=serializers.Field()
        )
    )
