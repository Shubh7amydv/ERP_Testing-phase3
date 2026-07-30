from django.db import models

from schools.models import School, AcademicYear
from students.models import Admission, AcademicClass, Section
from accounts.models import User


class AttendancePeriod(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="attendance_periods")
    name = models.CharField(max_length=50)
    start_time = models.TimeField()
    end_time = models.TimeField()
    period_order = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "name")
        ordering = ["period_order"]

    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"


class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ("present", "Present"),
        ("absent", "Absent"),
        ("late", "Late"),
        ("half_day", "Half Day"),
        ("excused", "Excused"),
    ]

    SOURCE_CHOICES = [
        ("manual", "Manual"),
        ("biometric", "Biometric"),
        ("face", "Face Recognition"),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="attendance_records")
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name="attendance_records")
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    period = models.ForeignKey(
        AttendancePeriod,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="records",
    )
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="marked_attendance")
    remarks = models.TextField(blank=True)
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default="manual")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "date", "period")
        ordering = ["-date", "student"]

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - {self.date} - {self.status}"


class AttendanceSummary(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="attendance_summaries")
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name="attendance_summaries")
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name="attendance_summaries")
    total_days = models.PositiveIntegerField(default=0)
    present_days = models.PositiveIntegerField(default=0)
    absent_days = models.PositiveIntegerField(default=0)
    late_days = models.PositiveIntegerField(default=0)
    half_days = models.PositiveIntegerField(default=0)
    excused_days = models.PositiveIntegerField(default=0)
    attendance_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "academic_year")
        ordering = ["student"]

    def __str__(self):
        return f"{self.student.first_name} - {self.academic_year.year} - {self.attendance_pct}%"

    def calculate_percentage(self):
        if self.total_days > 0:
            effective_present = self.present_days + (self.half_days * 0.5) + self.late_days
            self.attendance_pct = round((effective_present / self.total_days) * 100, 2)
        else:
            self.attendance_pct = 0
        return self.attendance_pct


class Holiday(models.Model):
    HOLIDAY_TYPE_CHOICES = [
        ("national", "National"),
        ("religious", "Religious"),
        ("school", "School"),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="attendance_holidays")
    name = models.CharField(max_length=200)
    date = models.DateField()
    holiday_type = models.CharField(max_length=20, choices=HOLIDAY_TYPE_CHOICES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "date")
        ordering = ["date"]

    def __str__(self):
        return f"{self.name} - {self.date}"


class LeaveApplication(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="leave_applications")
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name="leave_applications")
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="pending")
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_leaves",
    )
    remarks = models.TextField(blank=True)
    attachment = models.FileField(upload_to="leave_attachments/", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student.first_name} - {self.start_date} to {self.end_date} ({self.status})"

    @property
    def total_days(self):
        delta = self.end_date - self.start_date
        return delta.days + 1


class ClassAttendanceDay(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="class_attendance_days")
    class_obj = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name="attendance_days")
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name="attendance_days")
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
        related_name="finalized_attendance",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("class_obj", "section", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.class_obj} - {self.section} - {self.date}"

    @property
    def attendance_pct(self):
        if self.total_students > 0:
            return round(((self.present + self.late) / self.total_students) * 100, 2)
        return 0


def update_attendance_summary(student, date):
    academic_year = AcademicYear.objects.filter(
        school=student.school,
        is_current=True,
    ).first()

    if not academic_year:
        return None

    summary, created = AttendanceSummary.objects.get_or_create(
        student=student,
        academic_year=academic_year,
        defaults={"school": student.school},
    )

    records = AttendanceRecord.objects.filter(
        student=student,
        date__gte=academic_year.start_date,
        date__lte=academic_year.end_date,
        period__isnull=True,
    )

    summary.total_days = records.count()
    summary.present_days = records.filter(status="present").count()
    summary.absent_days = records.filter(status="absent").count()
    summary.late_days = records.filter(status="late").count()
    summary.half_days = records.filter(status="half_day").count()
    summary.excused_days = records.filter(status="excused").count()
    summary.calculate_percentage()
    summary.save()

    return summary