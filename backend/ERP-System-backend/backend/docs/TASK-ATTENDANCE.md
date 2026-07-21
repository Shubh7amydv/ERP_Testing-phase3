# Task: Attendance Module (Module 3)

> **Assigned To:** Sudipto (API Endpoints) | Varun (Database/Models)
> **Reference:** `docs/ERP-MODULE-PLAN.md` Section 6
> **Tech Stack:** Django 6 + DRF + PostgreSQL
> **Depends On:** Module 0 (Auth), Module 1 (School), Module 2 (Fees)

---

## Current State

- No `attendance` app exists
- No attendance tracking for students
- No leave application system
- No period-wise attendance support
- No attendance summary/reporting
- `SchoolHoliday` model already exists in `schools` app
- `Admission` model exists in `students` app (student records)
- `AcademicClass` and `Section` models exist in `students` app
- `School` and `AcademicYear` models exist in `schools` app

---

## TASKS FOR VARUN (Database / Models)

### Task V1: Create `attendance` Django App
- Run `python manage.py startapp attendance`
- Add `'attendance'` to `INSTALLED_APPS` in `config/settings.py`

### Task V2: Create `AttendancePeriod` Model
File: `attendance/models.py`

```python
from django.db import models
from schools.models import School


class AttendancePeriod(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='attendance_periods')
    name = models.CharField(max_length=50)  # e.g. "Period 1", "Morning Assembly"
    start_time = models.TimeField()
    end_time = models.TimeField()
    period_order = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['period_order']

    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"
```

### Task V3: Create `AttendanceRecord` Model
File: `attendance/models.py`

```python
from django.db import models
from schools.models import School
from students.models import Admission
from accounts.models import User


class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('half_day', 'Half Day'),
        ('excused', 'Excused'),
    ]

    SOURCE_CHOICES = [
        ('manual', 'Manual'),
        ('biometric', 'Biometric'),
        ('face', 'Face Recognition'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='attendance_records')
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    period = models.ForeignKey(
        'AttendancePeriod',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='records'
    )  # null = full day attendance
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='marked_attendance')
    remarks = models.TextField(blank=True)
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default='manual')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'date', 'period')
        ordering = ['-date', 'student']

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - {self.date} - {self.status}"
```

### Task V4: Create `AttendanceSummary` Model
File: `attendance/models.py`

```python
from schools.models import AcademicYear


class AttendanceSummary(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='attendance_summaries')
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name='attendance_summaries')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='attendance_summaries')
    total_days = models.PositiveIntegerField(default=0)
    present_days = models.PositiveIntegerField(default=0)
    absent_days = models.PositiveIntegerField(default=0)
    late_days = models.PositiveIntegerField(default=0)
    half_days = models.PositiveIntegerField(default=0)
    excused_days = models.PositiveIntegerField(default=0)
    attendance_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'academic_year')
        ordering = ['student']

    def __str__(self):
        return f"{self.student.first_name} - {self.academic_year.year} - {self.attendance_pct}%"

    def calculate_percentage(self):
        if self.total_days > 0:
            effective_present = self.present_days + (self.half_days * 0.5) + self.late_days
            self.attendance_pct = round((effective_present / self.total_days) * 100, 2)
        else:
            self.attendance_pct = 0
        return self.attendance_pct
```

### Task V5: Create `Holiday` Model
File: `attendance/models.py`

```python
class Holiday(models.Model):
    HOLIDAY_TYPE_CHOICES = [
        ('national', 'National'),
        ('religious', 'Religious'),
        ('school', 'School'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='holidays')
    name = models.CharField(max_length=200)
    date = models.DateField()
    holiday_type = models.CharField(max_length=20, choices=HOLIDAY_TYPE_CHOICES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'date')
        ordering = ['date']

    def __str__(self):
        return f"{self.name} - {self.date}"
```

### Task V6: Create `LeaveApplication` Model
File: `attendance/models.py`

```python
class LeaveApplication(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='leave_applications')
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name='leave_applications')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_leaves'
    )
    remarks = models.TextField(blank=True)
    attachment = models.FileField(upload_to='leave_attachments/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.first_name} - {self.start_date} to {self.end_date} ({self.status})"

    @property
    def total_days(self):
        from datetime import timedelta
        delta = self.end_date - self.start_date
        return delta.days + 1
```

### Task V7: Create `ClassAttendanceDay` Model
File: `attendance/models.py`

```python
from students.models import AcademicClass, Section


class ClassAttendanceDay(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='class_attendance_days')
    class_obj = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name='attendance_days')
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='attendance_days')
    date = models.DateField()
    total_students = models.PositiveIntegerField()
    present = models.PositiveIntegerField(default=0)
    absent = models.PositiveIntegerField(default=0)
    late = models.PositiveIntegerField(default=0)
    is_finalized = models.BooleanField(default=False)
    finalized_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='finalized_attendance'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('class_obj', 'section', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.class_obj} - {self.section} - {self.date}"

    @property
    def attendance_pct(self):
        if self.total_students > 0:
            return round(((self.present + self.late) / self.total_students) * 100, 2)
        return 0
```

### Task V8: Create Helper Function for Auto-Updating Summary
File: `attendance/models.py`

Add this utility function at the bottom:

```python
def update_attendance_summary(student, date):
    """Update attendance summary for a student after marking attendance."""
    from schools.models import AcademicYear

    academic_year = AcademicYear.objects.filter(
        school=student.school,
        is_current=True
    ).first()

    if not academic_year:
        return None

    summary, created = AttendanceSummary.objects.get_or_create(
        student=student,
        academic_year=academic_year,
        defaults={'school': student.school}
    )

    # Count attendance for the academic year
    records = AttendanceRecord.objects.filter(
        student=student,
        date__gte=academic_year.start_date,
        date__lte=academic_year.end_date,
        period__isnull=True  # full day records only
    )

    summary.total_days = records.count()
    summary.present_days = records.filter(status='present').count()
    summary.absent_days = records.filter(status='absent').count()
    summary.late_days = records.filter(status='late').count()
    summary.half_days = records.filter(status='half_day').count()
    summary.excused_days = records.filter(status='excused').count()
    summary.calculate_percentage()
    summary.save()

    return summary
```

### Task V9: Register Models in Admin
File: `attendance/admin.py`

Register all models with appropriate admin classes:
- `AttendancePeriod` - list_display: name, start_time, end_time, period_order, is_active
- `AttendanceRecord` - list_display: student, date, status, period, marked_by, source
- `AttendanceSummary` - list_display: student, academic_year, total_days, present_days, attendance_pct
- `Holiday` - list_display: name, date, holiday_type, is_active
- `LeaveApplication` - list_display: student, start_date, end_date, status, approved_by
- `ClassAttendanceDay` - list_display: class_obj, section, date, total_students, present, absent, is_finalized

### Task V10: Run Migrations
```bash
python manage.py makemigrations attendance
python manage.py migrate
```

---

## TASKS FOR SUDIPTO (API Endpoints)

### Task S1: Create Serializers
File: `attendance/serializers.py`

Create these serializers:

```python
from rest_framework import serializers
from .models import (
    AttendancePeriod, AttendanceRecord, AttendanceSummary,
    Holiday, LeaveApplication, ClassAttendanceDay
)


class AttendancePeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendancePeriod
        fields = ['id', 'school', 'name', 'start_time', 'end_time', 'period_order', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    marked_by_name = serializers.CharField(source='marked_by.email', read_only=True)
    period_name = serializers.CharField(source='period.name', read_only=True, default=None)

    class Meta:
        model = AttendanceRecord
        fields = ['id', 'school', 'student', 'student_name', 'date', 'status', 'period',
                  'period_name', 'marked_by', 'marked_by_name', 'remarks', 'source',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class AttendanceSummarySerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    academic_year_name = serializers.CharField(source='academic_year.year', read_only=True)

    class Meta:
        model = AttendanceSummary
        fields = ['id', 'school', 'student', 'student_name', 'academic_year', 'academic_year_name',
                  'total_days', 'present_days', 'absent_days', 'late_days', 'half_days',
                  'excused_days', 'attendance_pct', 'updated_at']
        read_only_fields = ['updated_at', 'attendance_pct']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = ['id', 'school', 'name', 'date', 'holiday_type', 'description', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class LeaveApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    approved_by_name = serializers.CharField(source='approved_by.email', read_only=True, default=None)
    total_days = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaveApplication
        fields = ['id', 'school', 'student', 'student_name', 'start_date', 'end_date',
                  'reason', 'status', 'approved_by', 'approved_by_name', 'remarks',
                  'attachment', 'total_days', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'status']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class ClassAttendanceDaySerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_obj.admission_class', read_only=True)
    section_name = serializers.CharField(source='section.section', read_only=True)
    finalized_by_name = serializers.CharField(source='finalized_by.email', read_only=True, default=None)
    attendance_pct = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)

    class Meta:
        model = ClassAttendanceDay
        fields = ['id', 'school', 'class_obj', 'class_name', 'section', 'section_name',
                  'date', 'total_students', 'present', 'absent', 'late',
                  'is_finalized', 'finalized_by', 'finalized_by_name', 'attendance_pct',
                  'created_at']
        read_only_fields = ['created_at', 'attendance_pct']


class BulkMarkAttendanceSerializer(serializers.Serializer):
    """Serializer for bulk marking attendance."""
    class_id = serializers.IntegerField()
    section_id = serializers.IntegerField()
    date = serializers.DateField()
    period_id = serializers.IntegerField(required=False, allow_null=True)
    attendance = serializers.ListField(
        child=serializers.DictField(
            child=serializers.Field()
        )
    )
    # attendance format: [{"student_id": "uuid", "status": "present", "remarks": ""}]


class MarkSingleAttendanceSerializer(serializers.Serializer):
    """Serializer for marking single student attendance."""
    student_id = serializers.UUIDField()
    date = serializers.DateField()
    status = serializers.ChoiceField(choices=['present', 'absent', 'late', 'half_day', 'excused'])
    period_id = serializers.IntegerField(required=False, allow_null=True)
    remarks = serializers.CharField(required=False, allow_blank=True)
    source = serializers.ChoiceField(choices=['manual', 'biometric', 'face'], default='manual')
```

### Task S2: Create Custom Permissions
File: `attendance/permissions.py`

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

### Task S3: Create Attendance Period Views
File: `attendance/views.py`

```python
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import AttendancePeriod
from .serializers import AttendancePeriodSerializer
from .permissions import IsSchoolMember


class AttendancePeriodViewSet(viewsets.ModelViewSet):
    serializer_class = AttendancePeriodSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        return AttendancePeriod.objects.filter(school=self.request.user.school)
```

### Task S4: Create Attendance Record Views (Bulk Mark)
File: `attendance/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import AttendanceRecord, AttendanceSummary, ClassAttendanceDay
from .serializers import (
    AttendanceRecordSerializer, BulkMarkAttendanceSerializer,
    MarkSingleAttendanceSerializer
)


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'student', 'date', 'status', 'period', 'source']

    def get_queryset(self):
        return AttendanceRecord.objects.filter(
            school=self.request.user.school
        ).select_related('student', 'marked_by', 'period')

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='mark')
    def mark_bulk(self, request):
        """Mark attendance for entire class (bulk)."""
        serializer = BulkMarkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        class_id = data['class_id']
        section_id = data['section_id']
        date = data['date']
        period_id = data.get('period_id')
        attendance_list = data['attendance']

        from students.models import Admission, AcademicClass, Section

        try:
            class_obj = AcademicClass.objects.get(id=class_id)
            section = Section.objects.get(id=section_id)
        except (AcademicClass.DoesNotExist, Section.DoesNotExist):
            return Response(
                {'error': 'Invalid class_id or section_id'},
                status=status.HTTP_400_BAD_REQUEST
            )

        created = []
        updated = []

        with transaction.atomic():
            for item in attendance_list:
                student_id = item['student_id']
                status_val = item['status']
                remarks = item.get('remarks', '')

                try:
                    student = Admission.objects.get(id=student_id)
                except Admission.DoesNotExist:
                    continue

                record, was_created = AttendanceRecord.objects.update_or_create(
                    student=student,
                    date=date,
                    period_id=period_id,
                    defaults={
                        'school': request.user.school,
                        'status': status_val,
                        'marked_by': request.user,
                        'remarks': remarks,
                        'source': 'manual'
                    }
                )

                if was_created:
                    created.append(str(record.id))
                else:
                    updated.append(str(record.id))

                # Update/create class attendance day summary
                ClassAttendanceDay.objects.update_or(
                    class_obj=class_obj,
                    section=section,
                    date=date,
                    defaults={'school': request.user.school}
                )

                # Update attendance summary
                from .models import update_attendance_summary
                update_attendance_summary(student, date)

        return Response({
            'created_count': len(created),
            'updated_count': len(updated),
            'created_ids': created,
            'updated_ids': updated
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='mark-single')
    def mark_single(self, request):
        """Mark attendance for a single student."""
        serializer = MarkSingleAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        from students.models import Admission

        try:
            student = Admission.objects.get(id=data['student_id'])
        except Admission.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        record, was_created = AttendanceRecord.objects.update_or_create(
            student=student,
            date=data['date'],
            period_id=data.get('period_id'),
            defaults={
                'school': request.user.school,
                'status': data['status'],
                'marked_by': request.user,
                'remarks': data.get('remarks', ''),
                'source': data.get('source', 'manual')
            }
        )

        from .models import update_attendance_summary
        update_attendance_summary(student, data['date'])

        return Response({
            'id': str(record.id),
            'status': 'created' if was_created else 'updated'
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='class/(?P<class_id>[^/.]+)/(?P<section_id>[^/.]+)')
    def class_attendance(self, request, class_id=None, section_id=None):
        """Get class attendance for a specific date."""
        date = request.query_params.get('date')
        if not date:
            return Response(
                {'error': 'date query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        records = self.get_queryset().filter(
            student__admission_class_id=class_id,
            student__section_id=section_id,
            date=date
        )

        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='student/(?P<student_id>[^/.]+)')
    def student_attendance(self, request, student_id=None):
        """Get student attendance history."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        records = self.get_queryset().filter(student_id=student_id)

        if start_date and end_date:
            records = records.filter(date__range=[start_date, end_date])

        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='student/(?P<student_id>[^/.]+)/summary')
    def student_summary(self, request, student_id=None):
        """Get student attendance summary."""
        academic_year_id = request.query_params.get('academic_year_id')

        from schools.models import AcademicYear

        if not academic_year_id:
            academic_year = AcademicYear.objects.filter(
                school=request.user.school,
                is_current=True
            ).first()
        else:
            academic_year = AcademicYear.objects.get(id=academic_year_id)

        if not academic_year:
            return Response(
                {'error': 'No active academic year found'},
                status=status.HTTP_404_NOT_FOUND
            )

        summary = AttendanceSummary.objects.filter(
            student_id=student_id,
            academic_year=academic_year
        ).first()

        if summary:
            serializer = AttendanceSummarySerializer(summary)
            return Response(serializer.data)

        return Response({
            'student_id': student_id,
            'academic_year': academic_year.year,
            'total_days': 0,
            'present_days': 0,
            'absent_days': 0,
            'late_days': 0,
            'half_days': 0,
            'excused_days': 0,
            'attendance_pct': 0
        })

    @action(detail=False, methods=['get'], url_path='class/(?P<class_id>[^/.]+)/summary')
    def class_summary(self, request, class_id=None):
        """Get class attendance summary."""
        date = request.query_params.get('date')
        if not date:
            return Response(
                {'error': 'date query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        class_day = ClassAttendanceDay.objects.filter(
            class_obj_id=class_id,
            date=date
        ).first()

        if class_day:
            serializer = ClassAttendanceDaySerializer(class_day)
            return Response(serializer.data)

        return Response({
            'class_id': class_id,
            'date': date,
            'total_students': 0,
            'present': 0,
            'absent': 0,
            'late': 0,
            'attendance_pct': 0
        })
```

### Task S5: Create Holiday Views
File: `attendance/views.py`

```python
from .models import Holiday
from .serializers import HolidaySerializer


class HolidayViewSet(viewsets.ModelViewSet):
    serializer_class = HolidaySerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'holiday_type', 'is_active']

    def get_queryset(self):
        return Holiday.objects.filter(school=self.request.user.school)
```

### Task S6: Create Leave Application Views
File: `attendance/views.py`

```python
from .models import LeaveApplication
from .serializers import LeaveApplicationSerializer


class LeaveApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveApplicationSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'student', 'status']

    def get_queryset(self):
        return LeaveApplication.objects.filter(
            school=self.request.user.school
        ).select_related('student', 'approved_by')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a leave application."""
        leave = self.get_object()
        if leave.status != 'pending':
            return Response(
                {'error': 'Only pending applications can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave.status = 'approved'
        leave.approved_by = request.user
        leave.remarks = request.data.get('remarks', '')
        leave.save()

        # Auto-mark attendance for the leave period
        from datetime import timedelta
        current_date = leave.start_date
        while current_date <= leave.end_date:
            from students.models import Admission
            student = Admission.objects.get(id=leave.student_id)
            AttendanceRecord.objects.update_or(
                student=student,
                date=current_date,
                defaults={
                    'school': request.user.school,
                    'status': 'excused',
                    'marked_by': request.user,
                    'remarks': f'Approved leave: {leave.reason}',
                    'source': 'manual'
                }
            )
            current_date += timedelta(days=1)

        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a leave application."""
        leave = self.get_object()
        if leave.status != 'pending':
            return Response(
                {'error': 'Only pending applications can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave.status = 'rejected'
        leave.approved_by = request.user
        leave.remarks = request.data.get('remarks', '')
        leave.save()

        return Response({'status': 'rejected'})
```

### Task S7: Create Attendance Report Views
File: `attendance/views.py`

```python
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import AttendanceRecord, AttendanceSummary, ClassAttendanceDay


class DailyAttendanceReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        date = request.query_params.get('date', timezone.now().date())
        class_id = request.query_params.get('class_id')
        section_id = request.query_params.get('section_id')

        records = AttendanceRecord.objects.filter(school=school, date=date, period__isnull=True)

        if class_id:
            records = records.filter(student__admission_class_id=class_id)
        if section_id:
            records = records.filter(student__section_id=section_id)

        total = records.count()
        present = records.filter(status='present').count()
        absent = records.filter(status='absent').count()
        late = records.filter(status='late').count()
        half_day = records.filter(status='half_day').count()
        excused = records.filter(status='excused').count()

        return Response({
            'date': date,
            'total_students': total,
            'present': present,
            'absent': absent,
            'late': late,
            'half_day': half_day,
            'excused': excused,
            'attendance_pct': round((present + late) / total * 100, 2) if total > 0 else 0
        })


class MonthlyAttendanceReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)
        class_id = request.query_params.get('class_id')

        records = AttendanceRecord.objects.filter(
            school=school,
            date__month=month,
            date__year=year,
            period__isnull=True
        )

        if class_id:
            records = records.filter(student__admission_class_id=class_id)

        daily_data = records.values('date').annotate(
            total=Count('id'),
            present=Count('id', filter=Q(status='present')),
            absent=Count('id', filter=Q(status='absent')),
            late=Count('id', filter=Q(status='late'))
        ).order_by('date')

        return Response(list(daily_data))


class ClassWiseAttendanceReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        date = request.query_params.get('date', timezone.now().date())

        from students.models import AcademicClass, Section

        classes = AcademicClass.objects.filter(school=school)
        report = []

        for cls in classes:
            sections = Section.objects.filter(school=school)
            for section in sections:
                records = AttendanceRecord.objects.filter(
                    school=school,
                    student__admission_class=cls,
                    student__section=section,
                    date=date,
                    period__isnull=True
                )

                total = records.count()
                present = records.filter(status='present').count()

                report.append({
                    'class_id': cls.id,
                    'class_name': cls.admission_class,
                    'section_id': section.id,
                    'section_name': section.section,
                    'total_students': total,
                    'present': present,
                    'attendance_pct': round(present / total * 100, 2) if total > 0 else 0
                })

        return Response(report)


class LowAttendanceReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        threshold = float(request.query_params.get('threshold', 75))
        academic_year_id = request.query_params.get('academic_year_id')

        from schools.models import AcademicYear

        if not academic_year_id:
            academic_year = AcademicYear.objects.filter(
                school=school, is_current=True
            ).first()
        else:
            academic_year = AcademicYear.objects.get(id=academic_year_id)

        summaries = AttendanceSummary.objects.filter(
            school=school,
            academic_year=academic_year,
            attendance_pct__lt=threshold,
            total_days__gte=5
        ).select_related('student')

        report = []
        for summary in summaries:
            report.append({
                'student_id': str(summary.student.id),
                'student_name': f"{summary.student.first_name} {summary.student.last_name}",
                'admission_no': summary.student.admission_no,
                'class': summary.student.admission_class.admission_class if summary.student.admission_class else None,
                'section': summary.student.section.section if summary.student.section else None,
                'total_days': summary.total_days,
                'present_days': summary.present_days,
                'attendance_pct': float(summary.attendance_pct)
            })

        return Response(report)


class BulkSMSReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        threshold = float(request.query_params.get('threshold', 75))

        from schools.models import AcademicYear
        academic_year = AcademicYear.objects.filter(
            school=school, is_current=True
        ).first()

        if not academic_year:
            return Response([])

        summaries = AttendanceSummary.objects.filter(
            school=school,
            academic_year=academic_year,
            attendance_pct__lt=threshold,
            total_days__gte=5
        ).select_related('student', 'student__user')

        students_to_notify = []
        for summary in summaries:
            student = summary.student
            phone = student.user.phone if student.user else None
            if phone:
                students_to_notify.append({
                    'student_id': str(student.id),
                    'student_name': f"{student.first_name} {student.last_name}",
                    'phone': phone,
                    'attendance_pct': float(summary.attendance_pct),
                    'parent_phone': phone
                })

        return Response(students_to_notify)
```

### Task S8: Create URL Patterns
File: `attendance/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'attendance-periods', views.AttendancePeriodViewSet)
router.register(r'attendance', views.AttendanceRecordViewSet)
router.register(r'holidays', views.HolidayViewSet)
router.register(r'leave-applications', views.LeaveApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('attendance/reports/daily/', views.DailyAttendanceReportView.as_view(), name='attendance-daily-report'),
    path('attendance/reports/monthly/', views.MonthlyAttendanceReportView.as_view(), name='attendance-monthly-report'),
    path('attendance/reports/class-wise/', views.ClassWiseAttendanceReportView.as_view(), name='attendance-class-wise-report'),
    path('attendance/reports/low-attendance/', views.LowAttendanceReportView.as_view(), name='attendance-low-report'),
    path('attendance/reports/bulk-sms/', views.BulkSMSReportView.as_view(), name='attendance-bulk-sms-report'),
]
```

### Task S9: Wire URLs in `config/urls.py`
Add to root `urls.py`:
```python
path('api/', include('attendance.urls')),
```

### Task S10: Test All Endpoints
Create test data and verify:
1. CRUD for AttendancePeriod
2. Bulk mark attendance for class
3. Single student attendance marking
4. Get class attendance for date
5. Get student attendance history
6. Get student attendance summary
7. Get class attendance summary
8. CRUD for Holiday
9. CRUD for LeaveApplication + approve + reject
10. Daily attendance report
11. Monthly attendance report
12. Class-wise attendance report
13. Low attendance report
14. Bulk SMS report

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Attendance Periods** | | |
| GET | `/api/attendance-periods/` | List periods |
| POST | `/api/attendance-periods/` | Create period |
| GET | `/api/attendance-periods/{id}/` | Period detail |
| PUT | `/api/attendance-periods/{id}/` | Update period |
| DELETE | `/api/attendance-periods/{id}/` | Delete period |
| **Attendance Records** | | |
| GET | `/api/attendance/` | List attendance records |
| POST | `/api/attendance/` | Create attendance record |
| GET | `/api/attendance/{id}/` | Attendance detail |
| PUT | `/api/attendance/{id}/` | Update attendance |
| DELETE | `/api/attendance/{id}/` | Delete attendance |
| POST | `/api/attendance/mark/` | Bulk mark attendance for class |
| POST | `/api/attendance/mark-single/` | Mark single student attendance |
| GET | `/api/attendance/class/{class_id}/{section_id}/` | Get class attendance for date |
| GET | `/api/attendance/student/{student_id}/` | Student attendance history |
| GET | `/api/attendance/student/{student_id}/summary/` | Student attendance summary |
| GET | `/api/attendance/class/{class_id}/summary/` | Class attendance summary |
| **Holidays** | | |
| GET | `/api/holidays/` | List holidays |
| POST | `/api/holidays/` | Create holiday |
| GET | `/api/holidays/{id}/` | Holiday detail |
| PUT | `/api/holidays/{id}/` | Update holiday |
| DELETE | `/api/holidays/{id}/` | Delete holiday |
| **Leave Applications** | | |
| GET | `/api/leave-applications/` | List leave applications |
| POST | `/api/leave-applications/` | Apply for leave |
| GET | `/api/leave-applications/{id}/` | Application detail |
| PUT | `/api/leave-applications/{id}/` | Update application |
| DELETE | `/api/leave-applications/{id}/` | Delete application |
| POST | `/api/leave-applications/{id}/approve/` | Approve leave |
| POST | `/api/leave-applications/{id}/reject/` | Reject leave |
| **Reports** | | |
| GET | `/api/attendance/reports/daily/` | Daily attendance report |
| GET | `/api/attendance/reports/monthly/` | Monthly attendance report |
| GET | `/api/attendance/reports/class-wise/` | Class-wise attendance report |
| GET | `/api/attendance/reports/low-attendance/` | Students with low attendance |
| GET | `/api/attendance/reports/bulk-sms/` | Students to notify via SMS |



## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| djangorestframework | 3.17.1 | Already installed |
| django-filter | Latest | For query parameter filtering |
| Django | 6.0.5 | Already installed |

---

## Notes

- `students.Admission` model is used as the Student model (already exists)
- `students.AcademicClass` model is used for Class (already exists)
- `students.Section` model is used for Section (already exists)
- `schools.School` model is used for School (already exists)
- `schools.AcademicYear` model is used for Academic Year (already exists)
- `accounts.User` model is used for User (already exists)
- `schools.SchoolHoliday` already exists separately - `Holiday` in attendance is for attendance-specific holidays
- Period-wise attendance is optional (period=null means full-day)
- Attendance summary auto-updates when attendance is marked
- Leave approval auto-marks attendance as "excused"
- `ClassAttendanceDay` is a summary model for class-level daily tracking
