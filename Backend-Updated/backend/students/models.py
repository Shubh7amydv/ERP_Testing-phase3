import uuid

from django.db import models
from django.conf import settings
from schools.models import School, AcademicYear


GENDER_CHOICES = [
    ('Male', 'Male'),
    ('Female', 'Female'),
]

MONTH_CHOICES = [
    ('Jan', 'January'),
    ('Feb', 'February'),
    ('Mar', 'March'),
    ('Apr', 'April'),
    ('May', 'May'),
    ('Jun', 'June'),
    ('Jul', 'July'),
    ('Aug', 'August'),
    ('Sep', 'September'),
    ('Oct', 'October'),
    ('Nov', 'November'),
    ('Dec', 'December'),
]

CLASS_CHOICES = [
    ('NUR', 'Nursery'),
    ('LKG', 'LKG'),
    ('UKG', 'UKG'),
    ('PLAY', 'Play Group'),
    ('I', 'Class 1'),
    ('II', 'Class 2'),
    ('III', 'Class 3'),
    ('IV', 'Class 4'),
    ('V', 'Class 5'),
    ('VI', 'Class 6'),
    ('VII', 'Class 7'),
    ('VIII', 'Class 8'),
    ('IX', 'Class 9'),
    ('X', 'Class 10'),
    ('XI', 'Class 11'),
    ('XII', 'Class 12'),
]

SECTION_CHOICES = [(chr(c), f'Section {chr(c)}') for c in range(ord('A'), ord('Z') + 1)]


class AcademicClass(models.Model):
    CLASS_CHOICES = CLASS_CHOICES

    id = models.BigAutoField(primary_key=True)
    admission_class = models.CharField(max_length=10, choices=CLASS_CHOICES)
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='academic_classes',
        null=True,
        blank=True,
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='academic_classes'
    )

    class Meta:
        unique_together = ('admission_class', 'academic_year')
        verbose_name = 'Academic Class'
        verbose_name_plural = 'Academic Classes'

    def __str__(self):
        return f"{self.get_admission_class_display()} - {self.academic_year.year}"


class Section(models.Model):
    SECTION_CHOICES = SECTION_CHOICES

    id = models.BigAutoField(primary_key=True)
    section = models.CharField(max_length=1, choices=SECTION_CHOICES)
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='sections',
        null=True,
        blank=True,
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='sections'
    )

    class Meta:
        unique_together = ('section', 'academic_year')
        verbose_name = 'Section'
        verbose_name_plural = 'Sections'

    def __str__(self):
        return f"Section {self.section} - {self.academic_year.year}"


class SiblingGroup(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True, blank=True, null=True)
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='sibling_groups',
        null=True,
        blank=True,
    )

    primary_sibling = models.ForeignKey(
        'Admission',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='primary_in_groups'
    )

    def __str__(self):
        return self.name or str(self.id)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.primary_sibling:
            try:
                ps = self.primary_sibling
                if ps.sibling_group_id != self.id:
                    ps.sibling_group = self
                    ps.save(update_fields=['sibling_group'])
            except Exception:
                pass

class Teacher(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    school_id = models.UUIDField(null=True, blank=True)
    contact = models.CharField(max_length=100, blank=True, null=True)
    admission_class = models.ForeignKey(
        'AcademicClass',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='teachers'
    )
    section = models.ForeignKey(
        'Section',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='teachers'
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class House(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='houses',
        null=True,
        blank=True,
    )
    color_code = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.name


class Caste(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='castes',
        null=True,
        blank=True,
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='castes'
    )

    def __str__(self):
        return self.name


class Category(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='categories',
        null=True,
        blank=True,
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='categories'
    )

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Admission(models.Model):
    id = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admissions'
    )
    password = models.CharField(max_length=128, blank=True, null=True)
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='admissions',
        null=True,
        blank=True,
    )
    admission_no = models.CharField(max_length=100, unique=True)
    pen_no = models.CharField(max_length=100, blank=True, null=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=6, choices=GENDER_CHOICES, blank=True, null=True)
    blood_group = models.CharField(max_length=20, blank=True, null=True)
    category = models.ForeignKey(
        'Category',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admissions'
    )
    caste = models.ForeignKey(
        'Caste',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admissions'
    )
    aadhaar_no = models.CharField(max_length=50, blank=True, null=True)
    father_name = models.CharField(max_length=100, blank=True, null=True)
    father_occupation = models.CharField(max_length=100, blank=True, null=True)
    mother_name = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    admission_class = models.ForeignKey(
        'AcademicClass',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admissions'
    )
    section = models.ForeignKey(
        'Section',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admissions'
    )
    sibling_group = models.ForeignKey(
        'SiblingGroup',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='siblings'
    )
    roll_number = models.PositiveIntegerField(blank=True, null=True)

    bus_route = models.CharField(max_length=255, blank=True, null=True)
    bus_detail = models.CharField(max_length=255, blank=True, null=True)
    driver = models.CharField(max_length=255, blank=True, null=True)

    hostel = models.CharField(max_length=255, blank=True, null=True)
    sibling_info = models.TextField(blank=True, null=True)
    medium = models.CharField(max_length=100, blank=True, null=True)
    student_type = models.CharField(max_length=100, blank=True, null=True)
    discount_mode = models.CharField(max_length=100, blank=True, null=True)
    is_bpl = models.BooleanField(default=False)
    dropout = models.BooleanField(default=False)
    tc = models.BooleanField(default=False)
    status = models.CharField(max_length=50, default='Pending')

    house = models.ForeignKey(
        'House',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admissions'
    )

    is_active = models.BooleanField(default=True)
    inactive = models.BooleanField(default=False)
    blocked = models.BooleanField(default=False)

    photo = models.ImageField(
        upload_to='students/photos/',
        null=True,
        blank=True
    )
    parent_photo = models.ImageField(
        upload_to='parents/photos/',
        null=True,
        blank=True
    )

    tc_document = models.FileField(upload_to='students/docs/', blank=True, null=True)
    aadhaar_document = models.FileField(upload_to='students/docs/', blank=True, null=True)

    date_of_admission = models.DateField(blank=True, null=True)
    ssmid = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    height = models.FloatField(blank=True, null=True)
    weight = models.FloatField(blank=True, null=True)
    religion = models.CharField(max_length=100, blank=True, null=True)
    remarks1 = models.TextField(blank=True, null=True)
    remarks2 = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.admission_no})"
