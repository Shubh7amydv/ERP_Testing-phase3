from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'hostels', views.HostelViewSet, basename='hostel')
router.register(r'hostel-rooms', views.HostelRoomViewSet, basename='hostelroom')
router.register(r'hostel-allocations', views.HostelAllocationViewSet, basename='hostelallocation')
router.register(r'hostel-fees', views.HostelFeeViewSet, basename='hostelfee')
router.register(r'hostel-attendance', views.HostelAttendanceViewSet, basename='hostelattendance')
router.register(r'hostel-visitors', views.HostelVisitorViewSet, basename='hostelvisitor')
router.register(r'hostel-mess-menu', views.HostelMessMenuViewSet, basename='hostelmessmenu')

urlpatterns = [
    path('', include(router.urls)),
    path('hostel/reports/occupancy/', views.HostelReportView.as_view(), name='hostel-occupancy-report'),
    path('hostel/reports/fee-collection/', views.HostelReportView.as_view(), name='hostel-fee-collection-report'),
]
