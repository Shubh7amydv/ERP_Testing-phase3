from django.contrib import admin
from .models import (
    ExamType,
    Subject,
    ClassSubject,
    Exam,
    ExamSchedule,
    ExamResult,
    GradingSystem,
    ReportCard,
    ClassResultSummary,
)


@admin.register(ExamType)
class ExamTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "school", "weightage", "is_active"]
    search_fields = ["name", "school__name"]
    list_filter = ["school", "is_active"]


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "type", "max_marks", "passing_marks", "is_active"]
    search_fields = ["name", "code"]
    list_filter = ["school", "type", "is_active"]


@admin.register(ClassSubject)
class ClassSubjectAdmin(admin.ModelAdmin):
    list_display = ["class_obj", "subject", "teacher", "is_active"]
    list_filter = ["school", "class_obj", "is_active"]
    search_fields = ["subject__name", "teacher__email"]


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ["name", "exam_type", "academic_year", "start_date", "end_date", "is_published"]
    search_fields = ["name"]
    list_filter = ["school", "exam_type", "academic_year", "is_published"]


@admin.register(ExamSchedule)
class ExamScheduleAdmin(admin.ModelAdmin):
    list_display = ["exam", "subject", "class_obj", "date", "start_time", "end_time", "max_marks"]
    list_filter = ["school", "exam", "class_obj", "date"]
    search_fields = ["exam__name", "subject__name"]


@admin.register(ExamResult)
class ExamResultAdmin(admin.ModelAdmin):
    list_display = ["exam", "student", "schedule", "marks_obtained", "grade", "is_absent"]
    list_filter = ["school", "exam", "is_absent", "grade"]
    search_fields = ["student__first_name", "student__last_name", "student__admission_no"]


@admin.register(GradingSystem)
class GradingSystemAdmin(admin.ModelAdmin):
    list_display = ["name", "is_default", "is_active"]
    list_filter = ["school", "is_default", "is_active"]
    search_fields = ["name"]


@admin.register(ReportCard)
class ReportCardAdmin(admin.ModelAdmin):
    list_display = ["exam", "student", "marks_obtained", "percentage", "grade", "rank", "status"]
    list_filter = ["school", "exam", "status", "grade"]
    search_fields = ["student__first_name", "student__last_name", "student__admission_no"]


@admin.register(ClassResultSummary)
class ClassResultSummaryAdmin(admin.ModelAdmin):
    list_display = ["exam", "class_obj", "section", "subject", "pass_pct", "average"]
    list_filter = ["school", "exam", "class_obj", "section", "subject"]