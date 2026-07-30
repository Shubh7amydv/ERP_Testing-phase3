from django.db import models


class VisitorCategory(models.Model):

    school = models.ForeignKey(
        "schools.School",
        on_delete=models.CASCADE,
        related_name="visitor_categories",
    )

    name = models.CharField(max_length=100)

    badge_color = models.CharField(max_length=7, default="#3B82F6")

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.school})"


class Visitor(models.Model):

    ID_TYPE_CHOICES = [
        ("aadhaar", "Aadhaar"),
        ("pan", "PAN"),
        ("driving", "Driving License"),
        ("other", "Other"),
    ]

    MEETING_WITH_TYPE_CHOICES = [
        ("teacher", "Teacher"),
        ("student", "Student"),
        ("staff", "Staff"),
        ("admin", "Admin"),
    ]

    school = models.ForeignKey(
        "schools.School",
        on_delete=models.CASCADE,
        related_name="visitors",
    )

    name = models.CharField(max_length=200)

    phone = models.CharField(max_length=15)

    category = models.ForeignKey(
        VisitorCategory,
        on_delete=models.CASCADE,
        related_name="visitors",
    )

    id_type = models.CharField(
        max_length=20,
        choices=ID_TYPE_CHOICES,
        default="other",
    )

    id_number = models.CharField(max_length=30, blank=True)

    photo = models.ImageField(
        upload_to="visitor_photos/",
        blank=True,
        null=True,
    )

    purpose = models.TextField()

    meeting_with = models.CharField(max_length=200, blank=True)

    meeting_with_type = models.CharField(
        max_length=15,
        choices=MEETING_WITH_TYPE_CHOICES,
        blank=True,
    )

    badge_no = models.CharField(max_length=10, blank=True)

    check_in = models.DateTimeField()

    check_out = models.DateTimeField(null=True, blank=True)

    vehicle_no = models.CharField(max_length=15, blank=True)

    items_carrying = models.TextField(blank=True)

    remarks = models.TextField(blank=True)

    approved_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_visitors",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-check_in"]

    def __str__(self):
        return f"{self.name} - {self.category.name}"

    @property
    def is_inside(self):
        return self.check_out is None


class VisitorPass(models.Model):

    school = models.ForeignKey(
        "schools.School",
        on_delete=models.CASCADE,
        related_name="visitor_passes",
    )

    visitor = models.ForeignKey(
        Visitor,
        on_delete=models.CASCADE,
        related_name="passes",
    )

    pass_no = models.CharField(max_length=20, unique=True)

    valid_from = models.DateTimeField()

    valid_to = models.DateTimeField()

    purpose = models.CharField(max_length=200)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Pass {self.pass_no} - {self.visitor.name}"
