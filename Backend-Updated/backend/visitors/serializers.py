from django.utils import timezone
from rest_framework import serializers

from .models import VisitorCategory, Visitor, VisitorPass


class VisitorCategorySerializer(serializers.ModelSerializer):
    visitor_count = serializers.SerializerMethodField()

    class Meta:
        model = VisitorCategory
        fields = [
            "id",
            "school",
            "name",
            "badge_color",
            "is_active",
            "created_at",
            "visitor_count",
        ]
        read_only_fields = ("id", "created_at")

    def get_visitor_count(self, obj):
        return obj.visitors.count()

    def validate_name(self, value):
        school = self.context["request"].user.school
        qs = VisitorCategory.objects.filter(school=school, name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Visitor category with this name already exists.")
        return value


class VisitorPassSerializer(serializers.ModelSerializer):
    visitor_name = serializers.CharField(
        source="visitor.name", read_only=True
    )

    class Meta:
        model = VisitorPass
        fields = [
            "id",
            "school",
            "visitor",
            "visitor_name",
            "pass_no",
            "valid_from",
            "valid_to",
            "purpose",
            "is_active",
            "created_at",
        ]
        read_only_fields = ("id", "created_at")

    def validate(self, data):
        if data.get("valid_from") and data.get("valid_to"):
            if data["valid_to"] <= data["valid_from"]:
                raise serializers.ValidationError(
                    {"valid_to": "Valid to must be after valid from."}
                )
        return data


class VisitorSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name", read_only=True
    )
    category_color = serializers.CharField(
        source="category.badge_color", read_only=True
    )
    approved_by_name = serializers.SerializerMethodField()
    is_inside = serializers.BooleanField(read_only=True)
    passes = VisitorPassSerializer(many=True, read_only=True)

    class Meta:
        model = Visitor
        fields = [
            "id",
            "school",
            "name",
            "phone",
            "category",
            "category_name",
            "category_color",
            "id_type",
            "id_number",
            "photo",
            "purpose",
            "meeting_with",
            "meeting_with_type",
            "badge_no",
            "check_in",
            "check_out",
            "vehicle_no",
            "items_carrying",
            "remarks",
            "approved_by",
            "approved_by_name",
            "is_inside",
            "passes",
            "created_at",
        ]
        read_only_fields = ("id", "created_at")

    def get_approved_by_name(self, obj):
        if not obj.approved_by:
            return None
        user = obj.approved_by
        if user.first_name or user.last_name:
            return f"{user.first_name} {user.last_name}".strip()
        return user.email
