from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    AttendancePeriod, AttendanceRecord, AttendanceSummary,
    Holiday, LeaveApplication, ClassAttendanceDay,
    update_attendance_summary,
)
from .serializers import (
    AttendancePeriodSerializer, AttendanceRecordSerializer,
    AttendanceSummarySerializer, HolidaySerializer,
    LeaveApplicationSerializer, ClassAttendanceDaySerializer,
    BulkMarkAttendanceSerializer, MarkSingleAttendanceSerializer,
)
from .permissions import IsSchoolMember, ModulePermission


# ─── Attendance Period ──────────────────────────────────────────

class AttendancePeriodViewSet(viewsets.ModelViewSet):
    serializer_class = AttendancePeriodSerializer
    permission_classes = [IsSchoolMember, ModulePermission("attendance")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        return AttendancePeriod.objects.filter(school=self.request.user.school)


# ─── Attendance Record ──────────────────────────────────────────

class AttendanceRecordViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsSchoolMember, ModulePermission("attendance")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'student', 'date', 'status', 'period', 'source']

    def get_queryset(self):
        return AttendanceRecord.objects.filter(
            school=self.request.user.school,
        ).select_related('student', 'marked_by', 'period')

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='mark')
    def mark_bulk(self, request):
        serializer = BulkMarkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        class_id = data['class_id']
        section_id = data['section_id']
        date = data['date']
        period_id = data.get('period_id')
        attendance_list = data['attendance']

        from students.models import Admission, AcademicClass, Section

        try:
            class_obj = AcademicClass.objects.get(id=class_id)
            section = Section.objects.get(id=section_id)
        except (AcademicClass.DoesNotExist, Section.DoesNotExist):
            return Response(
                {'error': 'Invalid class_id or section_id'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created = []
        updated = []

        with transaction.atomic():
            for item in attendance_list:
                student_id = item['student_id']
                status_val = item['status']
                remarks = item.get('remarks', '')

                try:
                    student = Admission.objects.get(id=student_id)
                except Admission.DoesNotExist:
                    continue

                record, was_created = AttendanceRecord.objects.update_or_create(
                    student=student,
                    date=date,
                    period_id=period_id,
                    defaults={
                        'school': request.user.school,
                        'status': status_val,
                        'marked_by': request.user,
                        'remarks': remarks,
                        'source': 'manual',
                    },
                )

                if was_created:
                    created.append(str(record.id))
                else:
                    updated.append(str(record.id))

                ClassAttendanceDay.objects.update_or_create(
                    class_obj=class_obj,
                    section=section,
                    date=date,
                    defaults={
                        'school': request.user.school,
                        'total_students': Admission.objects.filter(
                            admission_class=class_obj,
                            section=section,
                            is_active=True,
                        ).count(),
                    },
                )

                update_attendance_summary(student, date)

        return Response({
            'created_count': len(created),
            'updated_count': len(updated),
            'created_ids': created,
            'updated_ids': updated,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='mark-single')
    def mark_single(self, request):
        serializer = MarkSingleAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        from students.models import Admission

        try:
            student = Admission.objects.get(id=data['student_id'])
        except Admission.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        record, was_created = AttendanceRecord.objects.update_or_create(
            student=student,
            date=data['date'],
            period_id=data.get('period_id'),
            defaults={
                'school': request.user.school,
                'status': data['status'],
                'marked_by': request.user,
                'remarks': data.get('remarks', ''),
                'source': data.get('source', 'manual'),
            },
        )

        update_attendance_summary(student, data['date'])

        return Response({
            'id': str(record.id),
            'status': 'created' if was_created else 'updated',
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path=r'class/(?P<class_id>[^/.]+)/(?P<section_id>[^/.]+)')
    def class_attendance(self, request, class_id=None, section_id=None):
        date = request.query_params.get('date')
        if not date:
            return Response(
                {'error': 'date query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        records = self.get_queryset().filter(
            student__admission_class_id=class_id,
            student__section_id=section_id,
            date=date,
        )

        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path=r'student/(?P<student_id>[^/.]+)')
    def student_attendance(self, request, student_id=None):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        records = self.get_queryset().filter(student_id=student_id)

        if start_date and end_date:
            records = records.filter(date__range=[start_date, end_date])

        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path=r'student/(?P<student_id>[^/.]+)/summary')
    def student_summary(self, request, student_id=None):
        academic_year_id = request.query_params.get('academic_year_id')

        from schools.models import AcademicYear

        if not academic_year_id:
            academic_year = AcademicYear.objects.filter(
                school=request.user.school,
                is_current=True,
            ).first()
        else:
            academic_year = AcademicYear.objects.get(id=academic_year_id)

        if not academic_year:
            return Response(
                {'error': 'No active academic year found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        summary = AttendanceSummary.objects.filter(
            student_id=student_id,
            academic_year=academic_year,
        ).first()

        if summary:
            serializer = AttendanceSummarySerializer(summary)
            return Response(serializer.data)

        return Response({
            'student_id': student_id,
            'academic_year': academic_year.year,
            'total_days': 0,
            'present_days': 0,
            'absent_days': 0,
            'late_days': 0,
            'half_days': 0,
            'excused_days': 0,
            'attendance_pct': 0,
        })

    @action(detail=False, methods=['get'], url_path=r'class/(?P<class_id>[^/.]+)/summary')
    def class_summary(self, request, class_id=None):
        date = request.query_params.get('date')
        if not date:
            return Response(
                {'error': 'date query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        class_day = ClassAttendanceDay.objects.filter(
            class_obj_id=class_id,
            date=date,
        ).first()

        if class_day:
            serializer = ClassAttendanceDaySerializer(class_day)
            return Response(serializer.data)

        return Response({
            'class_id': class_id,
            'date': date,
            'total_students': 0,
            'present': 0,
            'absent': 0,
            'late': 0,
            'attendance_pct': 0,
        })


# ─── Holiday ────────────────────────────────────────────────────

class HolidayViewSet(viewsets.ModelViewSet):
    serializer_class = HolidaySerializer
    permission_classes = [IsSchoolMember, ModulePermission("attendance")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'holiday_type', 'is_active']

    def get_queryset(self):
        return Holiday.objects.filter(school=self.request.user.school)


# ─── Leave Application ──────────────────────────────────────────

class LeaveApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveApplicationSerializer
    permission_classes = [IsSchoolMember, ModulePermission("attendance")]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'student', 'status']

    def get_queryset(self):
        return LeaveApplication.objects.filter(
            school=self.request.user.school,
        ).select_related('student', 'approved_by')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        if leave.status != 'pending':
            return Response(
                {'error': 'Only pending applications can be approved'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        leave.status = 'approved'
        leave.approved_by = request.user
        leave.remarks = request.data.get('remarks', '')
        leave.save()

        from datetime import timedelta
        from students.models import Admission

        current_date = leave.start_date
        while current_date <= leave.end_date:
            student = Admission.objects.get(id=leave.student_id)
            AttendanceRecord.objects.update_or_create(
                student=student,
                date=current_date,
                period=None,
                defaults={
                    'school': request.user.school,
                    'status': 'excused',
                    'marked_by': request.user,
                    'remarks': f'Approved leave: {leave.reason}',
                    'source': 'manual',
                },
            )
            update_attendance_summary(student, current_date)
            current_date += timedelta(days=1)

        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        if leave.status != 'pending':
            return Response(
                {'error': 'Only pending applications can be rejected'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        leave.status = 'rejected'
        leave.approved_by = request.user
        leave.remarks = request.data.get('remarks', '')
        leave.save()

        return Response({'status': 'rejected'})


# ─── Attendance Reports ─────────────────────────────────────────

class DailyAttendanceReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        date = request.query_params.get('date', str(timezone.now().date()))
        class_id = request.query_params.get('class_id')
        section_id = request.query_params.get('section_id')

        records = AttendanceRecord.objects.filter(school=school, date=date, period__isnull=True)

        if class_id:
            records = records.filter(student__admission_class_id=class_id)
        if section_id:
            records = records.filter(student__section_id=section_id)

        total = records.count()
        present = records.filter(status='present').count()
        absent = records.filter(status='absent').count()
        late = records.filter(status='late').count()
        half_day = records.filter(status='half_day').count()
        excused = records.filter(status='excused').count()

        return Response({
            'date': date,
            'total_students': total,
            'present': present,
            'absent': absent,
            'late': late,
            'half_day': half_day,
            'excused': excused,
            'attendance_pct': round((present + late) / total * 100, 2) if total > 0 else 0,
        })


class MonthlyAttendanceReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)
        class_id = request.query_params.get('class_id')

        records = AttendanceRecord.objects.filter(
            school=school,
            date__month=month,
            date__year=year,
            period__isnull=True,
        )

        if class_id:
            records = records.filter(student__admission_class_id=class_id)

        daily_data = records.values('date').annotate(
            total=Count('id'),
            present=Count('id', filter=Q(status='present')),
            absent=Count('id', filter=Q(status='absent')),
            late=Count('id', filter=Q(status='late')),
        ).order_by('date')

        return Response(list(daily_data))


class ClassWiseAttendanceReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        date = request.query_params.get('date', str(timezone.now().date()))

        from students.models import AcademicClass, Section

        classes = AcademicClass.objects.filter(school=school)
        sections = Section.objects.filter(school=school)
        report = []

        for cls in classes:
            for section in sections:
                records = AttendanceRecord.objects.filter(
                    school=school,
                    student__admission_class=cls,
                    student__section=section,
                    date=date,
                    period__isnull=True,
                )

                total = records.count()
                present = records.filter(status='present').count()

                report.append({
                    'class_id': cls.id,
                    'class_name': cls.get_admission_class_display(),
                    'section_id': section.id,
                    'section_name': section.section,
                    'total_students': total,
                    'present': present,
                    'attendance_pct': round(present / total * 100, 2) if total > 0 else 0,
                })

        return Response(report)


class LowAttendanceReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        threshold = float(request.query_params.get('threshold', 75))
        academic_year_id = request.query_params.get('academic_year_id')

        from schools.models import AcademicYear

        if not academic_year_id:
            academic_year = AcademicYear.objects.filter(
                school=school, is_current=True,
            ).first()
        else:
            academic_year = AcademicYear.objects.get(id=academic_year_id)

        if not academic_year:
            return Response([])

        summaries = AttendanceSummary.objects.filter(
            school=school,
            academic_year=academic_year,
            attendance_pct__lt=threshold,
            total_days__gte=5,
        ).select_related('student', 'student__admission_class', 'student__section')

        report = []
        for summary in summaries:
            report.append({
                'student_id': str(summary.student.id),
                'student_name': f"{summary.student.first_name} {summary.student.last_name}",
                'admission_no': summary.student.admission_no,
                'class': summary.student.admission_class.get_admission_class_display() if summary.student.admission_class else None,
                'section': summary.student.section.section if summary.student.section else None,
                'total_days': summary.total_days,
                'present_days': summary.present_days,
                'attendance_pct': float(summary.attendance_pct),
            })

        return Response(report)


class BulkSMSReportView(APIView):
    permission_classes = [IsSchoolMember, ModulePermission("reports")]

    def get(self, request):
        school = request.user.school
        threshold = float(request.query_params.get('threshold', 75))

        from schools.models import AcademicYear

        academic_year = AcademicYear.objects.filter(
            school=school, is_current=True,
        ).first()

        if not academic_year:
            return Response([])

        summaries = AttendanceSummary.objects.filter(
            school=school,
            academic_year=academic_year,
            attendance_pct__lt=threshold,
            total_days__gte=5,
        ).select_related('student', 'student__user')

        students_to_notify = []
        for summary in summaries:
            student = summary.student
            phone = student.phone
            if phone:
                students_to_notify.append({
                    'student_id': str(student.id),
                    'student_name': f"{student.first_name} {student.last_name}",
                    'phone': phone,
                    'attendance_pct': float(summary.attendance_pct),
                    'parent_phone': phone,
                })

        return Response(students_to_notify)
