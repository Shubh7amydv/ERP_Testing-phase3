from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    DocumentCategoryViewSet,
    DocumentViewSet,
    DocumentTemplateViewSet,
    TransferCertificateViewSet,
)

router = DefaultRouter()

router.register(r"document-categories", DocumentCategoryViewSet, basename="document-categories")
router.register(r"documents", DocumentViewSet, basename="documents")
router.register(r"document-templates", DocumentTemplateViewSet, basename="document-templates")
router.register(r"transfer-certificates", TransferCertificateViewSet, basename="transfer-certificates")

urlpatterns = [
    path("", include(router.urls)),
]
