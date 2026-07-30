from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ParentProfileViewSet,
    ParentStudentLinkViewSet,
    ParentFeedbackViewSet,
)

router = DefaultRouter()

router.register(
    r"parents",
    ParentProfileViewSet,
    basename="parents",
)

router.register(
    r"parent-student-links",
    ParentStudentLinkViewSet,
    basename="parent-student-links",
)

router.register(
    r"parent-feedback",
    ParentFeedbackViewSet,
    basename="parent-feedback",
)

urlpatterns = [
    path("", include(router.urls)),
]
