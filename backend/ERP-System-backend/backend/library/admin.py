from django.contrib import admin
from .models import BookCategory, Book, BookIssue, BookReservation, LibraryMember


@admin.register(BookCategory)
class BookCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "school", "is_active", "created_at"]
    search_fields = ["name", "school__name"]
    list_filter = ["school", "is_active"]


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "isbn", "category", "total_copies", "available_copies", "is_active"]
    search_fields = ["title", "author", "isbn"]
    list_filter = ["school", "category", "is_active"]


@admin.register(BookIssue)
class BookIssueAdmin(admin.ModelAdmin):
    list_display = ["book", "issued_to_type", "issued_to_id", "issue_date", "due_date", "return_date", "status", "fine"]
    search_fields = ["book__title", "issued_to_id"]
    list_filter = ["school", "issued_to_type", "status", "issue_date"]


@admin.register(BookReservation)
class BookReservationAdmin(admin.ModelAdmin):
    list_display = ["book", "reserved_by_type", "reserved_by_id", "reservation_date", "expiry_date", "status"]
    search_fields = ["book__title", "reserved_by_id"]
    list_filter = ["school", "reserved_by_type", "status"]


@admin.register(LibraryMember)
class LibraryMemberAdmin(admin.ModelAdmin):
    list_display = ["school", "member_type", "member_id", "max_books", "is_active"]
    search_fields = ["member_id"]
    list_filter = ["school", "member_type", "is_active"]