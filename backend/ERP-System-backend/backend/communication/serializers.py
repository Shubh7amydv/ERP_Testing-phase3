from rest_framework import serializers

from .models import (
    Notification,
    SMSLog,
    EmailLog,
    Circular,
    EventReminder,
    ParentCommunication,
)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


class SMSLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSLog
        fields = "__all__"


class EmailLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLog
        fields = "__all__"


class CircularSerializer(serializers.ModelSerializer):
    class Meta:
        model = Circular
        fields = "__all__"


class EventReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventReminder
        fields = "__all__"


class ParentCommunicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParentCommunication
        fields = "__all__"