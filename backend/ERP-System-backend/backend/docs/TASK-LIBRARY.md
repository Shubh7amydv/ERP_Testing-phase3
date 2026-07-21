# Task: Library Module (Module 6)

> **Assigned To:** Sudipto (API Endpoints) | Varun (Database/Models)
> **Reference:** `docs/ERP-MODULE-PLAN.md` Section 9
> **Tech Stack:** Django 6 + DRF + PostgreSQL
> **Depends On:** Module 0 (Auth), Module 1 (School), Module 2 (Students)

---

## Current State

- No `library` app exists
- No library/book management system in the ERP
- `Admission` model exists in `students` app (used as Student)
- `Teacher` model exists in `students` app
- `School` model exists in `schools` app
- `accounts.User` model exists for User
- No book catalog
- No issue/return tracking
- No reservation system

---

## TASKS FOR VARUN (Database / Models)

### Task V1: Create `library` Django App
- Run `python manage.py startapp library`
- Add `'library'` to `INSTALLED_APPS` in `config/settings.py`

### Task V2: Create `BookCategory` Model
File: `library/models.py`

```python
from django.db import models
from schools.models import School


class BookCategory(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='book_categories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['name']

    def __str__(self):
        return self.name
```

### Task V3: Create `Book` Model
File: `library/models.py`

```python
class Book(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='books')
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=13, unique=True)
    publisher = models.CharField(max_length=200, blank=True)
    category = models.ForeignKey(BookCategory, on_delete=models.SET_NULL, null=True, related_name='books')
    edition = models.CharField(max_length=50, blank=True)
    year_published = models.PositiveIntegerField(null=True, blank=True)
    language = models.CharField(max_length=30, default='English')
    pages = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='book_covers/', blank=True)
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    location = models.CharField(max_length=50, blank=True)  # e.g. "Shelf A-3"
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return f"{self.title} by {self.author}"

    @property
    def is_available(self):
        return self.available_copies > 0
```

### Task V4: Create `BookIssue` Model
File: `library/models.py`

```python
from accounts.models import User


class BookIssue(models.Model):
    MEMBER_TYPE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('staff', 'Staff'),
    ]

    STATUS_CHOICES = [
        ('issued', 'Issued'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
        ('lost', 'Lost'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='book_issues')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='issues')
    issued_to_type = models.CharField(max_length=10, choices=MEMBER_TYPE_CHOICES)
    issued_to_id = models.PositiveIntegerField()  # ID of student/teacher/staff
    issued_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='issued_books')
    issue_date = models.DateField()
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='issued')
    fine = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fine_paid = models.BooleanField(default=False)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-issue_date']

    def __str__(self):
        return f"{self.book.title} - {self.issued_to_type}:{self.issued_to_id} ({self.status})"

    @property
    def is_overdue(self):
        from datetime import date
        if self.status == 'issued' and self.due_date < date.today():
            return True
        return False

    @property
    def days_overdue(self):
        from datetime import date
        if self.status == 'issued' and self.due_date < date.today():
            return (date.today() - self.due_date).days
        return 0
```

### Task V5: Create `BookReservation` Model
File: `library/models.py`

```python
class BookReservation(models.Model):
    MEMBER_TYPE_CHOICES = BookIssue.MEMBER_TYPE_CHOICES

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='book_reservations')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reservations')
    reserved_by_type = models.CharField(max_length=10, choices=MEMBER_TYPE_CHOICES)
    reserved_by_id = models.PositiveIntegerField()
    reservation_date = models.DateField()
    expiry_date = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-reservation_date']

    def __str__(self):
        return f"{self.book.title} - {self.reserved_by_type}:{self.reserved_by_id} ({self.status})"

    @property
    def is_expired(self):
        from datetime import date
        return self.expiry_date < date.today()
```

### Task V6: Create `LibraryMember` Model
File: `library/models.py`

```python
class LibraryMember(models.Model):
    MEMBER_TYPE_CHOICES = BookIssue.MEMBER_TYPE_CHOICES

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='library_members')
    member_type = models.CharField(max_length=10, choices=MEMBER_TYPE_CHOICES)
    member_id = models.PositiveIntegerField()
    max_books = models.PositiveIntegerField(default=3)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'member_type', 'member_id')
        ordering = ['member_type', 'member_id']

    def __str__(self):
        return f"{self.member_type}:{self.member_id} (Max: {self.max_books})"

    @property
    def currently_issued_count(self):
        return BookIssue.objects.filter(
            school=self.school,
            issued_to_type=self.member_type,
            issued_to_id=self.member_id,
            status='issued'
        ).count()

    @property
    def can_issue(self):
        return self.currently_issued_count < self.max_books
```

### Task V7: Register Models in Admin
File: `library/admin.py`

Register all models with appropriate admin classes:
- `BookCategory` - list_display: name, school, is_active, created_at
- `Book` - list_display: title, author, isbn, category, total_copies, available_copies, is_active
- `BookIssue` - list_display: book, issued_to_type, issued_to_id, issue_date, due_date, return_date, status, fine
- `BookReservation` - list_display: book, reserved_by_type, reserved_by_id, reservation_date, expiry_date, status
- `LibraryMember` - list_display: school, member_type, member_id, max_books, is_active

### Task V8: Run Migrations
```bash
python manage.py makemigrations library
python manage.py migrate
```

---

## TASKS FOR SUDIPTO (API Endpoints)

### Task S1: Create Serializers
File: `library/serializers.py`

```python
from rest_framework import serializers
from .models import BookCategory, Book, BookIssue, BookReservation, LibraryMember


class BookCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookCategory
        fields = ['id', 'school', 'name', 'description', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    is_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = Book
        fields = ['id', 'school', 'title', 'author', 'isbn', 'publisher', 'category', 'category_name',
                  'edition', 'year_published', 'language', 'pages', 'description', 'cover_image',
                  'total_copies', 'available_copies', 'location', 'price', 'is_active',
                  'is_available', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'available_copies']


class BookIssueSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    issued_by_name = serializers.CharField(source='issued_by.email', read_only=True, default=None)
    is_overdue = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)

    class Meta:
        model = BookIssue
        fields = ['id', 'school', 'book', 'book_title', 'issued_to_type', 'issued_to_id',
                  'issued_by', 'issued_by_name', 'issue_date', 'due_date', 'return_date',
                  'status', 'fine', 'fine_paid', 'remarks', 'is_overdue', 'days_overdue',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'status', 'return_date']


class BookReservationSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = BookReservation
        fields = ['id', 'school', 'book', 'book_title', 'reserved_by_type', 'reserved_by_id',
                  'reservation_date', 'expiry_date', 'status', 'is_expired', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'status']


class LibraryMemberSerializer(serializers.ModelSerializer):
    currently_issued_count = serializers.IntegerField(read_only=True)
    can_issue = serializers.BooleanField(read_only=True)

    class Meta:
        model = LibraryMember
        fields = ['id', 'school', 'member_type', 'member_id', 'max_books', 'is_active',
                  'currently_issued_count', 'can_issue', 'created_at']
        read_only_fields = ['created_at']


class IssueBookSerializer(serializers.Serializer):
    """Serializer for issuing a book."""
    book_id = serializers.IntegerField()
    issued_to_type = serializers.ChoiceField(choices=['student', 'teacher', 'staff'])
    issued_to_id = serializers.IntegerField()
    due_date = serializers.DateField()
    remarks = serializers.CharField(required=False, allow_blank=True)


class ReturnBookSerializer(serializers.Serializer):
    """Serializer for returning a book."""
    remarks = serializers.CharField(required=False, allow_blank=True)
    fine = serializers.DecimalField(max_digits=10, decimal_places=2, default=0, required=False)
    fine_paid = serializers.BooleanField(default=False, required=False)
```

### Task S2: Create Custom Permissions
File: `library/permissions.py`

```python
from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class IsLibrarian(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role and
                request.user.role.name in ['School Admin', 'Librarian', 'Vice Principal', 'Principal'])


class IsSchoolMember(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.school is not None
```

### Task S3: Create BookCategory Views
File: `library/views.py`

```python
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import BookCategory
from .serializers import BookCategorySerializer
from .permissions import IsSchoolMember


class BookCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = BookCategorySerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        return BookCategory.objects.filter(school=self.request.user.school)
```

### Task S4: Create Book Views
File: `library/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Book
from .serializers import BookSerializer


class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'category', 'language', 'is_active']

    def get_queryset(self):
        return Book.objects.filter(school=self.request.user.school).select_related('category')

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
        """Get books with available copies."""
        books = self.get_queryset().filter(available_copies__gt=0)
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='overdue')
    def overdue(self, request):
        """Get books that are currently overdue (all copies issued)."""
        from .models import BookIssue
        overdue_book_ids = BookIssue.objects.filter(
            school=request.user.school,
            status='issued',
            due_date__lt=timezone.now().date()
        ).values_list('book_id', flat=True).distinct()

        books = self.get_queryset().filter(id__in=overdue_book_ids)
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)
```

### Task S5: Create BookIssue Views
File: `library/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from .models import Book, BookIssue, LibraryMember
from .serializers import BookIssueSerializer, IssueBookSerializer, ReturnBookSerializer


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
        """Issue a book to a member."""
        serializer = IssueBookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Check book availability
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

        # Check member and max books limit
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
            # Create issue record
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

            # Decrement available copies
            book.available_copies -= 1
            book.save()

        return Response(
            BookIssueSerializer(issue).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='return')
    def return_book(self, request, pk=None):
        """Return a book."""
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

            # Increment available copies
            book = issue.book
            book.available_copies += 1
            book.save()

            # Check if there's a reservation to fulfill
            from .models import BookReservation
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
        """Get all active (issued) books."""
        issues = self.get_queryset().filter(status='issued')
        serializer = self.get_serializer(issues, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='overdue')
    def overdue(self, request):
        """Get all overdue books."""
        issues = self.get_queryset().filter(
            status='issued',
            due_date__lt=timezone.now().date()
        )
        serializer = self.get_serializer(issues, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path=r'by-member/(?P<type>[^/.]+)/(?P<member_id>[^/.]+)')
    def by_member(self, request, type=None, member_id=None):
        """Get issues for a specific member."""
        issues = self.get_queryset().filter(
            issued_to_type=type,
            issued_to_id=member_id
        )
        serializer = self.get_serializer(issues, many=True)
        return Response(serializer.data)
```

### Task S6: Create BookReservation Views
File: `library/views.py`

```python
from .models import Book, BookReservation
from .serializers import BookReservationSerializer


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
        """Fulfill a reservation (mark as fulfilled when book is issued)."""
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
        """Cancel a reservation."""
        reservation = self.get_object()
        if reservation.status != 'active':
            return Response(
                {'error': 'Only active reservations can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reservation.status = 'cancelled'
        reservation.save()
        return Response({'status': 'cancelled'})
```

### Task S7: Create LibraryMember Views
File: `library/views.py`

```python
from .models import LibraryMember, BookIssue
from .serializers import LibraryMemberSerializer


class LibraryMemberViewSet(viewsets.ModelViewSet):
    serializer_class = LibraryMemberSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'member_type', 'is_active']

    def get_queryset(self):
        return LibraryMember.objects.filter(school=self.request.user.school)

    @action(detail=True, methods=['get'], url_path='history')
    def history(self, request, pk=None):
        """Get issue history for a member."""
        member = self.get_object()
        issues = BookIssue.objects.filter(
            school=member.school,
            issued_to_type=member.member_type,
            issued_to_id=member.member_id
        ).select_related('book').order_by('-issue_date')

        serializer = BookIssueSerializer(issues, many=True)
        return Response(serializer.data)
```

### Task S8: Create Report Views
File: `library/views.py`

```python
from rest_framework.views import APIView
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from .models import Book, BookIssue, BookReservation, LibraryMember


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
```

### Task S9: Create URL Patterns
File: `library/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'book-categories', views.BookCategoryViewSet)
router.register(r'books', views.BookViewSet)
router.register(r'book-issues', views.BookIssueViewSet)
router.register(r'book-reservations', views.BookReservationViewSet)
router.register(r'library-members', views.LibraryMemberViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('library/reports/popular-books/', views.PopularBooksReportView.as_view(), name='library-popular-books-report'),
    path('library/reports/member-activity/', views.MemberActivityReportView.as_view(), name='library-member-activity-report'),
    path('library/reports/overdue-summary/', views.OverdueSummaryReportView.as_view(), name='library-overdue-summary-report'),
    path('library/reports/inventory/', views.InventoryReportView.as_view(), name='library-inventory-report'),
]
```

### Task S10: Wire URLs in `config/urls.py`
Add to root `urls.py`:
```python
path('api/', include('library.urls')),
```

### Task S11: Test All Endpoints
Create test data and verify:
1. CRUD for BookCategory
2. CRUD for Book
3. Search books by title/author/ISBN
4. List available books
5. List overdue books
6. Issue a book
7. Return a book
8. List active issues
9. List overdue issues
10. Get issues by member
11. CRUD for BookReservation
12. Fulfill reservation
13. Cancel reservation
14. CRUD for LibraryMember
15. Get member issue history
16. Popular books report
17. Member activity report
18. Overdue summary report
19. Inventory report

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Book Categories** | | |
| GET | `/api/book-categories/` | List categories |
| POST | `/api/book-categories/` | Create category |
| GET | `/api/book-categories/{id}/` | Category detail |
| PUT | `/api/book-categories/{id}/` | Update category |
| DELETE | `/api/book-categories/{id}/` | Delete category |
| **Books** | | |
| GET | `/api/books/` | List books (search available) |
| POST | `/api/books/` | Add book |
| GET | `/api/books/{id}/` | Book detail |
| PUT | `/api/books/{id}/` | Update book |
| DELETE | `/api/books/{id}/` | Delete book |
| GET | `/api/books/available/` | Available books only |
| GET | `/api/books/overdue/` | Overdue books |
| **Book Issues** | | |
| GET | `/api/book-issues/` | List all issues |
| POST | `/api/book-issues/` | Create issue record |
| POST | `/api/book-issues/issue/` | Issue book (with checks) |
| POST | `/api/book-issues/{id}/return/` | Return book |
| GET | `/api/book-issues/active/` | Active issues |
| GET | `/api/book-issues/overdue/` | Overdue issues |
| GET | `/api/book-issues/by-member/{type}/{id}/` | Member's issues |
| **Book Reservations** | | |
| GET | `/api/book-reservations/` | List reservations |
| POST | `/api/book-reservations/` | Reserve book |
| GET | `/api/book-reservations/{id}/` | Reservation detail |
| PUT | `/api/book-reservations/{id}/` | Update reservation |
| POST | `/api/book-reservations/{id}/fulfill/` | Fulfill reservation |
| POST | `/api/book-reservations/{id}/cancel/` | Cancel reservation |
| **Library Members** | | |
| GET | `/api/library-members/` | List members |
| POST | `/api/library-members/` | Add member |
| GET | `/api/library-members/{id}/` | Member detail |
| PUT | `/api/library-members/{id}/` | Update member |
| DELETE | `/api/library-members/{id}/` | Remove member |
| GET | `/api/library-members/{id}/history/` | Member's issue history |
| **Reports** | | |
| GET | `/api/library/reports/popular-books/` | Most issued books |
| GET | `/api/library/reports/member-activity/` | Member activity |
| GET | `/api/library/reports/overdue-summary/` | Overdue summary |
| GET | `/api/library/reports/inventory/` | Book inventory |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| djangorestframework | 3.17.1 | Already installed |
| django-filter | Latest | For query parameter filtering |
| Django | 6.0.5 | Already installed |
| Pillow | Latest | For ImageField (Book cover) |

---

## Notes

- `students.Admission` model is used as Student (already exists)
- `students.Teacher` model is used as Teacher (already exists)
- `accounts.User` model is used for User (already exists)
- `schools.School` model is used for School (already exists)
- `BookIssue.issued_to_id` stores the ID of student/teacher/staff (polymorphic approach)
- `BookReservation.reserved_by_id` uses same polymorphic pattern
- `LibraryMember` tracks max books allowed per member type
- `available_copies` auto-decrements on issue, increments on return
- `Book.is_available` property checks if copies are available
- `BookIssue.is_overdue` property checks if due date has passed
- Overdue fines are tracked per issue (not auto-calculated - manual input)
- `return_book` action auto-fulfills oldest active reservation for that book
