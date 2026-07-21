from django.db import models
from schools.models import School
from accounts.models import User


class BookCategory(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="book_categories")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Book(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="books")
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=13, unique=True)
    publisher = models.CharField(max_length=200, blank=True)
    category = models.ForeignKey(BookCategory, on_delete=models.SET_NULL, null=True, related_name="books")
    edition = models.CharField(max_length=50, blank=True)
    year_published = models.PositiveIntegerField(null=True, blank=True)
    language = models.CharField(max_length=30, default="English")
    pages = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="book_covers/", blank=True)
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    location = models.CharField(max_length=50, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return f"{self.title} by {self.author}"

    @property
    def is_available(self):
        return self.available_copies > 0


class BookIssue(models.Model):
    MEMBER_TYPE_CHOICES = [
        ("student", "Student"),
        ("teacher", "Teacher"),
        ("staff", "Staff"),
    ]

    STATUS_CHOICES = [
        ("issued", "Issued"),
        ("returned", "Returned"),
        ("overdue", "Overdue"),
        ("lost", "Lost"),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="book_issues")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="issues")
    issued_to_type = models.CharField(max_length=10, choices=MEMBER_TYPE_CHOICES)
    issued_to_id = models.PositiveIntegerField()
    issued_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="issued_books")
    issue_date = models.DateField()
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="issued")
    fine = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fine_paid = models.BooleanField(default=False)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-issue_date"]

    def __str__(self):
        return f"{self.book.title} - {self.issued_to_type}:{self.issued_to_id} ({self.status})"

    @property
    def is_overdue(self):
        from datetime import date
        return self.status == "issued" and self.due_date < date.today()

    @property
    def days_overdue(self):
        from datetime import date
        if self.is_overdue:
            return (date.today() - self.due_date).days
        return 0


class BookReservation(models.Model):
    MEMBER_TYPE_CHOICES = BookIssue.MEMBER_TYPE_CHOICES

    STATUS_CHOICES = [
        ("active", "Active"),
        ("fulfilled", "Fulfilled"),
        ("cancelled", "Cancelled"),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="book_reservations")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="reservations")
    reserved_by_type = models.CharField(max_length=10, choices=MEMBER_TYPE_CHOICES)
    reserved_by_id = models.PositiveIntegerField()
    reservation_date = models.DateField()
    expiry_date = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-reservation_date"]

    def __str__(self):
        return f"{self.book.title} - {self.reserved_by_type}:{self.reserved_by_id} ({self.status})"

    @property
    def is_expired(self):
        from datetime import date
        return self.expiry_date < date.today()


class LibraryMember(models.Model):
    MEMBER_TYPE_CHOICES = BookIssue.MEMBER_TYPE_CHOICES

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="library_members")
    member_type = models.CharField(max_length=10, choices=MEMBER_TYPE_CHOICES)
    member_id = models.PositiveIntegerField()
    max_books = models.PositiveIntegerField(default=3)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "member_type", "member_id")
        ordering = ["member_type", "member_id"]

    def __str__(self):
        return f"{self.member_type}:{self.member_id} (Max: {self.max_books})"

    @property
    def currently_issued_count(self):
        return BookIssue.objects.filter(
            school=self.school,
            issued_to_type=self.member_type,
            issued_to_id=self.member_id,
            status="issued",
        ).count()

    @property
    def can_issue(self):
        return self.currently_issued_count < self.max_books