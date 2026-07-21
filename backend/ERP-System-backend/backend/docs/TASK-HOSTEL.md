# Task: Hostel Management Module (Module 10)

> **Assigned To:** Sudipto (API Endpoints) | Varun (Database/Models)
> **Reference:** `docs/ERP-MODULE-PLAN.md` Section 13
> **Tech Stack:** Django 6 + DRF + PostgreSQL
> **Depends On:** Module 0 (Auth), Module 1 (School), Module 2 (Students)

---

## Current State

- No `hostel` app exists
- No hostel management system in the ERP
- No room allocation tracking
- No hostel attendance
- No visitor management
- No mess menu management
- `School` model exists in `schools` app
- `AcademicYear` model exists in `schools` app
- `Admission` model exists in `students` app
- `accounts.User` model exists for User

---

## TASKS FOR VARUN (Database / Models)

### Task V1: Create `hostel` Django App
- Run `python manage.py startapp hostel`
- Add `'hostel'` to `INSTALLED_APPS` in `config/settings.py`

### Task V2: Create `Hostel` Model
File: `hostel/models.py`

```python
from django.db import models
from schools.models import School


class Hostel(models.Model):
    TYPE_CHOICES = [
        ('boys', 'Boys'),
        ('girls', 'Girls'),
        ('staff', 'Staff'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='hostels')
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    address = models.TextField(blank=True)
    warden = models.CharField(max_length=100, blank=True)
    contact = models.CharField(max_length=15, blank=True)
    total_rooms = models.PositiveIntegerField(default=0)
    capacity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

    @property
    def occupied_rooms(self):
        return self.rooms.aggregate(
            total_occupied=models.Sum('occupied')
        )['total_occupied'] or 0

    @property
    def occupancy_percentage(self):
        if self.capacity == 0:
            return 0
        return round((self.occupied_rooms / self.capacity) * 100, 1)
```

### Task V3: Create `HostelRoom` Model
File: `hostel/models.py`

```python
class HostelRoom(models.Model):
    ROOM_TYPE_CHOICES = [
        ('single', 'Single'),
        ('double', 'Double'),
        ('triple', 'Triple'),
        ('dorm', 'Dormitory'),
    ]

    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='rooms')
    room_number = models.CharField(max_length=10)
    floor = models.PositiveIntegerField(default=1)
    room_type = models.CharField(max_length=15, choices=ROOM_TYPE_CHOICES)
    capacity = models.PositiveIntegerField()
    occupied = models.PositiveIntegerField(default=0)
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    facilities = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('hostel', 'room_number')
        ordering = ['floor', 'room_number']

    def __str__(self):
        return f"{self.hostel.name} - Room {self.room_number}"

    @property
    def available_beds(self):
        return self.capacity - self.occupied

    @property
    def is_full(self):
        return self.occupied >= self.capacity
```

### Task V4: Create `HostelAllocation` Model
File: `hostel/models.py`

```python
from students.models import Admission
from schools.models import AcademicYear


class HostelAllocation(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('vacated', 'Vacated'),
        ('transferred', 'Transferred'),
    ]

    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='allocations')
    room = models.ForeignKey(HostelRoom, on_delete=models.CASCADE, related_name='allocations')
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name='hostel_allocations')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='hostel_allocations')
    allocated_from = models.DateField()
    allocated_to = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'academic_year')
        ordering = ['-allocated_from']

    def __str__(self):
        return f"{self.student} - {self.room} ({self.status})"
```

### Task V5: Create `HostelFee` Model
File: `hostel/models.py`

```python
class HostelFee(models.Model):
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='fees')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='hostel_fees')
    room_type = models.CharField(max_length=15, choices=HostelRoom.ROOM_TYPE_CHOICES)
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('hostel', 'academic_year', 'room_type')
        ordering = ['room_type']

    def __str__(self):
        return f"{self.hostel.name} - {self.get_room_type_display()} - ₹{self.monthly_fee}/month"
```

### Task V6: Create `HostelAttendance` Model
File: `hostel/models.py`

```python
class HostelAttendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('out', 'Out'),
    ]

    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='attendances')
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name='hostel_attendances')
    date = models.DateField()
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.student} - {self.date} - {self.status}"
```

### Task V7: Create `HostelVisitor` Model
File: `hostel/models.py`

```python
class HostelVisitor(models.Model):
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='visitors')
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name='hostel_visitors')
    visitor_name = models.CharField(max_length=100)
    visitor_phone = models.CharField(max_length=15)
    relation = models.CharField(max_length=50)
    id_proof = models.CharField(max_length=50)
    visit_date = models.DateField()
    check_in = models.TimeField()
    check_out = models.TimeField(null=True, blank=True)
    purpose = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-visit_date', '-check_in']

    def __str__(self):
        return f"{self.visitor_name} - {self.student} ({self.visit_date})"
```

### Task V8: Create `HostelMessMenu` Model
File: `hostel/models.py`

```python
class HostelMessMenu(models.Model):
    MEAL_TYPE_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
    ]

    DAY_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]

    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='mess_menus')
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    meal_type = models.CharField(max_length=10, choices=MEAL_TYPE_CHOICES)
    menu_items = models.TextField()
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('hostel', 'date', 'meal_type')
        ordering = ['date', 'meal_type']

    def __str__(self):
        return f"{self.hostel.name} - {self.get_day_of_week_display()} - {self.get_meal_type_display()}"
```

### Task V9: Register Models in Admin
File: `hostel/admin.py`

Register all models with appropriate admin classes:
- `Hostel` - list_display: name, type, warden, total_rooms, capacity, is_active
- `HostelRoom` - list_display: hostel, room_number, floor, room_type, capacity, occupied, monthly_fee, is_active
- `HostelAllocation` - list_display: hostel, room, student, academic_year, allocated_from, allocated_to, status
- `HostelFee` - list_display: hostel, academic_year, room_type, monthly_fee, security_deposit, is_active
- `HostelAttendance` - list_display: hostel, student, date, status, check_in_time, check_out_time
- `HostelVisitor` - list_display: hostel, student, visitor_name, visitor_phone, relation, visit_date, check_in, check_out
- `HostelMessMenu` - list_display: hostel, day_of_week, meal_type, menu_items, date

### Task V10: Run Migrations
```bash
python manage.py makemigrations hostel
python manage.py migrate
```

---

## TASKS FOR SUDIPTO (API Endpoints)

### Task S1: Create Serializers
File: `hostel/serializers.py`

```python
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
    student_name = serializers.CharField(source='student.student_name', read_only=True)
    admission_no = serializers.CharField(source='student.admission_no', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = HostelAllocation
        fields = ['id', 'hostel', 'hostel_name', 'room', 'room_number', 'student',
                  'student_name', 'admission_no', 'academic_year', 'academic_year_name',
                  'allocated_from', 'allocated_to', 'status', 'remarks',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class HostelFeeSerializer(serializers.ModelSerializer):
    hostel_name = serializers.CharField(source='hostel.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = HostelFee
        fields = ['id', 'hostel', 'hostel_name', 'academic_year', 'academic_year_name',
                  'room_type', 'monthly_fee', 'security_deposit', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class HostelAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.student_name', read_only=True)
    admission_no = serializers.CharField(source='student.admission_no', read_only=True)
    room_number = serializers.SerializerMethodField()

    class Meta:
        model = HostelAttendance
        fields = ['id', 'hostel', 'student', 'student_name', 'admission_no',
                  'room_number', 'date', 'check_in_time', 'check_out_time',
                  'status', 'remarks', 'created_at']
        read_only_fields = ['created_at']

    def get_room_number(self, obj):
        allocation = HostelAllocation.objects.filter(
            student=obj.student,
            status='active'
        ).first()
        return allocation.room.room_number if allocation else None


class HostelVisitorSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.student_name', read_only=True)
    admission_no = serializers.CharField(source='student.admission_no', read_only=True)

    class Meta:
        model = HostelVisitor
        fields = ['id', 'hostel', 'student', 'student_name', 'admission_no',
                  'visitor_name', 'visitor_phone', 'relation', 'id_proof',
                  'visit_date', 'check_in', 'check_out', 'purpose', 'created_at']
        read_only_fields = ['created_at']


class HostelMessMenuSerializer(serializers.ModelSerializer):
    hostel_name = serializers.CharField(source='hostel.name', read_only=True)

    class Meta:
        model = HostelMessMenu
        fields = ['id', 'hostel', 'hostel_name', 'day_of_week', 'meal_type',
                  'menu_items', 'date', 'created_at']
        read_only_fields = ['created_at']


class BulkAttendanceSerializer(serializers.Serializer):
    """Serializer for bulk hostel attendance marking."""
    date = models.DateField()
    attendance = serializers.ListField(
        child=serializers.DictField(
            child=serializers.Field()
        )
    )
    # Example: [{"student_id": 1, "status": "present", "check_in_time": "22:00"}, ...]
```

### Task S2: Create Custom Permissions
File: `hostel/permissions.py`

```python
from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class IsSchoolAdmin(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role and
                request.user.role.name in ['Super Admin', 'School Admin', 'Principal'])


class IsWarden(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role and
                request.user.role.name in ['Super Admin', 'School Admin', 'Principal', 'Warden'])


class IsSchoolMember(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.school is not None
```

### Task S3: Create Hostel Views
File: `hostel/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum, Count
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Hostel, HostelRoom, HostelAllocation, HostelFee,
    HostelAttendance, HostelVisitor, HostelMessMenu
)
from .serializers import (
    HostelSerializer, HostelRoomSerializer, HostelAllocationSerializer,
    HostelFeeSerializer, HostelAttendanceSerializer, HostelVisitorSerializer,
    HostelMessMenuSerializer, BulkAttendanceSerializer
)
from .permissions import IsSchoolMember


class HostelViewSet(viewsets.ModelViewSet):
    serializer_class = HostelSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'type', 'is_active']

    def get_queryset(self):
        return Hostel.objects.filter(school=self.request.user.school)

    @action(detail=True, methods=['get'])
    def rooms(self, request, pk=None):
        """Get all rooms for a hostel."""
        hostel = self.get_object()
        rooms = HostelRoom.objects.filter(hostel=hostel)
        serializer = HostelRoomSerializer(rooms, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def occupancy(self, request, pk=None):
        """Get occupancy report for a hostel."""
        hostel = self.get_object()
        rooms = HostelRoom.objects.filter(hostel=hostel)

        by_type = rooms.values('room_type').annotate(
            total_rooms=Count('id'),
            total_capacity=Sum('capacity'),
            total_occupied=Sum('occupied')
        )

        return Response({
            'hostel': hostel.name,
            'total_rooms': rooms.count(),
            'total_capacity': hostel.capacity,
            'total_occupied': hostel.occupied_rooms,
            'occupancy_percentage': hostel.occupancy_percentage,
            'by_room_type': list(by_type)
        })


class HostelRoomViewSet(viewsets.ModelViewSet):
    serializer_class = HostelRoomSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hostel', 'floor', 'room_type', 'is_active']

    def get_queryset(self):
        return HostelRoom.objects.filter(
            hostel__school=self.request.user.school
        ).select_related('hostel')

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get rooms with available beds."""
        hostel_id = request.query_params.get('hostel')
        queryset = self.get_queryset().filter(is_active=True)

        if hostel_id:
            queryset = queryset.filter(hostel_id=hostel_id)

        available_rooms = []
        for room in queryset:
            if room.available_beds > 0:
                available_rooms.append({
                    'id': room.id,
                    'hostel': room.hostel.id,
                    'hostel_name': room.hostel.name,
                    'room_number': room.room_number,
                    'room_type': room.room_type,
                    'capacity': room.capacity,
                    'occupied': room.occupied,
                    'available_beds': room.available_beds,
                    'monthly_fee': float(room.monthly_fee)
                })

        return Response(available_rooms)


class HostelAllocationViewSet(viewsets.ModelViewSet):
    serializer_class = HostelAllocationSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hostel', 'room', 'student', 'academic_year', 'status']

    def get_queryset(self):
        return HostelAllocation.objects.filter(
            hostel__school=self.request.user.school
        ).select_related('hostel', 'room', 'student', 'academic_year')

    def perform_create(self, serializer):
        allocation = serializer.save()
        # Update room occupied count
        room = allocation.room
        room.occupied += 1
        room.save()

    @action(detail=True, methods=['post'])
    def vacate(self, request, pk=None):
        """Vacate a room allocation."""
        allocation = self.get_object()
        if allocation.status != 'active':
            return Response(
                {'error': 'Only active allocations can be vacated'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from django.utils import timezone
        allocation.status = 'vacated'
        allocation.allocated_to = timezone.now().date()
        allocation.save()

        # Update room occupied count
        room = allocation.room
        room.occupied = max(0, room.occupied - 1)
        room.save()

        return Response({'status': 'vacated'})

    @action(detail=True, methods=['post'])
    def transfer(self, request, pk=None):
        """Transfer student to a different room."""
        allocation = self.get_object()
        new_room_id = request.data.get('new_room_id')

        if not new_room_id:
            return Response(
                {'error': 'new_room_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if allocation.status != 'active':
            return Response(
                {'error': 'Only active allocations can be transferred'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            new_room = HostelRoom.objects.get(
                id=new_room_id,
                hostel__school=request.user.school
            )
        except HostelRoom.DoesNotExist:
            return Response(
                {'error': 'Room not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if new_room.is_full:
            return Response(
                {'error': 'Target room is full'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vacate old room
        old_room = allocation.room
        old_room.occupied = max(0, old_room.occupied - 1)
        old_room.save()

        # Allocate new room
        allocation.room = new_room
        allocation.status = 'active'
        allocation.remarks = request.data.get('remarks', allocation.remarks)
        allocation.save()

        # Update new room occupied count
        new_room.occupied += 1
        new_room.save()

        return Response({'status': 'transferred'})


class HostelFeeViewSet(viewsets.ModelViewSet):
    serializer_class = HostelFeeSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hostel', 'academic_year', 'room_type', 'is_active']

    def get_queryset(self):
        return HostelFee.objects.filter(
            hostel__school=self.request.user.school
        ).select_related('hostel', 'academic_year')


class HostelAttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = HostelAttendanceSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hostel', 'student', 'date', 'status']

    def get_queryset(self):
        return HostelAttendance.objects.filter(
            hostel__school=self.request.user.school
        ).select_related('student')

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        """Bulk mark attendance for multiple students."""
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        attendance_data = data['attendance']
        date = data['date']

        created = []
        for item in attendance_data:
            student_id = item.get('student_id')
            att_status = item.get('status')
            check_in_time = item.get('check_in_time')
            check_out_time = item.get('check_out_time')
            remarks = item.get('remarks', '')

            obj, was_created = HostelAttendance.objects.update_or_create(
                student_id=student_id,
                date=date,
                defaults={
                    'hostel': request.user.school.hostels.first(),
                    'status': att_status,
                    'check_in_time': check_in_time,
                    'check_out_time': check_out_time,
                    'remarks': remarks
                }
            )
            if was_created:
                created.append(obj.id)

        return Response({
            'created_count': len(created),
            'created_ids': created
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='student/(?P<student_id>[^/.]+)')
    def student_attendance(self, request, student_id=None):
        """Get attendance history for a specific student."""
        attendances = self.get_queryset().filter(student_id=student_id)
        serializer = self.get_serializer(attendances, many=True)
        return Response(serializer.data)


class HostelVisitorViewSet(viewsets.ModelViewSet):
    serializer_class = HostelVisitorSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hostel', 'student', 'visit_date']

    def get_queryset(self):
        return HostelVisitor.objects.filter(
            hostel__school=self.request.user.school
        ).select_related('student')


class HostelMessMenuViewSet(viewsets.ModelViewSet):
    serializer_class = HostelMessMenuSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hostel', 'day_of_week', 'meal_type', 'date']

    def get_queryset(self):
        return HostelMessMenu.objects.filter(
            hostel__school=self.request.user.school
        ).select_related('hostel')


class HostelReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        report_type = request.query_params.get('type', 'occupancy')

        if report_type == 'occupancy':
            return self.occupancy_report(request)
        elif report_type == 'fee-collection':
            return self.fee_collection_report(request)
        else:
            return Response({'error': 'Invalid report type'}, status=400)

    def occupancy_report(self, request):
        school = request.user.school
        hostels = Hostel.objects.filter(school=school, is_active=True)

        data = []
        for hostel in hostels:
            rooms = HostelRoom.objects.filter(hostel=hostel)
            data.append({
                'hostel_id': hostel.id,
                'hostel_name': hostel.name,
                'hostel_type': hostel.type,
                'total_rooms': rooms.count(),
                'total_capacity': hostel.capacity,
                'total_occupied': hostel.occupied_rooms,
                'occupancy_percentage': hostel.occupancy_percentage,
                'by_room_type': list(rooms.values('room_type').annotate(
                    count=Count('id'),
                    capacity=Sum('capacity'),
                    occupied=Sum('occupied')
                ))
            })

        return Response({
            'report_type': 'occupancy',
            'hostels': data
        })

    def fee_collection_report(self, request):
        school = request.user.school
        academic_year_id = request.query_params.get('academic_year')

        allocations = HostelAllocation.objects.filter(
            hostel__school=school,
            status='active'
        )

        if academic_year_id:
            allocations = allocations.filter(academic_year_id=academic_year_id)

        total_allocations = allocations.count()
        total_fee = allocations.aggregate(
            total=Sum('room__monthly_fee')
        )['total'] or 0

        by_hostel = allocations.values(
            'hostel__id', 'hostel__name'
        ).annotate(
            count=Count('id'),
            monthly_fee=Sum('room__monthly_fee')
        )

        return Response({
            'report_type': 'fee-collection',
            'total_allocations': total_allocations,
            'total_monthly_fee': float(total_fee),
            'by_hostel': list(by_hostel)
        })
```

### Task S4: Create URL Patterns
File: `hostel/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'hostels', views.HostelViewSet)
router.register(r'hostel-rooms', views.HostelRoomViewSet)
router.register(r'hostel-allocations', views.HostelAllocationViewSet)
router.register(r'hostel-fees', views.HostelFeeViewSet)
router.register(r'hostel-attendance', views.HostelAttendanceViewSet)
router.register(r'hostel-visitors', views.HostelVisitorViewSet)
router.register(r'hostel-mess-menu', views.HostelMessMenuViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('hostel/reports/occupancy/', views.HostelReportView.as_view(), name='hostel-occupancy-report'),
    path('hostel/reports/fee-collection/', views.HostelReportView.as_view(), name='hostel-fee-collection-report'),
]
```

### Task S5: Wire URLs in `config/urls.py`
Add to root `urls.py`:
```python
path('api/', include('hostel.urls')),
```

### Task S6: Test All Endpoints
Create test data and verify:
1. CRUD for Hostel
2. Get hostel rooms
3. Get hostel occupancy report
4. CRUD for HostelRoom
5. Get available rooms
6. CRUD for HostelAllocation
7. Allocate room (auto-update occupied count)
8. Vacate room (auto-update occupied count)
9. Transfer room (auto-update both rooms)
10. CRUD for HostelFee
11. CRUD for HostelAttendance
12. Bulk mark attendance
13. Get student attendance history
14. CRUD for HostelVisitor
15. CRUD for HostelMessMenu
16. Occupancy report
17. Fee collection report

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Hostels** | | |
| GET | `/api/hostels/` | List hostels |
| POST | `/api/hostels/` | Create hostel |
| GET | `/api/hostels/{id}/` | Hostel detail |
| PUT | `/api/hostels/{id}/` | Update hostel |
| DELETE | `/api/hostels/{id}/` | Delete hostel |
| GET | `/api/hostels/{id}/rooms/` | Get hostel rooms |
| GET | `/api/hostels/{id}/occupancy/` | Get occupancy report |
| **Hostel Rooms** | | |
| GET | `/api/hostel-rooms/` | List rooms (filter by hostel) |
| POST | `/api/hostel-rooms/` | Create room |
| GET | `/api/hostel-rooms/{id}/` | Room detail |
| PUT | `/api/hostel-rooms/{id}/` | Update room |
| DELETE | `/api/hostel-rooms/{id}/` | Delete room |
| GET | `/api/hostel-rooms/available/` | Available rooms |
| **Hostel Allocations** | | |
| GET | `/api/hostel-allocations/` | List allocations |
| POST | `/api/hostel-allocations/` | Allocate room |
| GET | `/api/hostel-allocations/{id}/` | Allocation detail |
| PUT | `/api/hostel-allocations/{id}/` | Update allocation |
| POST | `/api/hostel-allocations/{id}/vacate/` | Vacate room |
| POST | `/api/hostel-allocations/{id}/transfer/` | Transfer room |
| **Hostel Fees** | | |
| GET | `/api/hostel-fees/` | List hostel fees |
| POST | `/api/hostel-fees/` | Set hostel fee |
| GET | `/api/hostel-fees/{id}/` | Fee detail |
| PUT | `/api/hostel-fees/{id}/` | Update fee |
| DELETE | `/api/hostel-fees/{id}/` | Delete fee |
| **Hostel Attendance** | | |
| GET | `/api/hostel-attendance/` | List attendance |
| POST | `/api/hostel-attendance/` | Mark attendance |
| GET | `/api/hostel-attendance/{id}/` | Attendance detail |
| POST | `/api/hostel-attendance/bulk-mark/` | Bulk mark attendance |
| GET | `/api/hostel-attendance/student/{student_id}/` | Student attendance |
| **Hostel Visitors** | | |
| GET | `/api/hostel-visitors/` | List visitors |
| POST | `/api/hostel-visitors/` | Log visitor |
| GET | `/api/hostel-visitors/{id}/` | Visitor detail |
| PUT | `/api/hostel-visitors/{id}/` | Update visitor |
| DELETE | `/api/hostel-visitors/{id}/` | Delete visitor |
| **Hostel Mess Menu** | | |
| GET | `/api/hostel-mess-menu/` | List menu |
| POST | `/api/hostel-mess-menu/` | Add menu item |
| GET | `/api/hostel-mess-menu/{id}/` | Menu detail |
| PUT | `/api/hostel-mess-menu/{id}/` | Update menu |
| DELETE | `/api/hostel-mess-menu/{id}/` | Delete menu |
| **Reports** | | |
| GET | `/api/hostel/reports/occupancy/` | Room occupancy report |
| GET | `/api/hostel/reports/fee-collection/` | Fee collection report |

---

## Implementation Order (Suggested)

### Phase 1: Foundation (Day 1)
1. **Varun:** Create app + models (V1-V9) + migrations (V10)
2. **Sudipto:** Create serializers (S1) + permissions (S2)

### Phase 2: Core CRUD (Day 2)
3. **Sudipto:** Hostel CRUD views (S3)
4. **Sudipto:** HostelRoom views with available rooms (S3)

### Phase 3: Allocations (Day 3)
5. **Sudipto:** HostelAllocation views with vacate/transfer (S3)

### Phase 4: Supporting Features (Day 4)
6. **Sudipto:** HostelFee, HostelAttendance, HostelVisitor, HostelMessMenu views (S3)

### Phase 5: Reports & Integration (Day 5)
7. **Sudipto:** Report views (S3)
8. **Sudipto:** URL patterns + wire in root urls (S4-S5)
9. **Both:** Testing all endpoints (S6)

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| djangorestframework | 3.17.1 | Already installed |
| django-filter | Latest | For query parameter filtering |
| Django | 6.0.5 | Already installed |

---

## Notes

- `accounts.User` model is used for User (already exists)
- `schools.School` model is used for School (already exists)
- `schools.AcademicYear` model is used for AcademicYear (already exists)
- `students.Admission` model is used for Student (already exists)
- Hostel `occupied_rooms` property calculates total occupied across all rooms
- HostelRoom `available_beds` property returns capacity - occupied
- HostelAllocation auto-updates room occupied count on create/vacate/transfer
- HostelAttendance uses `unique_together` on (student, date) to prevent duplicates
- Bulk attendance marking supports marking multiple students at once
- Occupancy report shows breakdown by room type
- Fee collection report shows total monthly fee by hostel
- Room facilities stored as JSONField (e.g., ["AC", "Wifi", "Attached Bathroom"])
- Mess menu organized by day_of_week and meal_type
