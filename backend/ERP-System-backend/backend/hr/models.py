from django.db import models
from schools.models import School
from accounts.models import User


class Department(models.Model):
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='departments'
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    head = models.ForeignKey(
        'Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='headed_departments'
    )

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.school.name} - {self.name}"


class Designation(models.Model):
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='designations'
    )
    name = models.CharField(max_length=100)
    level = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['level', 'name']

    def __str__(self):
        return f"{self.name} (Level {self.level})"


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

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='staff'
    )

    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='staff_profile'
    )

    employee_id = models.CharField(max_length=20)

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    date_of_birth = models.DateField()

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )

    marital_status = models.CharField(
        max_length=15,
        choices=MARITAL_STATUS_CHOICES,
        blank=True
    )

    blood_group = models.CharField(max_length=5, blank=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)

    address = models.TextField()

    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)

    aadhaar_no = models.CharField(max_length=12, blank=True)
    pan_no = models.CharField(max_length=10, blank=True)

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='staff'
    )

    designation = models.ForeignKey(
        Designation,
        on_delete=models.CASCADE,
        related_name='staff'
    )

    date_of_joining = models.DateField()
    date_of_leaving = models.DateField(null=True, blank=True)

    employment_type = models.CharField(
        max_length=15,
        choices=EMPLOYMENT_TYPE_CHOICES
    )

    qualification = models.CharField(max_length=100, blank=True)
    experience = models.CharField(max_length=50, blank=True)

    photo = models.ImageField(
        upload_to='staff_photos/',
        blank=True
    )

    resume = models.FileField(
        upload_to='staff_resumes/',
        blank=True
    )

    bank_name = models.CharField(max_length=100, blank=True)
    bank_account = models.CharField(max_length=20, blank=True)
    ifsc_code = models.CharField(max_length=11, blank=True)

    basic_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='active'
    )

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
    
class StaffAttendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('half_day', 'Half Day'),
        ('leave', 'Leave'),
    ]

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='staff_attendances'
    )

    staff = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name='attendances'
    )

    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES
    )

    overtime_hours = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0
    )

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


class LeaveType(models.Model):
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='leave_types'
    )

    name = models.CharField(max_length=50)
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


class StaffLeave(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='staff_leaves'
    )

    staff = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name='leaves'
    )

    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        related_name='leaves'
    )

    start_date = models.DateField()
    end_date = models.DateField()

    total_days = models.DecimalField(
        max_digits=4,
        decimal_places=2
    )

    reason = models.TextField()

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='pending'
    )

    approved_by = models.ForeignKey(
    User,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='hr_approved_leaves'
)

    remarks = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return (
            f"{self.staff.employee_id} - "
            f"{self.leave_type.name} "
            f"({self.start_date} to {self.end_date})"
        )

    def save(self, *args, **kwargs):
        if not self.total_days:
            delta = self.end_date - self.start_date
            self.total_days = delta.days + 1
        super().save(*args, **kwargs)
        
class PayrollMonth(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('closed', 'Closed'),
    ]

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='payroll_months'
    )

    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='draft'
    )

    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_payrolls'
    )

    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'month', 'year')
        ordering = ['-year', '-month']

    def __str__(self):
        from datetime import date
        month_name = date(self.year, self.month, 1).strftime('%B')
        return f"{month_name} {self.year} - {self.status}"


class SalarySlip(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='salary_slips'
    )

    staff = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name='salary_slips'
    )

    payroll_month = models.ForeignKey(
        PayrollMonth,
        on_delete=models.CASCADE,
        related_name='salary_slips'
    )

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

    payment_status = models.CharField(
        max_length=15,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )

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
        self.gross_salary = (
            self.basic_salary +
            self.hra +
            self.da +
            self.conveyance +
            self.medical +
            self.other_allowances
        )

        self.total_deductions = (
            self.pf +
            self.esi +
            self.tds +
            self.professional_tax +
            self.other_deductions
        )

        self.net_salary = self.gross_salary - self.total_deductions

        super().save(*args, **kwargs)


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

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='salary_components'
    )

    name = models.CharField(max_length=50)

    type = models.CharField(
        max_length=10,
        choices=TYPE_CHOICES
    )

    calculation = models.CharField(
        max_length=15,
        choices=CALCULATION_CHOICES
    )

    value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['type', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"