from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Notification,
    SMSLog,
    EmailLog,
    Circular,
    EventReminder,
    ParentCommunication,
)

from .serializers import (
    NotificationSerializer,
    SMSLogSerializer,
    EmailLogSerializer,
    CircularSerializer,
    EventReminderSerializer,
    ParentCommunicationSerializer,
)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by("-created_at")
    serializer_class = NotificationSerializer

    @action(detail=True, methods=["put"])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()

        return Response(
            {
                "message": "Notification marked as read."
            }
        )

    @action(detail=False, methods=["put"])
    def read_all(self, request):
        Notification.objects.filter(
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )

        return Response(
            {
                "message": "All notifications marked as read."
            }
        )

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        count = Notification.objects.filter(
            is_read=False
        ).count()

        return Response(
            {
                "unread_count": count
            }
        )
        
class SMSLogViewSet(viewsets.ModelViewSet):
    queryset = SMSLog.objects.all().order_by("-created_at")
    serializer_class = SMSLogSerializer

    @action(detail=False, methods=["post"])
    def send(self, request):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            sms = serializer.save(status="sent")

            return Response(
                {
                    "message": "SMS sent successfully.",
                    "data": SMSLogSerializer(sms).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"])
    def bulk_send(self, request):
        data = request.data

        phone_numbers = data.get("phone_numbers", [])
        message = data.get("message", "")
        school = data.get("school")
        sent_by = data.get("sent_by")

        sms_logs = []

        for phone in phone_numbers:
            sms = SMSLog.objects.create(
                school_id=school,
                phone_number=phone,
                message=message,
                status="sent",
                sent_by_id=sent_by if sent_by else None,
            )

            sms_logs.append(SMSLogSerializer(sms).data)

        return Response(
            {
                "message": "Bulk SMS sent successfully.",
                "count": len(sms_logs),
                "data": sms_logs,
            },
            status=status.HTTP_201_CREATED,
        )
        
class EmailLogViewSet(viewsets.ModelViewSet):
    queryset = EmailLog.objects.all().order_by("-created_at")
    serializer_class = EmailLogSerializer

    @action(detail=False, methods=["post"])
    def send(self, request):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            email = serializer.save(status="sent")

            return Response(
                {
                    "message": "Email sent successfully.",
                    "data": EmailLogSerializer(email).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"])
    def bulk_send(self, request):
        data = request.data

        emails = data.get("emails", [])
        subject = data.get("subject", "")
        body = data.get("body", "")
        html_body = data.get("html_body", "")
        school = data.get("school")
        sent_by = data.get("sent_by")

        created_logs = []

        for email in emails:
            obj = EmailLog.objects.create(
                school_id=school,
                to_email=email,
                subject=subject,
                body=body,
                html_body=html_body,
                status="sent",
                sent_by_id=sent_by if sent_by else None,
            )

            created_logs.append(EmailLogSerializer(obj).data)

        return Response(
            {
                "message": "Bulk Email sent successfully.",
                "count": len(created_logs),
                "data": created_logs,
            },
            status=status.HTTP_201_CREATED,
        )
        
class CircularViewSet(viewsets.ModelViewSet):
    queryset = Circular.objects.all().order_by("-created_at")
    serializer_class = CircularSerializer

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        circular = self.get_object()

        circular.published = True
        circular.published_at = timezone.now()
        circular.save()

        return Response(
            {
                "message": "Circular published successfully.",
                "data": CircularSerializer(circular).data,
            }
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Circular created successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Circular updated successfully.",
                    "data": serializer.data,
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        circular = self.get_object()
        circular.delete()

        return Response(
            {
                "message": "Circular deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT,
        )

class ParentCommunicationViewSet(viewsets.ModelViewSet):
    queryset = ParentCommunication.objects.all().order_by("-sent_at")
    serializer_class = ParentCommunicationSerializer

    @action(detail=False, methods=["get"], url_path=r"student/(?P<student_id>[^/.]+)")
    def student_history(self, request, student_id=None):
        queryset = ParentCommunication.objects.filter(
            student_id=student_id
        ).order_by("-sent_at")

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Communication sent successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

class EventReminderViewSet(viewsets.ModelViewSet):
    queryset = EventReminder.objects.all().order_by("event_date")
    serializer_class = EventReminderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Reminder created successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Reminder updated successfully.",
                    "data": serializer.data,
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        reminder = self.get_object()
        reminder.delete()

        return Response(
            {
                "message": "Reminder deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT,
        )