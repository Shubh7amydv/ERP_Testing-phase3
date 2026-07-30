# Task: HR & Payroll Module (Module 7)

> **Assigned To:** Sudipto (API Endpoints) | Varun (Database/Models)
> **Reference:** `docs/ERP-MODULE-PLAN.md` Section 10
> **Tech Stack:** Django 6 + DRF + PostgreSQL
> **Depends On:** Module 0 (Auth), Module 1 (School)

---

## Current State

- No `hr` app exists
- No staff management system in the ERP
- No attendance tracking for staff
- No leave management for staff
- No payroll/salary slip system
- `School` model exists in `schools` app
- `accounts.User` model exists for User

---

## TASKS FOR VARUN (Database / Models)

### Task V1: Create `hr` Django App
- Run `python manage.py startapp hr`
- Add `'hr'` to `INSTALLED_APPS` in `config/settings.py`

### Task V2: Create `Department` Model
File: `hr/models.py`

```python
from django.db import models
from schools.models import School


class Department(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)  # e.g. "Academic", "Admin", "Transport"
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Forward reference - head will be added after Staff model
    head = models.ForeignKey('Staff', on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_departments')

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.school.name} - {self.name}"
```

### Task V3: Create `Designation` Model
File: `hr/models.py`

```python
class Designation(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='designations')
    name = models.CharField(max_length=100)  # e.g. "Teacher", "Accountant", "Peon"
    level = models.PositiveIntegerField(default=1)  # 1=entry, 5=management
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['level', 'name']

    def __str__(self):
        return f"{self.name} (Level {self.level})"
```

### Task V4: Create `Staff` Model
File: `hr/models.py`

```python
from accounts.models import User


class Staff(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    MARITAL_STATUS_CHOICES = [
        ('single', 'Single'),
        ('married', 'Married'),
        ('divorced', 'Divorced'),
        ('widowed', 'Widowed'),
    ]

    EMPLOYMENT_TYPE_CHOICES = [
        ('permanent', 'Permanent'),
        ('contract', 'Contract'),
        ('part_time', 'Part Time'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('on_leave', 'On Leave'),
        ('terminated', 'Terminated'),
        ('retired', 'Retired'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='staff')
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff_profile')
    employee_id = models.CharField(max_length=20)  # e.g. "EMP-2025-0001"
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    marital_status = models.CharField(max_length=15, choices=MARITAL_STATUS_CHOICES, blank=True)
    blood_group = models.CharField(max_length=5, blank=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField()
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    aadhaar_no = models.CharField(max_length=12, blank=True)
    pan_no = models.CharField(max_length=10, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='staff')
    designation = models.ForeignKey(Designation, on_delete=models.CASCADE, related_name='staff')
    date_of_joining = models.DateField()
    date_of_leaving = models.DateField(null=True, blank=True)
    employment_type = models.CharField(max_length=15, choices=EMPLOYMENT_TYPE_CHOICES)
    qualification = models.CharField(max_length=100, blank=True)
    experience = models.CharField(max_length=50, blank=True)  # e.g. "5 years"
    photo = models.ImageField(upload_to='staff_photos/', blank=True)
    resume = models.FileField(upload_to='staff_resumes/', blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account = models.CharField(max_length=20, blank=True)
    ifsc_code = models.CharField(max_length=11, blank=True)
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('school', 'employee_id')
        ordering = ['employee_id']

    def __str__(self):
        return f"{self.employee_id} - {self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
```

### Task V5: Create `StaffAttendance` Model
File: `hr/models.py`

```python
class StaffAttendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('half_day', 'Half Day'),
        ('leave', 'Leave'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='staff_attendances')
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    overtime_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('staff', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.staff.employee_id} - {self.date} - {self.status}"

    @property
    def total_hours(self):
        if self.check_in and self.check_out:
            from datetime import datetime
            check_in = datetime.combine(self.date, self.check_in)
            check_out = datetime.combine(self.date, self.check_out)
            diff = check_out - check_in
            return diff.total_seconds() / 3600
        return 0
```

### Task V6: Create `LeaveType` Model
File: `hr/models.py`

```python
class LeaveType(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='leave_types')
    name = models.CharField(max_length=50)  # e.g. "Casual", "Sick", "Earned"
    days_per_year = models.PositiveIntegerField()
    is_carry_forward = models.BooleanField(default=False)
    max_carry_forward = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.days_per_year} days/year)"
```

### Task V7: Create `StaffLeave` Model
File: `hr/models.py`

```python
class StaffLeave(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='staff_leaves')
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='leaves')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE, related_name='leaves')
    start_date = models.DateField()
    end_date = models.DateField()
    total_days = models.DecimalField(max_digits=4, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.staff.employee_id} - {self.leave_type.name} ({self.start_date} to {self.end_date})"

    def save(self, *args, **kwargs):
        if not self.total_days:
            from datetime import date
            delta = self.end_date - self.start_date
            self.total_days = delta.days + 1
        super().save(*args, **kwargs)
```

### Task V8: Create `PayrollMonth` Model
File: `hr/models.py`

```python
class PayrollMonth(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('closed', 'Closed'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='payroll_months')
    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='draft')
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_payrolls')
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'month', 'year')
        ordering = ['-year', '-month']

    def __str__(self):
        from datetime import date
        month_name = date(self.year, self.month, 1).strftime('%B')
        return f"{month_name} {self.year} - {self.status}"
```

### Task V9: Create `SalarySlip` Model
File: `hr/models.py`

```python
class SalarySlip(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='salary_slips')
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='salary_slips')
    payroll_month = models.ForeignKey(PayrollMonth, on_delete=models.CASCADE, related_name='salary_slips')
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
    hra = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    da = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    conveyance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    medical = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gross_salary = models.DecimalField(max_digits=10, decimal_places=2)
    pf = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    esi = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tds = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    professional_tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=15, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_date = models.DateField(null=True, blank=True)
    payment_mode = models.CharField(max_length=15, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('staff', 'payroll_month')
        ordering = ['-payroll_month__year', '-payroll_month__month']

    def __str__(self):
        return f"{self.staff.employee_id} - {self.payroll_month} - ₹{self.net_salary}"

    def save(self, *args, **kwargs):
        # Auto-calculate gross salary
        self.gross_salary = (
            self.basic_salary + self.hra + self.da +
            self.conveyance + self.medical + self.other_allowances
        )
        # Auto-calculate total deductions
        self.total_deductions = (
            self.pf + self.esi + self.tds +
            self.professional_tax + self.other_deductions
        )
        # Auto-calculate net salary
        self.net_salary = self.gross_salary - self.total_deductions
        super().save(*args, **kwargs)
```

### Task V10: Create `SalaryComponent` Model
File: `hr/models.py`

```python
class SalaryComponent(models.Model):
    TYPE_CHOICES = [
        ('earning', 'Earning'),
        ('deduction', 'Deduction'),
    ]

    CALCULATION_CHOICES = [
        ('fixed', 'Fixed'),
        ('percentage', 'Percentage'),
        ('basic_pct', 'Percentage of Basic'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='salary_components')
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    calculation = models.CharField(max_length=15, choices=CALCULATION_CHOICES)
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['type', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
```

### Task V11: Register Models in Admin
File: `hr/admin.py`

Register all models with appropriate admin classes:
- `Department` - list_display: name, school, head, is_active
- `Designation` - list_display: name, level, is_active
- `Staff` - list_display: employee_id, full_name, department, designation, status, is_active
- `StaffAttendance` - list_display: staff, date, status, check_in, check_out, overtime_hours
- `LeaveType` - list_display: name, days_per_year, is_carry_forward, is_active
- `StaffLeave` - list_display: staff, leave_type, start_date, end_date, total_days, status
- `PayrollMonth` - list_display: month, year, status, processed_by, processed_at
- `SalarySlip` - list_display: staff, payroll_month, gross_salary, total_deductions, net_salary, payment_status
- `SalaryComponent` - list_display: name, type, calculation, value, is_active

### Task V12: Run Migrations
```bash
python manage.py makemigrations hr
python manage.py migrate
```

---

## TASKS FOR SUDIPTO (API Endpoints)

### Task S1: Create Serializers
File: `hr/serializers.py`

```python
from rest_framework import serializers
from .models import (
    Department, Designation, Staff, StaffAttendance,
    LeaveType, StaffLeave, PayrollMonth, SalarySlip, SalaryComponent
)


class DepartmentSerializer(serializers.ModelSerializer):
    head_name = serializers.CharField(source='head.full_name', read_only=True, default=None)
    staff_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'school', 'name', 'head', 'head_name', 'description',
                  'is_active', 'staff_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_staff_count(self, obj):
        return obj.staff.filter(is_active=True).count()


class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields = ['id', 'school', 'name', 'level', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class StaffSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    designation_name = serializers.CharField(source='designation.name', read_only=True)

    class Meta:
        model = Staff
        fields = ['id', 'school', 'user', 'employee_id', 'first_name', 'last_name',
                  'full_name', 'date_of_birth', 'gender', 'marital_status', 'blood_group',
                  'phone', 'email', 'address', 'city', 'state', 'pincode',
                  'aadhaar_no', 'pan_no', 'department', 'department_name',
                  'designation', 'designation_name', 'date_of_joining', 'date_of_leaving',
                  'employment_type', 'qualification', 'experience', 'photo', 'resume',
                  'bank_name', 'bank_account', 'ifsc_code', 'basic_salary',
                  'status', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class StaffListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    full_name = serializers.CharField(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    designation_name = serializers.CharField(source='designation.name', read_only=True)

    class Meta:
        model = Staff
        fields = ['id', 'employee_id', 'full_name', 'department', 'department_name',
                  'designation', 'designation_name', 'phone', 'status', 'is_active']


class StaffAttendanceSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True)
    employee_id = serializers.CharField(source='staff.employee_id', read_only=True)
    total_hours = serializers.DecimalField(max_digits=4, decimal_places=2, read_only=True)

    class Meta:
        model = StaffAttendance
        fields = ['id', 'school', 'staff', 'staff_name', 'employee_id', 'date',
                  'check_in', 'check_out', 'status', 'overtime_hours', 'total_hours',
                  'remarks', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ['id', 'school', 'name', 'days_per_year', 'is_carry_forward',
                  'max_carry_forward', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class StaffLeaveSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True)
    employee_id = serializers.CharField(source='staff.employee_id', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.email', read_only=True, default=None)

    class Meta:
        model = StaffLeave
        fields = ['id', 'school', 'staff', 'staff_name', 'employee_id',
                  'leave_type', 'leave_type_name', 'start_date', 'end_date',
                  'total_days', 'reason', 'status', 'approved_by', 'approved_by_name',
                  'remarks', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'total_days']


class PayrollMonthSerializer(serializers.ModelSerializer):
    processed_by_name = serializers.CharField(source='processed_by.email', read_only=True, default=None)
    month_name = serializers.SerializerMethodField()
    total_slips = serializers.SerializerMethodField()
    total_payout = serializers.SerializerMethodField()

    class Meta:
        model = PayrollMonth
        fields = ['id', 'school', 'month', 'year', 'month_name', 'status',
                  'processed_by', 'processed_by_name', 'processed_at',
                  'total_slips', 'total_payout', 'created_at']
        read_only_fields = ['created_at', 'processed_at']

    def get_month_name(self, obj):
        from datetime import date
        return date(obj.year, obj.month, 1).strftime('%B')

    def get_total_slips(self, obj):
        return obj.salary_slips.count()

    def get_total_payout(self, obj):
        from django.db.models import Sum
        total = obj.salary_slips.aggregate(total=Sum('net_salary'))['total']
        return float(total) if total else 0


class SalarySlipSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True)
    employee_id = serializers.CharField(source='staff.employee_id', read_only=True)
    payroll_month_name = serializers.SerializerMethodField()

    class Meta:
        model = SalarySlip
        fields = ['id', 'school', 'staff', 'staff_name', 'employee_id',
                  'payroll_month', 'payroll_month_name', 'basic_salary', 'hra', 'da',
                  'conveyance', 'medical', 'other_allowances', 'gross_salary',
                  'pf', 'esi', 'tds', 'professional_tax', 'other_deductions',
                  'total_deductions', 'net_salary', 'payment_status', 'payment_date',
                  'payment_mode', 'transaction_id', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'gross_salary',
                           'total_deductions', 'net_salary']

    def get_payroll_month_name(self, obj):
        from datetime import date
        return date(obj.payroll_month.year, obj.payroll_month.month, 1).strftime('%B %Y')


class SalaryComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryComponent
        fields = ['id', 'school', 'name', 'type', 'calculation', 'value',
                  'is_active', 'created_at']
        read_only_fields = ['created_at']


class BulkAttendanceSerializer(serializers.Serializer):
    """Serializer for bulk attendance marking."""
    date = serializers.DateField()
    attendance = serializers.ListField(
        child=serializers.DictField(
            child=serializers.Field()
        )
    )
    # Example: [{"staff_id": 1, "status": "present", "check_in": "09:00"}, ...]
```

### Task S2: Create Custom Permissions
File: `hr/permissions.py`

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


class IsHRManager(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role and
                request.user.role.name in ['Super Admin', 'School Admin', 'Principal', 'Vice Principal'])


class IsSchoolMember(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.school is not None
```

### Task S3: Create Department Views
File: `hr/views.py`

```python
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import Department
from .serializers import DepartmentSerializer
from .permissions import IsSchoolMember


class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        return Department.objects.filter(school=self.request.user.school)
```

### Task S4: Create Designation Views
File: `hr/views.py`

```python
from .models import Designation
from .serializers import DesignationSerializer


class DesignationViewSet(viewsets.ModelViewSet):
    serializer_class = DesignationSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        return Designation.objects.filter(school=self.request.user.school)
```

### Task S5: Create Staff Views
File: `hr/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Staff, StaffAttendance, StaffLeave, SalarySlip
from .serializers import (
    StaffSerializer, StaffListSerializer, StaffAttendanceSerializer,
    StaffLeaveSerializer, SalarySlipSerializer
)


class StaffViewSet(viewsets.ModelViewSet):
    serializer_class = StaffSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'department', 'designation', 'status', 'is_active']

    def get_queryset(self):
        queryset = Staff.objects.filter(
            school=self.request.user.school
        ).select_related('department', 'designation')
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(employee_id__icontains=search) |
                Q(phone__icontains=search)
            )
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return StaffListSerializer
        return StaffSerializer

    @action(detail=True, methods=['get'])
    def attendance(self, request, pk=None):
        """Get attendance history for a staff member."""
        staff = self.get_object()
        attendances = StaffAttendance.objects.filter(staff=staff).order_by('-date')[:30]
        serializer = StaffAttendanceSerializer(attendances, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def leaves(self, request, pk=None):
        """Get leave history for a staff member."""
        staff = self.get_object()
        leaves = StaffLeave.objects.filter(staff=staff).order_by('-created_at')
        serializer = StaffLeaveSerializer(leaves, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def salary_history(self, request, pk=None):
        """Get salary history for a staff member."""
        staff = self.get_object()
        slips = SalarySlip.objects.filter(staff=staff).order_by(
            '-payroll_month__year', '-payroll_month__month'
        )
        serializer = SalarySlipSerializer(slips, many=True)
        return Response(serializer.data)
```

### Task S6: Create StaffAttendance Views
File: `hr/views.py`

```python
from django.utils import timezone
from .models import StaffAttendance


class StaffAttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = StaffAttendanceSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'staff', 'date', 'status']

    def get_queryset(self):
        return StaffAttendance.objects.filter(
            school=self.request.user.school
        ).select_related('staff')

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        """Bulk mark attendance for multiple staff."""
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        attendance_data = data['attendance']
        date = data['date']

        created = []
        for item in attendance_data:
            staff_id = item.get('staff_id')
            staff_status = item.get('status')
            check_in = item.get('check_in')
            check_out = item.get('check_out')
            overtime = item.get('overtime_hours', 0)
            remarks = item.get('remarks', '')

            obj, was_created = StaffAttendance.objects.update_or_create(
                staff_id=staff_id,
                date=date,
                defaults={
                    'school': request.user.school,
                    'status': staff_status,
                    'check_in': check_in,
                    'check_out': check_out,
                    'overtime_hours': overtime,
                    'remarks': remarks
                }
            )
            if was_created:
                created.append(obj.id)

        return Response({
            'created_count': len(created),
            'created_ids': created
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's attendance."""
        today = timezone.now().date()
        attendances = self.get_queryset().filter(date=today)
        serializer = self.get_serializer(attendances, many=True)
        return Response(serializer.data)
```

### Task S7: Create LeaveType Views
File: `hr/views.py`

```python
from .models import LeaveType
from .serializers import LeaveTypeSerializer


class LeaveTypeViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        return LeaveType.objects.filter(school=self.request.user.school)
```

### Task S8: Create StaffLeave Views
File: `hr/views.py`

```python
from .models import StaffLeave, LeaveType


class StaffLeaveViewSet(viewsets.ModelViewSet):
    serializer_class = StaffLeaveSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'staff', 'leave_type', 'status']

    def get_queryset(self):
        return StaffLeave.objects.filter(
            school=self.request.user.school
        ).select_related('staff', 'leave_type', 'approved_by')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a leave application."""
        leave = self.get_object()
        if leave.status != 'pending':
            return Response(
                {'error': 'Only pending leaves can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave.status = 'approved'
        leave.approved_by = request.user
        leave.remarks = request.data.get('remarks', '')
        leave.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a leave application."""
        leave = self.get_object()
        if leave.status != 'pending':
            return Response(
                {'error': 'Only pending leaves can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave.status = 'rejected'
        leave.approved_by = request.user
        leave.remarks = request.data.get('remarks', '')
        leave.save()
        return Response({'status': 'rejected'})

    @action(detail=False, methods=['get'], url_path='balance/(?P<staff_id>[^/.]+)')
    def balance(self, request, staff_id=None):
        """Get leave balance for a staff member."""
        from django.db.models import Sum
        from datetime import date

        current_year = date.today().year
        leave_types = LeaveType.objects.filter(
            school=request.user.school,
            is_active=True
        )

        balance = []
        for lt in leave_types:
            taken = StaffLeave.objects.filter(
                staff_id=staff_id,
                leave_type=lt,
                status='approved',
                start_date__year=current_year
            ).aggregate(total=Sum('total_days'))['total'] or 0

            balance.append({
                'leave_type_id': lt.id,
                'leave_type_name': lt.name,
                'total_allowed': lt.days_per_year,
                'taken': float(taken),
                'remaining': float(lt.days_per_year - taken)
            })

        return Response(balance)
```

### Task S9: Create PayrollMonth Views
File: `hr/views.py`

```python
from .models import PayrollMonth
from .serializers import PayrollMonthSerializer


class PayrollMonthViewSet(viewsets.ModelViewSet):
    serializer_class = PayrollMonthSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'month', 'year', 'status']

    def get_queryset(self):
        return PayrollMonth.objects.filter(
            school=self.request.user.school
        ).select_related('processed_by')

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Process payroll for a month."""
        payroll = self.get_object()
        if payroll.status not in ['draft', 'processing']:
            return Response(
                {'error': 'Only draft or processing payrolls can be processed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payroll.status = 'processing'
        payroll.processed_by = request.user
        from django.utils import timezone
        payroll.processed_at = timezone.now()
        payroll.save()
        return Response({'status': 'processing'})

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close payroll for a month."""
        payroll = self.get_object()
        if payroll.status != 'paid':
            return Response(
                {'error': 'Only paid payrolls can be closed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payroll.status = 'closed'
        payroll.save()
        return Response({'status': 'closed'})
```

### Task S10: Create SalarySlip Views
File: `hr/views.py`

```python
from .models import SalarySlip
from .serializers import SalarySlipSerializer


class SalarySlipViewSet(viewsets.ModelViewSet):
    serializer_class = SalarySlipSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'staff', 'payroll_month', 'payment_status']

    def get_queryset(self):
        return SalarySlip.objects.filter(
            school=self.request.user.school
        ).select_related('staff', 'payroll_month')

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate salary slips for all active staff in a payroll month."""
        payroll_month_id = request.data.get('payroll_month')
        if not payroll_month_id:
            return Response(
                {'error': 'payroll_month is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payroll_month = PayrollMonth.objects.get(
                id=payroll_month_id,
                school=request.user.school
            )
        except PayrollMonth.DoesNotExist:
            return Response(
                {'error': 'Payroll month not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        from .models import Staff, SalaryComponent
        active_staff = Staff.objects.filter(
            school=request.user.school,
            is_active=True,
            status='active'
        )

        created = []
        for staff in active_staff:
            slip, was_created = SalarySlip.objects.get_or_create(
                staff=staff,
                payroll_month=payroll_month,
                defaults={
                    'school': request.user.school,
                    'basic_salary': staff.basic_salary,
                    'hra': 0,
                    'da': 0,
                    'conveyance': 0,
                    'medical': 0,
                    'other_allowances': 0,
                    'gross_salary': staff.basic_salary,
                    'pf': 0,
                    'esi': 0,
                    'tds': 0,
                    'professional_tax': 0,
                    'other_deductions': 0,
                    'total_deductions': 0,
                    'net_salary': staff.basic_salary
                }
            )
            if was_created:
                created.append(slip.id)

        return Response({
            'created_count': len(created),
            'created_ids': created
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='by-staff/(?P<staff_id>[^/.]+)')
    def by_staff(self, request, staff_id=None):
        """Get salary history for a specific staff member."""
        slips = self.get_queryset().filter(staff_id=staff_id)
        serializer = self.get_serializer(slips, many=True)
        return Response(serializer.data)
```

### Task S11: Create SalaryComponent Views
File: `hr/views.py`

```python
from .models import SalaryComponent
from .serializers import SalaryComponentSerializer


class SalaryComponentViewSet(viewsets.ModelViewSet):
    serializer_class = SalaryComponentSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'type', 'is_active']

    def get_queryset(self):
        return SalaryComponent.objects.filter(school=self.request.user.school)
```

### Task S12: Create Report Views
File: `hr/views.py`

```python
from rest_framework.views import APIView
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import date, timedelta
from .models import Staff, StaffAttendance, StaffLeave, SalarySlip, PayrollMonth


class StaffListReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        department_id = request.query_params.get('department')
        status = request.query_params.get('status', 'active')

        staff = Staff.objects.filter(school=school, is_active=True)
        if department_id:
            staff = staff.filter(department_id=department_id)
        if status:
            staff = staff.filter(status=status)

        report = staff.values(
            'department__name', 'designation__name'
        ).annotate(
            count=Count('id')
        ).order_by('department__name')

        total = staff.count()
        total_salary = staff.aggregate(total=Sum('basic_salary'))['total'] or 0

        return Response({
            'total_staff': total,
            'total_monthly_salary': float(total_salary),
            'by_department_designation': list(report)
        })


class PayrollSummaryReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)

        payroll = PayrollMonth.objects.filter(
            school=school, month=month, year=year
        ).first()

        if not payroll:
            return Response({'error': 'No payroll found for this period'}, status=404)

        slips = SalarySlip.objects.filter(payroll_month=payroll)
        summary = slips.aggregate(
            total_gross=Sum('gross_salary'),
            total_deductions=Sum('total_deductions'),
            total_net=Sum('net_salary'),
            total_pf=Sum('pf'),
            total_esi=Sum('esi'),
            total_tds=Sum('tds')
        )

        return Response({
            'month': month,
            'year': year,
            'status': payroll.status,
            'total_staff': slips.count(),
            'summary': {k: float(v) if v else 0 for k, v in summary.items()}
        })


class AttendanceSummaryReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))

        from django.db.models import Count, Case, When, IntegerField
        from calendar import monthrange

        _, days_in_month = monthrange(year, month)
        start_date = date(year, month, 1)
        end_date = date(year, month, days_in_month)

        attendances = StaffAttendance.objects.filter(
            school=school,
            date__range=[start_date, end_date]
        )

        summary = attendances.aggregate(
            total_records=Count('id'),
            present=Count('id', filter=Q(status='present')),
            absent=Count('id', filter=Q(status='absent')),
            late=Count('id', filter=Q(status='late')),
            half_day=Count('id', filter=Q(status='half_day')),
            leave=Count('id', filter=Q(status='leave'))
        )

        return Response({
            'month': month,
            'year': year,
            'days_in_month': days_in_month,
            'summary': summary
        })


class LeaveSummaryReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        year = int(request.query_params.get('year', timezone.now().year))

        leaves = StaffLeave.objects.filter(
            school=school,
            start_date__year=year
        )

        summary = leaves.values(
            'leave_type__name'
        ).annotate(
            total_applications=Count('id'),
            approved=Count('id', filter=Q(status='approved')),
            rejected=Count('id', filter=Q(status='rejected')),
            pending=Count('id', filter=Q(status='pending')),
            total_days=Sum('total_days')
        ).order_by('leave_type__name')

        return Response({
            'year': year,
            'summary': list(summary)
        })


class PFReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)

        payroll = PayrollMonth.objects.filter(
            school=school, month=month, year=year
        ).first()

        if not payroll:
            return Response({'error': 'No payroll found'}, status=404)

        slips = SalarySlip.objects.filter(payroll_month=payroll)
        total_pf = slips.aggregate(total=Sum('pf'))['total'] or 0

        return Response({
            'month': month,
            'year': year,
            'total_pf_contribution': float(total_pf),
            'employee_share': float(total_pf / 2),
            'employer_share': float(total_pf / 2)
        })


class ESIReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)

        payroll = PayrollMonth.objects.filter(
            school=school, month=month, year=year
        ).first()

        if not payroll:
            return Response({'error': 'No payroll found'}, status=404)

        slips = SalarySlip.objects.filter(payroll_month=payroll)
        total_esi = slips.aggregate(total=Sum('esi'))['total'] or 0

        return Response({
            'month': month,
            'year': year,
            'total_esi_contribution': float(total_esi),
            'employee_share': float(total_esi * 0.75),
            'employer_share': float(total_esi * 0.25)
        })
```

### Task S13: Create URL Patterns
File: `hr/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'departments', views.DepartmentViewSet)
router.register(r'designations', views.DesignationViewSet)
router.register(r'staff', views.StaffViewSet)
router.register(r'staff-attendances', views.StaffAttendanceViewSet)
router.register(r'leave-types', views.LeaveTypeViewSet)
router.register(r'staff-leaves', views.StaffLeaveViewSet)
router.register(r'payroll-months', views.PayrollMonthViewSet)
router.register(r'salary-slips', views.SalarySlipViewSet)
router.register(r'salary-components', views.SalaryComponentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('hr/reports/staff-list/', views.StaffListReportView.as_view(), name='hr-staff-list-report'),
    path('hr/reports/payroll-summary/', views.PayrollSummaryReportView.as_view(), name='hr-payroll-summary-report'),
    path('hr/reports/attendance-summary/', views.AttendanceSummaryReportView.as_view(), name='hr-attendance-summary-report'),
    path('hr/reports/leave-summary/', views.LeaveSummaryReportView.as_view(), name='hr-leave-summary-report'),
    path('hr/reports/pf-report/', views.PFReportView.as_view(), name='hr-pf-report'),
    path('hr/reports/esi-report/', views.ESIReportView.as_view(), name='hr-esi-report'),
]
```

### Task S14: Wire URLs in `config/urls.py`
Add to root `urls.py`:
```python
path('api/', include('hr.urls')),
```

### Task S15: Test All Endpoints
Create test data and verify:
1. CRUD for Department
2. CRUD for Designation
3. CRUD for Staff
4. Search staff by name/ID/phone
5. Get staff attendance history
6. Get staff leave history
7. Get staff salary history
8. Bulk mark staff attendance
9. Get today's attendance
10. CRUD for LeaveType
11. CRUD for StaffLeave
12. Approve/reject leave
13. Get leave balance
14. CRUD for PayrollMonth
15. Process payroll
16. Close payroll
17. CRUD for SalarySlip
18. Generate salary slips
19. Get salary slips by staff
20. CRUD for SalaryComponent
21. Staff list report
22. Payroll summary report
23. Attendance summary report
24. Leave summary report
25. PF report
26. ESI report

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Departments** | | |
| GET | `/api/departments/` | List departments |
| POST | `/api/departments/` | Create department |
| GET | `/api/departments/{id}/` | Department detail |
| PUT | `/api/departments/{id}/` | Update department |
| DELETE | `/api/departments/{id}/` | Delete department |
| **Designations** | | |
| GET | `/api/designations/` | List designations |
| POST | `/api/designations/` | Create designation |
| GET | `/api/designations/{id}/` | Designation detail |
| PUT | `/api/designations/{id}/` | Update designation |
| DELETE | `/api/designations/{id}/` | Delete designation |
| **Staff** | | |
| GET | `/api/staff/` | List staff (search available) |
| POST | `/api/staff/` | Add staff member |
| GET | `/api/staff/{id}/` | Staff detail |
| PUT | `/api/staff/{id}/` | Update staff |
| DELETE | `/api/staff/{id}/` | Soft delete staff |
| GET | `/api/staff/{id}/attendance/` | Staff attendance history |
| GET | `/api/staff/{id}/leaves/` | Staff leave history |
| GET | `/api/staff/{id}/salary-history/` | Staff salary history |
| **Staff Attendance** | | |
| GET | `/api/staff-attendances/` | List attendances |
| POST | `/api/staff-attendances/` | Mark attendance |
| GET | `/api/staff-attendances/{id}/` | Attendance detail |
| PUT | `/api/staff-attendances/{id}/` | Update attendance |
| POST | `/api/staff-attendances/bulk-mark/` | Bulk mark attendance |
| GET | `/api/staff-attendances/today/` | Today's attendance |
| **Leave Types** | | |
| GET | `/api/leave-types/` | List leave types |
| POST | `/api/leave-types/` | Create leave type |
| GET | `/api/leave-types/{id}/` | Leave type detail |
| PUT | `/api/leave-types/{id}/` | Update leave type |
| DELETE | `/api/leave-types/{id}/` | Delete leave type |
| **Staff Leaves** | | |
| GET | `/api/staff-leaves/` | List leave applications |
| POST | `/api/staff-leaves/` | Apply for leave |
| GET | `/api/staff-leaves/{id}/` | Leave detail |
| PUT | `/api/staff-leaves/{id}/` | Update leave |
| POST | `/api/staff-leaves/{id}/approve/` | Approve leave |
| POST | `/api/staff-leaves/{id}/reject/` | Reject leave |
| GET | `/api/staff-leaves/balance/{staff_id}/` | Leave balance |
| **Payroll Months** | | |
| GET | `/api/payroll-months/` | List payroll months |
| POST | `/api/payroll-months/` | Create payroll month |
| GET | `/api/payroll-months/{id}/` | Payroll detail |
| PUT | `/api/payroll-months/{id}/` | Update payroll |
| POST | `/api/payroll-months/{id}/process/` | Process payroll |
| POST | `/api/payroll-months/{id}/close/` | Close payroll |
| **Salary Slips** | | |
| GET | `/api/salary-slips/` | List salary slips |
| POST | `/api/salary-slips/` | Create salary slip |
| GET | `/api/salary-slips/{id}/` | Slip detail |
| PUT | `/api/salary-slips/{id}/` | Update slip |
| POST | `/api/salary-slips/generate/` | Generate slips for month |
| GET | `/api/salary-slips/by-staff/{staff_id}/` | Staff salary history |
| **Salary Components** | | |
| GET | `/api/salary-components/` | List components |
| POST | `/api/salary-components/` | Create component |
| GET | `/api/salary-components/{id}/` | Component detail |
| PUT | `/api/salary-components/{id}/` | Update component |
| DELETE | `/api/salary-components/{id}/` | Delete component |
| **Reports** | | |
| GET | `/api/hr/reports/staff-list/` | Staff list report |
| GET | `/api/hr/reports/payroll-summary/` | Payroll summary |
| GET | `/api/hr/reports/attendance-summary/` | Attendance summary |
| GET | `/api/hr/reports/leave-summary/` | Leave summary |
| GET | `/api/hr/reports/pf-report/` | PF report |
| GET | `/api/hr/reports/esi-report/` | ESI report |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| djangorestframework | 3.17.1 | Already installed |
| django-filter | Latest | For query parameter filtering |
| Django | 6.0.5 | Already installed |
| Pillow | Latest | For ImageField (Staff photo) |

---

## Notes

- `accounts.User` model is used for User (already exists)
- `schools.School` model is used for School (already exists)
- Staff `employee_id` format: `EMP-YYYY-NNNN` (e.g., EMP-2025-0001)
- Salary slip auto-calculates gross_salary, total_deductions, and net_salary on save
- StaffAttendance has `total_hours` property for calculating work hours
- StaffLeave auto-calculates `total_days` from start_date and end_date
- PayrollMonth status flow: draft → processing → paid → closed
- Salary slips are generated in bulk for all active staff
- Attendance can be marked individually or in bulk
- Leave balance is calculated based on approved leaves in current year
- PF and ESI reports show employer/employee share breakdown
- Department head is a self-referencing FK to Staff model
