import json

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Case, When, Value, IntegerField, F, Count
from django.db import transaction
from django.utils.timezone import now as tz_now

from .models import Admission, SiblingGroup, Caste, House, AcademicClass, Section, Category
from .serializers import (
    AdmissionSerializer, CasteSerializer, HouseSerializer,
    AcademicClassSerializer, SectionSerializer, CategorySerializer,
)
from .permissions import IsSchoolMember, ModulePermission
from schools.models import AcademicYear


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

class AutoInjectSchoolYearMixin:
    def create(self, request, *args, **kwargs):
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        if 'school' not in data or not data['school']:
            school = getattr(request.user, 'school', None)
            if school:
                data['school'] = school.id
        if hasattr(self.get_serializer().Meta.model, 'academic_year') and ('academic_year' not in data or not data['academic_year']):
            academic_year = AcademicYear.objects.filter(is_active=True).first() or AcademicYear.objects.order_by('-year').first()
            if academic_year:
                data['academic_year'] = academic_year.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_paginated_response(self, paginated_data):
        return Response({
            'success': True,
            'data': {
                'admissions': paginated_data['results'],
                'pagination': {
                    'page': paginated_data['page'],
                    'limit': paginated_data['limit'],
                    'total': paginated_data['total'],
                }
            }
        })


class AdmissionViewSet(StandardPaginationMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSchoolMember, ModulePermission("admissions")]
    serializer_class = AdmissionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'admission_class': ['exact'],
        'section': ['exact'],
        'house': ['exact'],
        'gender': ['exact'],
        'is_active': ['exact'],
        'inactive': ['exact'],
        'blocked': ['exact'],
        'dropout': ['exact'],
        'tc': ['exact'],
        'is_bpl': ['exact'],
    }

    def get_queryset(self):
        qs = Admission.objects.select_related(
            'admission_class', 'section', 'house', 'caste', 'category', 'sibling_group'
        ).prefetch_related('sibling_group__siblings').filter(is_active=True)

        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)

        year = self.request.query_params.get('year')
        admission_no = self.request.query_params.get('admission_no')
        search = self.request.query_params.get('search')
        ordering = self.request.query_params.get('ordering')

        if year:
            qs = qs.filter(admission_class__academic_year__year=year)
        if admission_no:
            qs = qs.filter(admission_no=admission_no)

        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(admission_no__icontains=search) |
                Q(father_name__icontains=search) |
                Q(phone__icontains=search) |
                Q(admission_class__admission_class__icontains=search) |
                Q(section__section__icontains=search) |
                Q(house__name__icontains=search) |
                Q(bus_route__icontains=search) |
                Q(medium__icontains=search) |
                Q(caste__name__icontains=search)
            )

        if ordering == 'roll_number':
            qs = qs.order_by('roll_number')
        else:
            qs = qs.order_by('-created_at')

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        paginated = self.paginate_queryset(queryset, request)
        serializer = self.get_serializer(paginated['results'], many=True)
        paginated['results'] = serializer.data
        return self.get_paginated_response(paginated)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(
            {'message': 'Admission deactivated successfully'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='filter-by-groups')
    def filter_by_groups(self, request):
        groups_param = request.query_params.get('groups')
        year = request.query_params.get('year')
        qs = self.get_queryset()

        if groups_param:
            try:
                groups = json.loads(groups_param)
            except ValueError:
                return Response(
                    {'success': False, 'message': 'Invalid JSON for groups parameter.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not isinstance(groups, list):
                return Response(
                    {'success': False, 'message': 'groups must be a JSON array of class/section objects.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            query = Q()
            for group in groups:
                if not isinstance(group, dict):
                    continue
                admission_class = group.get('class')
                section = group.get('section')
                if admission_class and section:
                    query |= Q(
                        admission_class__admission_class=admission_class,
                        section__section=section
                    )
                elif admission_class:
                    query |= Q(admission_class__admission_class=admission_class)

            if not query:
                return Response(
                    {'success': False, 'message': 'At least one valid class/section pair is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            qs = qs.filter(query)

        class_order = [
            'NUR', 'LKG', 'UKG', 'PLAY', 'I', 'II', 'III', 'IV', 'V', 'VI',
            'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
        ]
        class_order_case = Case(
            *[
                When(admission_class__admission_class=cls, then=Value(idx))
                for idx, cls in enumerate(class_order)
            ],
            default=Value(len(class_order)),
            output_field=IntegerField()
        )
        ordering_param = request.query_params.get('ordering')
        qs = qs.annotate(class_order_value=class_order_case)

        if ordering_param == 'house':
            qs = qs.order_by('class_order_value', 'section__section', 'house__name', 'roll_number')
        elif ordering_param == 'new':
            qs = qs.order_by('class_order_value', 'section__section', '-created_at')
        else:
            qs = qs.order_by('class_order_value', 'section__section', 'roll_number')

        paginated = self.paginate_queryset(qs, request)
        serializer = self.get_serializer(paginated['results'], many=True)
        paginated['results'] = serializer.data
        return self.get_paginated_response(paginated)

    @action(detail=False, methods=['get'], url_path='class-wise-total-students')
    def class_wise_total_students(self, request):
        from django.utils.timezone import now
        from datetime import timedelta

        year_param = request.query_params.get('year')
        if not year_param:
            current_year = now().year
            year_param = f"{current_year}-{current_year + 1}"

        qs = Admission.objects.filter(is_active=True, admission_class__academic_year__year=year_param)
        seven_days_ago = now() - timedelta(days=7)

        stats = qs.values(
            class_name=F('admission_class__admission_class'),
            section_name=F('section__section')
        ).annotate(
            boys=Count('id', filter=Q(gender='Male')),
            girls=Count('id', filter=Q(gender='Female')),
            total_students=Count('id'),
            dropout_count=Count('id', filter=Q(dropout=True)),
            tc_count=Count('id', filter=Q(tc=True)),
            new_students=Count('id', filter=Q(created_at__gte=seven_days_ago))
        ).order_by('class_name', 'section_name')

        class_order = [
            'NUR', 'LKG', 'UKG', 'PLAY', 'I', 'II', 'III', 'IV', 'V', 'VI',
            'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
        ]

        result_map = {}
        for item in stats:
            cls = item['class_name']
            if not cls:
                continue

            sec = item['section_name']

            if cls not in result_map:
                result_map[cls] = {
                    "class": cls,
                    "year": year_param,
                    "sections": [],
                    "class_total": {
                        "boys": 0,
                        "girls": 0,
                        "total_students": 0,
                        "dropout": 0,
                        "tc": 0,
                        "new_students": 0
                    }
                }

            section_data = {
                "section": sec,
                "boys": item['boys'],
                "girls": item['girls'],
                "total_students": item['total_students'],
                "dropout": item['dropout_count'],
                "tc": item['tc_count'],
                "new_students": item['new_students']
            }

            result_map[cls]['sections'].append(section_data)

            result_map[cls]['class_total']['boys'] += item['boys']
            result_map[cls]['class_total']['girls'] += item['girls']
            result_map[cls]['class_total']['total_students'] += item['total_students']
            result_map[cls]['class_total']['dropout'] += item['dropout_count']
            result_map[cls]['class_total']['tc'] += item['tc_count']
            result_map[cls]['class_total']['new_students'] += item['new_students']

        result_list = list(result_map.values())
        result_list.sort(key=lambda x: class_order.index(x['class']) if x['class'] in class_order else len(class_order))

        return Response({
            "success": True,
            "data": result_list
        })

    @action(detail=False, methods=['patch'], url_path='bulk-update')
    def bulk_update(self, request):
        data = request.data
        if not isinstance(data, list):
            return Response(
                {'success': False, 'message': 'Request body must be a list of admission objects.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        updated = []
        errors = []

        for item in data:
            admission_id = item.get('id')
            if not admission_id:
                errors.append({'id': None, 'errors': {'id': 'This field is required.'}})
                continue

            try:
                admission = Admission.objects.get(id=admission_id, is_active=True)
            except Admission.DoesNotExist:
                errors.append({'id': admission_id, 'errors': {'id': f'Admission {admission_id} not found.'}})
                continue

            serializer = self.get_serializer(admission, data=item, partial=True)
            if serializer.is_valid():
                serializer.save()
                updated.append(serializer.data)
            else:
                errors.append({'id': admission_id, 'errors': serializer.errors})

        return Response({
            'success': True,
            'updated': updated,
            'errors': errors,
        }, status=status.HTTP_200_OK)


class AcademicClassViewSet(AutoInjectSchoolYearMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSchoolMember, ModulePermission("admissions")]
    serializer_class = AcademicClassSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['academic_year']

    def perform_create(self, serializer):
        school = getattr(self.request.user, 'school', None)
        academic_year = AcademicYear.objects.filter(is_active=True).first() or AcademicYear.objects.order_by('-year').first()
        serializer.save(school=school, academic_year=academic_year)

    def get_queryset(self):
        qs = AcademicClass.objects.select_related('academic_year').all()
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        year = self.request.query_params.get('year', '').strip()
        if year:
            qs = qs.filter(academic_year__year=year)
        academic_year = self.request.query_params.get('academic_year', '').strip()
        if academic_year:
            qs = qs.filter(academic_year__id=academic_year)
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(admission_class__icontains=search)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except ValueError:
            page = 1
        try:
            limit = max(1, int(request.query_params.get('limit', 10)))
        except ValueError:
            limit = 10
        from django.core.paginator import Paginator
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        serializer = self.get_serializer(page_obj, many=True)
        return Response({
            'page': page,
            'limit': limit,
            'total': paginator.count,
            'results': serializer.data,
        })


class SectionViewSet(AutoInjectSchoolYearMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSchoolMember, ModulePermission("admissions")]
    serializer_class = SectionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['academic_year']

    def perform_create(self, serializer):
        school = getattr(self.request.user, 'school', None)
        academic_year = AcademicYear.objects.filter(is_active=True).first() or AcademicYear.objects.order_by('-year').first()
        serializer.save(school=school, academic_year=academic_year)

    def get_queryset(self):
        qs = Section.objects.select_related('academic_year').all()
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        year = self.request.query_params.get('year', '').strip()
        if year:
            qs = qs.filter(academic_year__year=year)
        academic_year = self.request.query_params.get('academic_year', '').strip()
        if academic_year:
            qs = qs.filter(academic_year__id=academic_year)
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(section__icontains=search)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except ValueError:
            page = 1
        try:
            limit = max(1, int(request.query_params.get('limit', 10)))
        except ValueError:
            limit = 10
        from django.core.paginator import Paginator
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        serializer = self.get_serializer(page_obj, many=True)
        return Response({
            'page': page,
            'limit': limit,
            'total': paginator.count,
            'results': serializer.data,
        })


class SiblingGroupViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsSchoolMember, ModulePermission("admissions")]
    serializer_class = AdmissionSerializer

    def list(self, request):
        year = request.query_params.get('year')
        groups_param = request.query_params.get('groups')
        groups = SiblingGroup.objects.prefetch_related(
            'siblings__admission_class', 'siblings__section'
        )
        school = getattr(self.request.user, 'school', None)
        if school:
            groups = groups.filter(school=school)
        if year:
            groups = groups.filter(primary_sibling__admission_class__academic_year__year=year)

        if groups_param:
            try:
                group_filters = json.loads(groups_param)
            except ValueError:
                return Response(
                    {'success': False, 'message': 'Invalid JSON for groups parameter.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not isinstance(group_filters, list):
                return Response(
                    {'success': False, 'message': 'groups must be a JSON array of class/section objects.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            group_query = Q()
            for group in group_filters:
                if not isinstance(group, dict):
                    continue
                admission_class = group.get('class')
                section = group.get('section')
                if admission_class and section:
                    group_query |= Q(
                        primary_sibling__admission_class__admission_class=admission_class,
                        primary_sibling__section__section=section
                    )

            if not group_query:
                return Response(
                    {'success': False, 'message': 'At least one valid class/section pair is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            groups = groups.filter(group_query)

        sibling_groups_data = []
        for group in groups:
            admissions = list(group.siblings.all())
            serializer = self.get_serializer(admissions, many=True)
            primary_id = str(group.primary_sibling_id) if group.primary_sibling_id else None
            admissions_data = []
            for admission in serializer.data:
                admission['is_primary'] = admission['id'] == primary_id
                admissions_data.append(admission)

            sibling_groups_data.append({
                'sibling_group_name': group.name,
                'admissions': admissions_data
            })

        return Response({'sibling_groups': sibling_groups_data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='add-to-sibling-group')
    def add_to_sibling_group(self, request):
        data = request.data
        name = data.get('sibling_group_name')
        admission_ids = data.get('admission_ids') or []
        primary_id = data.get('primary_sibling')

        if not name:
            return Response({'success': False, 'message': 'sibling_group_name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(admission_ids, (list, tuple)) or len(admission_ids) == 0:
            return Response({'success': False, 'message': 'admission_ids must be a non-empty list of admission ids.'}, status=status.HTTP_400_BAD_REQUEST)

        if primary_id and primary_id not in admission_ids:
            admission_ids = list(admission_ids) + [primary_id]

        admissions_qs = Admission.objects.filter(id__in=admission_ids)
        found_ids = set(str(a.id) for a in admissions_qs)
        missing = [aid for aid in admission_ids if str(aid) not in found_ids]
        if missing:
            return Response({'success': False, 'message': f'Admissions not found: {missing}'}, status=status.HTTP_400_BAD_REQUEST)

        group, _ = SiblingGroup.objects.get_or_create(name=name, defaults={'school': self.request.user.school})

        for adm in admissions_qs:
            old_group = adm.sibling_group
            if old_group and old_group.id != group.id:
                if old_group.primary_sibling_id == adm.id:
                    remaining_siblings = old_group.siblings.exclude(id=adm.id)
                    if remaining_siblings.exists():
                        old_group.primary_sibling = remaining_siblings.first()
                        old_group.save(update_fields=['primary_sibling'])
                    else:
                        old_group.delete()
            if adm.sibling_group_id != group.id:
                adm.sibling_group = group
                adm.save(update_fields=['sibling_group'])

        if primary_id:
            try:
                primary = admissions_qs.get(id=primary_id)
            except Admission.DoesNotExist:
                primary = admissions_qs.first()
        else:
            primary = admissions_qs.first()

        if primary and group.primary_sibling_id != primary.id:
            group.primary_sibling = primary
            group.save(update_fields=['primary_sibling'])

        serializer = self.get_serializer(admissions_qs, many=True)
        response_data = {
            'sibling_group': {
                'id': str(group.id),
                'name': group.name,
                'primary_sibling': str(group.primary_sibling.id) if group.primary_sibling else None
            },
            'admissions': serializer.data
        }

        return Response({'success': True, 'data': response_data}, status=status.HTTP_200_OK)


class CasteViewSet(AutoInjectSchoolYearMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSchoolMember, ModulePermission("admissions")]
    serializer_class = CasteSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['academic_year']

    def perform_create(self, serializer):
        school = getattr(self.request.user, 'school', None)
        academic_year = AcademicYear.objects.filter(is_active=True).first() or AcademicYear.objects.order_by('-year').first()
        serializer.save(school=school, academic_year=academic_year)

    def get_queryset(self):
        qs = Caste.objects.select_related('academic_year').all()
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        year = self.request.query_params.get('year', '').strip()
        if year:
            qs = qs.filter(academic_year__year=year)
        academic_year = self.request.query_params.get('academic_year', '').strip()
        if academic_year:
            qs = qs.filter(academic_year__id=academic_year)
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(name__icontains=search)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except ValueError:
            page = 1
        try:
            limit = max(1, int(request.query_params.get('limit', 10)))
        except ValueError:
            limit = 10
        from django.core.paginator import Paginator
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        serializer = self.get_serializer(page_obj, many=True)
        return Response({
            'page': page,
            'limit': limit,
            'total': paginator.count,
            'results': serializer.data,
        })


class HouseViewSet(AutoInjectSchoolYearMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSchoolMember, ModulePermission("admissions")]
    serializer_class = HouseSerializer

    def perform_create(self, serializer):
        school = getattr(self.request.user, 'school', None)
        serializer.save(school=school)

    def get_queryset(self):
        qs = House.objects.all()
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(color_code__icontains=search))
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except ValueError:
            page = 1
        try:
            limit = max(1, int(request.query_params.get('limit', 10)))
        except ValueError:
            limit = 10
        from django.core.paginator import Paginator
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        serializer = self.get_serializer(page_obj, many=True)
        return Response({
            'page': page,
            'limit': limit,
            'total': paginator.count,
            'results': serializer.data,
        })


class CategoryViewSet(AutoInjectSchoolYearMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSchoolMember, ModulePermission("admissions")]
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['academic_year']

    def perform_create(self, serializer):
        school = getattr(self.request.user, 'school', None)
        academic_year = AcademicYear.objects.filter(is_active=True).first() or AcademicYear.objects.order_by('-year').first()
        serializer.save(school=school, academic_year=academic_year)

    def get_queryset(self):
        qs = Category.objects.select_related('academic_year').all()
        school = getattr(self.request.user, 'school', None)
        if school:
            qs = qs.filter(school=school)
        year = self.request.query_params.get('year', '').strip()
        if year:
            qs = qs.filter(academic_year__year=year)
        academic_year = self.request.query_params.get('academic_year', '').strip()
        if academic_year:
            qs = qs.filter(academic_year__id=academic_year)
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(name__icontains=search)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except ValueError:
            page = 1
        try:
            limit = max(1, int(request.query_params.get('limit', 10)))
        except ValueError:
            limit = 10
        from django.core.paginator import Paginator
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        serializer = self.get_serializer(page_obj, many=True)
        return Response({
            'page': page,
            'limit': limit,
            'total': paginator.count,
            'results': serializer.data,
        })
