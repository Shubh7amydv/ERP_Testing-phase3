from django.db import models

from schools.models import School, AcademicYear
from students.models import Admission


class Hostel(models.Model):
    TYPE_CHOICES = [
        ('boys', 'Boys'),
        ('girls', 'Girls'),
        ('staff', 'Staff'),
    ]

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='hostels'
    )
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    address = models.TextField(blank=True)
    warden = models.CharField(max_length=100, blank=True)
    contact = models.CharField(max_length=15, blank=True)
    total_rooms = models.PositiveIntegerField(default=0)
    capacity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

    @property
    def occupied_rooms(self):
        return self.rooms.aggregate(
            total_occupied=models.Sum("occupied")
        )["total_occupied"] or 0

    @property
    def occupancy_percentage(self):
        if self.capacity == 0:
            return 0
        return round((self.occupied_rooms / self.capacity) * 100, 1)


class HostelRoom(models.Model):
    ROOM_TYPE_CHOICES = [
        ('single', 'Single'),
        ('double', 'Double'),
        ('triple', 'Triple'),
        ('dorm', 'Dormitory'),
    ]

    hostel = models.ForeignKey(
        Hostel,
        on_delete=models.CASCADE,
        related_name='rooms'
    )
    room_number = models.CharField(max_length=10)
    floor = models.PositiveIntegerField(default=1)
    room_type = models.CharField(max_length=15, choices=ROOM_TYPE_CHOICES)
    capacity = models.PositiveIntegerField()
    occupied = models.PositiveIntegerField(default=0)
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    facilities = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('hostel', 'room_number')
        ordering = ['floor', 'room_number']

    def __str__(self):
        return f"{self.hostel.name} - Room {self.room_number}"

    @property
    def available_beds(self):
        return self.capacity - self.occupied

    @property
    def is_full(self):
        return self.occupied >= self.capacity


class HostelAllocation(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('vacated', 'Vacated'),
        ('transferred', 'Transferred'),
    ]

    hostel = models.ForeignKey(
        Hostel,
        on_delete=models.CASCADE,
        related_name='allocations'
    )
    room = models.ForeignKey(
        HostelRoom,
        on_delete=models.CASCADE,
        related_name='allocations'
    )
    student = models.ForeignKey(
        Admission,
        on_delete=models.CASCADE,
        related_name='hostel_allocations'
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='hostel_allocations'
    )
    allocated_from = models.DateField()
    allocated_to = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='active'
    )
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'academic_year')
        ordering = ['-allocated_from']

    def __str__(self):
        return f"{self.student} - {self.room} ({self.status})"


class HostelFee(models.Model):
    hostel = models.ForeignKey(
        Hostel,
        on_delete=models.CASCADE,
        related_name='fees'
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='hostel_fees'
    )
    room_type = models.CharField(
        max_length=15,
        choices=HostelRoom.ROOM_TYPE_CHOICES
    )
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2)
    security_deposit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('hostel', 'academic_year', 'room_type')
        ordering = ['room_type']

    def __str__(self):
        return f"{self.hostel.name} - {self.get_room_type_display()} - ₹{self.monthly_fee}/month"


class HostelAttendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('out', 'Out'),
    ]

    hostel = models.ForeignKey(
        Hostel,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    student = models.ForeignKey(
        Admission,
        on_delete=models.CASCADE,
        related_name='hostel_attendances'
    )
    date = models.DateField()
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.student} - {self.date} - {self.status}"


class HostelVisitor(models.Model):
    hostel = models.ForeignKey(
        Hostel,
        on_delete=models.CASCADE,
        related_name='visitors'
    )
    student = models.ForeignKey(
        Admission,
        on_delete=models.CASCADE,
        related_name='hostel_visitors'
    )
    visitor_name = models.CharField(max_length=100)
    visitor_phone = models.CharField(max_length=15)
    relation = models.CharField(max_length=50)
    id_proof = models.CharField(max_length=50)
    visit_date = models.DateField()
    check_in = models.TimeField()
    check_out = models.TimeField(null=True, blank=True)
    purpose = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-visit_date', '-check_in']

    def __str__(self):
        return f"{self.visitor_name} - {self.student} ({self.visit_date})"


class HostelMessMenu(models.Model):
    MEAL_TYPE_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
    ]

    DAY_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]

    hostel = models.ForeignKey(
        Hostel,
        on_delete=models.CASCADE,
        related_name='mess_menus'
    )
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    meal_type = models.CharField(max_length=10, choices=MEAL_TYPE_CHOICES)
    menu_items = models.TextField()
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('hostel', 'date', 'meal_type')
        ordering = ['date', 'meal_type']

    def __str__(self):
        return f"{self.hostel.name} - {self.get_day_of_week_display()} - {self.get_meal_type_display()}"