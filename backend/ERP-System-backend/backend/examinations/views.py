import csv
import io
from decimal import Decimal

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Q, Avg, Max, Min, Count, F

from .models import (
    ExamType, Subject, ClassSubject, Exam, ExamSchedule,
    ExamResult, GradingSystem, ReportCard, ClassResultSummary,
    calculate_grade, generate_report_card, generate_class_result_summary,
)
from .serializers import (
    ExamTypeSerializer, SubjectSerializer, ClassSubjectSerializer,
    ExamSerializer, ExamScheduleSerializer, ExamResultSerializer,
    GradingSystemSerializer, ReportCardSerializer, ClassResultSummarySerializer,
    BulkEnterResultsSerializer, BulkCreateScheduleSerializer,
)
from .permissions import IsSchoolMember
from students.models import AcademicClass, Section, Admission
from schools.models import AcademicYear
from accounts.models import User


class StandardPaginationMixin:
    def paginate_queryset(self, queryset, request, view=None):
        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except ValueError:
            page = 1
        try:
            limit = max(1, int(request.query_params.get('limit', 10)))
        except ValueError:
            limit = 10

        from django.core.paginator import Paginator, EmptyPage
        paginator = Paginator(queryset, limit)
        try:
            page_obj = paginator.page(page)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)

        return {
            'page': page,
            'limit': limit,
            'total': paginator.count,
            'results': list(page_obj),
        }

    def get_paginated_response(self, paginated_data):
        return Response({
            'success': True,
            'data': {
                'results': paginated_data['results'],
                'pagination': {
                    'page': paginated_data['page'],
                    'limit': paginated_data['limit'],
                    'total': paginated_data['total'],
                }
            }
        })


class ExamTypeViewSet(StandardPaginationMixin, viewsets.ModelViewSet):
    serializer_class = ExamTypeSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'is_active': ['exact'],
    }

    def get_queryset(self):
        qs = ExamType.objects.all()
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        return qs.order_by('name')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        paginated = self.paginate_queryset(queryset, request)
        serializer = self.get_serializer(paginated['results'], many=True)
        paginated['results'] = serializer.data
        return self.get_paginated_response(paginated)


class SubjectViewSet(StandardPaginationMixin, viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'type': ['exact'],
        'is_active': ['exact'],
    }

    def get_queryset(self):
        qs = Subject.objects.all()
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(code__icontains=search))
        return qs.order_by('name')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        paginated = self.paginate_queryset(queryset, request)
        serializer = self.get_serializer(paginated['results'], many=True)
        paginated['results'] = serializer.data
        return self.get_paginated_response(paginated)


class ClassSubjectViewSet(StandardPaginationMixin, viewsets.ModelViewSet):
    serializer_class = ClassSubjectSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'class_obj': ['exact'],
        'subject': ['exact'],
        'is_active': ['exact'],
    }

    def get_queryset(self):
        qs = ClassSubject.objects.select_related('class_obj', 'subject', 'teacher')
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(subject__name__icontains=search) |
                Q(class_obj__admission_class__icontains=search) |
                Q(teacher__first_name__icontains=search) |
                Q(teacher__last_name__icontains=search)
            )
        return qs.order_by('class_obj', 'subject')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        paginated = self.paginate_queryset(queryset, request)
        serializer = self.get_serializer(paginated['results'], many=True)
        paginated['results'] = serializer.data
        return self.get_paginated_response(paginated)

    @action(detail=False, methods=['post'], url_path='bulk-assign')
    def bulk_assign(self, request):
        class_id = request.data.get('class_id')
        items = request.data.get('items', [])

        if not class_id:
            return Response(
                {'success': False, 'message': 'class_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        school = getattr(request.user, 'school', None)
        if not school:
            return Response(
                {'success': False, 'message': 'No school associated with user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            class_obj = AcademicClass.objects.get(pk=class_id, school=school)
        except AcademicClass.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Class not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        created = []
        skipped = []
        with transaction.atomic():
            for item in items:
                subject_id = item.get('subject_id')
                teacher_id = item.get('teacher_id')
                if not subject_id:
                    continue
                try:
                    subject = Subject.objects.get(pk=subject_id, school=school)
                except Subject.DoesNotExist:
                    skipped.append(subject_id)
                    continue

                obj, was_created = ClassSubject.objects.get_or_create(
                    school=school,
                    class_obj=class_obj,
                    subject=subject,
                    defaults={
                        'teacher_id': teacher_id if teacher_id else None,
                    },
                )
                if was_created:
                    created.append(obj.pk)
                else:
                    skipped.append(subject_id)

        return Response({
            'success': True,
            'message': f'{len(created)} created, {len(skipped)} skipped.',
            'data': {'created': created, 'skipped': skipped},
        }, status=status.HTTP_201_CREATED)


class ExamViewSet(StandardPaginationMixin, viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'exam_type': ['exact'],
        'academic_year': ['exact'],
        'is_published': ['exact'],
    }

    def get_queryset(self):
        qs = Exam.objects.select_related('exam_type', 'academic_year', 'published_by')
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search))
        return qs.order_by('-start_date')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        paginated = self.paginate_queryset(queryset, request)
        serializer = self.get_serializer(paginated['results'], many=True)
        paginated['results'] = serializer.data
        return self.get_paginated_response(paginated)

    @action(detail=True, methods=['post'], url_path='publish')
    def publish(self, request, pk=None):
        exam = self.get_object()
        if exam.is_published:
            return Response(
                {'success': False, 'message': 'Exam results are already published.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            exam.is_published = True
            exam.published_by = request.user
            exam.save(update_fields=['is_published', 'published_by', 'updated_at'])

            students = Admission.objects.filter(
                school=exam.school,
                is_active=True,
            )
            for student in students:
                generate_report_card(exam, student)

        return Response({
            'success': True,
            'message': 'Exam results published successfully.',
        })


class ExamScheduleViewSet(StandardPaginationMixin, viewsets.ModelViewSet):
    serializer_class = ExamScheduleSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'exam': ['exact'],
        'subject': ['exact'],
        'class_obj': ['exact'],
    }

    def get_queryset(self):
        qs = ExamSchedule.objects.select_related('exam', 'subject', 'class_obj')
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(exam__name__icontains=search) |
                Q(subject__name__icontains=search)
            )
        return qs.order_by('date', 'start_time')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        paginated = self.paginate_queryset(queryset, request)
        serializer = self.get_serializer(paginated['results'], many=True)
        paginated['results'] = serializer.data
        return self.get_paginated_response(paginated)

    @action(detail=False, methods=['post'], url_path='bulk-create')
    def bulk_create(self, request):
        serializer = BulkCreateScheduleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        exam_id = data['exam_id']
        class_id = data['class_id']
        schedules_data = data['schedules']

        school = getattr(request.user, 'school', None)
        if not school:
            return Response(
                {'success': False, 'message': 'No school associated with user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            exam = Exam.objects.get(pk=exam_id, school=school)
        except Exam.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Exam not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            class_obj = AcademicClass.objects.get(pk=class_id, school=school)
        except AcademicClass.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Class not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        created = []
        skipped = []
        with transaction.atomic():
            for item in schedules_data:
                subject_id = item['subject_id']
                try:
                    subject = Subject.objects.get(pk=subject_id, school=school)
                except Subject.DoesNotExist:
                    skipped.append(subject_id)
                    continue

                obj, was_created = ExamSchedule.objects.get_or_create(
                    exam=exam,
                    subject=subject,
                    class_obj=class_obj,
                    defaults={
                        'school': school,
                        'date': item['date'],
                        'start_time': item['start_time'],
                        'end_time': item['end_time'],
                        'max_marks': item['max_marks'],
                        'passing_marks': item['passing_marks'],
                        'room_no': item.get('room_no', ''),
                        'instructions': item.get('instructions', ''),
                    },
                )
                if was_created:
                    created.append(obj.pk)
                else:
                    skipped.append(subject_id)

        return Response({
            'success': True,
            'message': f'{len(created)} schedules created, {len(skipped)} skipped.',
            'data': {'created': created, 'skipped': skipped},
        }, status=status.HTTP_201_CREATED)


class ExamResultViewSet(StandardPaginationMixin, viewsets.ModelViewSet):
    serializer_class = ExamResultSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'exam': ['exact'],
        'student': ['exact'],
        'schedule': ['exact'],
        'is_absent': ['exact'],
    }

    def get_queryset(self):
        qs = ExamResult.objects.select_related('exam', 'student', 'schedule', 'schedule__subject', 'graded_by')
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(student__first_name__icontains=search) |
                Q(student__last_name__icontains=search) |
                Q(student__admission_no__icontains=search)
            )
        return qs.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        paginated = self.paginate_queryset(queryset, request)
        serializer = self.get_serializer(paginated['results'], many=True)
        paginated['results'] = serializer.data
        return self.get_paginated_response(paginated)

    @action(detail=False, methods=['post'], url_path='bulk-enter')
    def bulk_enter(self, request):
        serializer = BulkEnterResultsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        exam_id = data['exam_id']
        class_id = data['class_id']
        section_id = data['section_id']
        schedule_id = data['schedule_id']
        results_data = data['results']

        school = getattr(request.user, 'school', None)
        if not school:
            return Response(
                {'success': False, 'message': 'No school associated with user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            exam = Exam.objects.get(pk=exam_id, school=school)
        except Exam.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Exam not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            schedule = ExamSchedule.objects.get(pk=schedule_id, exam=exam)
        except ExamSchedule.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Exam schedule not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        grading_system = GradingSystem.objects.filter(
            school=school, is_default=True, is_active=True
        ).first()

        created_count = 0
        updated_count = 0

        with transaction.atomic():
            for item in results_data:
                student_id = item.get('student_id')
                marks = item.get('marks_obtained')
                is_absent = item.get('is_absent', False)
                remarks = item.get('remarks', '')

                try:
                    student = Admission.objects.get(pk=student_id, school=school)
                except Admission.DoesNotExist:
                    continue

                grade = ""
                if not is_absent and marks is not None and grading_system:
                    grade = calculate_grade(
                        Decimal(str(marks)), schedule.max_marks, grading_system
                    )

                result, created = ExamResult.objects.update_or_create(
                    exam=exam,
                    student=student,
                    schedule=schedule,
                    defaults={
                        'school': school,
                        'marks_obtained': Decimal(str(marks)) if marks is not None else None,
                        'grade': grade,
                        'remarks': remarks,
                        'is_absent': is_absent,
                        'graded_by': request.user,
                    },
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1

        return Response({
            'success': True,
            'message': f'{created_count} created, {updated_count} updated.',
            'data': {'created': created_count, 'updated': updated_count},
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='import')
    def import_results(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'success': False, 'message': 'No file uploaded.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        exam_id = request.data.get('exam_id')
        schedule_id = request.data.get('schedule_id')

        if not exam_id or not schedule_id:
            return Response(
                {'success': False, 'message': 'exam_id and schedule_id are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        school = getattr(request.user, 'school', None)
        if not school:
            return Response(
                {'success': False, 'message': 'No school associated with user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            exam = Exam.objects.get(pk=exam_id, school=school)
        except Exam.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Exam not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            schedule = ExamSchedule.objects.get(pk=schedule_id, exam=exam)
        except ExamSchedule.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Exam schedule not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        grading_system = GradingSystem.objects.filter(
            school=school, is_default=True, is_active=True
        ).first()

        try:
            decoded = file.read().decode('utf-8')
            reader = csv.DictReader(io.StringIO(decoded))
        except Exception:
            return Response(
                {'success': False, 'message': 'Invalid file format. Use CSV.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_count = 0
        updated_count = 0
        errors = []

        with transaction.atomic():
            for idx, row in enumerate(reader, start=1):
                admission_no = row.get('admission_no', '').strip()
                marks = row.get('marks_obtained', '').strip()
                is_absent = row.get('is_absent', '').strip().lower() in ('true', '1', 'yes')
                remarks = row.get('remarks', '').strip()

                if not admission_no:
                    errors.append(f'Row {idx}: missing admission_no')
                    continue

                try:
                    student = Admission.objects.get(admission_no=admission_no, school=school)
                except Admission.DoesNotExist:
                    errors.append(f'Row {idx}: student {admission_no} not found')
                    continue

                marks_val = None
                if marks:
                    try:
                        marks_val = Decimal(marks)
                    except Exception:
                        errors.append(f'Row {idx}: invalid marks value')
                        continue

                grade = ""
                if not is_absent and marks_val is not None and grading_system:
                    grade = calculate_grade(marks_val, schedule.max_marks, grading_system)

                result, created = ExamResult.objects.update_or_create(
                    exam=exam,
                    student=student,
                    schedule=schedule,
                    defaults={
                        'school': school,
                        'marks_obtained': marks_val,
                        'grade': grade,
                        'remarks': remarks,
                        'is_absent': is_absent,
                        'graded_by': request.user,
                    },
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1

        return Response({
            'success': True,
            'message': f'{created_count} created, {updated_count} updated, {len(errors)} errors.',
            'data': {
                'created': created_count,
                'updated': updated_count,
                'errors': errors,
            },
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='student/(?P<student_id>[^/.]+)')
    def student_results(self, request, student_id=None):
        school = getattr(request.user, 'school', None)
        if not school:
            return Response(
                {'success': False, 'message': 'No school associated with user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            student = Admission.objects.get(pk=student_id, school=school)
        except Admission.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Student not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        results = ExamResult.objects.filter(
            student=student, school=school
        ).select_related('exam', 'schedule', 'schedule__subject').order_by('-exam__start_date')

        grouped = {}
        for result in results:
            exam_id = result.exam_id
            if exam_id not in grouped:
                grouped[exam_id] = {
                    'exam_id': exam_id,
                    'exam_name': result.exam.name,
                    'exam_type': result.exam.exam_type.name if result.exam.exam_type else None,
                    'start_date': result.exam.start_date,
                    'results': [],
                }
            grouped[exam_id]['results'].append({
                'id': result.pk,
                'subject': result.schedule.subject.name if result.schedule.subject else None,
                'max_marks': result.schedule.max_marks,
                'passing_marks': result.schedule.passing_marks,
                'marks_obtained': str(result.marks_obtained) if result.marks_obtained else None,
                'grade': result.grade,
                'is_absent': result.is_absent,
                'remarks': result.remarks,
            })

        return Response({
            'success': True,
            'data': {
                'student_id': student.pk,
                'student_name': f"{student.first_name} {student.last_name}".strip(),
                'exams': list(grouped.values()),
            }
        })

    @action(detail=False, methods=['get'], url_path='class/(?P<class_id>[^/.]+)')
    def class_results(self, request, class_id=None):
        exam_id = request.query_params.get('exam_id')
        if not exam_id:
            return Response(
                {'success': False, 'message': 'exam_id query param is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        school = getattr(request.user, 'school', None)
        if not school:
            return Response(
                {'success': False, 'message': 'No school associated with user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            exam = Exam.objects.get(pk=exam_id, school=school)
        except Exam.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Exam not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            class_obj = AcademicClass.objects.get(pk=class_id, school=school)
        except AcademicClass.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Class not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        results = ExamResult.objects.filter(
            exam=exam, school=school,
            student__admission_class=class_obj,
        ).select_related('student', 'schedule', 'schedule__subject').order_by(
            'student__first_name', 'student__last_name'
        )

        student_results = {}
        for result in results:
            student_id = result.student_id
            if student_id not in student_results:
                student_results[student_id] = {
                    'student_id': student_id,
                    'student_name': f"{result.student.first_name} {result.student.last_name}".strip(),
                    'admission_no': result.student.admission_no,
                    'results': [],
                }
            student_results[student_id]['results'].append({
                'subject': result.schedule.subject.name if result.schedule.subject else None,
                'max_marks': result.schedule.max_marks,
                'passing_marks': result.schedule.passing_marks,
                'marks_obtained': str(result.marks_obtained) if result.marks_obtained else None,
                'grade': result.grade,
                'is_absent': result.is_absent,
                'remarks': result.remarks,
            })

        return Response({
            'success': True,
            'data': {
                'exam_id': exam.pk,
                'exam_name': exam.name,
                'class_id': class_obj.pk,
                'class_name': class_obj.admission_class,
                'students': list(student_results.values()),
            }
        })


class GradingSystemViewSet(StandardPaginationMixin, viewsets.ModelViewSet):
    serializer_class = GradingSystemSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'is_active': ['exact'],
        'is_default': ['exact'],
    }

    def get_queryset(self):
        qs = GradingSystem.objects.all()
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search))
        return qs.order_by('name')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        paginated = self.paginate_queryset(queryset, request)
        serializer = self.get_serializer(paginated['results'], many=True)
        paginated['results'] = serializer.data
        return self.get_paginated_response(paginated)

    @action(detail=True, methods=['post'], url_path='set-default')
    def set_default(self, request, pk=None):
        grading_system = self.get_object()

        with transaction.atomic():
            GradingSystem.objects.filter(
                school=grading_system.school, is_default=True
            ).update(is_default=False)
            grading_system.is_default = True
            grading_system.save(update_fields=['is_default'])

        return Response({
            'success': True,
            'message': f'"{grading_system.name}" set as default grading system.',
        })


class ReportCardViewSet(StandardPaginationMixin, viewsets.ModelViewSet):
    serializer_class = ReportCardSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'exam': ['exact'],
        'student': ['exact'],
        'status': ['exact'],
    }
    http_method_names = ['get', 'head', 'options']

    def get_queryset(self):
        qs = ReportCard.objects.select_related('exam', 'student')
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(student__first_name__icontains=search) |
                Q(student__last_name__icontains=search) |
                Q(student__admission_no__icontains=search)
            )
        return qs.order_by('-generated_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        paginated = self.paginate_queryset(queryset, request)
        serializer = self.get_serializer(paginated['results'], many=True)
        paginated['results'] = serializer.data
        return self.get_paginated_response(paginated)

    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        exam_id = request.data.get('exam_id')
        if not exam_id:
            return Response(
                {'success': False, 'message': 'exam_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        school = getattr(request.user, 'school', None)
        if not school:
            return Response(
                {'success': False, 'message': 'No school associated with user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            exam = Exam.objects.get(pk=exam_id, school=school)
        except Exam.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Exam not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        students = Admission.objects.filter(school=school, is_active=True)
        generated = 0

        with transaction.atomic():
            for student in students:
                report = generate_report_card(exam, student)
                if report:
                    generated += 1

            report_cards = ReportCard.objects.filter(exam=exam, school=school)
            percentages = list(report_cards.values_list('percentage', flat=True))
            percentages.sort(reverse=True)

            rank_map = {}
            current_rank = 1
            for i, pct in enumerate(percentages):
                if i > 0 and pct < percentages[i - 1]:
                    current_rank = i + 1
                rank_map[pct] = current_rank

            for rc in report_cards:
                rc.rank = rank_map.get(rc.percentage)
                rc.save(update_fields=['rank'])

        return Response({
            'success': True,
            'message': f'{generated} report cards generated.',
            'data': {'generated': generated},
        })

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        report_card = self.get_object()
        return Response({
            'success': True,
            'data': {
                'id': report_card.pk,
                'student': f"{report_card.student.first_name} {report_card.student.last_name}".strip(),
                'exam': report_card.exam.name,
                'total_marks': str(report_card.total_marks),
                'marks_obtained': str(report_card.marks_obtained),
                'percentage': str(report_card.percentage),
                'grade': report_card.grade,
                'rank': report_card.rank,
                'status': report_card.status,
                'remarks': report_card.remarks,
                'message': 'PDF generation not yet implemented.',
            }
        })


class ClassPerformanceReportView(APIView):
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get(self, request):
        exam_id = request.query_params.get('exam_id')
        class_id = request.query_params.get('class_id')

        if not exam_id or not class_id:
            return Response(
                {'success': False, 'message': 'exam_id and class_id are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        school = getattr(request.user, 'school', None)
        if not school:
            return Response(
                {'success': False, 'message': 'No school associated with user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            exam = Exam.objects.get(pk=exam_id, school=school)
        except Exam.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Exam not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            class_obj = AcademicClass.objects.get(pk=class_id, school=school)
        except AcademicClass.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Class not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        summaries = ClassResultSummary.objects.filter(
            exam=exam, class_obj=class_obj, school=school
        ).select_related('subject', 'section')

        subjects_data = []
        for summary in summaries:
            subjects_data.append({
                'subject_id': summary.subject_id,
                'subject_name': summary.subject.name,
                'section': summary.section.section if summary.section else None,
                'total_students': summary.total_students,
                'appeared': summary.appeared,
                'passed': summary.passed,
                'failed': summary.failed,
                'pass_pct': str(summary.pass_pct),
                'highest': str(summary.highest),
                'lowest': str(summary.lowest),
                'average': str(summary.average),
            })

        return Response({
            'success': True,
            'data': {
                'exam_id': exam.pk,
                'exam_name': exam.name,
                'class_id': class_obj.pk,
                'class_name': class_obj.admission_class,
                'subjects': subjects_data,
            }
        })


class SubjectAnalysisReportView(APIView):
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get(self, request):
        exam_id = request.query_params.get('exam_id')
        subject_id = request.query_params.get('subject_id')

        if not exam_id or not subject_id:
            return Response(
                {'success': False, 'message': 'exam_id and subject_id are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        school = getattr(request.user, 'school', None)
        if not school:
            return Response(
                {'success': False, 'message': 'No school associated with user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            exam = Exam.objects.get(pk=exam_id, school=school)
        except Exam.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Exam not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            subject = Subject.objects.get(pk=subject_id, school=school)
        except Subject.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Subject not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        summaries = ClassResultSummary.objects.filter(
            exam=exam, subject=subject, school=school
        ).select_related('class_obj', 'section')

        classes_data = []
        for summary in summaries:
            classes_data.append({
                'class_id': summary.class_obj_id,
                'class_name': summary.class_obj.admission_class if summary.class_obj else None,
                'section': summary.section.section if summary.section else None,
                'total_students': summary.total_students,
                'appeared': summary.appeared,
                'passed': summary.passed,
                'failed': summary.failed,
                'pass_pct': str(summary.pass_pct),
                'highest': str(summary.highest),
                'lowest': str(summary.lowest),
                'average': str(summary.average),
            })

        return Response({
            'success': True,
            'data': {
                'exam_id': exam.pk,
                'exam_name': exam.name,
                'subject_id': subject.pk,
                'subject_name': subject.name,
                'classes': classes_data,
            }
        })


class ToppersReportView(APIView):
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get(self, request):
        exam_id = request.query_params.get('exam_id')
        class_id = request.query_params.get('class_id')
        limit = int(request.query_params.get('limit', 10))

        if not exam_id:
            return Response(
                {'success': False, 'message': 'exam_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        school = getattr(request.user, 'school', None)
        if not school:
            return Response(
                {'success': False, 'message': 'No school associated with user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            exam = Exam.objects.get(pk=exam_id, school=school)
        except Exam.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Exam not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        report_cards = ReportCard.objects.filter(
            exam=exam, school=school
        ).select_related('student')

        if class_id:
            report_cards = report_cards.filter(student__admission_class_id=class_id)

        report_cards = report_cards.order_by('rank', '-percentage')[:limit]

        toppers = []
        for rc in report_cards:
            toppers.append({
                'rank': rc.rank,
                'student_id': rc.student_id,
                'student_name': f"{rc.student.first_name} {rc.student.last_name}".strip(),
                'admission_no': rc.student.admission_no,
                'total_marks': str(rc.total_marks),
                'marks_obtained': str(rc.marks_obtained),
                'percentage': str(rc.percentage),
                'grade': rc.grade,
                'status': rc.status,
            })

        return Response({
            'success': True,
            'data': {
                'exam_id': exam.pk,
                'exam_name': exam.name,
                'toppers': toppers,
            }
        })


class FailStudentsReportView(APIView):
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get(self, request):
        exam_id = request.query_params.get('exam_id')
        class_id = request.query_params.get('class_id')

        if not exam_id:
            return Response(
                {'success': False, 'message': 'exam_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        school = getattr(request.user, 'school', None)
        if not school:
            return Response(
                {'success': False, 'message': 'No school associated with user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            exam = Exam.objects.get(pk=exam_id, school=school)
        except Exam.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Exam not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        report_cards = ReportCard.objects.filter(
            exam=exam, school=school,
            status__in=['fail', 'compartment'],
        ).select_related('student', 'student__admission_class')

        if class_id:
            report_cards = report_cards.filter(student__admission_class_id=class_id)

        report_cards = report_cards.order_by(
            'student__admission_class', 'student__first_name'
        )

        failed = []
        for rc in report_cards:
            failed.append({
                'student_id': rc.student_id,
                'student_name': f"{rc.student.first_name} {rc.student.last_name}".strip(),
                'admission_no': rc.student.admission_no,
                'class': rc.student.admission_class.admission_class if rc.student.admission_class else None,
                'section': rc.student.section.section if rc.student.section else None,
                'total_marks': str(rc.total_marks),
                'marks_obtained': str(rc.marks_obtained),
                'percentage': str(rc.percentage),
                'grade': rc.grade,
                'status': rc.status,
            })

        return Response({
            'success': True,
            'data': {
                'exam_id': exam.pk,
                'exam_name': exam.name,
                'total_failed': len(failed),
                'students': failed,
            }
        })


class ExamComparisonReportView(APIView):
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get(self, request):
        exam_ids_param = request.query_params.get('exam_ids', '')
        class_id = request.query_params.get('class_id')

        if not exam_ids_param:
            return Response(
                {'success': False, 'message': 'exam_ids (comma-separated) is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        school = getattr(request.user, 'school', None)
        if not school:
            return Response(
                {'success': False, 'message': 'No school associated with user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            exam_ids = [int(x.strip()) for x in exam_ids_param.split(',') if x.strip()]
        except ValueError:
            return Response(
                {'success': False, 'message': 'Invalid exam_ids format.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        exams = Exam.objects.filter(pk__in=exam_ids, school=school)

        comparisons = []
        for exam in exams:
            report_cards = ReportCard.objects.filter(exam=exam, school=school)
            if class_id:
                report_cards = report_cards.filter(student__admission_class_id=class_id)

            total = report_cards.count()
            passed = report_cards.filter(status='pass').count()
            failed = report_cards.filter(status__in=['fail', 'compartment']).count()
            pass_pct = round((passed / total * 100), 2) if total > 0 else 0

            avg_agg = report_cards.aggregate(avg=Avg('percentage'))
            avg_pct = round(float(avg_agg['avg'] or 0), 2)

            comparisons.append({
                'exam_id': exam.pk,
                'exam_name': exam.name,
                'exam_type': exam.exam_type.name if exam.exam_type else None,
                'start_date': exam.start_date,
                'total_students': total,
                'passed': passed,
                'failed': failed,
                'pass_percentage': pass_pct,
                'average_percentage': avg_pct,
            })

        comparisons.sort(key=lambda x: x['start_date'], reverse=True)

        return Response({
            'success': True,
            'data': {
                'comparisons': comparisons,
            }
        })
