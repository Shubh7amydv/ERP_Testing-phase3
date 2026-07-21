from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    NotificationViewSet,
    SMSLogViewSet,
    EmailLogViewSet,
    CircularViewSet,
    ParentCommunicationViewSet,
    EventReminderViewSet,
)

router = DefaultRouter()

router.register(
    r'notifications',
    NotificationViewSet,
    basename='notifications'
)

router.register(
    r'sms-logs',
    SMSLogViewSet,
    basename='sms-logs'
)

router.register(
    r'email-logs',
    EmailLogViewSet,
    basename='email-logs'
)

router.register(
    r'circulars',
    CircularViewSet,
    basename='circulars'
)

router.register(
    r'parent-comm',
    ParentCommunicationViewSet,
    basename='parent-comm'
)

router.register(
    r'event-reminders',
    EventReminderViewSet,
    basename='event-reminders'
)

urlpatterns = [
    path('', include(router.urls)),
]