from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.InventoryCategoryViewSet, basename='inventorycategory')
router.register(r'items', views.ItemViewSet, basename='item')
router.register(r'stock-entries', views.StockEntryViewSet, basename='stockentry')
router.register(r'suppliers', views.SupplierViewSet, basename='supplier')
router.register(r'purchase-orders', views.PurchaseOrderViewSet, basename='purchaseorder')

urlpatterns = [
    path('', include(router.urls)),
    path('inventory/reports/stock-summary/', views.StockSummaryReportView.as_view(), name='inventory-stock-summary-report'),
    path('inventory/reports/stock-movement/', views.StockMovementReportView.as_view(), name='inventory-stock-movement-report'),
    path('inventory/reports/purchase-orders/', views.PurchaseOrderReportView.as_view(), name='inventory-purchase-orders-report'),
]
