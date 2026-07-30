# Task: Module 1 - School (Multi-Tenancy)

> **Assigned To:** Sudipto (API Endpoints) | Varun (Database/Models)
> **Reference:** `docs/ERP-MODULE-PLAN.md` Section 4
> **Tech Stack:** Django 6 + DRF + PostgreSQL
> **Depends On:** Module 0 (Authentication) - ✅ Complete

---

## Current State Analysis

### What Exists
| Component | Status | Notes |
|-----------|--------|-------|
| `accounts.User` model | ✅ Done | Has `school_id` as raw UUIDField (needs to become FK) |
| `authentication` app | ✅ Done | Role, Permission, JWT login/logout working |
| `students` app | ⚠️ Partial | Models exist (compiled .pyc) but no .py source visible |
| `schools` app | ❌ Not Created | Does not exist yet |
| `config/urls.py` | ✅ Done | Only `authentication.urls` wired |

### Key Issues to Address in Module 1
1. `User.school_id` is raw UUID → needs to become FK to `School` model
2. No `schools` Django app exists
3. No School/AcademicYear/Settings models
4. `students` app models reference `school_id` as raw UUID → need migration to FK

---

## TASKS FOR VARUN (Database / Models)

### Task V1: Create `schools` Django App
```bash
cd backend
python manage.py startapp schools
```
- Add `'schools'` to `INSTALLED_APPS` in `config/settings.py`
- **File:** `config/settings.py` line 48

### Task V2: Create `School` Model
**File:** `schools/models.py`

```python
import uuid
from django.db import models

class School(models.Model):
    AFFILIATION_CHOICES = [
        ('CBSE', 'CBSE'),
        ('ICSE', 'ICSE'),
        ('STATE', 'State Board'),
        ('IB', 'IB'),
        ('CIE', 'Cambridge'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)  # e.g. "DPS001"
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='school_logos/', blank=True, null=True)
    established = models.DateField(null=True, blank=True)
    affiliation = models.CharField(max_length=100, blank=True, choices=AFFILIATION_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"
```

### Task V3: Create `AcademicYear` Model
**File:** `schools/models.py`

```python
class AcademicYear(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='academic_years')
    year = models.CharField(max_length=9)  # e.g. "2025-2026"
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'year')
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.school.name} - {self.year}"

    def save(self, *args, **kwargs):
        if self.is_current:
            # Reset other current years for this school
            AcademicYear.objects.filter(
                school=self.school, is_current=True
            ).exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)
```

### Task V4: Create `SchoolSettings` Model
**File:** `schools/models.py`

```python
class SchoolSettings(models.Model):
    school = models.OneToOneField(School, on_delete=models.CASCADE, related_name='settings')
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')
    currency = models.CharField(max_length=3, default='INR')
    currency_symbol = models.CharField(max_length=5, default='₹')
    academic_start_month = models.PositiveIntegerField(default=4)  # 1=Jan, 4=Apr
    passing_percentage = models.PositiveIntegerField(default=33)
    max_students_per_section = models.PositiveIntegerField(default=40)
    enable_biometric = models.BooleanField(default=False)
    sms_enabled = models.BooleanField(default=False)
    email_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Settings for {self.school.name}"
```

### Task V5: Create `SchoolHoliday` Model
**File:** `schools/models.py`

```python
class SchoolHoliday(models.Model):
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
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'date')
        ordering = ['date']

    def __str__(self):
        return f"{self.name} - {self.date}"
```

### Task V6: Create `SchoolNotificationTemplate` Model
**File:** `schools/models.py`

```python
class SchoolNotificationTemplate(models.Model):
    TEMPLATE_TYPE_CHOICES = [
        ('fee_receipt', 'Fee Receipt'),
        ('welcome', 'Welcome'),
        ('attendance_alert', 'Attendance Alert'),
        ('exam_result', 'Exam Result'),
        ('general', 'General'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='notification_templates')
    template_type = models.CharField(max_length=30, choices=TEMPLATE_TYPE_CHOICES)
    subject = models.CharField(max_length=200)
    body = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('school', 'template_type')

    def __str__(self):
        return f"{self.school.name} - {self.get_template_type_display()}"
```

### Task V7: Update `accounts.User` Model - Change `school_id` to FK
**File:** `accounts/models.py`

**Current (line 39):**
```python
school_id = models.UUIDField(null=True, blank=True)
```

**Replace with:**
```python
school = models.ForeignKey(
    'schools.School',
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='users'
)
```

**Note:** Keep `school_id` temporarily as deprecated field, then create migration to migrate data and remove old field. Or if no data exists, just replace directly.

### Task V8: Create Data Migration for Predefined Roles
**File:** `schools/migrations/0002_seed_roles.py` (data migration)

Create a data migration that ensures these roles exist:
```python
PREDEFINED_ROLES = [
    "Super Admin",
    "School Admin",
    "Principal",
    "Vice Principal",
    "Accountant",
    "Librarian",
    "Teacher",
    "Transport Manager",
    "Office Staff",
    "Parent",
]
```

### Task V9: Register Models in Admin
**File:** `schools/admin.py`

```python
from django.contrib import admin
from .models import School, AcademicYear, SchoolSettings, SchoolHoliday, SchoolNotificationTemplate

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'city', 'state', 'is_active']
    search_fields = ['name', 'code']
    list_filter = ['is_active', 'state']

@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ['school', 'year', 'start_date', 'end_date', 'is_current']
    list_filter = ['school', 'is_current']

@admin.register(SchoolSettings)
class SchoolSettingsAdmin(admin.ModelAdmin):
    list_display = ['school', 'currency', 'timezone']

@admin.register(SchoolHoliday)
class SchoolHolidayAdmin(admin.ModelAdmin):
    list_display = ['school', 'name', 'date', 'holiday_type']
    list_filter = ['school', 'holiday_type']

@admin.register(SchoolNotificationTemplate)
class SchoolNotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['school', 'template_type', 'subject', 'is_active']
    list_filter = ['school', 'template_type']
```

### Task V10: Run Migrations
```bash
cd backend
python manage.py makemigrations schools
python manage.py makemigrations accounts  # For User model changes
python manage.py migrate
```

### Task V11: Create Superuser (if not exists)
```bash
python manage.py createsuperuser
```

---

## TASKS FOR SUDIPTO (API Endpoints)

### Task S1: Create Serializers
**File:** `schools/serializers.py`

Create serializers for all models:

```python
from rest_framework import serializers
from .models import School, AcademicYear, SchoolSettings, SchoolHoliday, SchoolNotificationTemplate


class SchoolSerializer(serializers.ModelSerializer):
    academic_years_count = serializers.SerializerMethodField()
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = [
            'id', 'name', 'code', 'address', 'city', 'state', 'pincode',
            'phone', 'email', 'website', 'logo', 'established', 'affiliation',
            'is_active', 'created_at', 'updated_at',
            'academic_years_count', 'students_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_academic_years_count(self, obj):
        return obj.academic_years.count()

    def get_students_count(self, obj):
        # Will work once User model has school FK
        return obj.users.count()


class SchoolListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    class Meta:
        model = School
        fields = ['id', 'name', 'code', 'city', 'state', 'is_active']


class AcademicYearSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model = AcademicYear
        fields = ['id', 'school', 'school_name', 'year', 'start_date', 'end_date', 'is_current', 'created_at']
        read_only_fields = ['id', 'created_at']


class SchoolSettingsSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model = SchoolSettings
        fields = [
            'id', 'school', 'school_name', 'timezone', 'currency', 'currency_symbol',
            'academic_start_month', 'passing_percentage', 'max_students_per_section',
            'enable_biometric', 'sms_enabled', 'email_enabled',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SchoolHolidaySerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model = SchoolHoliday
        fields = ['id', 'school', 'school_name', 'name', 'date', 'holiday_type', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class SchoolNotificationTemplateSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model = SchoolNotificationTemplate
        fields = ['id', 'school', 'school_name', 'template_type', 'subject', 'body', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
```

### Task S2: Create Custom Permissions
**File:** `schools/permissions.py`

```python
from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """Only superusers can access"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser


class IsSchoolAdmin(BasePermission):
    """School Admin role or superuser"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.role and request.user.role.name == 'School Admin'


class IsSchoolMember(BasePermission):
    """User belongs to the school being accessed"""
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        # For School objects, check if user belongs to that school
        if hasattr(obj, 'school'):
            return request.user.school_id == obj.school.id
        # For School objects directly
        if hasattr(obj, 'id'):
            return request.user.school_id == obj.id
        return False
```

### Task S3: Create Views
**File:** `schools/views.py`

Implement these views:

| Endpoint | View Class | Method | Permission | Description |
|----------|-----------|--------|------------|-------------|
| `/schools/` | `SchoolListView` | GET | IsSuperAdmin | List all schools |
| `/schools/` | `SchoolCreateView` | POST | IsSuperAdmin | Create school |
| `/schools/{id}/` | `SchoolDetailView` | GET | IsSchoolMember | School detail |
| `/schools/{id}/` | `SchoolUpdateView` | PUT | IsSuperAdmin | Update school |
| `/schools/{id}/` | `SchoolDeleteView` | DELETE | IsSuperAdmin | Soft delete school |
| `/schools/{id}/settings/` | `SchoolSettingsView` | GET/PUT | IsSchoolMember | Get/Update settings |
| `/schools/{id}/academic-years/` | `AcademicYearListView` | GET | IsSchoolMember | List academic years |
| `/schools/{id}/academic-years/` | `AcademicYearCreateView` | POST | IsSchoolAdmin | Create academic year |
| `/schools/{id}/academic-years/{id}/` | `AcademicYearDetailView` | GET/PUT | IsSchoolMember | Academic year detail |
| `/schools/{id}/academic-years/{id}/set-current/` | `SetCurrentYearView` | POST | IsSchoolAdmin | Set as current year |
| `/schools/{id}/holidays/` | `HolidayListView` | GET | IsSchoolMember | List holidays |
| `/schools/{id}/holidays/` | `HolidayCreateView` | POST | IsSchoolAdmin | Add holiday |
| `/schools/{id}/holidays/{id}/` | `HolidayDetailView` | GET/PUT/DELETE | IsSchoolAdmin | Holiday CRUD |
| `/schools/{id}/templates/` | `TemplateListView` | GET | IsSchoolMember | List notification templates |
| `/schools/{id}/templates/` | `TemplateCreateView` | POST | IsSchoolAdmin | Create template |
| `/schools/{id}/templates/{id}/` | `TemplateDetailView` | GET/PUT | IsSchoolAdmin | Template detail/update |

### Task S4: Create URL Patterns
**File:** `schools/urls.py`

```python
from django.urls import path
from . import views

urlpatterns = [
    # Schools
    path('schools/', views.SchoolListView.as_view(), name='school-list'),
    path('schools/create/', views.SchoolCreateView.as_view(), name='school-create'),
    path('schools/<uuid:pk>/', views.SchoolDetailView.as_view(), name='school-detail'),
    path('schools/<uuid:pk>/update/', views.SchoolUpdateView.as_view(), name='school-update'),
    path('schools/<uuid:pk>/delete/', views.SchoolDeleteView.as_view(), name='school-delete'),

    # School Settings
    path('schools/<uuid:school_id>/settings/', views.SchoolSettingsView.as_view(), name='school-settings'),

    # Academic Years
    path('schools/<uuid:school_id>/academic-years/', views.AcademicYearListView.as_view(), name='academic-year-list'),
    path('schools/<uuid:school_id>/academic-years/create/', views.AcademicYearCreateView.as_view(), name='academic-year-create'),
    path('schools/<uuid:school_id>/academic-years/<int:pk>/', views.AcademicYearDetailView.as_view(), name='academic-year-detail'),
    path('schools/<uuid:school_id>/academic-years/<int:pk>/set-current/', views.SetCurrentYearView.as_view(), name='academic-year-set-current'),

    # Holidays
    path('schools/<uuid:school_id>/holidays/', views.HolidayListView.as_view(), name='holiday-list'),
    path('schools/<uuid:school_id>/holidays/create/', views.HolidayCreateView.as_view(), name='holiday-create'),
    path('schools/<uuid:school_id>/holidays/<int:pk>/', views.HolidayDetailView.as_view(), name='holiday-detail'),

    # Notification Templates
    path('schools/<uuid:school_id>/templates/', views.TemplateListView.as_view(), name='template-list'),
    path('schools/<uuid:school_id>/templates/create/', views.TemplateCreateView.as_view(), name='template-create'),
    path('schools/<uuid:school_id>/templates/<int:pk>/', views.TemplateDetailView.as_view(), name='template-detail'),
]
```

### Task S5: Wire URLs in `config/urls.py`
**File:** `config/urls.py`

Add after line 24:
```python
path('api/', include('schools.urls')),
```

### Task S6: Implement School List/Create Views
```python
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import School, AcademicYear, SchoolSettings, SchoolHoliday, SchoolNotificationTemplate
from .serializers import (
    SchoolSerializer, SchoolListSerializer, AcademicYearSerializer,
    SchoolSettingsSerializer, SchoolHolidaySerializer, SchoolNotificationTemplateSerializer
)
from .permissions import IsSuperAdmin, IsSchoolAdmin, IsSchoolMember


class SchoolListView(generics.ListAPIView):
    queryset = School.objects.filter(is_active=True)
    serializer_class = SchoolListSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class SchoolCreateView(generics.CreateAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def perform_create(self, serializer):
        school = serializer.save()
        # Auto-create default settings for the school
        SchoolSettings.objects.create(school=school)


class SchoolDetailView(generics.RetrieveAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]


class SchoolUpdateView(generics.UpdateAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class SchoolDeleteView(generics.DestroyAPIView):
    queryset = School.objects.all()
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def delete(self, request, *args, **kwargs):
        school = self.get_object()
        school.is_active = False
        school.save()
        return Response({'message': 'School deactivated successfully'}, status=status.HTTP_200_OK)
```

### Task S7: Implement Settings View
```python
class SchoolSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = SchoolSettingsSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get_object(self):
        school_id = self.kwargs['school_id']
        settings, created = SchoolSettings.objects.get_or_create(school_id=school_id)
        return settings
```

### Task S8: Implement Academic Year Views
```python
class AcademicYearListView(generics.ListAPIView):
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get_queryset(self):
        school_id = self.kwargs['school_id']
        return AcademicYear.objects.filter(school_id=school_id)


class AcademicYearCreateView(generics.CreateAPIView):
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def perform_create(self, serializer):
        serializer.save(school_id=self.kwargs['school_id'])


class AcademicYearDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get_queryset(self):
        school_id = self.kwargs['school_id']
        return AcademicYear.objects.filter(school_id=school_id)


class SetCurrentYearView(APIView):
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def post(self, request, school_id, pk):
        try:
            academic_year = AcademicYear.objects.get(pk=pk, school_id=school_id)
        except AcademicYear.DoesNotExist:
            return Response({'error': 'Academic year not found'}, status=status.HTTP_404_NOT_FOUND)

        academic_year.is_current = True
        academic_year.save()  # This will auto-reset other current years

        return Response({'message': f'{academic_year.year} set as current academic year'})
```

### Task S9: Implement Holiday Views
```python
class HolidayListView(generics.ListAPIView):
    serializer_class = SchoolHolidaySerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get_queryset(self):
        school_id = self.kwargs['school_id']
        return SchoolHoliday.objects.filter(school_id=school_id)


class HolidayCreateView(generics.CreateAPIView):
    serializer_class = SchoolHolidaySerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def perform_create(self, serializer):
        serializer.save(school_id=self.kwargs['school_id'])


class HolidayDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SchoolHolidaySerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def get_queryset(self):
        school_id = self.kwargs['school_id']
        return SchoolHoliday.objects.filter(school_id=school_id)
```

### Task S10: Implement Template Views
```python
class TemplateListView(generics.ListAPIView):
    serializer_class = SchoolNotificationTemplateSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get_queryset(self):
        school_id = self.kwargs['school_id']
        return SchoolNotificationTemplate.objects.filter(school_id=school_id)


class TemplateCreateView(generics.CreateAPIView):
    serializer_class = SchoolNotificationTemplateSerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def perform_create(self, serializer):
        serializer.save(school_id=self.kwargs['school_id'])


class TemplateDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = SchoolNotificationTemplateSerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def get_queryset(self):
        school_id = self.kwargs['school_id']
        return SchoolNotificationTemplate.objects.filter(school_id=school_id)
```

### Task S11: Update UserSerializer to Use New School FK
**File:** `authentication/serializers.py`

Update `UserSerializer` (line 46) to include school details:
```python
class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True, default=None)
    school_name = serializers.CharField(source='school.name', read_only=True, default=None)
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'avatar', 'role', 'role_name', 'school', 'school_name', 'permissions']
        read_only_fields = ['id', 'email']
```



## API Request/Response Examples

### POST `/api/schools/create/`
```json
// Request (Super Admin only)
{
    "name": "Delhi Public School",
    "code": "DPS001",
    "address": "123 Education Lane",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "phone": "011-12345678",
    "email": "info@dps001.edu.in",
    "website": "https://dps001.edu.in",
    "affiliation": "CBSE"
}

// Response 201
{
    "id": "uuid-here",
    "name": "Delhi Public School",
    "code": "DPS001",
    "city": "New Delhi",
    "state": "Delhi",
    "is_active": true,
    "academic_years_count": 0,
    "students_count": 0,
    "created_at": "2025-01-15T10:30:00Z"
}
```

### GET `/api/schools/{id}/`
```json
// Response 200
{
    "id": "uuid-here",
    "name": "Delhi Public School",
    "code": "DPS001",
    "address": "123 Education Lane",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "phone": "011-12345678",
    "email": "info@dps001.edu.in",
    "website": "https://dps001.edu.in",
    "logo": "/media/school_logos/dps_logo.png",
    "established": "1995-04-01",
    "affiliation": "CBSE",
    "is_active": true,
    "academic_years_count": 2,
    "students_count": 450,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
}
```

### POST `/api/schools/{id}/academic-years/`
```json
// Request
{
    "year": "2025-2026",
    "start_date": "2025-04-01",
    "end_date": "2026-03-31",
    "is_current": true
}

// Response 201
{
    "id": 1,
    "school": "uuid-here",
    "school_name": "Delhi Public School",
    "year": "2025-2026",
    "start_date": "2025-04-01",
    "end_date": "2026-03-31",
    "is_current": true,
    "created_at": "2025-01-15T10:35:00Z"
}
```

### PUT `/api/schools/{id}/settings/`
```json
// Request
{
    "timezone": "Asia/Kolkata",
    "currency": "INR",
    "currency_symbol": "₹",
    "academic_start_month": 4,
    "passing_percentage": 33,
    "max_students_per_section": 40,
    "sms_enabled": true,
    "email_enabled": true
}

// Response 200
{
    "id": 1,
    "school": "uuid-here",
    "school_name": "Delhi Public School",
    "timezone": "Asia/Kolkata",
    "currency": "INR",
    "currency_symbol": "₹",
    "academic_start_month": 4,
    "passing_percentage": 33,
    "max_students_per_section": 40,
    "enable_biometric": false,
    "sms_enabled": true,
    "email_enabled": true,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:40:00Z"
}
```

---

## Testing Checklist

### Varun (Models)
- [ ] `python manage.py makemigrations schools` - no errors
- [ ] `python manage.py migrate` - all migrations applied
- [ ] School model shows in Django admin
- [ ] Can create School via admin panel
- [ ] AcademicYear unique_together works
- [ ] SchoolSettings OneToOne works
- [ ] SchoolHoliday unique_together works
- [ ] User.school FK works (nullable)

### Sudipto (API)
- [ ] `POST /api/auth/login/` - get JWT token
- [ ] `GET /api/schools/` - returns 403 for non-superadmin
- [ ] `POST /api/schools/create/` - creates school (superadmin)
- [ ] `GET /api/schools/{id}/` - returns school detail
- [ ] `PUT /api/schools/{id}/update/` - updates school
- [ ] `DELETE /api/schools/{id}/delete/` - soft deletes school
- [ ] `GET /api/schools/{id}/settings/` - returns settings
- [ ] `PUT /api/schools/{id}/settings/` - updates settings
- [ ] `GET /api/schools/{id}/academic-years/` - lists years
- [ ] `POST /api/schools/{id}/academic-years/` - creates year
- [ ] `POST /api/schools/{id}/academic-years/{id}/set-current/` - sets current
- [ ] `GET /api/schools/{id}/holidays/` - lists holidays
- [ ] `POST /api/schools/{id}/holidays/` - creates holiday
- [ ] `GET /api/schools/{id}/templates/` - lists templates
- [ ] `POST /api/schools/{id}/templates/` - creates template

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Django | 6.0.5 | Already installed |
| djangorestframework | 3.17.1 | Already installed |
| Pillow | >=10.0.0 | For School logo ImageField |

---

## Notes

- School uses UUID primary key (matching existing User model pattern)
- AcademicYear has `is_current` flag with auto-reset logic
- SchoolSettings auto-creates when a new School is created
- Soft delete for School (is_active=False) preserves data
- All school-scoped endpoints filter by `school_id` in URL
- `IsSchoolMember` permission checks user belongs to the school
