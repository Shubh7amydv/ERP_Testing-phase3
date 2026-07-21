from django.db import models

from schools.models import School, AcademicYear
from students.models import AcademicClass, Section, Teacher
from examinations.models import Subject
from accounts.models import User


class TimeSlot(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="time_slots")
    name = models.CharField(max_length=50)
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_order = models.PositiveIntegerField()
    is_break = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "name")
        ordering = ["slot_order"]

    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"


class Timetable(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="timetables")
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name="timetables")
    class_obj = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name="timetables")
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name="timetables")
    name = models.CharField(max_length=100)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "class_obj", "section", "effective_from")
        ordering = ["-effective_from"]

    def __str__(self):
        return f"{self.name} ({self.class_obj} - {self.section})"


class TimetableEntry(models.Model):
    DAY_CHOICES = [
        ("monday", "Monday"),
        ("tuesday", "Tuesday"),
        ("wednesday", "Wednesday"),
        ("thursday", "Thursday"),
        ("friday", "Friday"),
        ("saturday", "Saturday"),
    ]

    timetable = models.ForeignKey(Timetable, on_delete=models.CASCADE, related_name="entries")
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name="entries")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="timetable_entries")
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="timetable_entries",
    )
    room_no = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("timetable", "day_of_week", "time_slot")
        ordering = ["day_of_week", "time_slot__slot_order"]

    def __str__(self):
        return f"{self.day_of_week} - {self.time_slot.name} - {self.subject.name}"


class TeacherTimetable(models.Model):
    DAY_CHOICES = TimetableEntry.DAY_CHOICES

    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="teacher_timetable")
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name="teacher_timetable")
    class_obj = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name="teacher_timetable")
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name="teacher_timetable")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="teacher_timetable")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("teacher", "day_of_week", "time_slot")
        ordering = ["day_of_week", "time_slot__slot_order"]

    def __str__(self):
        return f"{self.teacher} - {self.day_of_week} - {self.time_slot.name}"


class SubstituteTeacher(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="substitutes")
    date = models.DateField()
    original_teacher = models.ForeignKey(
        Teacher,
        on_delete=models.CASCADE,
        related_name="substitutes_as_original",
    )
    substitute_teacher = models.ForeignKey(
        Teacher,
        on_delete=models.CASCADE,
        related_name="substitutes_as_substitute",
    )
    timetable_entry = models.ForeignKey(TimetableEntry, on_delete=models.CASCADE, related_name="substitutes")
    reason = models.CharField(max_length=200, blank=True)
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_substitutes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("date", "timetable_entry")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.date} - {self.original_teacher} -> {self.substitute_teacher}"


class Room(models.Model):
    ROOM_TYPE_CHOICES = [
        ("classroom", "Classroom"),
        ("lab", "Laboratory"),
        ("office", "Office"),
        ("hall", "Hall"),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="rooms")
    room_no = models.CharField(max_length=20)
    building = models.CharField(max_length=100, blank=True)
    capacity = models.PositiveIntegerField(default=40)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES)
    facilities = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "room_no")
        ordering = ["room_no"]

    def __str__(self):
        return f"{self.room_no} ({self.building})" if self.building else self.room_no