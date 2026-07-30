from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BusRouteViewSet,
    BusViewSet,
    BusRouteFeeViewSet,
    AdmissionBusDetailViewSet,
    route_wise_students_report,
    transport_collection_report,
)

router = DefaultRouter()

router.register(r"bus-routes", BusRouteViewSet, basename="bus-routes")
router.register(r"buses", BusViewSet, basename="buses")
router.register(r"bus-route-fees", BusRouteFeeViewSet, basename="bus-route-fees")
router.register(r"admission-bus-details", AdmissionBusDetailViewSet, basename="admission-bus-details")

urlpatterns = [
    path("", include(router.urls)),
    path("reports/transport/route-wise/", route_wise_students_report, name="report-transport-route-wise"),
    path("reports/transport/collection/", transport_collection_report, name="report-transport-collection"),
]
