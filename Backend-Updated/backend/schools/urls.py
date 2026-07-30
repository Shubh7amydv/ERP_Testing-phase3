from django.urls import path
from . import views

urlpatterns = [
    # Schools
    path('schools/', views.SchoolListView.as_view(), name='school-list'),
    path('schools/create/', views.SchoolCreateView.as_view(), name='school-create'),
    path('schools/<uuid:pk>/', views.SchoolDetailView.as_view(), name='school-detail'),
    path('schools/<uuid:pk>/update/', views.SchoolUpdateView.as_view(), name='school-update'),
    path('schools/<uuid:pk>/delete/', views.SchoolDeleteView.as_view(), name='school-delete'),

    # School Settings
    path('schools/<uuid:school_id>/settings/', views.SchoolSettingsView.as_view(), name='school-settings'),

    # Academic Years
    path('schools/<uuid:school_id>/academic-years/', views.AcademicYearListView.as_view(), name='academic-year-list'),
    path('schools/<uuid:school_id>/academic-years/create/', views.AcademicYearCreateView.as_view(), name='academic-year-create'),
    path('schools/<uuid:school_id>/academic-years/<int:pk>/', views.AcademicYearDetailView.as_view(), name='academic-year-detail'),
    path('schools/<uuid:school_id>/academic-years/<int:pk>/set-current/', views.SetCurrentYearView.as_view(), name='academic-year-set-current'),

    # Holidays
    path('schools/<uuid:school_id>/holidays/', views.HolidayListView.as_view(), name='holiday-list'),
    path('schools/<uuid:school_id>/holidays/create/', views.HolidayCreateView.as_view(), name='holiday-create'),
    path('schools/<uuid:school_id>/holidays/<int:pk>/', views.HolidayDetailView.as_view(), name='holiday-detail'),

    # Notification Templates
    path('schools/<uuid:school_id>/templates/', views.TemplateListView.as_view(), name='template-list'),
    path('schools/<uuid:school_id>/templates/create/', views.TemplateCreateView.as_view(), name='template-create'),
    path('schools/<uuid:school_id>/templates/<int:pk>/', views.TemplateDetailView.as_view(), name='template-detail'),
]
