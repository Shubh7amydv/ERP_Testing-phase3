from django.utils import timezone
from rest_framework import serializers

from .models import EventType, Event, ExamEvent, SchoolCalendar


class EventTypeSerializer(serializers.ModelSerializer):
    event_count = serializers.SerializerMethodField()

    class Meta:
        model = EventType
        fields = [
            "id",
            "school",
            "name",
            "color",
            "is_active",
            "created_at",
            "event_count",
        ]
        read_only_fields = ("id", "created_at")

    def get_event_count(self, obj):
        return obj.events.filter(is_active=True).count()

    def validate_name(self, value):
        school = self.context["request"].user.school
        qs = EventType.objects.filter(school=school, name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Event type with this name already exists.")
        return value


class EventSerializer(serializers.ModelSerializer):
    event_type_name = serializers.CharField(
        source="event_type.name", read_only=True
    )
    event_type_color = serializers.CharField(
        source="event_type.color", read_only=True
    )
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "school",
            "event_type",
            "event_type_name",
            "event_type_color",
            "title",
            "description",
            "start_date",
            "end_date",
            "location",
            "is_holiday",
            "target_audience",
            "created_by",
            "created_by_name",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def get_created_by_name(self, obj):
        user = obj.created_by
        if user.first_name or user.last_name:
            return f"{user.first_name} {user.last_name}".strip()
        return user.email

    def validate(self, data):
        if data.get("start_date") and data.get("end_date"):
            if data["end_date"] <= data["start_date"]:
                raise serializers.ValidationError(
                    {"end_date": "End date must be after start date."}
                )
        return data


class ExamEventSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(
        source="event.title", read_only=True
    )
    exam_name = serializers.CharField(
        source="exam.name", read_only=True, default=None
    )

    class Meta:
        model = ExamEvent
        fields = [
            "id",
            "event",
            "event_title",
            "exam",
            "exam_name",
            "classes",
        ]
        read_only_fields = ("id",)


class SchoolCalendarSerializer(serializers.ModelSerializer):
    academic_year_name = serializers.CharField(
        source="academic_year.name", read_only=True
    )
    events_count = serializers.SerializerMethodField()

    class Meta:
        model = SchoolCalendar
        fields = [
            "id",
            "school",
            "academic_year",
            "academic_year_name",
            "name",
            "year",
            "is_published",
            "published_at",
            "created_at",
            "events_count",
        ]
        read_only_fields = ("id", "created_at", "published_at")

    def get_events_count(self, obj):
        return Event.objects.filter(
            school=obj.school,
            start_date__year=obj.year,
            is_active=True,
        ).count()
