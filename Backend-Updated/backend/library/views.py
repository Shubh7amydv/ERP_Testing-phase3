from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction
from django.db.models import Count, Sum, Q
from datetime import timedelta

from .models import BookCategory, Book, BookIssue, BookReservation, LibraryMember
from .serializers import (
    BookCategorySerializer,
    BookSerializer,
    BookIssueSerializer,
    BookReservationSerializer,
    LibraryMemberSerializer,
    IssueBookSerializer,
    ReturnBookSerializer,
)
from .permissions import IsSchoolMember


class BookCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = BookCategorySerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        return BookCategory.objects.filter(school=self.request.user.school)


class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'category', 'language', 'is_active']

    def get_queryset(self):
        queryset = Book.objects.filter(school=self.request.user.school).select_related('category')
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(author__icontains=search) |
                Q(isbn__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['get'], url_path='available')
    def available(self, request):
        books = self.get_queryset().filter(available_copies__gt=0)
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='overdue')
    def overdue(self, request):
        overdue_book_ids = BookIssue.objects.filter(
            school=request.user.school,
            status='issued',
            due_date__lt=timezone.now().date()
        ).values_list('book_id', flat=True).distinct()

        books = self.get_queryset().filter(id__in=overdue_book_ids)
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)


class BookIssueViewSet(viewsets.ModelViewSet):
    serializer_class = BookIssueSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'book', 'issued_to_type', 'issued_to_id', 'status']

    def get_queryset(self):
        return BookIssue.objects.filter(
            school=self.request.user.school
        ).select_related('book', 'issued_by')

    def perform_create(self, serializer):
        serializer.save(issued_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='issue')
    def issue_book(self, request):
        serializer = IssueBookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            book = Book.objects.get(id=data['book_id'], school=request.user.school)
        except Book.DoesNotExist:
            return Response(
                {'error': 'Book not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if book.available_copies <= 0:
            return Response(
                {'error': 'No copies available'},
                status=status.HTTP_400_BAD_REQUEST
            )

        member, created = LibraryMember.objects.get_or_create(
            school=request.user.school,
            member_type=data['issued_to_type'],
            member_id=data['issued_to_id'],
            defaults={'max_books': 3}
        )

        if not member.can_issue:
            return Response(
                {'error': f'Member has reached max book limit ({member.max_books})'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            issue = BookIssue.objects.create(
                school=request.user.school,
                book=book,
                issued_to_type=data['issued_to_type'],
                issued_to_id=data['issued_to_id'],
                issued_by=request.user,
                issue_date=timezone.now().date(),
                due_date=data['due_date'],
                remarks=data.get('remarks', ''),
                status='issued'
            )

            book.available_copies -= 1
            book.save()

        return Response(
            BookIssueSerializer(issue).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='return')
    def return_book(self, request, pk=None):
        issue = self.get_object()
        if issue.status != 'issued':
            return Response(
                {'error': 'This book is not currently issued'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ReturnBookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            issue.status = 'returned'
            issue.return_date = timezone.now().date()
            issue.fine = data.get('fine', 0)
            issue.fine_paid = data.get('fine_paid', False)
            issue.remarks = data.get('remarks', '')
            issue.save()

            book = issue.book
            book.available_copies += 1
            book.save()

            reservation = BookReservation.objects.filter(
                book=book,
                status='active',
                expiry_date__gte=timezone.now().date()
            ).order_by('reservation_date').first()

            if reservation:
                reservation.status = 'fulfilled'
                reservation.save()

        return Response({
            'status': 'returned',
            'fine': float(issue.fine),
            'return_date': str(issue.return_date)
        })

    @action(detail=False, methods=['get'], url_path='active')
    def active(self, request):
        issues = self.get_queryset().filter(status='issued')
        serializer = self.get_serializer(issues, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='overdue')
    def overdue(self, request):
        issues = self.get_queryset().filter(
            status='issued',
            due_date__lt=timezone.now().date()
        )
        serializer = self.get_serializer(issues, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path=r'by-member/(?P<type>[^/.]+)/(?P<member_id>[^/.]+)')
    def by_member(self, request, type=None, member_id=None):
        issues = self.get_queryset().filter(
            issued_to_type=type,
            issued_to_id=member_id
        )
        serializer = self.get_serializer(issues, many=True)
        return Response(serializer.data)


class BookReservationViewSet(viewsets.ModelViewSet):
    serializer_class = BookReservationSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'book', 'reserved_by_type', 'reserved_by_id', 'status']

    def get_queryset(self):
        return BookReservation.objects.filter(
            school=self.request.user.school
        ).select_related('book')

    @action(detail=True, methods=['post'], url_path='fulfill')
    def fulfill(self, request, pk=None):
        reservation = self.get_object()
        if reservation.status != 'active':
            return Response(
                {'error': 'Only active reservations can be fulfilled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reservation.status = 'fulfilled'
        reservation.save()
        return Response({'status': 'fulfilled'})

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        reservation = self.get_object()
        if reservation.status != 'active':
            return Response(
                {'error': 'Only active reservations can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reservation.status = 'cancelled'
        reservation.save()
        return Response({'status': 'cancelled'})


class LibraryMemberViewSet(viewsets.ModelViewSet):
    serializer_class = LibraryMemberSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'member_type', 'is_active']

    def get_queryset(self):
        return LibraryMember.objects.filter(school=self.request.user.school)

    @action(detail=True, methods=['get'], url_path='history')
    def history(self, request, pk=None):
        member = self.get_object()
        issues = BookIssue.objects.filter(
            school=member.school,
            issued_to_type=member.member_type,
            issued_to_id=member.member_id
        ).select_related('book').order_by('-issue_date')

        serializer = BookIssueSerializer(issues, many=True)
        return Response(serializer.data)


class PopularBooksReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        limit = int(request.query_params.get('limit', 10))

        popular = BookIssue.objects.filter(
            school=school
        ).values(
            'book__id', 'book__title', 'book__author'
        ).annotate(
            issue_count=Count('id')
        ).order_by('-issue_count')[:limit]

        return Response(list(popular))


class MemberActivityReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        member_type = request.query_params.get('member_type')

        issues = BookIssue.objects.filter(school=school)
        if member_type:
            issues = issues.filter(issued_to_type=member_type)

        activity = issues.values(
            'issued_to_type', 'issued_to_id'
        ).annotate(
            total_issues=Count('id'),
            active_issues=Count('id', filter=Q(status='issued')),
            total_fine=Sum('fine')
        ).order_by('-total_issues')[:50]

        return Response(list(activity))


class OverdueSummaryReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school

        overdue_issues = BookIssue.objects.filter(
            school=school,
            status='issued',
            due_date__lt=timezone.now().date()
        ).select_related('book')

        total_overdue = overdue_issues.count()
        total_fine = overdue_issues.aggregate(total=Sum('fine'))['total'] or 0

        by_member = overdue_issues.values(
            'issued_to_type', 'issued_to_id'
        ).annotate(
            overdue_count=Count('id')
        ).order_by('-overdue_count')

        return Response({
            'total_overdue_books': total_overdue,
            'total_fine_pending': float(total_fine),
            'by_member': list(by_member)
        })


class InventoryReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school

        books = Book.objects.filter(school=school, is_active=True)
        total_books = books.count()
        total_copies = books.aggregate(total=Sum('total_copies'))['total'] or 0
        available_copies = books.aggregate(total=Sum('available_copies'))['total'] or 0
        issued_copies = total_copies - available_copies

        by_category = books.values(
            'category__name'
        ).annotate(
            book_count=Count('id'),
            total_copies=Sum('total_copies'),
            available_copies=Sum('available_copies')
        ).order_by('category__name')

        low_stock = books.filter(
            available_copies__lte=2,
            available_copies__gt=0
        ).values('id', 'title', 'author', 'available_copies')

        return Response({
            'total_books': total_books,
            'total_copies': total_copies,
            'available_copies': available_copies,
            'issued_copies': issued_copies,
            'by_category': list(by_category),
            'low_stock': list(low_stock)
        })
