from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'departments', views.DepartmentViewSet, basename='department')
router.register(r'designations', views.DesignationViewSet, basename='designation')
router.register(r'staff', views.StaffViewSet, basename='staff')
router.register(r'staff-attendances', views.StaffAttendanceViewSet, basename='staffattendance')
router.register(r'leave-types', views.LeaveTypeViewSet, basename='leavetype')
router.register(r'staff-leaves', views.StaffLeaveViewSet, basename='staffleave')
router.register(r'payroll-months', views.PayrollMonthViewSet, basename='payrollmonth')
router.register(r'salary-slips', views.SalarySlipViewSet, basename='salaryslip')
router.register(r'salary-components', views.SalaryComponentViewSet, basename='salarycomponent')

urlpatterns = [
    path('', include(router.urls)),
    path('hr/reports/staff-list/', views.StaffListReportView.as_view(), name='hr-staff-list-report'),
    path('hr/reports/payroll-summary/', views.PayrollSummaryReportView.as_view(), name='hr-payroll-summary-report'),
    path('hr/reports/attendance-summary/', views.AttendanceSummaryReportView.as_view(), name='hr-attendance-summary-report'),
    path('hr/reports/leave-summary/', views.LeaveSummaryReportView.as_view(), name='hr-leave-summary-report'),
    path('hr/reports/pf-report/', views.PFReportView.as_view(), name='hr-pf-report'),
    path('hr/reports/esi-report/', views.ESIReportView.as_view(), name='hr-esi-report'),
]
