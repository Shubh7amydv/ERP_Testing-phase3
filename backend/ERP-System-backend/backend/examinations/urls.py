from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExamTypeViewSet, SubjectViewSet, ClassSubjectViewSet,
    ExamViewSet, ExamScheduleViewSet, ExamResultViewSet,
    GradingSystemViewSet, ReportCardViewSet,
    ClassPerformanceReportView, SubjectAnalysisReportView,
    ToppersReportView, FailStudentsReportView, ExamComparisonReportView,
)

router = DefaultRouter()
router.register(r'exam-types', ExamTypeViewSet, basename='examtype')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'class-subjects', ClassSubjectViewSet, basename='classsubject')
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'exam-schedules', ExamScheduleViewSet, basename='examschedule')
router.register(r'exam-results', ExamResultViewSet, basename='examresult')
router.register(r'grading-systems', GradingSystemViewSet, basename='gradingsystem')
router.register(r'report-cards', ReportCardViewSet, basename='reportcard')

urlpatterns = [
    path('', include(router.urls)),
    path('exams/reports/class-performance/', ClassPerformanceReportView.as_view(), name='class-performance-report'),
    path('exams/reports/subject-analysis/', SubjectAnalysisReportView.as_view(), name='subject-analysis-report'),
    path('exams/reports/toppers/', ToppersReportView.as_view(), name='toppers-report'),
    path('exams/reports/fail-students/', FailStudentsReportView.as_view(), name='fail-students-report'),
    path('exams/reports/comparison/', ExamComparisonReportView.as_view(), name='exam-comparison-report'),
]
