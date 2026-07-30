from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    SavedReportViewSet,
    ReportScheduleViewSet,
    student_list_report,
    student_class_wise_report,
    student_gender_wise_report,
    student_admission_trend_report,
    student_category_wise_report,
    fee_collection_summary,
    fee_pending_dues_report,
    fee_class_wise_report,
    fee_monthly_trend_report,
    attendance_daily_report,
    attendance_monthly_report,
    attendance_class_wise_report,
    attendance_low_report,
    exam_class_performance_report,
    exam_subject_analysis_report,
    exam_toppers_report,
    exam_pass_fail_report,
    hr_staff_list_report,
    hr_department_wise_report,
    hr_payroll_summary_report,
    dashboard_overview,
    dashboard_recent_activity,
    dashboard_announcements,
)

router = DefaultRouter()

router.register(r"saved-reports", SavedReportViewSet, basename="saved-reports")
router.register(r"report-schedules", ReportScheduleViewSet, basename="report-schedules")

urlpatterns = [
    path("", include(router.urls)),

    # Student Reports
    path("reports/students/list/", student_list_report, name="report-student-list"),
    path("reports/students/class-wise/", student_class_wise_report, name="report-student-class-wise"),
    path("reports/students/gender-wise/", student_gender_wise_report, name="report-student-gender-wise"),
    path("reports/students/admission-trend/", student_admission_trend_report, name="report-student-admission-trend"),
    path("reports/students/category-wise/", student_category_wise_report, name="report-student-category-wise"),

    # Fee Reports
    path("reports/fees/collection-summary/", fee_collection_summary, name="report-fee-collection"),
    path("reports/fees/pending-dues/", fee_pending_dues_report, name="report-fee-pending"),
    path("reports/fees/class-wise/", fee_class_wise_report, name="report-fee-class-wise"),
    path("reports/fees/monthly-trend/", fee_monthly_trend_report, name="report-fee-monthly"),

    # Attendance Reports
    path("reports/attendance/daily/", attendance_daily_report, name="report-attendance-daily"),
    path("reports/attendance/monthly/", attendance_monthly_report, name="report-attendance-monthly"),
    path("reports/attendance/class-wise/", attendance_class_wise_report, name="report-attendance-class-wise"),
    path("reports/attendance/low-attendance/", attendance_low_report, name="report-attendance-low"),

    # Exam Reports
    path("reports/exams/class-performance/", exam_class_performance_report, name="report-exam-class-performance"),
    path("reports/exams/subject-analysis/", exam_subject_analysis_report, name="report-exam-subject-analysis"),
    path("reports/exams/toppers/", exam_toppers_report, name="report-exam-toppers"),
    path("reports/exams/pass-fail/", exam_pass_fail_report, name="report-exam-pass-fail"),

    # HR Reports
    path("reports/hr/staff-list/", hr_staff_list_report, name="report-hr-staff-list"),
    path("reports/hr/department-wise/", hr_department_wise_report, name="report-hr-department"),
    path("reports/hr/payroll-summary/", hr_payroll_summary_report, name="report-hr-payroll"),

    # Dashboard
    path("dashboard/overview/", dashboard_overview, name="dashboard-overview"),
    path("dashboard/recent-activity/", dashboard_recent_activity, name="dashboard-recent-activity"),
    path("dashboard/announcements/", dashboard_announcements, name="dashboard-announcements"),
]
