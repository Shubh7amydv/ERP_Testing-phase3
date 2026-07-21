from django.contrib import admin
from .models import (
    FeeCategory,
    FeeHead,
    FeeStructure,
    StudentFeeAssignment,
    FeePayment,
    FeeReceipt,
    Fine,
    FeeDueReminder,
    StudentFeeInstallmentPaid,
)


@admin.register(FeeCategory)
class FeeCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "school", "is_active"]
    search_fields = ["name", "school__name"]
    list_filter = ["is_active", "school"]


@admin.register(FeeHead)
class FeeHeadAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "is_recurring", "is_active"]
    search_fields = ["name", "category__name"]
    list_filter = ["is_recurring", "is_active", "school"]


@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ["class_obj", "fee_head", "amount", "academic_year"]
    search_fields = ["class_obj__admission_class", "fee_head__name"]
    list_filter = ["school", "academic_year", "is_active"]


@admin.register(StudentFeeAssignment)
class StudentFeeAssignmentAdmin(admin.ModelAdmin):
    list_display = ["student", "fee_structure", "discount", "final_amount", "is_active"]
    search_fields = ["student__first_name", "student__last_name", "fee_structure__fee_head__name"]
    list_filter = ["school", "is_active"]


@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = ["receipt_no", "student", "amount_paid", "payment_date", "payment_mode", "is_verified"]
    search_fields = ["receipt_no", "student__first_name", "student__last_name"]
    list_filter = ["school", "payment_mode", "is_verified"]


@admin.register(FeeReceipt)
class FeeReceiptAdmin(admin.ModelAdmin):
    list_display = ["receipt_no", "payment", "generated_by", "created_at"]
    search_fields = ["receipt_no", "payment__receipt_no"]
    list_filter = ["school", "sent_via_email", "sent_via_sms"]


@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = ["student", "reason", "amount", "fine_date", "is_waived"]
    search_fields = ["student__first_name", "student__last_name", "reason"]
    list_filter = ["school", "is_waived", "fine_date"]


@admin.register(FeeDueReminder)
class FeeDueReminderAdmin(admin.ModelAdmin):
    list_display = ["student", "amount_due", "due_date", "reminder_sent"]
    search_fields = ["student__first_name", "student__last_name"]
    list_filter = ["school", "reminder_sent", "due_date"]


@admin.register(StudentFeeInstallmentPaid)
class StudentFeeInstallmentPaidAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'installment_number', 'amount_paid', 's_code', 'school')
    list_filter = ('installment_number', 'school')
    search_fields = ('student__first_name', 'student__last_name', 'student__admission_no')