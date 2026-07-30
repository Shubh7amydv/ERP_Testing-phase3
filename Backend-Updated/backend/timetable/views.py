from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    TimeSlot, Timetable, TimetableEntry,
    TeacherTimetable, SubstituteTeacher, Room,
)
from .serializers import (
    TimeSlotSerializer, TimetableSerializer, TimetableEntrySerializer,
    TeacherTimetableSerializer, SubstituteTeacherSerializer, RoomSerializer,
    BulkTimetableEntrySerializer,
)
from .permissions import IsSchoolMember, ModulePermission


class TimeSlotViewSet(viewsets.ModelViewSet):
    serializer_class = TimeSlotSerializer
    permission_classes = [IsSchoolMember, ModulePermission("timetable")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_break', 'is_active']

    def get_queryset(self):
        qs = TimeSlot.objects.all()
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        return qs.order_by('slot_order')


class TimetableViewSet(viewsets.ModelViewSet):
    serializer_class = TimetableSerializer
    permission_classes = [IsSchoolMember, ModulePermission("timetable")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'academic_year', 'class_obj', 'section', 'is_active']

    def get_queryset(self):
        qs = Timetable.objects.select_related(
            'academic_year', 'class_obj', 'section'
        ).all()
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        return qs.order_by('-effective_from')

    @action(detail=True, methods=['get'], url_path='entries')
    def entries(self, request, pk=None):
        timetable = self.get_object()
        entries = TimetableEntry.objects.filter(
            timetable=timetable
        ).select_related('time_slot', 'subject', 'teacher')

        day_filter = request.query_params.get('day')
        if day_filter:
            entries = entries.filter(day_of_week=day_filter)

        serializer = TimetableEntrySerializer(entries, many=True)
        return Response({'success': True, 'data': serializer.data})

    @action(detail=False, methods=['get'], url_path='class-timetable')
    def class_timetable(self, request):
        school = getattr(request.user, 'school', None)
        class_id = request.query_params.get('class_id')
        section_id = request.query_params.get('section_id')
        day = request.query_params.get('day')

        if not class_id or not section_id:
            return Response(
                {'success': False, 'message': 'class_id and section_id are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        timetable = Timetable.objects.filter(
            class_obj_id=class_id,
            section_id=section_id,
            is_active=True,
        )
        if school:
            timetable = timetable.filter(school=school)
        timetable = timetable.first()

        if not timetable:
            return Response(
                {'success': False, 'message': 'No active timetable found for this class/section.'},
                status=status.HTTP_404_NOT_FOUND
            )

        entries = TimetableEntry.objects.filter(
            timetable=timetable, is_active=True
        ).select_related('time_slot', 'subject', 'teacher')

        if day:
            entries = entries.filter(day_of_week=day)

        serializer = TimetableEntrySerializer(entries, many=True)
        return Response({
            'success': True,
            'timetable': TimetableSerializer(timetable).data,
            'data': serializer.data,
        })


class TimetableEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TimetableEntrySerializer
    permission_classes = [IsSchoolMember, ModulePermission("timetable")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['timetable', 'day_of_week', 'time_slot', 'subject', 'teacher', 'is_active']

    def get_queryset(self):
        qs = TimetableEntry.objects.select_related(
            'timetable', 'time_slot', 'subject', 'teacher'
        ).all()
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(timetable__school=school)
        return qs

    @action(detail=False, methods=['post'], url_path='bulk-create')
    def bulk_create(self, request):
        serializer = BulkTimetableEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        timetable_id = serializer.validated_data['timetable_id']
        entries_data = serializer.validated_data['entries']

        try:
            timetable = Timetable.objects.get(id=timetable_id)
        except Timetable.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Timetable not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        school = getattr(request.user, 'school', None)
        if school and timetable.school_id != school.id:
            return Response(
                {'success': False, 'message': 'Timetable does not belong to your school.'},
                status=status.HTTP_403_FORBIDDEN
            )

        created = []
        errors = []

        with transaction.atomic():
            for idx, entry_data in enumerate(entries_data):
                entry_data['timetable'] = timetable_id
                entry_serializer = TimetableEntrySerializer(data=entry_data)
                if entry_serializer.is_valid():
                    entry_serializer.save()
                    created.append(entry_serializer.data)
                else:
                    errors.append({'index': idx, 'errors': entry_serializer.errors})

        return Response({
            'success': True,
            'created_count': len(created),
            'created': created,
            'errors': errors,
        }, status=status.HTTP_201_CREATED)


class TeacherTimetableViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherTimetableSerializer
    permission_classes = [IsSchoolMember, ModulePermission("timetable")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['teacher', 'day_of_week', 'class_obj', 'section', 'subject', 'is_active']

    def get_queryset(self):
        qs = TeacherTimetable.objects.select_related(
            'teacher', 'time_slot', 'class_obj', 'section', 'subject'
        ).all()
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(teacher__school_id=school.id) if school.id else qs
        return qs

    @action(detail=False, methods=['get'], url_path=r'teacher/(?P<teacher_id>[^/.]+)')
    def teacher_schedule(self, request, teacher_id=None):
        day = request.query_params.get('day')

        entries = TeacherTimetable.objects.filter(
            teacher_id=teacher_id, is_active=True
        ).select_related('time_slot', 'class_obj', 'section', 'subject')

        if day:
            entries = entries.filter(day_of_week=day)

        serializer = TeacherTimetableSerializer(entries, many=True)
        return Response({'success': True, 'data': serializer.data})


class SubstituteTeacherViewSet(viewsets.ModelViewSet):
    serializer_class = SubstituteTeacherSerializer
    permission_classes = [IsSchoolMember, ModulePermission("timetable")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'date', 'original_teacher', 'substitute_teacher']

    def get_queryset(self):
        qs = SubstituteTeacher.objects.select_related(
            'original_teacher', 'substitute_teacher', 'timetable_entry', 'approved_by'
        ).all()
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        return qs.order_by('-date')

    def perform_create(self, serializer):
        serializer.save(approved_by=self.request.user)


class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    permission_classes = [IsSchoolMember, ModulePermission("timetable")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'room_type', 'is_active']

    def get_queryset(self):
        qs = Room.objects.all()
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        return qs.order_by('room_no')
