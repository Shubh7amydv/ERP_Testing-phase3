"""
URL configuration for config project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
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
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)