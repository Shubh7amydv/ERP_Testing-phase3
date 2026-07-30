from django.db import models


class EventType(models.Model):

    school = models.ForeignKey(
        "schools.School",
        on_delete=models.CASCADE,
        related_name="event_types",
    )

    name = models.CharField(max_length=100)

    color = models.CharField(max_length=7, default="#3B82F6")

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.school})"


class Event(models.Model):

    TARGET_AUDIENCE = [
        ("all", "All"),
        ("teachers", "Teachers"),
        ("students", "Students"),
        ("parents", "Parents"),
    ]

    school = models.ForeignKey(
        "schools.School",
        on_delete=models.CASCADE,
        related_name="events",
    )

    event_type = models.ForeignKey(
        EventType,
        on_delete=models.CASCADE,
        related_name="events",
    )

    title = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    start_date = models.DateTimeField()

    end_date = models.DateTimeField()

    location = models.CharField(max_length=200, blank=True)

    is_holiday = models.BooleanField(default=False)

    target_audience = models.CharField(
        max_length=20,
        choices=TARGET_AUDIENCE,
        default="all",
    )

    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="created_events",
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class ExamEvent(models.Model):

    event = models.OneToOneField(
        Event,
        on_delete=models.CASCADE,
        related_name="exam_event",
    )

    exam = models.ForeignKey(
        "examinations.Exam",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="exam_events",
    )

    classes = models.JSONField(default=list)

    def __str__(self):
        return f"ExamEvent - {self.event.title}"


class SchoolCalendar(models.Model):

    school = models.ForeignKey(
        "schools.School",
        on_delete=models.CASCADE,
        related_name="school_calendars",
    )

    academic_year = models.ForeignKey(
        "schools.AcademicYear",
        on_delete=models.CASCADE,
        related_name="calendars",
    )

    name = models.CharField(max_length=100)

    year = models.PositiveIntegerField()

    is_published = models.BooleanField(default=False)

    published_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.year})"
