from rest_framework import serializers
from .models import (
    FeeCategory, FeeHead, FeeStructure, StudentFeeAssignment,
    FeePayment, FeeReceipt, Fine, FeeDueReminder, StudentFeeInstallmentPaid,
)


class FeeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeCategory
        fields = [
            'id', 'school', 'name', 'description', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class FeeHeadSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = FeeHead
        fields = [
            'id', 'school', 'category', 'category_name', 'name', 'description',
            'is_recurring', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class FeeStructureSerializer(serializers.ModelSerializer):
    fee_head_name = serializers.CharField(source='fee_head.name', read_only=True)
    class_name = serializers.CharField(source='class_obj.get_admission_class_display', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.year', read_only=True)

    class Meta:
        model = FeeStructure
        fields = [
            'id', 'school', 'academic_year', 'academic_year_name', 'class_obj',
            'class_name', 'fee_head', 'fee_head_name', 'amount', 'due_date',
            'late_fee', 'late_fee_per_day', 'installment_allowed', 'max_installments',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class StudentFeeAssignmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    fee_head_name = serializers.CharField(source='fee_structure.fee_head.name', read_only=True)
    final_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = StudentFeeAssignment
        fields = [
            'id', 'school', 'student', 'student_name', 'fee_structure',
            'fee_head_name', 'discount', 'discount_reason', 'override_amount',
            'final_amount', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class FeePaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    received_by_name = serializers.CharField(source='received_by.email', read_only=True, default=None)
    verified_by_name = serializers.CharField(source='verified_by.email', read_only=True, default=None)

    class Meta:
        model = FeePayment
        fields = [
            'id', 'school', 'receipt_no', 'student', 'student_name', 'fee_structure',
            'amount_paid', 'payment_date', 'payment_mode', 'transaction_id',
            'cheque_no', 'bank_name', 'remarks', 'received_by', 'received_by_name',
            'is_verified', 'verified_by', 'verified_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['receipt_no', 'created_at', 'updated_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class FeeReceiptSerializer(serializers.ModelSerializer):
    payment_receipt_no = serializers.CharField(source='payment.receipt_no', read_only=True)
    student_name = serializers.SerializerMethodField()
    amount_paid = serializers.DecimalField(
        source='payment.amount_paid', max_digits=10, decimal_places=2, read_only=True,
    )

    class Meta:
        model = FeeReceipt
        fields = [
            'id', 'school', 'receipt_no', 'payment', 'payment_receipt_no',
            'student_name', 'amount_paid', 'generated_by', 'pdf_file',
            'sent_via_email', 'sent_via_sms', 'created_at',
        ]
        read_only_fields = ['created_at']

    def get_student_name(self, obj):
        return f"{obj.payment.student.first_name} {obj.payment.student.last_name}"


class FineSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    waived_by_name = serializers.CharField(source='waived_by.email', read_only=True, default=None)

    class Meta:
        model = Fine
        fields = [
            'id', 'school', 'student', 'student_name', 'fee_payment', 'reason',
            'amount', 'fine_date', 'is_waived', 'waived_by', 'waived_by_name',
            'waived_reason', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class FeeDueReminderSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = FeeDueReminder
        fields = [
            'id', 'school', 'student', 'student_name', 'fee_structure',
            'amount_due', 'due_date', 'reminder_sent', 'reminder_date', 'created_at',
        ]
        read_only_fields = ['created_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class StudentFeeInstallmentPaidSerializer(serializers.ModelSerializer):
    admission_no = serializers.CharField(source='student.admission_no', read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentFeeInstallmentPaid
        fields = [
            'id',
            'student',
            'admission_no',
            'student_name',
            'installment_number',
            'amount_paid',
            's_code',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'admission_no', 'student_name', 'created_at', 'updated_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

    def validate(self, data):
        student = data.get('student', getattr(self.instance, 'student', None))
        installment_number = data.get('installment_number', getattr(self.instance, 'installment_number', None))
        qs = StudentFeeInstallmentPaid.objects.filter(
            student=student,
            installment_number=installment_number,
        )
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                f"A payment record for installment {installment_number} already exists for this student."
            )
        return data
