"""
URL configuration for config project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def home_view(request):
    return JsonResponse({
        "status": "healthy",
        "message": "ERP System Backend API is running successfully",
        "version": "1.0.0"
    })

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),

    # Authentication APIs
    path('api/', include('authentication.urls')),

    # Student APIs
    path('api/', include('students.urls')),

    # School APIs
    path('api/', include('schools.urls')),

    # Fee APIs
    path('api/', include('fees.urls')),

    # Attendance APIs
    path('api/', include('attendance.urls')),

    # Examination APIs
    path('api/', include('examinations.urls')),
    
    #Communication API
    path("api/communication/", include("communication.urls")),

    # Timetable APIs
    path('api/', include('timetable.urls')),

    # Library APIs
    path('api/', include('library.urls')),

    # Inventory APIs
    path('api/', include('inventory.urls')),

    # Hostel APIs
    path('api/', include('hostel.urls')),

    # HR APIs
    path('api/', include('hr.urls')),

    # Events & Calendar APIs
    path('api/', include('events.urls')),

    # Visitors Management APIs
    path('api/', include('visitors.urls')),

    # Parents Portal APIs
    path('api/', include('parents.urls')),

    # Reports & Dashboard APIs
    path('api/', include('reports.urls')),

    # Document Management APIs
    path('api/', include('documents.urls')),

    # Transport APIs
    path('api/', include('transport.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)