from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'book-categories', views.BookCategoryViewSet, basename='bookcategory')
router.register(r'books', views.BookViewSet, basename='book')
router.register(r'book-issues', views.BookIssueViewSet, basename='bookissue')
router.register(r'book-reservations', views.BookReservationViewSet, basename='bookreservation')
router.register(r'library-members', views.LibraryMemberViewSet, basename='librarymember')

urlpatterns = [
    path('', include(router.urls)),
    path('library/reports/popular-books/', views.PopularBooksReportView.as_view(), name='library-popular-books-report'),
    path('library/reports/member-activity/', views.MemberActivityReportView.as_view(), name='library-member-activity-report'),
    path('library/reports/overdue-summary/', views.OverdueSummaryReportView.as_view(), name='library-overdue-summary-report'),
    path('library/reports/inventory/', views.InventoryReportView.as_view(), name='library-inventory-report'),
]
