from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Sum, Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Hostel, HostelRoom, HostelAllocation, HostelFee,
    HostelAttendance, HostelVisitor, HostelMessMenu
)
from .serializers import (
    HostelSerializer, HostelRoomSerializer, HostelAllocationSerializer,
    HostelFeeSerializer, HostelAttendanceSerializer, HostelVisitorSerializer,
    HostelMessMenuSerializer, BulkAttendanceSerializer
)
from .permissions import IsSchoolMember


class HostelViewSet(viewsets.ModelViewSet):
    serializer_class = HostelSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'type', 'is_active']

    def get_queryset(self):
        return Hostel.objects.filter(school=self.request.user.school)

    @action(detail=True, methods=['get'])
    def rooms(self, request, pk=None):
        hostel = self.get_object()
        rooms = HostelRoom.objects.filter(hostel=hostel)
        serializer = HostelRoomSerializer(rooms, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def occupancy(self, request, pk=None):
        hostel = self.get_object()
        rooms = HostelRoom.objects.filter(hostel=hostel)

        by_type = rooms.values('room_type').annotate(
            total_rooms=Count('id'),
            total_capacity=Sum('capacity'),
            total_occupied=Sum('occupied')
        )

        return Response({
            'hostel': hostel.name,
            'total_rooms': rooms.count(),
            'total_capacity': hostel.capacity,
            'total_occupied': hostel.occupied_rooms,
            'occupancy_percentage': hostel.occupancy_percentage,
            'by_room_type': list(by_type)
        })


class HostelRoomViewSet(viewsets.ModelViewSet):
    serializer_class = HostelRoomSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hostel', 'floor', 'room_type', 'is_active']

    def get_queryset(self):
        return HostelRoom.objects.filter(
            hostel__school=self.request.user.school
        ).select_related('hostel')

    @action(detail=False, methods=['get'])
    def available(self, request):
        hostel_id = request.query_params.get('hostel')
        queryset = self.get_queryset().filter(is_active=True)

        if hostel_id:
            queryset = queryset.filter(hostel_id=hostel_id)

        available_rooms = []
        for room in queryset:
            if room.available_beds > 0:
                available_rooms.append({
                    'id': room.id,
                    'hostel': room.hostel.id,
                    'hostel_name': room.hostel.name,
                    'room_number': room.room_number,
                    'room_type': room.room_type,
                    'capacity': room.capacity,
                    'occupied': room.occupied,
                    'available_beds': room.available_beds,
                    'monthly_fee': float(room.monthly_fee)
                })

        return Response(available_rooms)


class HostelAllocationViewSet(viewsets.ModelViewSet):
    serializer_class = HostelAllocationSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hostel', 'room', 'student', 'academic_year', 'status']

    def get_queryset(self):
        return HostelAllocation.objects.filter(
            hostel__school=self.request.user.school
        ).select_related('hostel', 'room', 'student', 'academic_year')

    def perform_create(self, serializer):
        allocation = serializer.save()
        room = allocation.room
        room.occupied += 1
        room.save()

    @action(detail=True, methods=['post'])
    def vacate(self, request, pk=None):
        allocation = self.get_object()
        if allocation.status != 'active':
            return Response(
                {'error': 'Only active allocations can be vacated'},
                status=status.HTTP_400_BAD_REQUEST
            )

        allocation.status = 'vacated'
        allocation.allocated_to = timezone.now().date()
        allocation.save()

        room = allocation.room
        room.occupied = max(0, room.occupied - 1)
        room.save()

        return Response({'status': 'vacated'})

    @action(detail=True, methods=['post'])
    def transfer(self, request, pk=None):
        allocation = self.get_object()
        new_room_id = request.data.get('new_room_id')

        if not new_room_id:
            return Response(
                {'error': 'new_room_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if allocation.status != 'active':
            return Response(
                {'error': 'Only active allocations can be transferred'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            new_room = HostelRoom.objects.get(
                id=new_room_id,
                hostel__school=request.user.school
            )
        except HostelRoom.DoesNotExist:
            return Response(
                {'error': 'Room not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if new_room.is_full:
            return Response(
                {'error': 'Target room is full'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_room = allocation.room
        old_room.occupied = max(0, old_room.occupied - 1)
        old_room.save()

        allocation.room = new_room
        allocation.status = 'active'
        allocation.remarks = request.data.get('remarks', allocation.remarks)
        allocation.save()

        new_room.occupied += 1
        new_room.save()

        return Response({'status': 'transferred'})


class HostelFeeViewSet(viewsets.ModelViewSet):
    serializer_class = HostelFeeSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hostel', 'academic_year', 'room_type', 'is_active']

    def get_queryset(self):
        return HostelFee.objects.filter(
            hostel__school=self.request.user.school
        ).select_related('hostel', 'academic_year')


class HostelAttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = HostelAttendanceSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hostel', 'student', 'date', 'status']

    def get_queryset(self):
        return HostelAttendance.objects.filter(
            hostel__school=self.request.user.school
        ).select_related('student')

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        attendance_data = data['attendance']
        date = data['date']

        created = []
        for item in attendance_data:
            student_id = item.get('student_id')
            att_status = item.get('status')
            check_in_time = item.get('check_in_time')
            check_out_time = item.get('check_out_time')
            remarks = item.get('remarks', '')

            obj, was_created = HostelAttendance.objects.update_or_create(
                student_id=student_id,
                date=date,
                defaults={
                    'hostel': request.user.school.hostels.first(),
                    'status': att_status,
                    'check_in_time': check_in_time,
                    'check_out_time': check_out_time,
                    'remarks': remarks
                }
            )
            if was_created:
                created.append(obj.id)

        return Response({
            'created_count': len(created),
            'created_ids': created
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='student/(?P<student_id>[^/.]+)')
    def student_attendance(self, request, student_id=None):
        attendances = self.get_queryset().filter(student_id=student_id)
        serializer = self.get_serializer(attendances, many=True)
        return Response(serializer.data)


class HostelVisitorViewSet(viewsets.ModelViewSet):
    serializer_class = HostelVisitorSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hostel', 'student', 'visit_date']

    def get_queryset(self):
        return HostelVisitor.objects.filter(
            hostel__school=self.request.user.school
        ).select_related('student')


class HostelMessMenuViewSet(viewsets.ModelViewSet):
    serializer_class = HostelMessMenuSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hostel', 'day_of_week', 'meal_type', 'date']

    def get_queryset(self):
        return HostelMessMenu.objects.filter(
            hostel__school=self.request.user.school
        ).select_related('hostel')


class HostelReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        report_type = request.query_params.get('type', 'occupancy')

        if report_type == 'occupancy':
            return self.occupancy_report(request)
        elif report_type == 'fee-collection':
            return self.fee_collection_report(request)
        else:
            return Response({'error': 'Invalid report type'}, status=400)

    def occupancy_report(self, request):
        school = request.user.school
        hostels = Hostel.objects.filter(school=school, is_active=True)

        data = []
        for hostel in hostels:
            rooms = HostelRoom.objects.filter(hostel=hostel)
            data.append({
                'hostel_id': hostel.id,
                'hostel_name': hostel.name,
                'hostel_type': hostel.type,
                'total_rooms': rooms.count(),
                'total_capacity': hostel.capacity,
                'total_occupied': hostel.occupied_rooms,
                'occupancy_percentage': hostel.occupancy_percentage,
                'by_room_type': list(rooms.values('room_type').annotate(
                    count=Count('id'),
                    capacity=Sum('capacity'),
                    occupied=Sum('occupied')
                ))
            })

        return Response({
            'report_type': 'occupancy',
            'hostels': data
        })

    def fee_collection_report(self, request):
        school = request.user.school
        academic_year_id = request.query_params.get('academic_year')

        allocations = HostelAllocation.objects.filter(
            hostel__school=school,
            status='active'
        )

        if academic_year_id:
            allocations = allocations.filter(academic_year_id=academic_year_id)

        total_allocations = allocations.count()
        total_fee = allocations.aggregate(
            total=Sum('room__monthly_fee')
        )['total'] or 0

        by_hostel = allocations.values(
            'hostel__id', 'hostel__name'
        ).annotate(
            count=Count('id'),
            monthly_fee=Sum('room__monthly_fee')
        )

        return Response({
            'report_type': 'fee-collection',
            'total_allocations': total_allocations,
            'total_monthly_fee': float(total_fee),
            'by_hostel': list(by_hostel)
        })
