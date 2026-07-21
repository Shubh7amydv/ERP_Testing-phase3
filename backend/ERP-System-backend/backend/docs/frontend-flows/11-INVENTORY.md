# Module 10: Inventory & Store - UI/UX Flow

## Screens

### 1. Inventory Dashboard
```
┌──────────────────────────────────────────────┐
│  Inventory Dashboard                         │
│  ──────────────────────────────────────────  │
│                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│  │ 📦 Items    │ │ ⚠️ Low Stock │ │ 💰 POs │ │
│  │ 150 Total   │ │ 12 Items    │ │ 3 Open │ │
│  └─────────────┘ └─────────────┘ └────────┘ │
│                                              │
│  Low Stock Alerts:                           │
│  ──────────────────────────────────────────  │
│  • White Chalk (5/100 remaining)             │
│  • Printer Paper (2/20 remaining)            │
│  • Lab Chemicals (1/10 remaining)            │
└──────────────────────────────────────────────┘
```

### 2. Item List
```
┌──────────────────────────────────────────────┐
│  Items                       [+ Add Item]    │
│  ──────────────────────────────────────────  │
│  [Search...] [Category ▼] [Stock Status ▼]   │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Item        │ Category  │ Stock │Status│  │
│  ├────────────────────────────────────────┤  │
│  │ White Chalk │Stationery │ 5     │ ⚠️   │  │
│  │ Printer A4  │Stationery │ 20    │ ✅   │  │
│  │ Lab Chemicals│Lab Equip │ 1     │ ⚠️   │  │
│  └────────────────────────────────────────┘  │
│  Showing 1-20 of 150                         │
└──────────────────────────────────────────────┘
```

### 3. Stock Entry
```
┌──────────────────────────────────────────────┐
│  Stock Entry                                 │
│  ──────────────────────────────────────────  │
│                                              │
│  Entry Type: ○ Purchase  ○ Issue  ○ Adjust   │
│  ──────────────────────────────────────────  │
│                                              │
│  Item: [White Chalk          ▼]              │
│  Current Stock: 5                            │
│  ──────────────────────────────────────────  │
│                                              │
│  Quantity:   [100              ]              │
│  Unit Price: [₹ 2              ]              │
│  Total:      [₹ 200            ]              │
│  Supplier:   [ABC Traders       ]             │
│  Invoice:    [INV-2025-001     ]              │
│  Date:       [25/06/2025       ]              │
│  Remarks:    [Monthly restock  ]              │
│                                              │
│  [  Record Entry  ]                          │
└──────────────────────────────────────────────┘
```

### 4. Purchase Order
```
┌──────────────────────────────────────────────┐
│  Purchase Orders             [+ Create PO]   │
│  ──────────────────────────────────────────  │
│  [Status ▼] [Supplier ▼]                     │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ PO No    │ Supplier    │ Amount │Status│  │
│  ├────────────────────────────────────────┤  │
│  │ PO-001   │ ABC Traders │₹5,000 │Draft │  │
│  │ PO-002   │ XYZ Supply  │₹12,000│Approved│ │
│  └────────────────────────────────────────┘  │
│                                              │
│  Create PO Modal:                            │
│  ┌────────────────────────────────────────┐  │
│  │ Supplier: [ABC Traders ▼]              │  │
│  │ Order Date: [25/06/2025]               │  │
│  │ Expected:   [01/07/2025]               │  │
│  │                                        │  │
│  │ Items:                                 │  │
│  │ • White Chalk | Qty: 100 | ₹2 = ₹200  │  │
│  │ • Marker Pen  | Qty: 50  | ₹10= ₹500  │  │
│  │                                        │  │
│  │ Total: ₹700                            │  │
│  │ Remarks: [                 ]            │  │
│  │                                        │  │
│  │ [Save Draft] [Submit for Approval]     │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

---

## API Integration Points

| Screen | API Calls |
|--------|-----------|
| Item List | `GET /items/` |
| Add Item | `POST /items/` |
| Low Stock | `GET /items/low-stock/` |
| Stock Entry | `POST /stock-entries/purchase/` |
| Issue Item | `POST /stock-entries/issue/` |
| Stock History | `GET /stock-entries/item/{id}/` |
| Suppliers | `GET /suppliers/` |
| Purchase Orders | `GET /purchase-orders/` |
| Create PO | `POST /purchase-orders/` |
| Approve PO | `POST /purchase-orders/{id}/approve/` |
| Receive PO | `POST /purchase-orders/{id}/receive/` |

---

## Key Components

| Component | Type | Description |
|-----------|------|-------------|
| `InventoryDashboard` | Page | Stats + low stock alerts |
| `ItemList` | Page | Item catalog |
| `ItemForm` | Modal | Add/edit item |
| `StockEntryForm` | Form | Purchase/issue/adjust |
| `PurchaseOrderList` | Page | PO management |
| `POForm` | Modal | Create PO |
| `SupplierList` | Page | Supplier management |
| `LowStockAlert` | Alert | Items below minimum |
