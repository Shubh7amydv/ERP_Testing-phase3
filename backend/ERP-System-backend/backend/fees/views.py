from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F, Q, Prefetch

from .models import (
    FeeCategory, FeeHead, FeeStructure, StudentFeeAssignment,
    FeePayment, FeeReceipt, Fine, FeeDueReminder, StudentFeeInstallmentPaid,
)
from .serializers import (
    FeeCategorySerializer, FeeHeadSerializer, FeeStructureSerializer,
    StudentFeeAssignmentSerializer, FeePaymentSerializer, FeeReceiptSerializer,
    FineSerializer, FeeDueReminderSerializer, StudentFeeInstallmentPaidSerializer,
)
from .permissions import IsSchoolMember, ModulePermission


# ─── Fee Category ───────────────────────────────────────────────

class FeeCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = FeeCategorySerializer
    permission_classes = [IsSchoolMember, ModulePermission("fees")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        return FeeCategory.objects.filter(school=self.request.user.school)


# ─── Fee Head ───────────────────────────────────────────────────

class FeeHeadViewSet(viewsets.ModelViewSet):
    serializer_class = FeeHeadSerializer
    permission_classes = [IsSchoolMember, ModulePermission("fees")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'category', 'is_active']

    def get_queryset(self):
        return FeeHead.objects.filter(school=self.request.user.school)


# ─── Fee Structure ──────────────────────────────────────────────

class FeeStructureViewSet(viewsets.ModelViewSet):
    serializer_class = FeeStructureSerializer
    permission_classes = [IsSchoolMember, ModulePermission("fees")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'academic_year', 'class_obj', 'is_active']

    def get_queryset(self):
        return FeeStructure.objects.filter(school=self.request.user.school)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        academic_year_id = request.data.get('academic_year')
        fee_head_id = request.data.get('fee_head')
        amount = request.data.get('amount')
        class_ids = request.data.get('class_ids', [])

        if not all([academic_year_id, fee_head_id, amount, class_ids]):
            return Response(
                {'error': 'academic_year, fee_head, amount, and class_ids are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created = []
        for class_id in class_ids:
            obj, was_created = FeeStructure.objects.get_or_create(
                school=request.user.school,
                academic_year_id=academic_year_id,
                class_obj_id=class_id,
                fee_head_id=fee_head_id,
                defaults={'amount': amount},
            )
            if was_created:
                created.append(obj.id)

        return Response(
            {'created_count': len(created), 'created_ids': created},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['get'], url_path=r'by-class/(?P<class_id>[^/.]+)')
    def by_class(self, request, class_id=None):
        structures = self.get_queryset().filter(class_obj_id=class_id)
        serializer = self.get_serializer(structures, many=True)
        return Response(serializer.data)


# ─── Student Fee Assignment ─────────────────────────────────────

class StudentFeeAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentFeeAssignmentSerializer
    permission_classes = [IsSchoolMember, ModulePermission("fees")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'student', 'fee_structure', 'is_active']

    def get_queryset(self):
        return StudentFeeAssignment.objects.filter(
            school=self.request.user.school,
        ).select_related('student', 'fee_structure', 'fee_structure__fee_head')

    @action(detail=False, methods=['post'])
    def bulk_assign(self, request):
        class_id = request.data.get('class_id')
        fee_structure_id = request.data.get('fee_structure_id')

        if not all([class_id, fee_structure_id]):
            return Response(
                {'error': 'class_id and fee_structure_id are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from students.models import Admission
        students = Admission.objects.filter(admission_class_id=class_id, is_active=True)
        fee_structure = FeeStructure.objects.get(id=fee_structure_id)

        created = []
        for student in students:
            obj, was_created = StudentFeeAssignment.objects.get_or_create(
                student=student,
                fee_structure=fee_structure,
                defaults={
                    'school': request.user.school,
                    'override_amount': fee_structure.amount,
                },
            )
            if was_created:
                created.append(obj.id)

        return Response(
            {'created_count': len(created), 'created_ids': created},
            status=status.HTTP_201_CREATED,
        )


# ─── Fee Payment ────────────────────────────────────────────────

class FeePaymentViewSet(viewsets.ModelViewSet):
    serializer_class = FeePaymentSerializer
    permission_classes = [IsSchoolMember, ModulePermission("fees")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'student', 'fee_structure', 'payment_mode', 'is_verified']

    def get_queryset(self):
        return FeePayment.objects.filter(
            school=self.request.user.school,
        ).select_related('student', 'fee_structure', 'received_by', 'verified_by')

    def perform_create(self, serializer):
        serializer.save(received_by=self.request.user)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        payment = self.get_object()
        payment.is_verified = True
        payment.verified_by = request.user
        payment.save()
        return Response({'status': 'verified'})

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {'error': 'student_id query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        payments = self.get_queryset().filter(student_id=student_id)
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        assignments = StudentFeeAssignment.objects.filter(
            school=request.user.school,
            is_active=True,
        ).select_related('student', 'fee_structure', 'fee_structure__fee_head')

        pending_dues = []
        for assignment in assignments:
            total_paid = FeePayment.objects.filter(
                student=assignment.student,
                fee_structure=assignment.fee_structure,
            ).aggregate(total=Sum('amount_paid'))['total'] or 0

            outstanding = assignment.final_amount - total_paid
            if outstanding > 0:
                pending_dues.append({
                    'student_id': str(assignment.student.id),
                    'student_name': f"{assignment.student.first_name} {assignment.student.last_name}",
                    'fee_structure_id': assignment.fee_structure.id,
                    'fee_head': assignment.fee_structure.fee_head.name,
                    'total_amount': float(assignment.final_amount),
                    'total_paid': float(total_paid),
                    'outstanding': float(outstanding),
                })

        return Response(pending_dues)

    @action(detail=False, methods=['get'])
    def today(self, request):
        today = timezone.now().date()
        payments = self.get_queryset().filter(payment_date=today)
        serializer = self.get_serializer(payments, many=True)
        total = payments.aggregate(total=Sum('amount_paid'))['total'] or 0

        return Response({
            'date': str(today),
            'total_collected': float(total),
            'payments': serializer.data,
        })


# ─── Fee Receipt ────────────────────────────────────────────────

class FeeReceiptViewSet(viewsets.ModelViewSet):
    serializer_class = FeeReceiptSerializer
    permission_classes = [IsSchoolMember, ModulePermission("fees")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'payment']

    def get_queryset(self):
        return FeeReceipt.objects.filter(
            school=self.request.user.school,
        ).select_related('payment', 'payment__student', 'generated_by')

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        receipt = self.get_object()
        if receipt.pdf_file:
            return Response({'pdf_url': receipt.pdf_file.url})
        return Response(
            {'error': 'PDF not generated yet'},
            status=status.HTTP_404_NOT_FOUND,
        )

    @action(detail=True, methods=['post'])
    def resend(self, request, pk=None):
        receipt = self.get_object()
        via = request.data.get('via', 'email')

        if via == 'email':
            # TODO: Implement email sending
            receipt.sent_via_email = True
        elif via == 'sms':
            # TODO: Implement SMS sending
            receipt.sent_via_sms = True

        receipt.save()
        return Response({'status': f'sent via {via}'})


# ─── Fine ───────────────────────────────────────────────────────

class FineViewSet(viewsets.ModelViewSet):
    serializer_class = FineSerializer
    permission_classes = [IsSchoolMember, ModulePermission("fees")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'student', 'is_waived']

    def get_queryset(self):
        return Fine.objects.filter(
            school=self.request.user.school,
        ).select_related('student', 'fee_payment', 'waived_by')

    @action(detail=True, methods=['post'])
    def waive(self, request, pk=None):
        fine = self.get_object()
        fine.is_waived = True
        fine.waived_by = request.user
        fine.waived_reason = request.data.get('reason', '')
        fine.save()
        return Response({'status': 'waived'})


# ─── Fee Due Reminder ───────────────────────────────────────────

class FeeDueReminderViewSet(viewsets.ModelViewSet):
    serializer_class = FeeDueReminderSerializer
    permission_classes = [IsSchoolMember, ModulePermission("fees")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'student', 'reminder_sent']

    def get_queryset(self):
        return FeeDueReminder.objects.filter(
            school=self.request.user.school,
        ).select_related('student', 'fee_structure')

    @action(detail=False, methods=['post'])
    def generate(self, request):
        academic_year_id = request.data.get('academic_year')
        if not academic_year_id:
            return Response(
                {'error': 'academic_year is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assignments = StudentFeeAssignment.objects.filter(
            school=request.user.school,
            fee_structure__academic_year_id=academic_year_id,
            is_active=True,
        )

        created_count = 0
        for assignment in assignments:
            total_paid = FeePayment.objects.filter(
                student=assignment.student,
                fee_structure=assignment.fee_structure,
            ).aggregate(total=Sum('amount_paid'))['total'] or 0

            outstanding = assignment.final_amount - total_paid
            if outstanding > 0:
                FeeDueReminder.objects.get_or_create(
                    student=assignment.student,
                    fee_structure=assignment.fee_structure,
                    defaults={
                        'school': request.user.school,
                        'amount_due': outstanding,
                        'due_date': assignment.fee_structure.due_date or timezone.now().date(),
                    },
                )
                created_count += 1

        return Response({'created_count': created_count})

    @action(detail=False, methods=['post'])
    def send(self, request):
        pending = self.get_queryset().filter(reminder_sent=False)

        sent_count = 0
        for reminder in pending:
            # TODO: Implement actual email/SMS sending
            reminder.reminder_sent = True
            reminder.reminder_date = timezone.now()
            reminder.save()
            sent_count += 1

        return Response({'sent_count': sent_count})


# ─── Fee Reports ────────────────────────────────────────────────

class FeeCollectionReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        academic_year_id = request.query_params.get('academic_year')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        queryset = FeePayment.objects.filter(school=school)

        if academic_year_id:
            queryset = queryset.filter(fee_structure__academic_year_id=academic_year_id)
        if start_date and end_date:
            queryset = queryset.filter(payment_date__range=[start_date, end_date])

        total_collected = queryset.aggregate(total=Sum('amount_paid'))['total'] or 0
        total_payments = queryset.count()

        return Response({
            'total_collected': float(total_collected),
            'total_payments': total_payments,
        })


class PendingDuesReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        academic_year_id = request.query_params.get('academic_year')

        assignments = StudentFeeAssignment.objects.filter(
            school=school,
            is_active=True,
        )

        if academic_year_id:
            assignments = assignments.filter(fee_structure__academic_year_id=academic_year_id)

        total_outstanding = 0
        students_with_dues = 0

        for assignment in assignments:
            total_paid = FeePayment.objects.filter(
                student=assignment.student,
                fee_structure=assignment.fee_structure,
            ).aggregate(total=Sum('amount_paid'))['total'] or 0

            outstanding = assignment.final_amount - total_paid
            if outstanding > 0:
                total_outstanding += outstanding
                students_with_dues += 1

        return Response({
            'total_outstanding': float(total_outstanding),
            'students_with_dues': students_with_dues,
        })


class ClassWiseCollectionReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        academic_year_id = request.query_params.get('academic_year')

        from students.models import AcademicClass
        classes = AcademicClass.objects.filter(school_id=school.id)

        report = []
        for cls in classes:
            total_paid = FeePayment.objects.filter(
                school=school,
                student__admission_class_id=cls.id,
                fee_structure__academic_year_id=academic_year_id,
            ).aggregate(total=Sum('amount_paid'))['total'] or 0

            report.append({
                'class_id': cls.id,
                'class_name': cls.get_admission_class_display(),
                'total_collected': float(total_paid),
            })

        return Response(report)


class MonthlyCollectionReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        year = int(request.query_params.get('year', timezone.now().year))

        monthly_data = []
        for month in range(1, 13):
            total = FeePayment.objects.filter(
                school=school,
                payment_date__year=year,
                payment_date__month=month,
            ).aggregate(total=Sum('amount_paid'))['total'] or 0

            monthly_data.append({
                'month': month,
                'total_collected': float(total),
            })

        return Response(monthly_data)


class DailyCollectionReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        date = request.query_params.get('date', str(timezone.now().date()))

        payments = FeePayment.objects.filter(
            school=school,
            payment_date=date,
        )

        total = payments.aggregate(total=Sum('amount_paid'))['total'] or 0
        by_mode = list(
            payments.values('payment_mode').annotate(
                total=Sum('amount_paid'),
                count=Count('id'),
            )
        )

        return Response({
            'date': date,
            'total_collected': float(total),
            'total_payments': payments.count(),
            'by_payment_mode': by_mode,
        })


# ─── Student Fee Installment Paid ────────────────────────────────

class StudentFeeInstallmentPaidViewSet(viewsets.ModelViewSet):
    serializer_class = StudentFeeInstallmentPaidSerializer
    permission_classes = [IsSchoolMember, ModulePermission("fees")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'student', 'installment_number']

    def get_queryset(self):
        qs = StudentFeeInstallmentPaid.objects.select_related(
            'student'
        ).order_by('student', 'installment_number')
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        admission_id = self.request.query_params.get('student')
        if admission_id:
            qs = qs.filter(student_id=admission_id)
        return qs

    @action(detail=False, methods=['patch'], url_path='bulk-update')
    def bulk_update(self, request):
        from django.db import transaction
        from django.utils.timezone import now as tz_now

        data = request.data
        if not isinstance(data, list):
            return Response(
                {'success': False, 'message': 'Request body must be a list of objects.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        errors = []
        valid_items = []

        for item in data:
            student_id = item.get('student') or item.get('admission_id')
            installment_number = item.get('installment_number')
            if not student_id or installment_number is None:
                errors.append({
                    'student_id': student_id,
                    'installment_number': installment_number,
                    'errors': 'student and installment_number are required.',
                })
                continue
            valid_items.append(item)

        if not valid_items:
            return Response(
                {'success': True, 'updated': [], 'errors': errors},
                status=status.HTTP_200_OK
            )

        lookup_q = Q()
        for item in valid_items:
            student_id = item.get('student') or item.get('admission_id')
            lookup_q |= Q(student_id=student_id, installment_number=item['installment_number'])

        record_map = {
            (str(r.student_id), r.installment_number): r
            for r in StudentFeeInstallmentPaid.objects.filter(lookup_q).select_related('student')
        }

        current_time = tz_now()
        records_to_update = []

        for item in valid_items:
            student_id = str(item.get('student') or item.get('admission_id'))
            installment_number = item['installment_number']
            record = record_map.get((student_id, installment_number))

            if not record:
                errors.append({
                    'student_id': student_id,
                    'installment_number': installment_number,
                    'errors': 'Record not found.',
                })
                continue

            if 'amount_paid' in item:
                record.amount_paid = item['amount_paid']
            if 's_code' in item:
                record.s_code = item['s_code']
            record.updated_at = current_time
            records_to_update.append(record)

        if records_to_update:
            with transaction.atomic():
                StudentFeeInstallmentPaid.objects.bulk_update(
                    records_to_update,
                    ['amount_paid', 's_code', 'updated_at'],
                )

        serializer = self.get_serializer(records_to_update, many=True)
        return Response({
            'success': True,
            'updated': serializer.data,
            'errors': errors,
        }, status=status.HTTP_200_OK)


# ─── Installment Table Views ─────────────────────────────────────

class InstallmentTableView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("fees")]

    def get(self, request):
        from students.models import Admission

        year = request.query_params.get('year')
        admission_class = request.query_params.get('class')
        section = request.query_params.get('section')
        installment_number = request.query_params.get('installment_number')

        if not installment_number:
            return Response(
                {'success': False, 'message': 'installment_number query parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            installment_number = int(installment_number)
        except (TypeError, ValueError):
            return Response(
                {'success': False, 'message': 'installment_number must be a positive integer.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = (
            Admission.objects
            .filter(is_active=True)
            .select_related('admission_class__academic_year', 'section', 'caste', 'house', 'category')
        )

        if year:
            queryset = queryset.filter(admission_class__academic_year__year=year)
        if admission_class:
            queryset = queryset.filter(admission_class__admission_class=admission_class)
        if section:
            queryset = queryset.filter(section__section=section)

        admission_ids = queryset.values_list('id', flat=True)
        installments = StudentFeeInstallmentPaid.objects.filter(
            student_id__in=admission_ids,
            installment_number=installment_number,
        )
        installment_map = {str(inst.student_id): inst for inst in installments}

        results = []
        for admission in queryset:
            inst = installment_map.get(str(admission.id))
            results.append({
                'id': str(admission.id),
                'admission_no': admission.admission_no,
                'first_name': admission.first_name,
                'last_name': admission.last_name,
                'gender': admission.gender,
                'roll_number': admission.roll_number,
                'admission_class': admission.admission_class.admission_class if admission.admission_class else None,
                'section': admission.section.section if admission.section else None,
                'year': admission.admission_class.academic_year.year if admission.admission_class and admission.admission_class.academic_year else None,
                'phone': admission.phone,
                'installment': {
                    'installment_number': inst.installment_number if inst else installment_number,
                    'amount_paid': str(inst.amount_paid) if inst else None,
                    's_code': inst.s_code if inst else None,
                } if inst else None,
            })

        return Response({
            'success': True,
            'installment_number': installment_number,
            'total': len(results),
            'data': results,
        }, status=status.HTTP_200_OK)


class TableInstallmentsView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("fees")]

    def get(self, request):
        from students.models import Admission

        year = request.query_params.get('year')
        admission_class = request.query_params.get('class')
        section = request.query_params.get('section')

        queryset = Admission.objects.filter(is_active=True).select_related(
            'admission_class', 'section'
        ).prefetch_related(
            Prefetch(
                'fee_installments',
                queryset=StudentFeeInstallmentPaid.objects.order_by('installment_number')
            )
        )

        if year:
            queryset = queryset.filter(admission_class__academic_year__year=year)
        if admission_class:
            queryset = queryset.filter(admission_class__admission_class=admission_class)
        if section:
            queryset = queryset.filter(section__section=section)

        results = []
        for admission in queryset:
            installments = [
                {
                    'installment_number': installment.installment_number,
                    'amount_paid': float(installment.amount_paid),
                    's_code': installment.s_code,
                }
                for installment in admission.fee_installments.all()
            ]
            results.append({
                'admission_id': str(admission.id),
                'student_name': f"{admission.first_name} {admission.last_name}",
                'class': admission.admission_class.admission_class if admission.admission_class else None,
                'section': admission.section.section if admission.section else None,
                'installments': installments,
            })

        return Response(results)
