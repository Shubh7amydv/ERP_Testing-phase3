from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Department, Designation, Staff, StaffAttendance,
    LeaveType, StaffLeave, PayrollMonth, SalarySlip, SalaryComponent,
)
from .serializers import (
    DepartmentSerializer, DesignationSerializer, StaffSerializer,
    StaffListSerializer, StaffAttendanceSerializer, LeaveTypeSerializer,
    StaffLeaveSerializer, PayrollMonthSerializer, SalarySlipSerializer,
    SalaryComponentSerializer, BulkAttendanceSerializer,
)
from .permissions import IsSchoolMember, ModulePermission


# ─── Department ──────────────────────────────────────────────────

class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsSchoolMember, ModulePermission("hr")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        return Department.objects.filter(school=self.request.user.school)


# ─── Designation ─────────────────────────────────────────────────

class DesignationViewSet(viewsets.ModelViewSet):
    serializer_class = DesignationSerializer
    permission_classes = [IsSchoolMember, ModulePermission("hr")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        return Designation.objects.filter(school=self.request.user.school)


# ─── Staff ───────────────────────────────────────────────────────

class StaffViewSet(viewsets.ModelViewSet):
    serializer_class = StaffSerializer
    permission_classes = [IsSchoolMember, ModulePermission("hr")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'department', 'designation', 'status', 'is_active']

    def get_queryset(self):
        queryset = Staff.objects.filter(
            school=self.request.user.school,
        ).select_related('department', 'designation')
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(employee_id__icontains=search) |
                Q(phone__icontains=search)
            )
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return StaffListSerializer
        return StaffSerializer

    @action(detail=True, methods=['get'])
    def attendance(self, request, pk=None):
        staff = self.get_object()
        attendances = StaffAttendance.objects.filter(staff=staff).order_by('-date')[:30]
        serializer = StaffAttendanceSerializer(attendances, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def leaves(self, request, pk=None):
        staff = self.get_object()
        leaves = StaffLeave.objects.filter(staff=staff).order_by('-created_at')
        serializer = StaffLeaveSerializer(leaves, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def salary_history(self, request, pk=None):
        staff = self.get_object()
        slips = SalarySlip.objects.filter(staff=staff).order_by(
            '-payroll_month__year', '-payroll_month__month',
        )
        serializer = SalarySlipSerializer(slips, many=True)
        return Response(serializer.data)


# ─── Staff Attendance ────────────────────────────────────────────

class StaffAttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = StaffAttendanceSerializer
    permission_classes = [IsSchoolMember, ModulePermission("hr")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'staff', 'date', 'status']

    def get_queryset(self):
        return StaffAttendance.objects.filter(
            school=self.request.user.school,
        ).select_related('staff')

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        attendance_data = data['attendance']
        att_date = data['date']

        created = []
        for item in attendance_data:
            staff_id = item.get('staff_id')
            staff_status = item.get('status')
            check_in = item.get('check_in')
            check_out = item.get('check_out')
            overtime = item.get('overtime_hours', 0)
            remarks = item.get('remarks', '')

            obj, was_created = StaffAttendance.objects.update_or_create(
                staff_id=staff_id,
                date=att_date,
                defaults={
                    'school': request.user.school,
                    'status': staff_status,
                    'check_in': check_in,
                    'check_out': check_out,
                    'overtime_hours': overtime,
                    'remarks': remarks,
                },
            )
            if was_created:
                created.append(obj.id)

        return Response(
            {'created_count': len(created), 'created_ids': created},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['get'])
    def today(self, request):
        today = timezone.now().date()
        attendances = self.get_queryset().filter(date=today)
        serializer = self.get_serializer(attendances, many=True)
        return Response(serializer.data)


# ─── Leave Type ──────────────────────────────────────────────────

class LeaveTypeViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsSchoolMember, ModulePermission("hr")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        return LeaveType.objects.filter(school=self.request.user.school)


# ─── Staff Leave ─────────────────────────────────────────────────

class StaffLeaveViewSet(viewsets.ModelViewSet):
    serializer_class = StaffLeaveSerializer
    permission_classes = [IsSchoolMember, ModulePermission("hr")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'staff', 'leave_type', 'status']

    def get_queryset(self):
        return StaffLeave.objects.filter(
            school=self.request.user.school,
        ).select_related('staff', 'leave_type', 'approved_by')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        if leave.status != 'pending':
            return Response(
                {'error': 'Only pending leaves can be approved'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        leave.status = 'approved'
        leave.approved_by = request.user
        leave.remarks = request.data.get('remarks', '')
        leave.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        if leave.status != 'pending':
            return Response(
                {'error': 'Only pending leaves can be rejected'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        leave.status = 'rejected'
        leave.approved_by = request.user
        leave.remarks = request.data.get('remarks', '')
        leave.save()
        return Response({'status': 'rejected'})

    @action(detail=False, methods=['get'], url_path=r'balance/(?P<staff_id>[^/.]+)')
    def balance(self, request, staff_id=None):
        current_year = timezone.now().year
        leave_types = LeaveType.objects.filter(
            school=request.user.school,
            is_active=True,
        )

        balance = []
        for lt in leave_types:
            taken = StaffLeave.objects.filter(
                staff_id=staff_id,
                leave_type=lt,
                status='approved',
                start_date__year=current_year,
            ).aggregate(total=Sum('total_days'))['total'] or 0

            balance.append({
                'leave_type_id': lt.id,
                'leave_type_name': lt.name,
                'total_allowed': lt.days_per_year,
                'taken': float(taken),
                'remaining': float(lt.days_per_year - taken),
            })

        return Response(balance)


# ─── Payroll Month ───────────────────────────────────────────────

class PayrollMonthViewSet(viewsets.ModelViewSet):
    serializer_class = PayrollMonthSerializer
    permission_classes = [IsSchoolMember, ModulePermission("hr")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'month', 'year', 'status']

    def get_queryset(self):
        return PayrollMonth.objects.filter(
            school=self.request.user.school,
        ).select_related('processed_by')

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        payroll = self.get_object()
        if payroll.status not in ['draft', 'processing']:
            return Response(
                {'error': 'Only draft or processing payrolls can be processed'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        payroll.status = 'processing'
        payroll.processed_by = request.user
        payroll.processed_at = timezone.now()
        payroll.save()
        return Response({'status': 'processing'})

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        payroll = self.get_object()
        if payroll.status != 'paid':
            return Response(
                {'error': 'Only paid payrolls can be closed'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        payroll.status = 'closed'
        payroll.save()
        return Response({'status': 'closed'})


# ─── Salary Slip ─────────────────────────────────────────────────

class SalarySlipViewSet(viewsets.ModelViewSet):
    serializer_class = SalarySlipSerializer
    permission_classes = [IsSchoolMember, ModulePermission("hr")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'staff', 'payroll_month', 'payment_status']

    def get_queryset(self):
        return SalarySlip.objects.filter(
            school=self.request.user.school,
        ).select_related('staff', 'payroll_month')

    @action(detail=False, methods=['post'])
    def generate(self, request):
        payroll_month_id = request.data.get('payroll_month')
        if not payroll_month_id:
            return Response(
                {'error': 'payroll_month is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payroll_month = PayrollMonth.objects.get(
                id=payroll_month_id,
                school=request.user.school,
            )
        except PayrollMonth.DoesNotExist:
            return Response(
                {'error': 'Payroll month not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        active_staff = Staff.objects.filter(
            school=request.user.school,
            is_active=True,
            status='active',
        )

        created = []
        for s in active_staff:
            slip, was_created = SalarySlip.objects.get_or_create(
                staff=s,
                payroll_month=payroll_month,
                defaults={
                    'school': request.user.school,
                    'basic_salary': s.basic_salary,
                    'hra': 0,
                    'da': 0,
                    'conveyance': 0,
                    'medical': 0,
                    'other_allowances': 0,
                    'gross_salary': s.basic_salary,
                    'pf': 0,
                    'esi': 0,
                    'tds': 0,
                    'professional_tax': 0,
                    'other_deductions': 0,
                    'total_deductions': 0,
                    'net_salary': s.basic_salary,
                },
            )
            if was_created:
                created.append(slip.id)

        return Response(
            {'created_count': len(created), 'created_ids': created},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['get'], url_path=r'by-staff/(?P<staff_id>[^/.]+)')
    def by_staff(self, request, staff_id=None):
        slips = self.get_queryset().filter(staff_id=staff_id)
        serializer = self.get_serializer(slips, many=True)
        return Response(serializer.data)


# ─── Salary Component ────────────────────────────────────────────

class SalaryComponentViewSet(viewsets.ModelViewSet):
    serializer_class = SalaryComponentSerializer
    permission_classes = [IsSchoolMember, ModulePermission("hr")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'type', 'is_active']

    def get_queryset(self):
        return SalaryComponent.objects.filter(school=self.request.user.school)


# ─── HR Reports ──────────────────────────────────────────────────

class StaffListReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        department_id = request.query_params.get('department')
        staff_status = request.query_params.get('status', 'active')

        staff = Staff.objects.filter(school=school, is_active=True)
        if department_id:
            staff = staff.filter(department_id=department_id)
        if staff_status:
            staff = staff.filter(status=staff_status)

        report = staff.values(
            'department__name', 'designation__name',
        ).annotate(
            count=Count('id'),
        ).order_by('department__name')

        total = staff.count()
        total_salary = staff.aggregate(total=Sum('basic_salary'))['total'] or 0

        return Response({
            'total_staff': total,
            'total_monthly_salary': float(total_salary),
            'by_department_designation': list(report),
        })


class PayrollSummaryReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)

        payroll = PayrollMonth.objects.filter(
            school=school, month=month, year=year,
        ).first()

        if not payroll:
            return Response({'error': 'No payroll found for this period'}, status=404)

        slips = SalarySlip.objects.filter(payroll_month=payroll)
        summary = slips.aggregate(
            total_gross=Sum('gross_salary'),
            total_deductions=Sum('total_deductions'),
            total_net=Sum('net_salary'),
            total_pf=Sum('pf'),
            total_esi=Sum('esi'),
            total_tds=Sum('tds'),
        )

        return Response({
            'month': month,
            'year': year,
            'status': payroll.status,
            'total_staff': slips.count(),
            'summary': {k: float(v) if v else 0 for k, v in summary.items()},
        })


class AttendanceSummaryReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))

        from calendar import monthrange
        from datetime import date as date_cls

        _, days_in_month = monthrange(year, month)
        start_date = date_cls(year, month, 1)
        end_date = date_cls(year, month, days_in_month)

        attendances = StaffAttendance.objects.filter(
            school=school,
            date__range=[start_date, end_date],
        )

        summary = attendances.aggregate(
            total_records=Count('id'),
            present=Count('id', filter=Q(status='present')),
            absent=Count('id', filter=Q(status='absent')),
            late=Count('id', filter=Q(status='late')),
            half_day=Count('id', filter=Q(status='half_day')),
            leave=Count('id', filter=Q(status='leave')),
        )

        return Response({
            'month': month,
            'year': year,
            'days_in_month': days_in_month,
            'summary': summary,
        })


class LeaveSummaryReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        year = int(request.query_params.get('year', timezone.now().year))

        leaves = StaffLeave.objects.filter(
            school=school,
            start_date__year=year,
        )

        summary = leaves.values(
            'leave_type__name',
        ).annotate(
            total_applications=Count('id'),
            approved=Count('id', filter=Q(status='approved')),
            rejected=Count('id', filter=Q(status='rejected')),
            pending=Count('id', filter=Q(status='pending')),
            total_days=Sum('total_days'),
        ).order_by('leave_type__name')

        return Response({
            'year': year,
            'summary': list(summary),
        })


class PFReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)

        payroll = PayrollMonth.objects.filter(
            school=school, month=month, year=year,
        ).first()

        if not payroll:
            return Response({'error': 'No payroll found'}, status=404)

        slips = SalarySlip.objects.filter(payroll_month=payroll)
        total_pf = slips.aggregate(total=Sum('pf'))['total'] or 0

        return Response({
            'month': month,
            'year': year,
            'total_pf_contribution': float(total_pf),
            'employee_share': float(total_pf / 2),
            'employer_share': float(total_pf / 2),
        })


class ESIReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)

        payroll = PayrollMonth.objects.filter(
            school=school, month=month, year=year,
        ).first()

        if not payroll:
            return Response({'error': 'No payroll found'}, status=404)

        slips = SalarySlip.objects.filter(payroll_month=payroll)
        total_esi = slips.aggregate(total=Sum('esi'))['total'] or 0

        return Response({
            'month': month,
            'year': year,
            'total_esi_contribution': float(total_esi),
            'employee_share': float(total_esi * 0.75),
            'employer_share': float(total_esi * 0.25),
        })
