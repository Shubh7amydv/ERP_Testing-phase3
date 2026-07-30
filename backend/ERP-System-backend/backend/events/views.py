import datetime

from django.http import HttpResponse
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from .models import EventType, Event, ExamEvent, SchoolCalendar

from .serializers import (
    EventTypeSerializer,
    EventSerializer,
    ExamEventSerializer,
    SchoolCalendarSerializer,
)


class EventTypeViewSet(viewsets.ModelViewSet):
    serializer_class = EventTypeSerializer
    filterset_fields = ("school", "is_active")
    search_fields = ("name",)

    def get_queryset(self):
        return EventType.objects.filter(
            school=self.request.user.school
        ).order_by("name")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Event type created successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Event type updated successfully.",
                    "data": serializer.data,
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()

        return Response(
            {"message": "Event type deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    filterset_fields = ("school", "event_type", "is_holiday", "target_audience", "is_active")
    search_fields = ("title", "description", "location")

    def get_queryset(self):
        queryset = Event.objects.filter(
            school=self.request.user.school
        ).select_related("event_type", "created_by")

        start = self.request.query_params.get("start_date")
        end = self.request.query_params.get("end_date")

        if start:
            queryset = queryset.filter(start_date__date__gte=start)
        if end:
            queryset = queryset.filter(start_date__date__lte=end)

        return queryset.order_by("-created_at")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save(created_by=request.user)

            return Response(
                {
                    "message": "Event created successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Event updated successfully.",
                    "data": serializer.data,
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()

        return Response(
            {"message": "Event deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=False, methods=["get"])
    def today(self, request):
        today = timezone.now().date()
        queryset = self.get_queryset().filter(
            start_date__date=today,
            is_active=True,
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def this_week(self, request):
        today = timezone.now().date()
        start = today - datetime.timedelta(days=today.weekday())
        end = start + datetime.timedelta(days=6)
        queryset = self.get_queryset().filter(
            start_date__date__gte=start,
            start_date__date__lte=end,
            is_active=True,
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def this_month(self, request):
        today = timezone.now().date()
        queryset = self.get_queryset().filter(
            start_date__year=today.year,
            start_date__month=today.month,
            is_active=True,
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        now = timezone.now()
        queryset = self.get_queryset().filter(
            start_date__gte=now,
            is_active=True,
        )[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def holidays(self, request):
        queryset = self.get_queryset().filter(
            is_holiday=True,
            is_active=True,
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ExamEventViewSet(viewsets.ModelViewSet):
    serializer_class = ExamEventSerializer

    def get_queryset(self):
        return ExamEvent.objects.filter(
            event__school=self.request.user.school
        ).select_related("event", "exam")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Exam event created successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Exam event updated successfully.",
                    "data": serializer.data,
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()

        return Response(
            {"message": "Exam event deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class SchoolCalendarViewSet(viewsets.ModelViewSet):
    serializer_class = SchoolCalendarSerializer
    filterset_fields = ("school", "academic_year", "is_published")

    def get_queryset(self):
        return SchoolCalendar.objects.filter(
            school=self.request.user.school
        ).select_related("academic_year").order_by("-created_at")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Calendar created successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Calendar updated successfully.",
                    "data": serializer.data,
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()

        return Response(
            {"message": "Calendar deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        calendar = self.get_object()

        if calendar.is_published:
            return Response(
                {"message": "Calendar is already published."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        calendar.is_published = True
        calendar.published_at = timezone.now()
        calendar.save()

        return Response(
            {
                "message": "Calendar published successfully.",
                "data": SchoolCalendarSerializer(calendar).data,
            }
        )

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        calendar = self.get_object()

        if not calendar.is_published:
            return Response(
                {"message": "Calendar is not published."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        calendar.is_published = False
        calendar.published_at = None
        calendar.save()

        return Response(
            {
                "message": "Calendar unpublished successfully.",
                "data": SchoolCalendarSerializer(calendar).data,
            }
        )

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        calendar = self.get_object()

        events = Event.objects.filter(
            school=calendar.school,
            start_date__year=calendar.year,
            is_active=True,
        ).select_related("event_type").order_by("start_date")

        lines = []
        lines.append(f"School Calendar: {calendar.name}")
        lines.append(f"Year: {calendar.year}")
        lines.append(f"Academic Year: {calendar.academic_year.name}")
        lines.append(f"Published: {'Yes' if calendar.is_published else 'No'}")
        lines.append("")
        lines.append("=" * 60)
        lines.append("")

        for event in events:
            lines.append(f"Title: {event.title}")
            lines.append(f"Type: {event.event_type.name}")
            lines.append(f"Start: {event.start_date.strftime('%d %b %Y %I:%M %p')}")
            lines.append(f"End: {event.end_date.strftime('%d %b %Y %I:%M %p')}")
            if event.location:
                lines.append(f"Location: {event.location}")
            if event.is_holiday:
                lines.append("Holiday: Yes")
            lines.append(f"Audience: {event.get_target_audience_display()}")
            lines.append("-" * 40)
            lines.append("")

        content = "\n".join(lines)

        response = HttpResponse(content, content_type="text/plain")
        filename = f"calendar_{calendar.name}_{calendar.year}.txt"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        return response
