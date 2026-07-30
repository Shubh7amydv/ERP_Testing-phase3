import uuid
from django.db import models


class School(models.Model):
    AFFILIATION_CHOICES = [
        ("CBSE", "CBSE"),
        ("ICSE", "ICSE"),
        ("STATE", "State Board"),
        ("IB", "IB"),
        ("CIE", "Cambridge"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to="school_logos/", blank=True, null=True)
    established = models.DateField(null=True, blank=True)
    affiliation = models.CharField(max_length=100, blank=True, choices=AFFILIATION_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class AcademicYear(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="academic_years")
    year = models.CharField(max_length=9)
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "year")
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.school.name} - {self.year}"

    def save(self, *args, **kwargs):
        if self.is_current:
            AcademicYear.objects.filter(
                school=self.school,
                is_current=True
            ).exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)


class SchoolSettings(models.Model):
    school = models.OneToOneField(School, on_delete=models.CASCADE, related_name="settings")
    timezone = models.CharField(max_length=50, default="Asia/Kolkata")
    currency = models.CharField(max_length=3, default="INR")
    currency_symbol = models.CharField(max_length=5, default="₹")
    academic_start_month = models.PositiveIntegerField(default=4)
    passing_percentage = models.PositiveIntegerField(default=33)
    max_students_per_section = models.PositiveIntegerField(default=40)
    enable_biometric = models.BooleanField(default=False)
    sms_enabled = models.BooleanField(default=False)
    email_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Settings for {self.school.name}"


class SchoolHoliday(models.Model):
    HOLIDAY_TYPE_CHOICES = [
        ("national", "National"),
        ("religious", "Religious"),
        ("school", "School"),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="holidays")
    name = models.CharField(max_length=200)
    date = models.DateField()
    holiday_type = models.CharField(max_length=20, choices=HOLIDAY_TYPE_CHOICES)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "date")
        ordering = ["date"]

    def __str__(self):
        return f"{self.name} - {self.date}"


class SchoolNotificationTemplate(models.Model):
    TEMPLATE_TYPE_CHOICES = [
        ("fee_receipt", "Fee Receipt"),
        ("welcome", "Welcome"),
        ("attendance_alert", "Attendance Alert"),
        ("exam_result", "Exam Result"),
        ("general", "General"),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="notification_templates")
    template_type = models.CharField(max_length=30, choices=TEMPLATE_TYPE_CHOICES)
    subject = models.CharField(max_length=200)
    body = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("school", "template_type")

    def __str__(self):
        return f"{self.school.name} - {self.get_template_type_display()}"