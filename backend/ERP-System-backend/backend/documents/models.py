from django.db import models


class DocumentCategory(models.Model):

    school = models.ForeignKey(
        "schools.School",
        on_delete=models.CASCADE,
        related_name="document_categories",
    )

    name = models.CharField(max_length=100)

    description = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("school", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.school})"


class Document(models.Model):

    TARGET_TYPE_CHOICES = [
        ("student", "Student"),
        ("staff", "Staff"),
        ("general", "General"),
    ]

    school = models.ForeignKey(
        "schools.School",
        on_delete=models.CASCADE,
        related_name="documents",
    )

    category = models.ForeignKey(
        DocumentCategory,
        on_delete=models.CASCADE,
        related_name="documents",
    )

    title = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    file = models.FileField(upload_to="documents/")

    file_size = models.PositiveIntegerField(default=0)

    uploaded_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="uploaded_documents",
    )

    target_type = models.CharField(
        max_length=15,
        choices=TARGET_TYPE_CHOICES,
        default="general",
    )

    target_id = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    academic_year = models.ForeignKey(
        "schools.AcademicYear",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents",
    )

    is_public = models.BooleanField(default=False)

    tags = models.JSONField(default=list)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class DocumentTemplate(models.Model):

    school = models.ForeignKey(
        "schools.School",
        on_delete=models.CASCADE,
        related_name="document_templates",
    )

    category = models.ForeignKey(
        DocumentCategory,
        on_delete=models.CASCADE,
        related_name="templates",
    )

    name = models.CharField(max_length=200)

    template_file = models.FileField(upload_to="document_templates/")

    placeholders = models.JSONField(default=list)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class TransferCertificate(models.Model):

    school = models.ForeignKey(
        "schools.School",
        on_delete=models.CASCADE,
        related_name="transfer_certificates",
    )

    student = models.ForeignKey(
        "students.Admission",
        on_delete=models.CASCADE,
        related_name="transfer_certificates",
    )

    tc_number = models.CharField(max_length=20, unique=True)

    issue_date = models.DateField()

    reason = models.TextField()

    conduct = models.CharField(max_length=100, blank=True)

    class_studied = models.CharField(max_length=50, blank=True)

    last_exam_passed = models.CharField(max_length=100, blank=True)

    remarks = models.TextField(blank=True)

    issued_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="issued_tcs",
    )

    document = models.ForeignKey(
        Document,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transfer_certificates",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"TC {self.tc_number} - {self.student}"
