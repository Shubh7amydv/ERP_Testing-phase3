from rest_framework import serializers
from .models import InventoryCategory, Item, StockEntry, Supplier, PurchaseOrder, PurchaseOrderItem


class InventoryCategorySerializer(serializers.ModelSerializer):
    item_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = InventoryCategory
        fields = ['id', 'school', 'name', 'description', 'is_active', 'item_count', 'created_at', 'updated_at']
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
        read_only_fields = ['created_at', 'total_price']


class SupplierSerializer(serializers.ModelSerializer):
    active_orders_count = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = ['id', 'school', 'name', 'contact_person', 'phone', 'email', 'address',
                  'gst_no', 'is_active', 'active_orders_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_active_orders_count(self, obj):
        return obj.purchase_orders.exclude(status__in=['received', 'cancelled']).count()


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_code = serializers.CharField(source='item.item_code', read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'purchase_order', 'item', 'item_name', 'item_code', 'quantity',
                  'unit_price', 'total_price', 'received_qty']
        read_only_fields = ['total_price']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.email', read_only=True, default=None)
    approved_by_name = serializers.CharField(source='approved_by.email', read_only=True, default=None)

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'school', 'order_no', 'supplier', 'supplier_name', 'order_date',
                  'expected_date', 'status', 'total_amount', 'remarks', 'created_by',
                  'created_by_name', 'approved_by', 'approved_by_name', 'items',
                  'created_at', 'updated_at']
        read_only_fields = ['order_no', 'created_at', 'updated_at', 'total_amount']


class CreateStockEntrySerializer(serializers.Serializer):
    item_id = serializers.IntegerField()
    entry_type = serializers.ChoiceField(choices=StockEntry.ENTRY_TYPE_CHOICES)
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    supplier = serializers.CharField(required=False, allow_blank=True)
    invoice_no = serializers.CharField(required=False, allow_blank=True)
    issued_to = serializers.CharField(required=False, allow_blank=True)
    issued_to_type = serializers.ChoiceField(
        choices=[('student', 'Student'), ('teacher', 'Teacher'), ('staff', 'Staff'), ('department', 'Department')],
        required=False,
        allow_blank=True
    )
    remarks = serializers.CharField(required=False, allow_blank=True)
    entry_date = serializers.DateField()


class CreatePurchaseOrderSerializer(serializers.Serializer):
    supplier_id = serializers.IntegerField()
    order_date = serializers.DateField()
    expected_date = serializers.DateField(required=False, allow_null=True)
    remarks = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )


class ApprovePurchaseOrderSerializer(serializers.Serializer):
    remarks = serializers.CharField(required=False, allow_blank=True)


class ReceivePurchaseOrderSerializer(serializers.Serializer):
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )
    remarks = serializers.CharField(required=False, allow_blank=True)
