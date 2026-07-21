from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models, transaction
from django.db.models import Count, Sum, Q
from django.utils import timezone

from .models import InventoryCategory, Item, StockEntry, Supplier, PurchaseOrder, PurchaseOrderItem
from .serializers import (
    InventoryCategorySerializer,
    ItemSerializer,
    StockEntrySerializer,
    SupplierSerializer,
    PurchaseOrderSerializer,
    PurchaseOrderItemSerializer,
    CreateStockEntrySerializer,
    CreatePurchaseOrderSerializer,
    ApprovePurchaseOrderSerializer,
    ReceivePurchaseOrderSerializer,
)
from .permissions import IsSchoolMember


class InventoryCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryCategorySerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'is_active']

    def get_queryset(self):
        return InventoryCategory.objects.filter(
            school=self.request.user.school
        ).annotate(item_count_agg=Count('items'))

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(school=self.request.user.school)


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

    def perform_create(self, serializer):
        serializer.save(school=self.request.user.school)

    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        items = self.get_queryset().filter(
            current_stock__lte=models.F('min_stock'),
            current_stock__gt=0,
            is_active=True
        )
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='out-of-stock')
    def out_of_stock(self, request):
        items = self.get_queryset().filter(current_stock=0, is_active=True)
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)


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
        serializer.save(
            school=self.request.user.school,
            entry_by=self.request.user
        )

    def create(self, request, *args, **kwargs):
        serializer = CreateStockEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            item = Item.objects.get(
                id=data['item_id'],
                school=request.user.school
            )
        except Item.DoesNotExist:
            return Response(
                {'error': 'Item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        total_price = data['quantity'] * data['unit_price']

        with transaction.atomic():
            stock_entry = StockEntry.objects.create(
                school=request.user.school,
                item=item,
                entry_type=data['entry_type'],
                quantity=data['quantity'],
                unit_price=data['unit_price'],
                total_price=total_price,
                supplier=data.get('supplier', ''),
                invoice_no=data.get('invoice_no', ''),
                issued_to=data.get('issued_to', ''),
                issued_to_type=data.get('issued_to_type', ''),
                remarks=data.get('remarks', ''),
                entry_by=request.user,
                entry_date=data['entry_date'],
            )

            if data['entry_type'] == 'purchase':
                item.current_stock += int(data['quantity'])
                item.save()
            elif data['entry_type'] == 'issue':
                if item.current_stock < int(data['quantity']):
                    return Response(
                        {'error': f'Insufficient stock. Available: {item.current_stock}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                item.current_stock -= int(data['quantity'])
                item.save()
            elif data['entry_type'] == 'return':
                item.current_stock += int(data['quantity'])
                item.save()
            elif data['entry_type'] == 'adjustment':
                item.current_stock = int(data['quantity'])
                item.save()

        return Response(
            StockEntrySerializer(stock_entry).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], url_path='by-item/(?P<item_id>[^/.]+)')
    def by_item(self, request, item_id=None):
        entries = self.get_queryset().filter(item_id=item_id)
        serializer = self.get_serializer(entries, many=True)
        return Response(serializer.data)


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
                Q(phone__icontains=search) |
                Q(email__icontains=search)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(school=self.request.user.school)


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsSchoolMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school', 'supplier', 'status', 'order_date']

    def get_queryset(self):
        queryset = PurchaseOrder.objects.filter(
            school=self.request.user.school
        ).select_related('supplier', 'created_by', 'approved_by').prefetch_related('items__item')
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(order_no__icontains=search) |
                Q(supplier__name__icontains=search)
            )
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = CreatePurchaseOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            supplier = Supplier.objects.get(
                id=data['supplier_id'],
                school=request.user.school
            )
        except Supplier.DoesNotExist:
            return Response(
                {'error': 'Supplier not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        with transaction.atomic():
            po = PurchaseOrder.objects.create(
                school=request.user.school,
                supplier=supplier,
                order_date=data['order_date'],
                expected_date=data.get('expected_date'),
                remarks=data.get('remarks', ''),
                created_by=request.user,
                status='draft',
            )

            total_amount = 0
            for item_data in data['items']:
                try:
                    item = Item.objects.get(
                        id=item_data['item_id'],
                        school=request.user.school
                    )
                except Item.DoesNotExist:
                    return Response(
                        {'error': f'Item with id {item_data["item_id"]} not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )

                qty = item_data['quantity']
                price = item_data['unit_price']
                item_total = qty * price

                PurchaseOrderItem.objects.create(
                    purchase_order=po,
                    item=item,
                    quantity=qty,
                    unit_price=price,
                    total_price=item_total,
                )
                total_amount += item_total

            po.total_amount = total_amount
            po.save()

        return Response(
            PurchaseOrderSerializer(po).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        po = self.get_object()
        if po.status != 'draft':
            return Response(
                {'error': 'Only draft orders can be submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        po.status = 'pending'
        po.save()
        return Response({'status': 'pending', 'order_no': po.order_no})

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        po = self.get_object()
        if po.status != 'pending':
            return Response(
                {'error': 'Only pending orders can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ApprovePurchaseOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        po.status = 'approved'
        po.approved_by = request.user
        if serializer.validated_data.get('remarks'):
            po.remarks = serializer.validated_data['remarks']
        po.save()
        return Response({'status': 'approved', 'order_no': po.order_no})

    @action(detail=True, methods=['post'], url_path='receive')
    def receive(self, request, pk=None):
        po = self.get_object()
        if po.status != 'approved':
            return Response(
                {'error': 'Only approved orders can be received'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ReceivePurchaseOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            for recv_item in data['items']:
                po_item_id = recv_item.get('purchase_order_item_id')
                received_qty = recv_item.get('received_qty', 0)

                try:
                    po_item = PurchaseOrderItem.objects.get(
                        id=po_item_id,
                        purchase_order=po
                    )
                except PurchaseOrderItem.DoesNotExist:
                    return Response(
                        {'error': f'Purchase order item {po_item_id} not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )

                po_item.received_qty += received_qty
                po_item.save()

                item = po_item.item
                item.current_stock += int(received_qty)
                item.save()

                StockEntry.objects.create(
                    school=request.user.school,
                    item=item,
                    entry_type='purchase',
                    quantity=received_qty,
                    unit_price=po_item.unit_price,
                    total_price=received_qty * po_item.unit_price,
                    supplier=po.supplier.name,
                    invoice_no=po.order_no,
                    remarks=data.get('remarks', ''),
                    entry_by=request.user,
                    entry_date=timezone.now().date(),
                )

            po.status = 'received'
            if data.get('remarks'):
                po.remarks = data['remarks']
            po.save()

        return Response({
            'status': 'received',
            'order_no': po.order_no
        })

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        po = self.get_object()
        if po.status in ['received', 'cancelled']:
            return Response(
                {'error': 'Cannot cancel a received or already cancelled order'},
                status=status.HTTP_400_BAD_REQUEST
            )
        po.status = 'cancelled'
        po.save()
        return Response({'status': 'cancelled', 'order_no': po.order_no})


class StockSummaryReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school

        items = Item.objects.filter(school=school, is_active=True)
        total_items = items.count()
        total_stock_value = items.aggregate(
            total=Sum('current_stock' * models.F('unit_price'))
        )['total'] or 0

        low_stock = items.filter(
            current_stock__lte=models.F('min_stock'),
            current_stock__gt=0
        ).count()

        out_of_stock = items.filter(current_stock=0).count()

        by_category = items.values(
            'category__name'
        ).annotate(
            item_count=Count('id'),
            total_stock_value=Sum('current_stock' * models.F('unit_price'))
        ).order_by('category__name')

        return Response({
            'total_items': total_items,
            'total_stock_value': float(total_stock_value),
            'low_stock_items': low_stock,
            'out_of_stock_items': out_of_stock,
            'by_category': list(by_category)
        })


class StockMovementReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school
        entry_type = request.query_params.get('entry_type')

        entries = StockEntry.objects.filter(school=school)
        if entry_type:
            entries = entries.filter(entry_type=entry_type)

        summary = entries.values('entry_type').annotate(
            count=Count('id'),
            total_value=Sum('total_price')
        ).order_by('entry_type')

        recent = entries.select_related('item', 'entry_by').order_by('-entry_date')[:20]

        recent_data = StockEntrySerializer(recent, many=True).data

        return Response({
            'summary': list(summary),
            'recent_entries': recent_data
        })


class PurchaseOrderReportView(APIView):
    permission_classes = [IsSchoolMember]

    def get(self, request):
        school = request.user.school

        orders = PurchaseOrder.objects.filter(school=school)

        status_summary = orders.values('status').annotate(
            count=Count('id'),
            total_amount=Sum('total_amount')
        ).order_by('status')

        pending_approval = orders.filter(status='pending').count()
        total_spent = orders.filter(status='received').aggregate(
            total=Sum('total_amount')
        )['total'] or 0

        return Response({
            'status_summary': list(status_summary),
            'pending_approval_count': pending_approval,
            'total_spent': float(total_spent)
        })
