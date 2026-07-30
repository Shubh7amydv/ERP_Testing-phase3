# Task: Timetable & Scheduling Module (Module 5)

> **Assigned To:** Sudipto (API Endpoints) | Varun (Database/Models)
> **Reference:** `docs/ERP-MODULE-PLAN.md` Section 8
> **Tech Stack:** Django 6 + DRF + PostgreSQL
> **Depends On:** Module 0 (Auth), Module 1 (School), Module 2 (Students), Module 4 (Examinations - Subject)

---

## Current State

- No `timetable` app exists
- No scheduling/timetable system in the ERP
- `AcademicClass`, `Section` models exist in `students` app
- `Teacher` model exists in `students` app
- `Subject` model exists in `examinations` app
- `School`, `AcademicYear` models exist in `schools` app
- `accounts.User` model exists for User
- No room management
- No substitute teacher tracking

---

## TASKS FOR VARUN (Database / Models)

### Task V1: Create `timetable` Django App
- Run `python manage.py startapp timetable`
- Add `'timetable'` to `INSTALLED_APPS` in `config/settings.py`

### Task V2: Create `TimeSlot` Model
File: `timetable/models.py`

```python
from django.db import models
from schools.models import School


class TimeSlot(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='time_slots')
    name = models.CharField(max_length=50)  # e.g. "Period 1", "Morning Assembly"
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_order = models.PositiveIntegerField()
    is_break = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['slot_order']

    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"
```

### Task V3: Create `Timetable` Model
File: `timetable/models.py`

```python
from schools.models import School, AcademicYear
from students.models import AcademicClass, Section


class Timetable(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='timetables')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='timetables')
    class_obj = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name='timetables')
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='timetables')
    name = models.CharField(max_length=100)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'class_obj', 'section', 'effective_from')
        ordering = ['-effective_from']

    def __str__(self):
        return f"{self.name} ({self.class_obj} - {self.section})"
```

### Task V4: Create `TimetableEntry` Model
File: `timetable/models.py`

```python
from examinations.models import Subject


class TimetableEntry(models.Model):
    DAY_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
    ]

    timetable = models.ForeignKey(Timetable, on_delete=models.CASCADE, related_name='entries')
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='entries')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='timetable_entries')
    teacher = models.ForeignKey('students.Teacher', on_delete=models.SET_NULL, null=True, blank=True, related_name='timetable_entries')
    room_no = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('timetable', 'day_of_week', 'time_slot')
        ordering = ['day_of_week', 'time_slot__slot_order']

    def __str__(self):
        return f"{self.day_of_week} - {self.time_slot.name} - {self.subject.name}"
```

### Task V5: Create `TeacherTimetable` Model
File: `timetable/models.py`

```python
from students.models import Teacher


class TeacherTimetable(models.Model):
    DAY_CHOICES = TimetableEntry.DAY_CHOICES

    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='teacher_timetable')
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='teacher_timetable')
    class_obj = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name='teacher_timetable')
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='teacher_timetable')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='teacher_timetable')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('teacher', 'day_of_week', 'time_slot')
        ordering = ['day_of_week', 'time_slot__slot_order']

    def __str__(self):
        return f"{self.teacher} - {self.day_of_week} - {self.time_slot.name}"
```

### Task V6: Create `SubstituteTeacher` Model
File: `timetable/models.py`

```python
class SubstituteTeacher(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='substitutes')
    date = models.DateField()
    original_teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='substitutes_as_original')
    substitute_teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='substitutes_as_substitute')
    timetable_entry = models.ForeignKey(TimetableEntry, on_delete=models.CASCADE, related_name='substitutes')
    reason = models.CharField(max_length=200, blank=True)
    approved_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_substitutes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('date', 'timetable_entry')
        ordering = ['-date']

    def __str__(self):
        return f"{self.date} - {self.original_teacher} -> {self.substitute_teacher}"
```

### Task V7: Create `Room` Model
File: `timetable/models.py`

```python
class Room(models.Model):
    ROOM_TYPE_CHOICES = [
        ('classroom', 'Classroom'),
        ('lab', 'Laboratory'),
        ('office', 'Office'),
        ('hall', 'Hall'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='rooms')
    room_no = models.CharField(max_length=20)
    building = models.CharField(max_length=100, blank=True)
    capacity = models.PositiveIntegerField(default=40)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES)
    facilities = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'room_no')
        ordering = ['room_no']

    def __str__(self):
        return f"{self.room_no} ({self.building})" if self.building else self.room_no
```

### Task V8: Register Models in Admin
File: `timetable/admin.py`

Register all models with appropriate admin classes:
- `TimeSlot` - list_display: name, start_time, end_time, slot_order, is_break, is_active
- `Timetable` - list_display: name, class_obj, section, academic_year, effective_from, effective_to, is_active
- `TimetableEntry` - list_display: timetable, day_of_week, time_slot, subject, teacher, room_no
- `TeacherTimetable` - list_display: teacher, day_of_week, time_slot, class_obj, section, subject
- `SubstituteTeacher` - list_display: date, original_teacher, substitute_teacher, timetable_entry, approved_by
- `Room` - list_display: room_no, building, capacity, room_type, is_active

### Task V9: Run Migrations
```bash
python manage.py makemigrations timetable
python manage.py migrate
```

---

## TASKS FOR SUDIPTO (API Endpoints)

### Task S1: Create Serializers
File: `timetable/serializers.py`

```python
from rest_framework import serializers
from .models import TimeSlot, Timetable, TimetableEntry, TeacherTimetable, SubstituteTeacher, Room


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'school', 'name', 'start_time', 'end_time', 'slot_order', 'is_break', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'school', 'room_no', 'building', 'capacity', 'room_type', 'facilities', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class TimetableEntrySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    time_slot_name = serializers.CharField(source='time_slot.name', read_only=True)
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = TimetableEntry
        fields = ['id', 'timetable', 'day_of_week', 'day_display', 'time_slot', 'time_slot_name',
                  'subject', 'subject_name', 'teacher', 'teacher_name', 'room_no', 'is_active', 'created_at']
        read_only_fields = ['created_at']

    def get_teacher_name(self, obj):
        if obj.teacher:
            return f"{obj.teacher.first_name} {obj.teacher.last_name}"
        return None


class TimetableSerializer(serializers.ModelSerializer):
    entries = TimetableEntrySerializer(many=True, read_only=True)
    class_name = serializers.CharField(source='class_obj.admission_class', read_only=True)
    section_name = serializers.CharField(source='section.section', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.year', read_only=True)

    class Meta:
        model = Timetable
        fields = ['id', 'school', 'academic_year', 'academic_year_name', 'class_obj', 'class_name',
                  'section', 'section_name', 'name', 'effective_from', 'effective_to',
                  'is_active', 'entries', 'created_at']
        read_only_fields = ['created_at']


class TeacherTimetableSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class_name = serializers.CharField(source='class_obj.admission_class', read_only=True)
    section_name = serializers.CharField(source='section.section', read_only=True)
    time_slot_name = serializers.CharField(source='time_slot.name', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = TeacherTimetable
        fields = ['id', 'teacher', 'teacher_name', 'day_of_week', 'day_display', 'time_slot',
                  'time_slot_name', 'class_obj', 'class_name', 'section', 'section_name',
                  'subject', 'subject_name', 'is_active', 'created_at']
        read_only_fields = ['created_at']

    def get_teacher_name(self, obj):
        return f"{obj.teacher.first_name} {obj.teacher.last_name}"


class SubstituteTeacherSerializer(serializers.ModelSerializer):
    original_teacher_name = serializers.SerializerMethodField()
    substitute_teacher_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='timetable_entry.subject.name', read_only=True)
    time_slot_name = serializers.CharField(source='timetable_entry.time_slot.name', read_only=True)
    day_of_week = serializers.CharField(source='timetable_entry.day_of_week', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.email', read_only=True, default=None)

    class Meta:
        model = SubstituteTeacher
        fields = ['id', 'school', 'date', 'original_teacher', 'original_teacher_name',
                  'substitute_teacher', 'substitute_teacher_name', 'timetable_entry',
                  'subject_name', 'time_slot_name', 'day_of_week', 'reason',
                  'approved_by', 'approved_by_name', 'created_at']
        read_only_fields = ['created_at']

    def get_original_teacher_name(self, obj):
        return f"{obj.original_teacher.first_name} {obj.original_teacher.last_name}"

    def get_substitute_teacher_name(self, obj):
        return f"{obj.substitute_teacher.first_name} {obj.substitute_teacher.last_name}"


class BulkCreateTimetableSerializer(serializers.Serializer):
    """Serializer for bulk creating timetable entries."""
    timetable_id = serializers.IntegerField()
    entries = serializers.ListField(
        child=serializers.DictField(
            child=serializers.Field()
        )
    )
    # entries format: [{"day_of_week": "monday", "time_slot_id": 1, "subject_id": 1, "teacher_id": 1, "room_no": ""}]
```

### Task S2: Create Custom Permissions
File: `timetable/permissions.py`

```python
from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class IsSchoolAdmin(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role and
                request.user.role.name == 'School Admin')


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role and
                request.user.role.name in ['School Admin', 'Teacher', 'Vice Principal', 'Principal'])


class IsSchoolMember(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.school is not None
```

### Task S3: Create TimeSlot Views
File: `timetable/views.py`

```python
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import TimeSlot
from .serializers import TimeSlotSerializer
from .permissions import IsSchoolMember


class TimeSlotViewSet(viewsets.ModelViewSet):
    serializer_class = TimeSlotSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_break', 'is_active']

    def get_queryset(self):
        return TimeSlot.objects.filter(school=self.request.user.school)
```

### Task S4: Create Room Views
File: `timetable/views.py`

```python
from .models import Room
from .serializers import RoomSerializer


class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'room_type', 'is_active']

    def get_queryset(self):
        return Room.objects.filter(school=self.request.user.school)
```

### Task S5: Create Timetable Views (with Entries)
File: `timetable/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Timetable, TimetableEntry, TeacherTimetable
from .serializers import (
    TimetableSerializer, TimetableEntrySerializer,
    BulkCreateTimetableSerializer, TeacherTimetableSerializer
)


class TimetableViewSet(viewsets.ModelViewSet):
    serializer_class = TimetableSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'academic_year', 'class_obj', 'section', 'is_active']

    def get_queryset(self):
        return Timetable.objects.filter(
            school=self.request.user.school
        ).select_related('academic_year', 'class_obj', 'section')

    @action(detail=True, methods=['get'], url_path='entries')
    def get_entries(self, request, pk=None):
        """Get all entries for a timetable."""
        timetable = self.get_object()
        entries = TimetableEntry.objects.filter(
            timetable=timetable
        ).select_related('subject', 'teacher', 'time_slot')
        serializer = TimetableEntrySerializer(entries, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='entries')
    def add_entry(self, request, pk=None):
        """Add a single entry to timetable."""
        timetable = self.get_object()
        serializer = TimetableEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(timetable=timetable)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='entries/bulk')
    def bulk_add_entries(self, request, pk=None):
        """Bulk add entries to timetable."""
        timetable = self.get_object()
        serializer = BulkCreateTimetableSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        entries_data = serializer.validated_data['entries']
        created = []

        with transaction.atomic():
            for entry_data in entries_data:
                entry, was_created = TimetableEntry.objects.get_or_create(
                    timetable=timetable,
                    day_of_week=entry_data['day_of_week'],
                    time_slot_id=entry_data['time_slot_id'],
                    defaults={
                        'subject_id': entry_data['subject_id'],
                        'teacher_id': entry_data.get('teacher_id'),
                        'room_no': entry_data.get('room_no', ''),
                    }
                )
                if was_created:
                    created.append(TimetableEntrySerializer(entry).data)

        return Response({
            'created_count': len(created),
            'entries': created
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='by-day/(?P<day>[^/.]+)')
    def by_day(self, request, day=None):
        """Get all timetable entries for a specific day across all classes."""
        timetable_id = request.query_params.get('timetable_id')
        queryset = TimetableEntry.objects.filter(
            timetable__school=request.user.school,
            day_of_week=day
        ).select_related('timetable', 'subject', 'teacher', 'time_slot', 'timetable__class_obj', 'timetable__section')

        if timetable_id:
            queryset = queryset.filter(timetable_id=timetable_id)

        serializer = TimetableEntrySerializer(queryset, many=True)
        return Response(serializer.data)
```

### Task S6: Create TimetableEntry View (Update/Delete)
File: `timetable/views.py`

```python
class TimetableEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TimetableEntrySerializer
    permission_classes = [IsSchoolMember]

    def get_queryset(self):
        return TimetableEntry.objects.filter(
            timetable__school=self.request.user.school
        ).select_related('subject', 'teacher', 'time_slot', 'timetable')
```

### Task S7: Create Teacher Timetable View
File: `timetable/views.py`

```python
from students.models import Teacher


class TeacherTimetableViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherTimetableSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['teacher', 'day_of_week', 'is_active']

    def get_queryset(self):
        return TeacherTimetable.objects.filter(
            teacher__school=self.request.user.school
        ).select_related('teacher', 'time_slot', 'class_obj', 'section', 'subject')

    @action(detail=False, methods=['get'], url_path='free-slots/(?P<teacher_id>[^/.]+)')
    def free_slots(self, request, teacher_id=None):
        """Get free time slots for a teacher on a specific day."""
        day = request.query_params.get('day')
        if not day:
            return Response(
                {'error': 'day query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from schools.models import School
        school = request.user.school

        all_slots = TimeSlot.objects.filter(school=school, is_active=True, is_break=False)
        occupied_slots = TeacherTimetable.objects.filter(
            teacher_id=teacher_id,
            day_of_week=day,
            is_active=True
        ).values_list('time_slot_id', flat=True)

        free_slots = all_slots.exclude(id__in=occupied_slots)
        serializer = TimeSlotSerializer(free_slots, many=True)
        return Response(serializer.data)
```

### Task S8: Create Substitute Teacher Views
File: `timetable/views.py`

```python
from .models import SubstituteTeacher
from .serializers import SubstituteTeacherSerializer


class SubstituteTeacherViewSet(viewsets.ModelViewSet):
    serializer_class = SubstituteTeacherSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'date', 'original_teacher', 'substitute_teacher']

    def get_queryset(self):
        return SubstituteTeacher.objects.filter(
            school=self.request.user.school
        ).select_related('original_teacher', 'substitute_teacher', 'timetable_entry', 'approved_by')

    def perform_create(self, serializer):
        serializer.save(approved_by=self.request.user)
```

### Task S9: Create Report Views
File: `timetable/views.py`

```python
from rest_framework.views import APIView
from django.db.models import Count, Q
from .models import TimetableEntry, TeacherTimetable, Room


class TeacherLoadReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        teachers = Teacher.objects.filter(school=school)

        report = []
        for teacher in teachers:
            entries = TeacherTimetable.objects.filter(
                teacher=teacher,
                is_active=True
            )
            report.append({
                'teacher_id': teacher.id,
                'teacher_name': f"{teacher.first_name} {teacher.last_name}",
                'total_periods': entries.count(),
                'monday': entries.filter(day_of_week='monday').count(),
                'tuesday': entries.filter(day_of_week='tuesday').count(),
                'wednesday': entries.filter(day_of_week='wednesday').count(),
                'thursday': entries.filter(day_of_week='thursday').count(),
                'friday': entries.filter(day_of_week='friday').count(),
                'saturday': entries.filter(day_of_week='saturday').count(),
            })

        return Response(report)


class RoomUtilizationReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        day = request.query_params.get('day')

        rooms = Room.objects.filter(school=school, is_active=True)
        report = []

        for room in rooms:
            entries = TimetableEntry.objects.filter(
                timetable__school=school,
                room_no=room.room_no,
                is_active=True
            )
            if day:
                entries = entries.filter(day_of_week=day)

            report.append({
                'room_no': room.room_no,
                'building': room.building,
                'capacity': room.capacity,
                'room_type': room.room_type,
                'total_slots_used': entries.count(),
                'days_used': entries.values('day_of_week').distinct().count(),
            })

        return Response(report)


class ScheduleConflictsReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school

        # Find teachers assigned to multiple classes at same time
        conflicts = TeacherTimetable.objects.filter(
            teacher__school=school,
            is_active=True
        ).values(
            'teacher', 'day_of_week', 'time_slot'
        ).annotate(
            count=Count('id')
        ).filter(count__gt=1)

        report = []
        for conflict in conflicts:
            entries = TeacherTimetable.objects.filter(
                teacher_id=conflict['teacher'],
                day_of_week=conflict['day_of_week'],
                time_slot_id=conflict['time_slot'],
                is_active=True
            ).select_related('teacher', 'time_slot', 'class_obj', 'section', 'subject')

            report.append({
                'teacher_id': conflict['teacher'],
                'teacher_name': f"{entries.first().teacher.first_name} {entries.first().teacher.last_name}",
                'day_of_week': conflict['day_of_week'],
                'time_slot': entries.first().time_slot.name,
                'conflicting_classes': [
                    {
                        'class': e.class_obj.admission_class,
                        'section': e.section.section,
                        'subject': e.subject.name
                    }
                    for e in entries
                ]
            })

        return Response(report)
```

### Task S10: Create URL Patterns
File: `timetable/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'time-slots', views.TimeSlotViewSet)
router.register(r'rooms', views.RoomViewSet)
router.register(r'timetables', views.TimetableViewSet)
router.register(r'timetable-entries', views.TimetableEntryViewSet)
router.register(r'teacher-timetable', views.TeacherTimetableViewSet)
router.register(r'substitutes', views.SubstituteTeacherViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('timetable/reports/teacher-load/', views.TeacherLoadReportView.as_view(), name='timetable-teacher-load-report'),
    path('timetable/reports/room-utilization/', views.RoomUtilizationReportView.as_view(), name='timetable-room-utilization-report'),
    path('timetable/reports/conflicts/', views.ScheduleConflictsReportView.as_view(), name='timetable-conflicts-report'),
]
```

### Task S11: Wire URLs in `config/urls.py`
Add to root `urls.py`:
```python
path('api/', include('timetable.urls')),
```

### Task S12: Test All Endpoints
Create test data and verify:
1. CRUD for TimeSlot
2. CRUD for Room
3. CRUD for Timetable
4. Add entry to Timetable
5. Bulk add entries to Timetable
6. Get entries for a Timetable
7. Get entries by day
8. CRUD for TeacherTimetable
9. Get free slots for teacher
10. CRUD for SubstituteTeacher
11. Teacher load report
12. Room utilization report
13. Schedule conflicts report

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Time Slots** | | |
| GET | `/api/time-slots/` | List time slots |
| POST | `/api/time-slots/` | Create time slot |
| GET | `/api/time-slots/{id}/` | Time slot detail |
| PUT | `/api/time-slots/{id}/` | Update time slot |
| DELETE | `/api/time-slots/{id}/` | Delete time slot |
| **Rooms** | | |
| GET | `/api/rooms/` | List rooms |
| POST | `/api/rooms/` | Create room |
| GET | `/api/rooms/{id}/` | Room detail |
| PUT | `/api/rooms/{id}/` | Update room |
| DELETE | `/api/rooms/{id}/` | Delete room |
| **Timetables** | | |
| GET | `/api/timetables/` | List timetables |
| POST | `/api/timetables/` | Create timetable |
| GET | `/api/timetables/{id}/` | Timetable detail (with entries) |
| PUT | `/api/timetables/{id}/` | Update timetable |
| GET | `/api/timetables/{id}/entries/` | Get all entries |
| POST | `/api/timetables/{id}/entries/` | Add entry |
| POST | `/api/timetables/{id}/entries/bulk/` | Bulk add entries |
| GET | `/api/timetables/by-day/{day}/` | Entries for a day |
| **Timetable Entries** | | |
| GET | `/api/timetable-entries/` | List entries |
| PUT | `/api/timetable-entries/{id}/` | Update entry |
| DELETE | `/api/timetable-entries/{id}/` | Delete entry |
| **Teacher Timetable** | | |
| GET | `/api/teacher-timetable/` | List teacher timetable |
| POST | `/api/teacher-timetable/` | Create teacher timetable |
| GET | `/api/teacher-timetable/{id}/` | Teacher timetable detail |
| PUT | `/api/teacher-timetable/{id}/` | Update teacher timetable |
| GET | `/api/teacher-timetable/free-slots/{teacher_id}/` | Free slots for teacher |
| **Substitutes** | | |
| GET | `/api/substitutes/` | List substitutes |
| POST | `/api/substitutes/` | Assign substitute |
| GET | `/api/substitutes/{id}/` | Substitute detail |
| PUT | `/api/substitutes/{id}/` | Update substitute |
| DELETE | `/api/substitutes/{id}/` | Remove substitute |
| **Reports** | | |
| GET | `/api/timetable/reports/teacher-load/` | Teacher workload report |
| GET | `/api/timetable/reports/room-utilization/` | Room utilization report |
| GET | `/api/timetable/reports/conflicts/` | Schedule conflicts report |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| djangorestframework | 3.17.1 | Already installed |
| django-filter | Latest | For query parameter filtering |
| Django | 6.0.5 | Already installed |

---

## Notes

- `examinations.Subject` model is used for Subject (already exists)
- `students.Teacher` model is used for Teacher (already exists)
- `students.AcademicClass` model is used for Class (already exists)
- `students.Section` model is used for Section (already exists)
- `schools.School` model is used for School (already exists)
- `schools.AcademicYear` model is used for Academic Year (already exists)
- `accounts.User` model is used for User (already exists)
- `Timetable` is per class-section (e.g., "Class 10 - Section A - 2025-2026")
- `TimetableEntry` links a day + time slot to a subject + teacher
- `TeacherTimetable` mirrors entries for quick teacher-side queries
- `SubstituteTeacher` tracks daily substitute assignments
- `Room` is a simple room/space tracker for scheduling
