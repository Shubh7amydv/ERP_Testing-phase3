from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'attendance-periods', views.AttendancePeriodViewSet, basename='attendanceperiod')
router.register(r'attendance', views.AttendanceRecordViewSet, basename='attendancerecord')
router.register(r'holidays', views.HolidayViewSet, basename='holiday')
router.register(r'leave-applications', views.LeaveApplicationViewSet, basename='leaveapplication')

urlpatterns = [
    path('', include(router.urls)),
    path('attendance/reports/daily/', views.DailyAttendanceReportView.as_view(), name='attendance-daily-report'),
    path('attendance/reports/monthly/', views.MonthlyAttendanceReportView.as_view(), name='attendance-monthly-report'),
    path('attendance/reports/class-wise/', views.ClassWiseAttendanceReportView.as_view(), name='attendance-class-wise-report'),
    path('attendance/reports/low-attendance/', views.LowAttendanceReportView.as_view(), name='attendance-low-report'),
    path('attendance/reports/bulk-sms/', views.BulkSMSReportView.as_view(), name='attendance-bulk-sms-report'),
]
