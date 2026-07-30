from django.db import models


class SavedReport(models.Model):

    REPORT_TYPE_CHOICES = [
        ("student", "Student"),
        ("fee", "Fee"),
        ("attendance", "Attendance"),
        ("exam", "Exam"),
        ("hr", "HR"),
        ("transport", "Transport"),
        ("library", "Library"),
        ("custom", "Custom"),
    ]

    school = models.ForeignKey(
        "schools.School",
        on_delete=models.CASCADE,
        related_name="saved_reports",
    )

    name = models.CharField(max_length=200)

    report_type = models.CharField(
        max_length=30,
        choices=REPORT_TYPE_CHOICES,
    )

    parameters = models.JSONField(default=dict)

    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="saved_reports",
    )

    is_public = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.get_report_type_display()})"


class ReportSchedule(models.Model):

    FREQUENCY_CHOICES = [
        ("daily", "Daily"),
        ("weekly", "Weekly"),
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
    ]

    school = models.ForeignKey(
        "schools.School",
        on_delete=models.CASCADE,
        related_name="report_schedules",
    )

    saved_report = models.ForeignKey(
        SavedReport,
        on_delete=models.CASCADE,
        related_name="schedules",
    )

    frequency = models.CharField(
        max_length=15,
        choices=FREQUENCY_CHOICES,
    )

    day_of_week = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="0=Monday, 6=Sunday",
    )

    day_of_month = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    recipients = models.JSONField(default=list)

    is_active = models.BooleanField(default=True)

    last_sent = models.DateTimeField(null=True, blank=True)

    next_send = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.saved_report.name} - {self.get_frequency_display()}"
