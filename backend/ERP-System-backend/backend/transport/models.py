from django.db import models


class BusRoute(models.Model):

    school = models.ForeignKey(
        "schools.School",
        on_delete=models.CASCADE,
        related_name="bus_routes",
    )

    name = models.CharField(max_length=200)

    start_point = models.CharField(max_length=200)

    end_point = models.CharField(max_length=200)

    distance_km = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
    )

    stops = models.JSONField(default=list)

    morning_time = models.TimeField(null=True, blank=True)

    evening_time = models.TimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.start_point} → {self.end_point})"


class Bus(models.Model):

    STATUS_CHOICES = [
        ("active", "Active"),
        ("maintenance", "Maintenance"),
        ("inactive", "Inactive"),
    ]

    school = models.ForeignKey(
        "schools.School",
        on_delete=models.CASCADE,
        related_name="buses",
    )

    bus_number = models.CharField(max_length=20)

    capacity = models.PositiveIntegerField(default=40)

    driver_name = models.CharField(max_length=200, blank=True)

    driver_phone = models.CharField(max_length=15, blank=True)

    conductor_name = models.CharField(max_length=200, blank=True)

    conductor_phone = models.CharField(max_length=15, blank=True)

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default="active",
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["bus_number"]

    def __str__(self):
        return f"Bus {self.bus_number}"


class BusRouteFee(models.Model):

    route = models.ForeignKey(
        BusRoute,
        on_delete=models.CASCADE,
        related_name="fees",
    )

    academic_year = models.ForeignKey(
        "schools.AcademicYear",
        on_delete=models.CASCADE,
        related_name="route_fees",
    )

    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2)

    quarterly_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    annual_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("route", "academic_year")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.route.name} - {self.academic_year.name} (₹{self.monthly_fee}/mo)"


class AdmissionBusDetail(models.Model):

    PAYMENT_MODE_CHOICES = [
        ("monthly", "Monthly"),
        ("quarterly", "Quarterly"),
        ("annual", "Annual"),
    ]

    student = models.OneToOneField(
        "students.Admission",
        on_delete=models.CASCADE,
        related_name="transport_detail",
    )

    route = models.ForeignKey(
        BusRoute,
        on_delete=models.CASCADE,
        related_name="student_assignments",
    )

    bus = models.ForeignKey(
        Bus,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="student_assignments",
    )

    pickup_point = models.CharField(max_length=200, blank=True)

    drop_point = models.CharField(max_length=200, blank=True)

    payment_mode = models.CharField(
        max_length=15,
        choices=PAYMENT_MODE_CHOICES,
        default="monthly",
    )

    fee_amount = models.DecimalField(max_digits=10, decimal_places=2)

    is_active = models.BooleanField(default=True)

    assigned_date = models.DateField(auto_now_add=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student} - {self.route.name}"
