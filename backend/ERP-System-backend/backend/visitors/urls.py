from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    VisitorCategoryViewSet,
    VisitorViewSet,
    VisitorPassViewSet,
)

router = DefaultRouter()

router.register(
    r"visitor-categories",
    VisitorCategoryViewSet,
    basename="visitor-categories",
)

router.register(
    r"visitors",
    VisitorViewSet,
    basename="visitors",
)

router.register(
    r"visitor-passes",
    VisitorPassViewSet,
    basename="visitor-passes",
)

urlpatterns = [
    path("", include(router.urls)),
]
