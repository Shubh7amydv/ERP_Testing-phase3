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
    book_id = serializers.IntegerField()
    issued_to_type = serializers.ChoiceField(choices=['student', 'teacher', 'staff'])
    issued_to_id = serializers.IntegerField()
    due_date = serializers.DateField()
    remarks = serializers.CharField(required=False, allow_blank=True)


class ReturnBookSerializer(serializers.Serializer):
    remarks = serializers.CharField(required=False, allow_blank=True)
    fine = serializers.DecimalField(max_digits=10, decimal_places=2, default=0, required=False)
    fine_paid = serializers.BooleanField(default=False, required=False)
