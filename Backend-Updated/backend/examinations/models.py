from decimal import Decimal
from django.db import models
from django.db.models import Avg, Max, Min

from schools.models import School, AcademicYear
from students.models import AcademicClass, Section, Admission
from accounts.models import User


class ExamType(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="exam_types")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    weightage = models.PositiveIntegerField(default=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Subject(models.Model):
    SUBJECT_TYPE_CHOICES = [
        ("theory", "Theory"),
        ("practical", "Practical"),
        ("both", "Both"),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="subjects")
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10)
    type = models.CharField(max_length=15, choices=SUBJECT_TYPE_CHOICES)
    max_marks = models.PositiveIntegerField(default=100)
    passing_marks = models.PositiveIntegerField(default=33)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "code")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class ClassSubject(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="class_subjects")
    class_obj = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name="class_subjects")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="class_subjects")
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_subjects")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "class_obj", "subject")
        ordering = ["class_obj", "subject"]

    def __str__(self):
        return f"{self.class_obj.admission_class} - {self.subject.name}"


class Exam(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="exams")
    exam_type = models.ForeignKey(ExamType, on_delete=models.CASCADE, related_name="exams")
    name = models.CharField(max_length=200)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name="exams")
    start_date = models.DateField()
    end_date = models.DateField()
    result_date = models.DateField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    published_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="published_exams")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return self.name


class ExamSchedule(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="exam_schedules")
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="schedules")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="exam_schedules")
    class_obj = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name="exam_schedules")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    max_marks = models.PositiveIntegerField()
    passing_marks = models.PositiveIntegerField()
    room_no = models.CharField(max_length=20, blank=True)
    instructions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("exam", "subject", "class_obj")
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.exam.name} - {self.subject.name}"


class ExamResult(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="exam_results")
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="results")
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name="exam_results")
    schedule = models.ForeignKey(ExamSchedule, on_delete=models.CASCADE, related_name="results")
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    grade = models.CharField(max_length=2, blank=True)
    remarks = models.CharField(max_length=200, blank=True)
    is_absent = models.BooleanField(default=False)
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="graded_results")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("exam", "student", "schedule")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - {self.exam.name}"


class GradingSystem(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="grading_systems")
    name = models.CharField(max_length=100)
    grades = models.JSONField(default=list)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.is_default:
            GradingSystem.objects.filter(
                school=self.school,
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


class ReportCard(models.Model):
    STATUS_CHOICES = [
        ("pass", "Pass"),
        ("fail", "Fail"),
        ("compartment", "Compartment"),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="report_cards")
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="report_cards")
    student = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name="report_cards")
    total_marks = models.DecimalField(max_digits=6, decimal_places=2)
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=2, blank=True)
    rank = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES)
    remarks = models.TextField(blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("exam", "student")
        ordering = ["-generated_at"]

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - {self.exam.name}"


class ClassResultSummary(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="class_result_summaries")
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="class_summaries")
    class_obj = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name="result_summaries")
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name="result_summaries")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="result_summaries")
    total_students = models.PositiveIntegerField()
    appeared = models.PositiveIntegerField()
    passed = models.PositiveIntegerField()
    failed = models.PositiveIntegerField()
    pass_pct = models.DecimalField(max_digits=5, decimal_places=2)
    highest = models.DecimalField(max_digits=5, decimal_places=2)
    lowest = models.DecimalField(max_digits=5, decimal_places=2)
    average = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("exam", "class_obj", "section", "subject")
        ordering = ["class_obj", "section", "subject"]

    def __str__(self):
        return f"{self.exam.name} - {self.class_obj.admission_class} - {self.subject.name}"


def calculate_grade(marks_obtained, max_marks, grading_system):
    if marks_obtained is None or not grading_system:
        return ""

    percentage = (Decimal(marks_obtained) / Decimal(max_marks)) * Decimal("100")

    for grade_item in grading_system.grades:
        min_value = Decimal(str(grade_item.get("min", 0)))
        max_value = Decimal(str(grade_item.get("max", 100)))

        if min_value <= percentage <= max_value:
            return grade_item.get("grade", "")

    return ""


def generate_report_card(exam, student):
    results = ExamResult.objects.filter(exam=exam, student=student).select_related("schedule")

    if not results.exists():
        return None

    total_marks = sum((Decimal(r.schedule.max_marks) for r in results), Decimal("0.00"))
    marks_obtained = sum((r.marks_obtained or Decimal("0.00") for r in results), Decimal("0.00"))

    percentage = Decimal("0.00")
    if total_marks > 0:
        percentage = round((marks_obtained / total_marks) * Decimal("100"), 2)

    failed_subjects = results.filter(
        is_absent=False,
        marks_obtained__lt=models.F("schedule__passing_marks")
    ).count()

    absent_subjects = results.filter(is_absent=True).count()
    total_failed = failed_subjects + absent_subjects

    if total_failed == 0:
        status = "pass"
    elif total_failed <= 2:
        status = "compartment"
    else:
        status = "fail"

    grading_system = GradingSystem.objects.filter(
        school=exam.school,
        is_default=True,
        is_active=True,
    ).first()

    grade = calculate_grade(marks_obtained, total_marks, grading_system)

    report_card, created = ReportCard.objects.update_or_create(
        exam=exam,
        student=student,
        defaults={
            "school": exam.school,
            "total_marks": total_marks,
            "marks_obtained": marks_obtained,
            "percentage": percentage,
            "grade": grade,
            "status": status,
        },
    )

    return report_card


def generate_class_result_summary(exam, class_obj, section):
    schedules = ExamSchedule.objects.filter(exam=exam, class_obj=class_obj)

    summaries = []

    for schedule in schedules:
        results = ExamResult.objects.filter(
            exam=exam,
            schedule=schedule,
            student__admission_class=class_obj,
            student__section=section,
        )

        total_students = results.count()
        appeared = results.filter(is_absent=False).count()
        passed = results.filter(
            is_absent=False,
            marks_obtained__gte=schedule.passing_marks,
        ).count()
        failed = appeared - passed

        pass_pct = Decimal("0.00")
        if appeared > 0:
            pass_pct = round((Decimal(passed) / Decimal(appeared)) * Decimal("100"), 2)

        aggregates = results.filter(is_absent=False).aggregate(
            highest=Max("marks_obtained"),
            lowest=Min("marks_obtained"),
            average=Avg("marks_obtained"),
        )

        summary, created = ClassResultSummary.objects.update_or_create(
            exam=exam,
            class_obj=class_obj,
            section=section,
            subject=schedule.subject,
            defaults={
                "school": exam.school,
                "total_students": total_students,
                "appeared": appeared,
                "passed": passed,
                "failed": failed,
                "pass_pct": pass_pct,
                "highest": aggregates["highest"] or Decimal("0.00"),
                "lowest": aggregates["lowest"] or Decimal("0.00"),
                "average": aggregates["average"] or Decimal("0.00"),
            },
        )

        summaries.append(summary)

    return summaries