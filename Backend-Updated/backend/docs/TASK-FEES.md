# Task: Fee Collection & Payments Module (Module 2)

> **Assigned To:** Sudipto (API Endpoints) | Varun (Database/Models)
> **Reference:** `docs/ERP-MODULE-PLAN.md` Section 5
> **Tech Stack:** Django 6 + DRF + PostgreSQL

---

## Current State

- `students` app has `Fees` model (fee structure) but no payment collection
- `students` app has `StudentFeeInstallmentPaid` model (basic installment tracking)
- `students` app has `OtherFees` and `HostelOtherFees` models
- No dedicated `fees` app exists
- No fee categories, fee heads, or payment recording system
- No receipt generation
- No fine management
- No due reminder system

---

## TASKS FOR VARUN (Database / Models)

### Task V1: Create `fees` Django App
- Run `python manage.py startapp fees`
- Add `'fees'` to `INSTALLED_APPS` in `config/settings.py`

### Task V2: Create `FeeCategory` Model
File: `fees/models.py`

```python
from django.db import models
from schools.models import School


class FeeCategory(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='fee_categories')
    name = models.CharField(max_length=100)  # e.g. "Tuition", "Bus", "Hostel"
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.school.name} - {self.name}"
```

### Task V3: Create `FeeHead` Model
File: `fees/models.py`

```python
class FeeHead(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='fee_heads')
    category = models.ForeignKey(FeeCategory, on_delete=models.CASCADE, related_name='fee_heads')
    name = models.CharField(max_length=100)  # e.g. "Tuition Fee", "Lab Fee"
    description = models.TextField(blank=True)
    is_recurring = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.category.name} - {self.name}"
```

### Task V4: Create `FeeStructure` Model
File: `fees/models.py`

```python
from students.models import AcademicClass
from schools.models import AcademicYear


class FeeStructure(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='fee_structures')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='fee_structures')
    class_obj = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name='fee_structures')
    fee_head = models.ForeignKey(FeeHead, on_delete=models.CASCADE, related_name='fee_structures')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField(null=True, blank=True)
    late_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    late_fee_per_day = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    installment_allowed = models.BooleanField(default=False)
    max_installments = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('school', 'academic_year', 'class_obj', 'fee_head')
        ordering = ['class_obj', 'fee_head']

    def __str__(self):
        return f"{self.class_obj.name} - {self.fee_head.name} - ₹{self.amount}"
```

### Task V5: Create `StudentFeeAssignment` Model
File: `fees/models.py`

```python
from students.models import Admission


class StudentFeeAssignment(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='student_fee_assignments')
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name='fee_assignments')
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE, related_name='assignments')
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_reason = models.TextField(blank=True)
    override_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'fee_structure')
        ordering = ['student', 'fee_structure']

    def __str__(self):
        return f"{self.student.student_name} - {self.fee_structure.fee_head.name}"

    @property
    def final_amount(self):
        if self.override_amount is not None:
            return self.override_amount
        return self.fee_structure.amount - self.discount
```

### Task V6: Create `FeePayment` Model
File: `fees/models.py`

```python
from accounts.models import User


class FeePayment(models.Model):
    PAYMENT_MODE_CHOICES = [
        ('cash', 'Cash'),
        ('online', 'Online'),
        ('card', 'Card'),
        ('cheque', 'Cheque'),
        ('upi', 'UPI'),
        ('neft', 'NEFT'),
        ('rtgs', 'RTGS'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='fee_payments')
    receipt_no = models.CharField(max_length=20, unique=True)  # e.g. "REC-2025-000001"
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name='fee_payments')
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE, related_name='payments')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODE_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True)
    cheque_no = models.CharField(max_length=20, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    remarks = models.TextField(blank=True)
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='collected_payments')
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_payments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.receipt_no} - {self.student.student_name} - ₹{self.amount_paid}"

    def save(self, *args, **kwargs):
        if not self.receipt_no:
            self.receipt_no = self.generate_receipt_no()
        super().save(*args, **kwargs)

    def generate_receipt_no(self):
        from django.utils import timezone
        year = timezone.now().year
        last_payment = FeePayment.objects.filter(
            school=self.school,
            receipt_no__startswith=f"REC-{year}-"
        ).order_by('-receipt_no').first()

        if last_payment:
            last_num = int(last_payment.receipt_no.split('-')[-1])
            new_num = last_num + 1
        else:
            new_num = 1

        return f"REC-{year}-{new_num:06d}"
```

### Task V7: Create `FeeReceipt` Model
File: `fees/models.py`

```python
class FeeReceipt(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='fee_receipts')
    receipt_no = models.CharField(max_length=20, unique=True)
    payment = models.OneToOneField(FeePayment, on_delete=models.CASCADE, related_name='receipt')
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='generated_receipts')
    pdf_file = models.FileField(upload_to='receipts/', blank=True)
    sent_via_email = models.BooleanField(default=False)
    sent_via_sms = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Receipt {self.receipt_no} for {self.payment.receipt_no}"
```

### Task V8: Create `Fine` Model
File: `fees/models.py`

```python
class Fine(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='fines')
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name='fines')
    fee_payment = models.ForeignKey(FeePayment, on_delete=models.SET_NULL, null=True, blank=True, related_name='fines')
    reason = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    fine_date = models.DateField()
    is_waived = models.BooleanField(default=False)
    waived_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='waived_fines')
    waived_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fine_date']

    def __str__(self):
        return f"{self.student.student_name} - {self.reason} - ₹{self.amount}"
```

### Task V9: Create `FeeDueReminder` Model
File: `fees/models.py`

```python
class FeeDueReminder(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='fee_due_reminders')
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name='fee_reminders')
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE, related_name='reminders')
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    reminder_sent = models.BooleanField(default=False)
    reminder_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        return f"{self.student.student_name} - Due: ₹{self.amount_due} by {self.due_date}"
```

### Task V10: Create Helper Function for Outstanding Dues
File: `fees/models.py`

Add this utility function at the bottom:

```python
def calculate_student_dues(student, academic_year=None):
    """Calculate total outstanding dues for a student."""
    assignments = StudentFeeAssignment.objects.filter(
        student=student,
        is_active=True,
        fee_structure__academic_year=academic_year or student.class_obj.academic_year,
        fee_structure__is_active=True
    )

    total_assigned = sum(a.final_amount for a in assignments)
    total_paid = FeePayment.objects.filter(
        student=student,
        fee_structure__academic_year=academic_year or student.class_obj.academic_year
    ).aggregate(total=models.Sum('amount_paid'))['total'] or 0

    total_fines = Fine.objects.filter(
        student=student,
        is_waived=False,
        fine_date__year=timezone.now().year
    ).aggregate(total=models.Sum('amount'))['total'] or 0

    return {
        'total_assigned': total_assigned,
        'total_paid': total_paid,
        'total_fines': total_fines,
        'outstanding': total_assigned - total_paid + total_fines
    }
```

### Task V11: Register Models in Admin
File: `fees/admin.py`

Register all models with appropriate admin classes:
- `FeeCategory` - list_display: name, school, is_active
- `FeeHead` - list_display: name, category, is_recurring, is_active
- `FeeStructure` - list_display: class_obj, fee_head, amount, academic_year
- `StudentFeeAssignment` - list_display: student, fee_structure, discount, final_amount
- `FeePayment` - list_display: receipt_no, student, amount_paid, payment_date, payment_mode, is_verified
- `FeeReceipt` - list_display: receipt_no, payment, generated_by, created_at
- `Fine` - list_display: student, reason, amount, fine_date, is_waived
- `FeeDueReminder` - list_display: student, amount_due, due_date, reminder_sent

### Task V12: Run Migrations
```bash
python manage.py makemigrations fees
python manage.py migrate
```

---

## TASKS FOR SUDIPTO (API Endpoints)

### Task S1: Create Serializers
File: `fees/serializers.py`

Create these serializers:

```python
from rest_framework import serializers
from .models import (
    FeeCategory, FeeHead, FeeStructure, StudentFeeAssignment,
    FeePayment, FeeReceipt, Fine, FeeDueReminder
)


class FeeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeCategory
        fields = ['id', 'school', 'name', 'description', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class FeeHeadSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = FeeHead
        fields = ['id', 'school', 'category', 'category_name', 'name', 'description',
                  'is_recurring', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class FeeStructureSerializer(serializers.ModelSerializer):
    fee_head_name = serializers.CharField(source='fee_head.name', read_only=True)
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.year', read_only=True)

    class Meta:
        model = FeeStructure
        fields = ['id', 'school', 'academic_year', 'academic_year_name', 'class_obj',
                  'class_name', 'fee_head', 'fee_head_name', 'amount', 'due_date',
                  'late_fee', 'late_fee_per_day', 'installment_allowed', 'max_installments',
                  'is_active', 'created_at']
        read_only_fields = ['created_at']


class StudentFeeAssignmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.student_name', read_only=True)
    fee_head_name = serializers.CharField(source='fee_structure.fee_head.name', read_only=True)
    final_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = StudentFeeAssignment
        fields = ['id', 'school', 'student', 'student_name', 'fee_structure',
                  'fee_head_name', 'discount', 'discount_reason', 'override_amount',
                  'final_amount', 'is_active', 'created_at']
        read_only_fields = ['created_at', 'final_amount']


class FeePaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.student_name', read_only=True)
    receipt_no = serializers.CharField(read_only=True)
    received_by_name = serializers.CharField(source='received_by.email', read_only=True)

    class Meta:
        model = FeePayment
        fields = ['id', 'school', 'receipt_no', 'student', 'student_name', 'fee_structure',
                  'amount_paid', 'payment_date', 'payment_mode', 'transaction_id',
                  'cheque_no', 'bank_name', 'remarks', 'received_by', 'received_by_name',
                  'is_verified', 'verified_by', 'created_at', 'updated_at']
        read_only_fields = ['receipt_no', 'created_at', 'updated_at']


class FeeReceiptSerializer(serializers.ModelSerializer):
    payment_receipt_no = serializers.CharField(source='payment.receipt_no', read_only=True)
    student_name = serializers.CharField(source='payment.student.student_name', read_only=True)
    amount_paid = serializers.DecimalField(source='payment.amount_paid', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = FeeReceipt
        fields = ['id', 'school', 'receipt_no', 'payment', 'payment_receipt_no',
                  'student_name', 'amount_paid', 'generated_by', 'pdf_file',
                  'sent_via_email', 'sent_via_sms', 'created_at']
        read_only_fields = ['created_at']


class FineSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.student_name', read_only=True)
    waived_by_name = serializers.CharField(source='waived_by.email', read_only=True, default=None)

    class Meta:
        model = Fine
        fields = ['id', 'school', 'student', 'student_name', 'fee_payment', 'reason',
                  'amount', 'fine_date', 'is_waived', 'waived_by', 'waived_by_name',
                  'waived_reason', 'created_at']
        read_only_fields = ['created_at']


class FeeDueReminderSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.student_name', read_only=True)

    class Meta:
        model = FeeDueReminder
        fields = ['id', 'school', 'student', 'student_name', 'fee_structure',
                  'amount_due', 'due_date', 'reminder_sent', 'reminder_date', 'created_at']
        read_only_fields = ['created_at']
```

### Task S2: Create Custom Permissions
File: `fees/permissions.py`

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


class IsAccountant(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role and
                request.user.role.name in ['School Admin', 'Accountant'])


class IsSchoolMember(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.school is not None
```

### Task S3: Create Fee Category Views
File: `fees/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import FeeCategory
from .serializers import FeeCategorySerializer
from .permissions import IsSchoolMember


class FeeCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = FeeCategorySerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        return FeeCategory.objects.filter(school=self.request.user.school)
```

### Task S4: Create Fee Head Views
File: `fees/views.py`

```python
from .models import FeeHead
from .serializers import FeeHeadSerializer


class FeeHeadViewSet(viewsets.ModelViewSet):
    serializer_class = FeeHeadSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'category', 'is_active']

    def get_queryset(self):
        return FeeHead.objects.filter(school=self.request.user.school)
```

### Task S5: Create Fee Structure Views
File: `fees/views.py`

```python
from .models import FeeStructure
from .serializers import FeeStructureSerializer


class FeeStructureViewSet(viewsets.ModelViewSet):
    serializer_class = FeeStructureSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'academic_year', 'class_obj', 'is_active']

    def get_queryset(self):
        return FeeStructure.objects.filter(school=self.request.user.school)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create fee structures for all classes."""
        academic_year_id = request.data.get('academic_year')
        fee_head_id = request.data.get('fee_head')
        amount = request.data.get('amount')
        class_ids = request.data.get('class_ids', [])

        if not all([academic_year_id, fee_head_id, amount, class_ids]):
            return Response(
                {'error': 'academic_year, fee_head, amount, and class_ids are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        created = []
        for class_id in class_ids:
            obj, was_created = FeeStructure.objects.get_or_create(
                school=request.user.school,
                academic_year_id=academic_year_id,
                class_obj_id=class_id,
                fee_head_id=fee_head_id,
                defaults={'amount': amount}
            )
            if was_created:
                created.append(obj.id)

        return Response({
            'created_count': len(created),
            'created_ids': created
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='by-class/(?P<class_id>[^/.]+)')
    def by_class(self, request, class_id=None):
        """Get fee structure for a specific class."""
        structures = self.get_queryset().filter(class_obj_id=class_id)
        serializer = self.get_serializer(structures, many=True)
        return Response(serializer.data)
```

### Task S6: Create Student Fee Assignment Views
File: `fees/views.py`

```python
from .models import StudentFeeAssignment
from .serializers import StudentFeeAssignmentSerializer


class StudentFeeAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentFeeAssignmentSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'student', 'fee_structure', 'is_active']

    def get_queryset(self):
        return StudentFeeAssignment.objects.filter(
            school=self.request.user.school
        ).select_related('student', 'fee_structure', 'fee_structure__fee_head')

    @action(detail=False, methods=['post'])
    def bulk_assign(self, request):
        """Bulk assign fees to all students in a class."""
        class_id = request.data.get('class_id')
        fee_structure_id = request.data.get('fee_structure_id')

        if not all([class_id, fee_structure_id]):
            return Response(
                {'error': 'class_id and fee_structure_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from students.models import Admission
        students = Admission.objects.filter(class_id=class_id, is_active=True)
        fee_structure = FeeStructure.objects.get(id=fee_structure_id)

        created = []
        for student in students:
            obj, was_created = StudentFeeAssignment.objects.get_or_create(
                student=student,
                fee_structure=fee_structure,
                defaults={
                    'school': request.user.school,
                    'override_amount': fee_structure.amount
                }
            )
            if was_created:
                created.append(obj.id)

        return Response({
            'created_count': len(created),
            'created_ids': created
        }, status=status.HTTP_201_CREATED)
```

### Task S7: Create Fee Payment Views
File: `fees/views.py`

```python
from django.db import models as db_models
from django.utils import timezone
from .models import FeePayment
from .serializers import FeePaymentSerializer


class FeePaymentViewSet(viewsets.ModelViewSet):
    serializer_class = FeePaymentSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'student', 'fee_structure', 'payment_mode', 'is_verified']

    def get_queryset(self):
        return FeePayment.objects.filter(
            school=self.request.user.school
        ).select_related('student', 'fee_structure', 'received_by', 'verified_by')

    def perform_create(self, serializer):
        serializer.save(received_by=self.request.user)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a payment."""
        payment = self.get_object()
        payment.is_verified = True
        payment.verified_by = request.user
        payment.save()
        return Response({'status': 'verified'})

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get payment history for a specific student."""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {'error': 'student_id query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        payments = self.get_queryset().filter(student_id=student_id)
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending dues."""
        from .models import StudentFeeAssignment

        assignments = StudentFeeAssignment.objects.filter(
            school=request.user.school,
            is_active=True
        ).select_related('student', 'fee_structure')

        pending_dues = []
        for assignment in assignments:
            total_paid = FeePayment.objects.filter(
                student=assignment.student,
                fee_structure=assignment.fee_structure
            ).aggregate(total=db_models.Sum('amount_paid'))['total'] or 0

            outstanding = assignment.final_amount - total_paid
            if outstanding > 0:
                pending_dues.append({
                    'student_id': str(assignment.student.id),
                    'student_name': assignment.student.student_name,
                    'fee_structure_id': assignment.fee_structure.id,
                    'fee_head': assignment.fee_structure.fee_head.name,
                    'total_amount': float(assignment.final_amount),
                    'total_paid': float(total_paid),
                    'outstanding': float(outstanding)
                })

        return Response(pending_dues)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's collections."""
        today = timezone.now().date()
        payments = self.get_queryset().filter(payment_date=today)
        serializer = self.get_serializer(payments, many=True)

        total = payments.aggregate(total=db_models.Sum('amount_paid'))['total'] or 0

        return Response({
            'date': today,
            'total_collected': float(total),
            'payments': serializer.data
        })
```

### Task S8: Create Fee Receipt Views
File: `fees/views.py`

```python
from .models import FeeReceipt
from .serializers import FeeReceiptSerializer


class FeeReceiptViewSet(viewsets.ModelViewSet):
    serializer_class = FeeReceiptSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'payment']

    def get_queryset(self):
        return FeeReceipt.objects.filter(
            school=self.request.user.school
        ).select_related('payment', 'payment__student', 'generated_by')

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download receipt PDF."""
        receipt = self.get_object()
        if receipt.pdf_file:
            return Response({'pdf_url': receipt.pdf_file.url})
        return Response(
            {'error': 'PDF not generated yet'},
            status=status.HTTP_404_NOT_FOUND
        )

    @action(detail=True, methods=['post'])
    def resend(self, request, pk=None):
        """Resend receipt via email/SMS."""
        receipt = self.get_object()
        via = request.data.get('via', 'email')

        if via == 'email':
            # TODO: Implement email sending
            receipt.sent_via_email = True
        elif via == 'sms':
            # TODO: Implement SMS sending
            receipt.sent_via_sms = True

        receipt.save()
        return Response({'status': f'sent via {via}'})
```

### Task S9: Create Fine Views
File: `fees/views.py`

```python
from .models import Fine
from .serializers import FineSerializer


class FineViewSet(viewsets.ModelViewSet):
    serializer_class = FineSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'student', 'is_waived']

    def get_queryset(self):
        return Fine.objects.filter(
            school=self.request.user.school
        ).select_related('student', 'fee_payment', 'waived_by')

    @action(detail=True, methods=['post'])
    def waive(self, request, pk=None):
        """Waive a fine."""
        fine = self.get_object()
        fine.is_waived = True
        fine.waived_by = request.user
        fine.waived_reason = request.data.get('reason', '')
        fine.save()
        return Response({'status': 'waived'})
```

### Task S10: Create Due Reminder Views
File: `fees/views.py`

```python
from .models import FeeDueReminder
from .serializers import FeeDueReminderSerializer


class FeeDueReminderViewSet(viewsets.ModelViewSet):
    serializer_class = FeeDueReminderSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'student', 'reminder_sent']

    def get_queryset(self):
        return FeeDueReminder.objects.filter(
            school=self.request.user.school
        ).select_related('student', 'fee_structure')

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate all due reminders."""
        from .models import StudentFeeAssignment

        academic_year_id = request.data.get('academic_year')
        if not academic_year_id:
            return Response(
                {'error': 'academic_year is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        assignments = StudentFeeAssignment.objects.filter(
            school=request.user.school,
            fee_structure__academic_year_id=academic_year_id,
            is_active=True
        )

        created_count = 0
        for assignment in assignments:
            total_paid = FeePayment.objects.filter(
                student=assignment.student,
                fee_structure=assignment.fee_structure
            ).aggregate(total=db_models.Sum('amount_paid'))['total'] or 0

            outstanding = assignment.final_amount - total_paid
            if outstanding > 0:
                FeeDueReminder.objects.get_or_create(
                    student=assignment.student,
                    fee_structure=assignment.fee_structure,
                    defaults={
                        'school': request.user.school,
                        'amount_due': outstanding,
                        'due_date': assignment.fee_structure.due_date or timezone.now().date()
                    }
                )
                created_count += 1

        return Response({'created_count': created_count})

    @action(detail=False, methods=['post'])
    def send(self, request):
        """Send pending reminders."""
        pending = self.get_queryset().filter(reminder_sent=False)

        sent_count = 0
        for reminder in pending:
            # TODO: Implement actual email/SMS sending
            reminder.reminder_sent = True
            reminder.reminder_date = timezone.now()
            reminder.save()
            sent_count += 1

        return Response({'sent_count': sent_count})
```

### Task S11: Create Fee Reports Views
File: `fees/views.py`

```python
from rest_framework.views import APIView
from django.db import models as db_models
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta


class FeeCollectionReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        academic_year_id = request.query_params.get('academic_year')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        queryset = FeePayment.objects.filter(school=school)

        if academic_year_id:
            queryset = queryset.filter(fee_structure__academic_year_id=academic_year_id)
        if start_date and end_date:
            queryset = queryset.filter(payment_date__range=[start_date, end_date])

        total_collected = queryset.aggregate(total=Sum('amount_paid'))['total'] or 0
        total_payments = queryset.count()

        return Response({
            'total_collected': float(total_collected),
            'total_payments': total_payments
        })


class PendingDuesReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        academic_year_id = request.query_params.get('academic_year')

        assignments = StudentFeeAssignment.objects.filter(
            school=school,
            is_active=True
        )

        if academic_year_id:
            assignments = assignments.filter(fee_structure__academic_year_id=academic_year_id)

        total_outstanding = 0
        students_with_dues = 0

        for assignment in assignments:
            total_paid = FeePayment.objects.filter(
                student=assignment.student,
                fee_structure=assignment.fee_structure
            ).aggregate(total=Sum('amount_paid'))['total'] or 0

            outstanding = assignment.final_amount - total_paid
            if outstanding > 0:
                total_outstanding += outstanding
                students_with_dues += 1

        return Response({
            'total_outstanding': float(total_outstanding),
            'students_with_dues': students_with_dues
        })


class ClassWiseCollectionReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        academic_year_id = request.query_params.get('academic_year')

        from students.models import AcademicClass
        classes = AcademicClass.objects.filter(school=school)

        report = []
        for cls in classes:
            total_paid = FeePayment.objects.filter(
                school=school,
                student__class_id=cls.id,
                fee_structure__academic_year_id=academic_year_id
            ).aggregate(total=Sum('amount_paid'))['total'] or 0

            report.append({
                'class_id': cls.id,
                'class_name': cls.name,
                'total_collected': float(total_paid)
            })

        return Response(report)


class MonthlyCollectionReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        year = request.query_params.get('year', timezone.now().year)

        monthly_data = []
        for month in range(1, 13):
            total = FeePayment.objects.filter(
                school=school,
                payment_date__year=year,
                payment_date__month=month
            ).aggregate(total=Sum('amount_paid'))['total'] or 0

            monthly_data.append({
                'month': month,
                'total_collected': float(total)
            })

        return Response(monthly_data)


class DailyCollectionReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        date = request.query_params.get('date', timezone.now().date())

        payments = FeePayment.objects.filter(
            school=school,
            payment_date=date
        )

        total = payments.aggregate(total=Sum('amount_paid'))['total'] or 0
        by_mode = payments.values('payment_mode').annotate(
            total=Sum('amount_paid'),
            count=Count('id')
        )

        return Response({
            'date': date,
            'total_collected': float(total),
            'total_payments': payments.count(),
            'by_payment_mode': list(by_mode)
        })
```

### Task S12: Create URL Patterns
File: `fees/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'fee-categories', views.FeeCategoryViewSet)
router.register(r'fee-heads', views.FeeHeadViewSet)
router.register(r'fee-structures', views.FeeStructureViewSet)
router.register(r'student-fee-assignments', views.StudentFeeAssignmentViewSet)
router.register(r'fee-payments', views.FeePaymentViewSet)
router.register(r'fee-receipts', views.FeeReceiptViewSet)
router.register(r'fines', views.FineViewSet)
router.register(r'fee-due-reminders', views.FeeDueReminderViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('fees/reports/collection/', views.FeeCollectionReportView.as_view(), name='fee-collection-report'),
    path('fees/reports/pending/', views.PendingDuesReportView.as_view(), name='fee-pending-report'),
    path('fees/reports/class-wise/', views.ClassWiseCollectionReportView.as_view(), name='fee-class-wise-report'),
    path('fees/reports/monthly/', views.MonthlyCollectionReportView.as_view(), name='fee-monthly-report'),
    path('fees/reports/daily/', views.DailyCollectionReportView.as_view(), name='fee-daily-report'),
]
```

### Task S13: Wire URLs in `config/urls.py`
Add to root `urls.py`:
```python
path('api/', include('fees.urls')),
```

### Task S14: Test All Endpoints
Create test data and verify:
1. CRUD for FeeCategory
2. CRUD for FeeHead
3. CRUD for FeeStructure + bulk_create + by-class
4. CRUD for StudentFeeAssignment + bulk_assign
5. CRUD for FeePayment + verify + by-student + pending + today
6. CRUD for FeeReceipt + download + resend
7. CRUD for Fine + waive
8. CRUD for FeeDueReminder + generate + send
9. All report endpoints

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Fee Categories** | | |
| GET | `/api/fee-categories/` | List fee categories |
| POST | `/api/fee-categories/` | Create fee category |
| GET | `/api/fee-categories/{id}/` | Fee category detail |
| PUT | `/api/fee-categories/{id}/` | Update fee category |
| DELETE | `/api/fee-categories/{id}/` | Delete fee category |
| **Fee Heads** | | |
| GET | `/api/fee-heads/` | List fee heads |
| POST | `/api/fee-heads/` | Create fee head |
| GET | `/api/fee-heads/{id}/` | Fee head detail |
| PUT | `/api/fee-heads/{id}/` | Update fee head |
| DELETE | `/api/fee-heads/{id}/` | Delete fee head |
| **Fee Structure** | | |
| GET | `/api/fee-structures/` | List fee structures |
| POST | `/api/fee-structures/` | Create fee structure |
| GET | `/api/fee-structures/{id}/` | Fee structure detail |
| PUT | `/api/fee-structures/{id}/` | Update fee structure |
| DELETE | `/api/fee-structures/{id}/` | Delete fee structure |
| POST | `/api/fee-structures/bulk-create/` | Bulk create for all classes |
| GET | `/api/fee-structures/by-class/{class_id}/` | Fee structure for a class |
| **Student Fee Assignment** | | |
| GET | `/api/student-fee-assignments/` | List assignments |
| POST | `/api/student-fee-assignments/` | Assign fee to student |
| GET | `/api/student-fee-assignments/{id}/` | Assignment detail |
| PUT | `/api/student-fee-assignments/{id}/` | Update assignment |
| DELETE | `/api/student-fee-assignments/{id}/` | Remove assignment |
| POST | `/api/student-fee-assignments/bulk-assign/` | Bulk assign to class |
| **Payments** | | |
| GET | `/api/fee-payments/` | List payments |
| POST | `/api/fee-payments/` | Record payment |
| GET | `/api/fee-payments/{id}/` | Payment detail |
| PUT | `/api/fee-payments/{id}/` | Update payment |
| DELETE | `/api/fee-payments/{id}/` | Delete payment |
| POST | `/api/fee-payments/{id}/verify/` | Verify payment |
| GET | `/api/fee-payments/by-student/?student_id=X` | Student payment history |
| GET | `/api/fee-payments/pending/` | All pending dues |
| GET | `/api/fee-payments/today/` | Today's collections |
| **Receipts** | | |
| GET | `/api/fee-receipts/` | List receipts |
| GET | `/api/fee-receipts/{id}/` | Receipt detail |
| PUT | `/api/fee-receipts/{id}/` | Update receipt |
| GET | `/api/fee-receipts/{id}/download/` | Download receipt PDF |
| POST | `/api/fee-receipts/{id}/resend/` | Resend via email/SMS |
| **Fines** | | |
| GET | `/api/fines/` | List fines |
| POST | `/api/fines/` | Add fine |
| GET | `/api/fines/{id}/` | Fine detail |
| PUT | `/api/fines/{id}/` | Update fine |
| DELETE | `/api/fines/{id}/` | Delete fine |
| POST | `/api/fines/{id}/waive/` | Waive fine |
| **Due Reminders** | | |
| GET | `/api/fee-due-reminders/` | List due reminders |
| POST | `/api/fee-due-reminders/` | Create reminder |
| GET | `/api/fee-due-reminders/{id}/` | Reminder detail |
| PUT | `/api/fee-due-reminders/{id}/` | Update reminder |
| DELETE | `/api/fee-due-reminders/{id}/` | Delete reminder |
| POST | `/api/fee-due-reminders/generate/` | Generate all dues |
| POST | `/api/fee-due-reminders/send/` | Send reminders |
| **Reports** | | |
| GET | `/api/fees/reports/collection/` | Fee collection report |
| GET | `/api/fees/reports/pending/` | Pending dues report |
| GET | `/api/fees/reports/class-wise/` | Class-wise collection |
| GET | `/api/fees/reports/monthly/` | Monthly collection summary |
| GET | `/api/fees/reports/daily/` | Daily collection summary |

---

## Implementation Order (Suggested)

### Phase 1: Foundation (Day 1)
1. **Varun:** Create app + models (V1-V9) + migrations (V12)
2. **Sudipto:** Create serializers (S1) + permissions (S2)

### Phase 2: Core CRUD (Day 2)
3. **Varun:** Register models in admin (V11)
4. **Sudipto:** FeeCategory, FeeHead, FeeStructure views (S3-S5)

### Phase 3: Payment Flow (Day 3)
5. **Sudipto:** StudentFeeAssignment views (S6)
6. **Sudipto:** FeePayment views (S7)

### Phase 4: Receipt & Fine (Day 4)
7. **Sudipto:** FeeReceipt views (S8)
8. **Sudipto:** Fine views (S9)

### Phase 5: Reminders & Reports (Day 5)
9. **Sudipto:** FeeDueReminder views (S10)
10. **Sudipto:** Fee Reports views (S11)

### Phase 6: Integration (Day 6)
11. **Sudipto:** URL wiring (S12-S13)
12. **Both:** Testing all endpoints (S14)

---

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
- `schools.School` model is used for School (already exists)
- `schools.AcademicYear` model is used for Academic Year (already exists)
- `accounts.User` model is used for User (already exists)
- Receipt number format: `REC-YYYY-NNNNNN` (e.g., REC-2025-000001)
- All amounts are in INR (₹) with 2 decimal places
- Payment verification is a two-step process: collect → verify
- Fine waiver requires a reason and is tracked
- Due reminders are generated from outstanding assignments
