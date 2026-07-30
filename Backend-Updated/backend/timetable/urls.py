from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'time-slots', views.TimeSlotViewSet, basename='timeslot')
router.register(r'timetables', views.TimetableViewSet, basename='timetable')
router.register(r'timetable-entries', views.TimetableEntryViewSet, basename='timetableentry')
router.register(r'teacher-timetables', views.TeacherTimetableViewSet, basename='teachertimetable')
router.register(r'substitute-teachers', views.SubstituteTeacherViewSet, basename='substituteteacher')
router.register(r'rooms', views.RoomViewSet, basename='room')

urlpatterns = [
    path('', include(router.urls)),
]
