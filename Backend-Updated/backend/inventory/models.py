from django.db import models
from django.utils import timezone

from schools.models import School
from accounts.models import User


class InventoryCategory(models.Model):
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="inventory_categories"
    )

    name = models.CharField(max_length=100)

    description = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("school", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.school.name} - {self.name}"


class Item(models.Model):

    UNIT_CHOICES = [
        ("piece", "Piece"),
        ("kg", "Kilogram"),
        ("litre", "Litre"),
        ("meter", "Meter"),
        ("pack", "Pack"),
    ]

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="items"
    )

    name = models.CharField(max_length=200)

    category = models.ForeignKey(
        InventoryCategory,
        on_delete=models.CASCADE,
        related_name="items"
    )

    item_code = models.CharField(max_length=20)

    unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES
    )

    min_stock = models.PositiveIntegerField(default=10)

    current_stock = models.PositiveIntegerField(default=0)

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    description = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("school", "item_code")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.item_code})"

    @property
    def is_low_stock(self):
        return self.current_stock <= self.min_stock

    @property
    def stock_value(self):
        return self.current_stock * self.unit_price


class StockEntry(models.Model):

    ENTRY_TYPE_CHOICES = [
        ("purchase", "Purchase"),
        ("issue", "Issue"),
        ("adjustment", "Adjustment"),
        ("return", "Return"),
    ]

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="stock_entries"
    )

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name="stock_entries"
    )

    entry_type = models.CharField(
        max_length=15,
        choices=ENTRY_TYPE_CHOICES
    )

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    supplier = models.CharField(
        max_length=200,
        blank=True
    )

    invoice_no = models.CharField(
        max_length=50,
        blank=True
    )

    issued_to = models.CharField(
        max_length=200,
        blank=True
    )

    issued_to_type = models.CharField(
        max_length=15,
        blank=True
    )

    remarks = models.TextField(blank=True)

    entry_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="stock_entries"
    )

    entry_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-entry_date", "-created_at"]

    def __str__(self):
        return f"{self.get_entry_type_display()} - {self.item.name} - {self.quantity} {self.item.unit}"

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.quantity * self.unit_price

        super().save(*args, **kwargs)
        
class Supplier(models.Model):
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="suppliers"
    )

    name = models.CharField(max_length=200)

    contact_person = models.CharField(
        max_length=100,
        blank=True
    )

    phone = models.CharField(max_length=15)

    email = models.EmailField(
        blank=True
    )

    address = models.TextField(
        blank=True
    )

    gst_no = models.CharField(
        max_length=15,
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name        

class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("received", "Received"),
        ("cancelled", "Cancelled"),
    ]

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="purchase_orders",
    )

    order_no = models.CharField(
        max_length=20,
        unique=True,
    )

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        related_name="purchase_orders",
    )

    order_date = models.DateField()

    expected_date = models.DateField(
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default="draft",
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    remarks = models.TextField(
        blank=True,
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_purchase_orders",
    )

    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_purchase_orders",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order_no} - {self.supplier.name}"

    def save(self, *args, **kwargs):
        if not self.order_no:
            self.order_no = self.generate_order_no()

        super().save(*args, **kwargs)

    def generate_order_no(self):
        year = timezone.now().year

        last_po = PurchaseOrder.objects.filter(
            school=self.school,
            order_no__startswith=f"PO-{year}-",
        ).order_by("-order_no").first()

        if last_po:
            last_number = int(last_po.order_no.split("-")[-1])
            new_number = last_number + 1
        else:
            new_number = 1

        return f"PO-{year}-{new_number:06d}"
    
class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name="items",
    )

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name="purchase_order_items",
    )

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    received_qty = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    class Meta:
        ordering = ["item"]

    def __str__(self):
        return f"{self.item.name} - {self.quantity} {self.item.unit}"

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.quantity * self.unit_price

        super().save(*args, **kwargs)