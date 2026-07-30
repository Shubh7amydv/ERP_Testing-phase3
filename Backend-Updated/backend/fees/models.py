import uuid
from decimal import Decimal
from django.db import models
from django.db.models import Sum
from django.utils import timezone

from schools.models import School, AcademicYear
from students.models import AcademicClass, Admission
from accounts.models import User


class FeeCategory(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="fee_categories")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("school", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.school.name} - {self.name}"


class FeeHead(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="fee_heads")
    category = models.ForeignKey(FeeCategory, on_delete=models.CASCADE, related_name="fee_heads")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_recurring = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("school", "name")
        ordering = ["category", "name"]

    def __str__(self):
        return f"{self.category.name} - {self.name}"


class FeeStructure(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="fee_structures")
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name="fee_structures")
    class_obj = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name="fee_structures")
    fee_head = models.ForeignKey(FeeHead, on_delete=models.CASCADE, related_name="fee_structures")
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
        unique_together = ("school", "academic_year", "class_obj", "fee_head")
        ordering = ["class_obj", "fee_head"]

    def __str__(self):
        return f"{self.class_obj.admission_class} - {self.fee_head.name} - ₹{self.amount}"


class StudentFeeAssignment(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="student_fee_assignments")
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name="fee_assignments")
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE, related_name="assignments")
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_reason = models.TextField(blank=True)
    override_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "fee_structure")
        ordering = ["student", "fee_structure"]

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - {self.fee_structure.fee_head.name}"

    @property
    def final_amount(self):
        if self.override_amount is not None:
            return self.override_amount
        return self.fee_structure.amount - self.discount


class FeePayment(models.Model):
    PAYMENT_MODE_CHOICES = [
        ("cash", "Cash"),
        ("online", "Online"),
        ("card", "Card"),
        ("cheque", "Cheque"),
        ("upi", "UPI"),
        ("neft", "NEFT"),
        ("rtgs", "RTGS"),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="fee_payments")
    receipt_no = models.CharField(max_length=20, unique=True, blank=True)
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name="fee_payments")
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE, related_name="payments")
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODE_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True)
    cheque_no = models.CharField(max_length=20, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    remarks = models.TextField(blank=True)
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="collected_payments")
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="verified_payments")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.receipt_no} - {self.student.first_name} {self.student.last_name} - ₹{self.amount_paid}"

    def save(self, *args, **kwargs):
        if not self.receipt_no:
            self.receipt_no = self.generate_receipt_no()
        super().save(*args, **kwargs)

    def generate_receipt_no(self):
        year = timezone.now().year
        last_payment = FeePayment.objects.filter(
            school=self.school,
            receipt_no__startswith=f"REC-{year}-"
        ).order_by("-receipt_no").first()

        if last_payment:
            last_num = int(last_payment.receipt_no.split("-")[-1])
            new_num = last_num + 1
        else:
            new_num = 1

        return f"REC-{year}-{new_num:06d}"


class FeeReceipt(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="fee_receipts")
    receipt_no = models.CharField(max_length=20, unique=True)
    payment = models.OneToOneField(FeePayment, on_delete=models.CASCADE, related_name="receipt")
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="generated_receipts")
    pdf_file = models.FileField(upload_to="receipts/", blank=True)
    sent_via_email = models.BooleanField(default=False)
    sent_via_sms = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Receipt {self.receipt_no}"


class Fine(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="fines")
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name="fines")
    fee_payment = models.ForeignKey(FeePayment, on_delete=models.SET_NULL, null=True, blank=True, related_name="fines")
    reason = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    fine_date = models.DateField()
    is_waived = models.BooleanField(default=False)
    waived_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="waived_fines")
    waived_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-fine_date"]

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - {self.reason} - ₹{self.amount}"


class FeeDueReminder(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="fee_due_reminders")
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name="fee_reminders")
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE, related_name="reminders")
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    reminder_sent = models.BooleanField(default=False)
    reminder_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["due_date"]

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - Due ₹{self.amount_due}"


def calculate_student_dues(student, academic_year=None):
    filters = {
        "student": student,
        "is_active": True,
        "fee_structure__is_active": True,
    }

    if academic_year:
        filters["fee_structure__academic_year"] = academic_year

    assignments = StudentFeeAssignment.objects.filter(**filters)

    total_assigned = sum((a.final_amount for a in assignments), Decimal("0.00"))

    payment_filters = {"student": student}
    if academic_year:
        payment_filters["fee_structure__academic_year"] = academic_year

    total_paid = FeePayment.objects.filter(**payment_filters).aggregate(
        total=Sum("amount_paid")
    )["total"] or Decimal("0.00")

    total_fines = Fine.objects.filter(
        student=student,
        is_waived=False,
        fine_date__year=timezone.now().year
    ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

    return {
        "total_assigned": total_assigned,
        "total_paid": total_paid,
        "total_fines": total_fines,
        "outstanding": total_assigned - total_paid + total_fines,
    }


class StudentFeeInstallmentPaid(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="student_fee_installments")
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name="fee_installments")
    installment_number = models.PositiveIntegerField()
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    s_code = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "installment_number")
        ordering = ["student", "installment_number"]
        verbose_name = "Student Fee Installment Payment"
        verbose_name_plural = "Student Fee Installment Payments"

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} — Installment {self.installment_number} (₹{self.amount_paid})"