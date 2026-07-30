from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdmissionViewSet, AcademicClassViewSet, SectionViewSet,
    SiblingGroupViewSet, CasteViewSet, HouseViewSet,
    CategoryViewSet,
)

router = DefaultRouter()
router.register(r'admissions', AdmissionViewSet, basename='admission')
router.register(r'sibling-groups', SiblingGroupViewSet, basename='sibling-groups')
router.register(r'castes', CasteViewSet, basename='caste')
router.register(r'houses', HouseViewSet, basename='house')
router.register(r'classes', AcademicClassViewSet, basename='academicclass')
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
]
