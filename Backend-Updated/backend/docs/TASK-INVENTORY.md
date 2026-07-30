# Task: Inventory & Store Module (Module 9)

> **Assigned To:** Sudipto (API Endpoints) | Varun (Database/Models)
> **Reference:** `docs/ERP-MODULE-PLAN.md` Section 12
> **Tech Stack:** Django 6 + DRF + PostgreSQL
> **Depends On:** Module 0 (Auth), Module 1 (School)

---

## Current State

- No `inventory` app exists
- No inventory/store management system in the ERP
- No stock tracking
- No supplier management
- No purchase order system
- `School` model exists in `schools` app
- `accounts.User` model exists for User

---

## TASKS FOR VARUN (Database / Models)

### Task V1: Create `inventory` Django App
- Run `python manage.py startapp inventory`
- Add `'inventory'` to `INSTALLED_APPS` in `config/settings.py`

### Task V2: Create `InventoryCategory` Model
File: `inventory/models.py`

```python
from django.db import models
from schools.models import School


class InventoryCategory(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='inventory_categories')
    name = models.CharField(max_length=100)  # e.g. "Stationery", "Lab Equipment"
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('school', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.school.name} - {self.name}"
```

### Task V3: Create `Item` Model
File: `inventory/models.py`

```python
class Item(models.Model):
    UNIT_CHOICES = [
        ('piece', 'Piece'),
        ('kg', 'Kilogram'),
        ('litre', 'Litre'),
        ('meter', 'Meter'),
        ('pack', 'Pack'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=200)
    category = models.ForeignKey(InventoryCategory, on_delete=models.CASCADE, related_name='items')
    item_code = models.CharField(max_length=20)  # unique per school
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES)
    min_stock = models.PositiveIntegerField(default=10)
    current_stock = models.PositiveIntegerField(default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('school', 'item_code')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.item_code})"

    @property
    def is_low_stock(self):
        return self.current_stock <= self.min_stock

    @property
    def stock_value(self):
        return self.current_stock * self.unit_price
```

### Task V4: Create `StockEntry` Model
File: `inventory/models.py`

```python
from accounts.models import User


class StockEntry(models.Model):
    ENTRY_TYPE_CHOICES = [
        ('purchase', 'Purchase'),
        ('issue', 'Issue'),
        ('adjustment', 'Adjustment'),
        ('return', 'Return'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='stock_entries')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='stock_entries')
    entry_type = models.CharField(max_length=15, choices=ENTRY_TYPE_CHOICES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.CharField(max_length=200, blank=True)
    invoice_no = models.CharField(max_length=50, blank=True)
    issued_to = models.CharField(max_length=200, blank=True)
    issued_to_type = models.CharField(max_length=15, blank=True)
    # choices: student/teacher/staff/department
    remarks = models.TextField(blank=True)
    entry_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='stock_entries')
    entry_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-entry_date', '-created_at']

    def __str__(self):
        return f"{self.get_entry_type_display()} - {self.item.name} - {self.quantity} {self.item.unit}"

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)
```

### Task V5: Create `Supplier` Model
File: `inventory/models.py`

```python
class Supplier(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='suppliers')
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    gst_no = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
```

### Task V6: Create `PurchaseOrder` Model
File: `inventory/models.py`

```python
class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('received', 'Received'),
        ('cancelled', 'Cancelled'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='purchase_orders')
    order_no = models.CharField(max_length=20, unique=True)  # e.g. "PO-2025-000001"
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders')
    order_date = models.DateField()
    expected_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='draft')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    remarks = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_pos')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_pos')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_no} - {self.supplier.name}"

    def save(self, *args, **kwargs):
        if not self.order_no:
            self.order_no = self.generate_order_no()
        super().save(*args, **kwargs)

    def generate_order_no(self):
        from django.utils import timezone
        year = timezone.now().year
        last_po = PurchaseOrder.objects.filter(
            school=self.school,
            order_no__startswith=f"PO-{year}-"
        ).order_by('-order_no').first()

        if last_po:
            last_num = int(last_po.order_no.split('-')[-1])
            new_num = last_num + 1
        else:
            new_num = 1

        return f"PO-{year}-{new_num:06d}"
```

### Task V7: Create `PurchaseOrderItem` Model
File: `inventory/models.py`

```python
class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='po_items')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    received_qty = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        ordering = ['item']

    def __str__(self):
        return f"{self.item.name} - {self.quantity} {self.item.unit}"

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)
```

### Task V8: Register Models in Admin
File: `inventory/admin.py`

Register all models with appropriate admin classes:
- `InventoryCategory` - list_display: name, school, is_active
- `Item` - list_display: name, item_code, category, unit, current_stock, min_stock, unit_price, is_active
- `StockEntry` - list_display: item, entry_type, quantity, unit_price, total_price, entry_date, entry_by
- `Supplier` - list_display: name, contact_person, phone, email, is_active
- `PurchaseOrder` - list_display: order_no, supplier, order_date, status, total_amount, created_by
- `PurchaseOrderItem` - list_display: purchase_order, item, quantity, unit_price, total_price, received_qty

### Task V9: Run Migrations
```bash
python manage.py makemigrations inventory
python manage.py migrate
```

---

## TASKS FOR SUDIPTO (API Endpoints)

### Task S1: Create Serializers
File: `inventory/serializers.py`

```python
from rest_framework import serializers
from .models import (
    InventoryCategory, Item, StockEntry, Supplier,
    PurchaseOrder, PurchaseOrderItem
)


class InventoryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryCategory
        fields = ['id', 'school', 'name', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    stock_value = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Item
        fields = ['id', 'school', 'name', 'category', 'category_name', 'item_code', 'unit',
                  'min_stock', 'current_stock', 'unit_price', 'description', 'is_active',
                  'is_low_stock', 'stock_value', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class StockEntrySerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_unit = serializers.CharField(source='item.unit', read_only=True)
    entry_by_name = serializers.CharField(source='entry_by.email', read_only=True, default=None)

    class Meta:
        model = StockEntry
        fields = ['id', 'school', 'item', 'item_name', 'item_unit', 'entry_type', 'quantity',
                  'unit_price', 'total_price', 'supplier', 'invoice_no', 'issued_to',
                  'issued_to_type', 'remarks', 'entry_by', 'entry_by_name', 'entry_date',
                  'created_at']
        read_only_fields = ['total_price', 'created_at']


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'school', 'name', 'contact_person', 'phone', 'email', 'address',
                  'gst_no', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_unit = serializers.CharField(source='item.unit', read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'purchase_order', 'item', 'item_name', 'item_unit', 'quantity',
                  'unit_price', 'total_price', 'received_qty']
        read_only_fields = ['total_price']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.email', read_only=True, default=None)
    approved_by_name = serializers.CharField(source='approved_by.email', read_only=True, default=None)
    items = PurchaseOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'school', 'order_no', 'supplier', 'supplier_name', 'order_date',
                  'expected_date', 'status', 'total_amount', 'remarks', 'created_by',
                  'created_by_name', 'approved_by', 'approved_by_name', 'items',
                  'created_at', 'updated_at']
        read_only_fields = ['order_no', 'created_at', 'updated_at']


class CreatePurchaseOrderSerializer(serializers.Serializer):
    """Serializer for creating purchase order with items."""
    supplier_id = serializers.IntegerField()
    order_date = serializers.DateField()
    expected_date = serializers.DateField(required=False, allow_null=True)
    remarks = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(
        child=serializers.DictField(
            child=serializers.Field()
        )
    )
    # items format: [{"item_id": 1, "quantity": 10, "unit_price": 50.00}]
```

### Task S2: Create Custom Permissions
File: `inventory/permissions.py`

```python
from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class IsSchoolAdmin(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role and
                request.user.role.name in ['Super Admin', 'School Admin'])


class IsStoreManager(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role and
                request.user.role.name in ['Super Admin', 'School Admin', 'Office Staff'])


class IsSchoolMember(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.school is not None
```

### Task S3: Create InventoryCategory Views
File: `inventory/views.py`

```python
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import InventoryCategory
from .serializers import InventoryCategorySerializer
from .permissions import IsSchoolMember


class InventoryCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryCategorySerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        return InventoryCategory.objects.filter(school=self.request.user.school)
```

### Task S4: Create Item Views
File: `inventory/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Item, StockEntry
from .serializers import ItemSerializer


class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'category', 'unit', 'is_active']

    def get_queryset(self):
        queryset = Item.objects.filter(
            school=self.request.user.school
        ).select_related('category')
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(item_code__icontains=search) |
                Q(description__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        """Get items with stock at or below minimum level."""
        items = self.get_queryset().filter(
            current_stock__lte=models.F('min_stock'),
            is_active=True
        )
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='stock-history')
    def stock_history(self, request, pk=None):
        """Get stock entry history for an item."""
        item = self.get_object()
        entries = StockEntry.objects.filter(
            item=item,
            school=request.user.school
        ).select_related('entry_by').order_by('-entry_date')

        serializer_data = []
        for entry in entries:
            serializer_data.append({
                'id': entry.id,
                'entry_type': entry.entry_type,
                'entry_type_display': entry.get_entry_type_display(),
                'quantity': float(entry.quantity),
                'unit_price': float(entry.unit_price),
                'total_price': float(entry.total_price),
                'supplier': entry.supplier,
                'invoice_no': entry.invoice_no,
                'issued_to': entry.issued_to,
                'remarks': entry.remarks,
                'entry_by': entry.entry_by.email if entry.entry_by else None,
                'entry_date': str(entry.entry_date),
                'created_at': entry.created_at.isoformat()
            })

        return Response(serializer_data)
```

### Task S5: Create StockEntry Views
File: `inventory/views.py`

```python
from django.db import transaction
from django.utils import timezone
from .models import StockEntry, Item
from .serializers import StockEntrySerializer


class StockEntryViewSet(viewsets.ModelViewSet):
    serializer_class = StockEntrySerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'item', 'entry_type', 'entry_date']

    def get_queryset(self):
        return StockEntry.objects.filter(
            school=self.request.user.school
        ).select_related('item', 'entry_by')

    def perform_create(self, serializer):
        serializer.save(entry_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='purchase')
    def purchase(self, request):
        """Record a stock purchase."""
        serializer = StockEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            entry = serializer.save(
                entry_by=request.user,
                entry_type='purchase'
            )

            # Update item stock
            item = entry.item
            item.current_stock += int(entry.quantity)
            item.unit_price = entry.unit_price
            item.save()

        return Response(StockEntrySerializer(entry).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='issue')
    def issue(self, request):
        """Issue stock to a department/person."""
        serializer = StockEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item = Item.objects.get(id=request.data['item_id'], school=request.user.school)

        if item.current_stock < int(request.data['quantity']):
            return Response(
                {'error': f'Insufficient stock. Available: {item.current_stock}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            entry = serializer.save(
                entry_by=request.user,
                entry_type='issue'
            )

            # Update item stock
            item.current_stock -= int(entry.quantity)
            item.save()

        return Response(StockEntrySerializer(entry).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='adjust')
    def adjust(self, request):
        """Adjust stock (add or subtract)."""
        serializer = StockEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            entry = serializer.save(
                entry_by=request.user,
                entry_type='adjustment'
            )

            # Update item stock based on quantity (positive adds, negative subtracts)
            item = entry.item
            item.current_stock += int(entry.quantity)
            if item.current_stock < 0:
                item.current_stock = 0
            item.save()

        return Response(StockEntrySerializer(entry).data, status=status.HTTP_201_CREATED)
```

### Task S6: Create Supplier Views
File: `inventory/views.py`

```python
from .models import Supplier
from .serializers import SupplierSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        queryset = Supplier.objects.filter(school=self.request.user.school)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(contact_person__icontains=search) |
                Q(phone__icontains=search)
            )
        return queryset
```

### Task S7: Create PurchaseOrder Views
File: `inventory/views.py`

```python
from .models import PurchaseOrder, PurchaseOrderItem
from .serializers import (
    PurchaseOrderSerializer, PurchaseOrderItemSerializer,
    CreatePurchaseOrderSerializer
)


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'supplier', 'status', 'order_date']

    def get_queryset(self):
        return PurchaseOrder.objects.filter(
            school=self.request.user.school
        ).select_related('supplier', 'created_by', 'approved_by')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='create-with-items')
    def create_with_items(self, request):
        """Create a purchase order with items."""
        serializer = CreatePurchaseOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        from schools.models import School
        school = request.user.school

        # Create PO
        po = PurchaseOrder.objects.create(
            school=school,
            supplier_id=data['supplier_id'],
            order_date=data['order_date'],
            expected_date=data.get('expected_date'),
            remarks=data.get('remarks', ''),
            created_by=request.user,
            status='draft'
        )

        # Create PO items
        total = 0
        for item_data in data['items']:
            item = Item.objects.get(id=item_data['item_id'], school=school)
            po_item = PurchaseOrderItem.objects.create(
                purchase_order=po,
                item=item,
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                total_price=item_data['quantity'] * item_data['unit_price']
            )
            total += po_item.total_price

        po.total_amount = total
        po.save()

        return Response(PurchaseOrderSerializer(po).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a purchase order."""
        po = self.get_object()
        if po.status not in ['draft', 'pending']:
            return Response(
                {'error': 'Only draft or pending POs can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )

        po.status = 'approved'
        po.approved_by = request.user
        po.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        """Mark PO as received and update stock."""
        po = self.get_object()
        if po.status != 'approved':
            return Response(
                {'error': 'Only approved POs can be received'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            po.status = 'received'
            po.save()

            # Update stock for each item
            for po_item in po.items.all():
                item = po_item.item
                item.current_stock += int(po_item.quantity)
                item.save()

                # Create stock entry
                StockEntry.objects.create(
                    school=po.school,
                    item=item,
                    entry_type='purchase',
                    quantity=po_item.quantity,
                    unit_price=po_item.unit_price,
                    total_price=po_item.total_price,
                    supplier=po.supplier.name,
                    invoice_no=po.order_no,
                    remarks=f'PO {po.order_no} received',
                    entry_by=request.user,
                    entry_date=timezone.now().date()
                )

        return Response({'status': 'received'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a purchase order."""
        po = self.get_object()
        if po.status in ['received', 'cancelled']:
            return Response(
                {'error': 'Cannot cancel received or already cancelled POs'},
                status=status.HTTP_400_BAD_REQUEST
            )

        po.status = 'cancelled'
        po.save()
        return Response({'status': 'cancelled'})
```

### Task S8: Create Report Views
File: `inventory/views.py`

```python
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Item, StockEntry, PurchaseOrder


class StockSummaryReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        category_id = request.query_params.get('category')

        items = Item.objects.filter(school=school, is_active=True)
        if category_id:
            items = items.filter(category_id=category_id)

        total_items = items.count()
        total_stock_value = items.aggregate(
            total=Sum(models.F('current_stock') * models.F('unit_price'))
        )['total'] or 0
        low_stock_items = items.filter(current_stock__lte=models.F('min_stock')).count()

        by_category = items.values(
            'category__name'
        ).annotate(
            item_count=Count('id'),
            total_stock=Sum('current_stock'),
            stock_value=Sum(models.F('current_stock') * models.F('unit_price'))
        ).order_by('category__name')

        return Response({
            'total_items': total_items,
            'total_stock_value': float(total_stock_value),
            'low_stock_items': low_stock_items,
            'by_category': list(by_category)
        })


class IssueHistoryReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        item_id = request.query_params.get('item_id')

        entries = StockEntry.objects.filter(
            school=school,
            entry_type='issue'
        ).select_related('item', 'entry_by')

        if start_date and end_date:
            entries = entries.filter(entry_date__range=[start_date, end_date])
        if item_id:
            entries = entries.filter(item_id=item_id)

        total_issued = entries.aggregate(total=Sum('total_price'))['total'] or 0
        by_item = entries.values(
            'item__id', 'item__name', 'item__unit'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_value=Sum('total_price'),
            issue_count=Count('id')
        ).order_by('-total_value')

        return Response({
            'total_issues': entries.count(),
            'total_value_issued': float(total_issued),
            'by_item': list(by_item)
        })


class PurchaseHistoryReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        supplier_id = request.query_params.get('supplier_id')

        pos = PurchaseOrder.objects.filter(
            school=school,
            status='received'
        ).select_related('supplier')

        if start_date and end_date:
            pos = pos.filter(order_date__range=[start_date, end_date])
        if supplier_id:
            pos = pos.filter(supplier_id=supplier_id)

        total_purchased = pos.aggregate(total=Sum('total_amount'))['total'] or 0

        by_supplier = pos.values(
            'supplier__id', 'supplier__name'
        ).annotate(
            po_count=Count('id'),
            total_amount=Sum('total_amount')
        ).order_by('-total_amount')

        monthly = pos.extra(
            select={'month': "date_trunc('month', order_date)"}
        ).values('month').annotate(
            total=Sum('total_amount'),
            count=Count('id')
        ).order_by('-month')[:12]

        return Response({
            'total_pos': pos.count(),
            'total_purchased': float(total_purchased),
            'by_supplier': list(by_supplier),
            'monthly': list(monthly)
        })
```

### Task S9: Create URL Patterns
File: `inventory/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'inventory-categories', views.InventoryCategoryViewSet)
router.register(r'items', views.ItemViewSet)
router.register(r'stock-entries', views.StockEntryViewSet)
router.register(r'suppliers', views.SupplierViewSet)
router.register(r'purchase-orders', views.PurchaseOrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('inventory/reports/stock-summary/', views.StockSummaryReportView.as_view(), name='inventory-stock-summary-report'),
    path('inventory/reports/issue-history/', views.IssueHistoryReportView.as_view(), name='inventory-issue-history-report'),
    path('inventory/reports/purchase-history/', views.PurchaseHistoryReportView.as_view(), name='inventory-purchase-history-report'),
]
```

### Task S10: Wire URLs in `config/urls.py`
Add to root `urls.py`:
```python
path('api/', include('inventory.urls')),
```

### Task S11: Test All Endpoints
Create test data and verify:
1. CRUD for InventoryCategory
2. CRUD for Item
3. Search items by name/code
4. Get low stock items
5. Get stock history for item
6. Record purchase (stock in)
7. Issue stock (stock out)
8. Adjust stock
9. CRUD for Supplier
10. Search suppliers
11. CRUD for PurchaseOrder
12. Create PO with items
13. Approve PO
14. Receive PO (auto-update stock)
15. Cancel PO
16. Stock summary report
17. Issue history report
18. Purchase history report

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Inventory Categories** | | |
| GET | `/api/inventory-categories/` | List categories |
| POST | `/api/inventory-categories/` | Create category |
| GET | `/api/inventory-categories/{id}/` | Category detail |
| PUT | `/api/inventory-categories/{id}/` | Update category |
| DELETE | `/api/inventory-categories/{id}/` | Delete category |
| **Items** | | |
| GET | `/api/items/` | List items (search available) |
| POST | `/api/items/` | Add item |
| GET | `/api/items/{id}/` | Item detail |
| PUT | `/api/items/{id}/` | Update item |
| DELETE | `/api/items/{id}/` | Delete item |
| GET | `/api/items/low-stock/` | Low stock items |
| GET | `/api/items/{id}/stock-history/` | Item stock history |
| **Stock Entries** | | |
| GET | `/api/stock-entries/` | List stock entries |
| POST | `/api/stock-entries/` | Create stock entry |
| POST | `/api/stock-entries/purchase/` | Record purchase |
| POST | `/api/stock-entries/issue/` | Issue stock |
| POST | `/api/stock-entries/adjust/` | Adjust stock |
| **Suppliers** | | |
| GET | `/api/suppliers/` | List suppliers |
| POST | `/api/suppliers/` | Add supplier |
| GET | `/api/suppliers/{id}/` | Supplier detail |
| PUT | `/api/suppliers/{id}/` | Update supplier |
| DELETE | `/api/suppliers/{id}/` | Delete supplier |
| **Purchase Orders** | | |
| GET | `/api/purchase-orders/` | List POs |
| POST | `/api/purchase-orders/` | Create PO |
| GET | `/api/purchase-orders/{id}/` | PO detail |
| PUT | `/api/purchase-orders/{id}/` | Update PO |
| POST | `/api/purchase-orders/create-with-items/` | Create PO with items |
| POST | `/api/purchase-orders/{id}/approve/` | Approve PO |
| POST | `/api/purchase-orders/{id}/receive/` | Receive PO (update stock) |
| POST | `/api/purchase-orders/{id}/cancel/` | Cancel PO |
| **Reports** | | |
| GET | `/api/inventory/reports/stock-summary/` | Stock summary report |
| GET | `/api/inventory/reports/issue-history/` | Issue history report |
| GET | `/api/inventory/reports/purchase-history/` | Purchase history report |

---

## Implementation Order (Suggested)

### Phase 1: Foundation (Day 1)
1. **Varun:** Create app + models (V1-V8) + migrations (V9)
2. **Sudipto:** Create serializers (S1) + permissions (S2)

### Phase 2: Core CRUD (Day 2)
3. **Sudipto:** InventoryCategory, Supplier views (S3, S6)
4. **Sudipto:** Item views with low-stock + stock-history (S4)

### Phase 3: Stock Management (Day 3)
5. **Sudipto:** StockEntry views - purchase, issue, adjust (S5)

### Phase 4: Purchase Orders (Day 4)
6. **Sudipto:** PurchaseOrder views with approve, receive, cancel (S7)

### Phase 5: Reports & Integration (Day 5)
7. **Sudipto:** Report views (S8)
8. **Sudipto:** URL patterns + wire in root urls (S9-S10)
9. **Both:** Testing all endpoints (S11)

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| djangorestframework | 3.17.1 | Already installed |
| django-filter | Latest | For query parameter filtering |
| Django | 6.0.5 | Already installed |

---

## Notes

- `accounts.User` model is used for User (already exists)
- `schools.School` model is used for School (already exists)
- Purchase order number format: `PO-YYYY-NNNNNN` (e.g., PO-2025-000001)
- `Item.is_low_stock` property checks if current_stock <= min_stock
- `Item.stock_value` property returns current_stock * unit_price
- Stock purchase auto-updates item's current_stock and unit_price
- Stock issue checks for sufficient stock before deducting
- Stock adjustment can be positive (add) or negative (subtract)
- PO receive action auto-updates stock for all items in the PO
- PO status flow: draft → pending → approved → received (or cancelled)
- `StockEntry.entry_by` tracks who made the entry
- Reports support date range and item/supplier filtering
