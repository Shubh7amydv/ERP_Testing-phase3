from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'fee-categories', views.FeeCategoryViewSet, basename='feecategory')
router.register(r'fee-heads', views.FeeHeadViewSet, basename='feehead')
router.register(r'fee-structures', views.FeeStructureViewSet, basename='feestructure')
router.register(r'student-fee-assignments', views.StudentFeeAssignmentViewSet, basename='studentfeeassignment')
router.register(r'fee-payments', views.FeePaymentViewSet, basename='feepayment')
router.register(r'fee-receipts', views.FeeReceiptViewSet, basename='feereceipt')
router.register(r'fines', views.FineViewSet, basename='fine')
router.register(r'fee-due-reminders', views.FeeDueReminderViewSet, basename='feeduereminder')
router.register(r'student-fee-installments-paid', views.StudentFeeInstallmentPaidViewSet, basename='studentfeeinstallmentpaid')

urlpatterns = [
    path('', include(router.urls)),
    path('fees/reports/collection/', views.FeeCollectionReportView.as_view(), name='fee-collection-report'),
    path('fees/reports/pending/', views.PendingDuesReportView.as_view(), name='fee-pending-report'),
    path('fees/reports/class-wise/', views.ClassWiseCollectionReportView.as_view(), name='fee-class-wise-report'),
    path('fees/reports/monthly/', views.MonthlyCollectionReportView.as_view(), name='fee-monthly-report'),
    path('fees/reports/daily/', views.DailyCollectionReportView.as_view(), name='fee-daily-report'),
    path('fees/installment-data/', views.InstallmentTableView.as_view(), name='fee-installment-data'),
    path('fees/table-installments/', views.TableInstallmentsView.as_view(), name='fee-table-installments'),
]
