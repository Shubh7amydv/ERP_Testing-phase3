from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    EventTypeViewSet,
    EventViewSet,
    ExamEventViewSet,
    SchoolCalendarViewSet,
)

router = DefaultRouter()

router.register(
    r"event-types",
    EventTypeViewSet,
    basename="event-types",
)

router.register(
    r"events",
    EventViewSet,
    basename="events",
)

router.register(
    r"exam-events",
    ExamEventViewSet,
    basename="exam-events",
)

router.register(
    r"school-calendars",
    SchoolCalendarViewSet,
    basename="school-calendars",
)

urlpatterns = [
    path("", include(router.urls)),
]
