from rest_framework import serializers
from .models import (
    Department, Designation, Staff, StaffAttendance,
    LeaveType, StaffLeave, PayrollMonth, SalarySlip, SalaryComponent,
)


class DepartmentSerializer(serializers.ModelSerializer):
    head_name = serializers.CharField(source='head.full_name', read_only=True, default=None)
    staff_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            'id', 'school', 'name', 'head', 'head_name', 'description',
            'is_active', 'staff_count', 'created_at', 'updated_at',
        ]
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
        fields = [
            'id', 'school', 'user', 'employee_id', 'first_name', 'last_name',
            'full_name', 'date_of_birth', 'gender', 'marital_status', 'blood_group',
            'phone', 'email', 'address', 'city', 'state', 'pincode',
            'aadhaar_no', 'pan_no', 'department', 'department_name',
            'designation', 'designation_name', 'date_of_joining', 'date_of_leaving',
            'employment_type', 'qualification', 'experience', 'photo', 'resume',
            'bank_name', 'bank_account', 'ifsc_code', 'basic_salary',
            'status', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class StaffListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    designation_name = serializers.CharField(source='designation.name', read_only=True)

    class Meta:
        model = Staff
        fields = [
            'id', 'employee_id', 'full_name', 'department', 'department_name',
            'designation', 'designation_name', 'phone', 'status', 'is_active',
        ]


class StaffAttendanceSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True)
    employee_id = serializers.CharField(source='staff.employee_id', read_only=True)
    total_hours = serializers.DecimalField(max_digits=4, decimal_places=2, read_only=True)

    class Meta:
        model = StaffAttendance
        fields = [
            'id', 'school', 'staff', 'staff_name', 'employee_id', 'date',
            'check_in', 'check_out', 'status', 'overtime_hours', 'total_hours',
            'remarks', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = [
            'id', 'school', 'name', 'days_per_year', 'is_carry_forward',
            'max_carry_forward', 'is_active', 'created_at',
        ]
        read_only_fields = ['created_at']


class StaffLeaveSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True)
    employee_id = serializers.CharField(source='staff.employee_id', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.email', read_only=True, default=None)

    class Meta:
        model = StaffLeave
        fields = [
            'id', 'school', 'staff', 'staff_name', 'employee_id',
            'leave_type', 'leave_type_name', 'start_date', 'end_date',
            'total_days', 'reason', 'status', 'approved_by', 'approved_by_name',
            'remarks', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'total_days']


class PayrollMonthSerializer(serializers.ModelSerializer):
    processed_by_name = serializers.CharField(source='processed_by.email', read_only=True, default=None)
    month_name = serializers.SerializerMethodField()
    total_slips = serializers.SerializerMethodField()
    total_payout = serializers.SerializerMethodField()

    class Meta:
        model = PayrollMonth
        fields = [
            'id', 'school', 'month', 'year', 'month_name', 'status',
            'processed_by', 'processed_by_name', 'processed_at',
            'total_slips', 'total_payout', 'created_at',
        ]
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
        fields = [
            'id', 'school', 'staff', 'staff_name', 'employee_id',
            'payroll_month', 'payroll_month_name', 'basic_salary', 'hra', 'da',
            'conveyance', 'medical', 'other_allowances', 'gross_salary',
            'pf', 'esi', 'tds', 'professional_tax', 'other_deductions',
            'total_deductions', 'net_salary', 'payment_status', 'payment_date',
            'payment_mode', 'transaction_id', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'gross_salary',
            'total_deductions', 'net_salary',
        ]

    def get_payroll_month_name(self, obj):
        from datetime import date
        return date(obj.payroll_month.year, obj.payroll_month.month, 1).strftime('%B %Y')


class SalaryComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryComponent
        fields = [
            'id', 'school', 'name', 'type', 'calculation', 'value',
            'is_active', 'created_at',
        ]
        read_only_fields = ['created_at']


class BulkAttendanceSerializer(serializers.Serializer):
    date = serializers.DateField()
    attendance = serializers.ListField(
        child=serializers.DictField(child=serializers.Field())
    )
