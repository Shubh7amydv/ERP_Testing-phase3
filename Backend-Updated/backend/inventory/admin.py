from django.contrib import admin

from .models import (
    InventoryCategory,
    Item,
    StockEntry,
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem,
)


@admin.register(InventoryCategory)
class InventoryCategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "school",
        "is_active",
    )
    list_filter = (
        "school",
        "is_active",
    )
    search_fields = (
        "name",
        "description",
    )


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "item_code",
        "category",
        "unit",
        "current_stock",
        "min_stock",
        "unit_price",
        "is_active",
    )
    list_filter = (
        "school",
        "category",
        "unit",
        "is_active",
    )
    search_fields = (
        "name",
        "item_code",
        "description",
    )


@admin.register(StockEntry)
class StockEntryAdmin(admin.ModelAdmin):
    list_display = (
        "item",
        "entry_type",
        "quantity",
        "unit_price",
        "total_price",
        "entry_date",
        "entry_by",
    )
    list_filter = (
        "school",
        "entry_type",
        "entry_date",
    )
    search_fields = (
        "item__name",
        "invoice_no",
        "supplier",
        "issued_to",
    )


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "contact_person",
        "phone",
        "email",
        "is_active",
    )
    list_filter = (
        "school",
        "is_active",
    )
    search_fields = (
        "name",
        "contact_person",
        "phone",
        "email",
        "gst_no",
    )


class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_no",
        "supplier",
        "order_date",
        "status",
        "total_amount",
        "created_by",
    )
    list_filter = (
        "school",
        "status",
        "order_date",
    )
    search_fields = (
        "order_no",
        "supplier__name",
    )
    inlines = [PurchaseOrderItemInline]


@admin.register(PurchaseOrderItem)
class PurchaseOrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "purchase_order",
        "item",
        "quantity",
        "unit_price",
        "total_price",
        "received_qty",
    )
    search_fields = (
        "purchase_order__order_no",
        "item__name",
    )