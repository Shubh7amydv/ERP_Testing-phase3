# Module 13: Visitors Management - UI/UX Flow

## Screens

### 1. Visitor Check-In Desk
```
┌──────────────────────────────────────────────┐
│  🚪 Visitor Management                       │
│  ──────────────────────────────────────────  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Current Visitors Inside: 5             │  │
│  │                                        │  │
│  │ Name         │ Purpose  │ In    │ Visiting│ │
│  │──────────────│──────────│───────│────────│ │
│  │ Rajesh K.    │ Meeting  │ 2:00P │ Principal│
│  │ Sunita M.    │ Pickup   │ 3:00P │ Aarav  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [+ New Visitor Check-In]                    │
└──────────────────────────────────────────────┘
```

### 2. Visitor Check-In Form
```
┌──────────────────────────────────────────────┐
│  New Visitor Check-In                        │
│  ──────────────────────────────────────────  │
│                                              │
│  Name:     [                        ]        │
│  Phone:    [                        ]        │
│  Category: [Parent ▼]                        │
│  ID Type:  [Aadhaar ▼]                       │
│  ID Number:[                        ]        │
│  📷 [Capture Photo]                          │
│  ──────────────────────────────────────────  │
│  Purpose:    [                        ]       │
│  Meeting With:[                        ]       │
│  Meet Type:   [Teacher ▼]                    │
│  Vehicle No:  [                        ]       │
│  Items:       [                        ]       │
│  Remarks:     [                        ]       │
│  ──────────────────────────────────────────  │
│  Badge No: AUTO-001                          │
│  ──────────────────────────────────────────  │
│  [  Check In  ]                              │
└──────────────────────────────────────────────┘
```

### 3. Active Visitors List
```
┌──────────────────────────────────────────────┐
│  Active Visitors (Currently Inside)          │
│  ──────────────────────────────────────────  │
│  [Today ▼] [Category ▼]                      │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │Badge│ Name      │ In Time │ Purpose   │  │
│  ├────────────────────────────────────────┤  │
│  │001  │ Rajesh K. │ 2:00 PM │ Meeting   │  │
│  │002  │ Sunita M. │ 3:00 PM │ Pickup    │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Check Out] [Print Badge] [View Details]    │
└──────────────────────────────────────────────┘
```

### 4. Visitor Pass
```
┌──────────────────────────────────────────────┐
│  🎫 Visitor Pass                   [Print 🖨]│
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │         🏫 DPS Delhi                   │  │
│  │      VISITOR PASS                      │  │
│  │                                        │  │
│  │  Pass No: VP-2025-001                  │  │
│  │  ─────────────────────────────────     │  │
│  │  Name: Rajesh Kumar                    │  │
│  │  Phone: +91-9876543210                 │  │
│  │  Category: Parent                      │  │
│  │  Meeting: Principal                    │  │
│  │  Date: 25/06/2025                      │  │
│  │  Time: 2:00 PM - 4:00 PM              │  │
│  │  ─────────────────────────────────     │  │
│  │  Valid only on mentioned date/time     │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 5. Visitor Reports
```
┌──────────────────────────────────────────────┐
│  Visitor Reports                             │
│  ──────────────────────────────────────────  │
│  [Daily] [Category-wise]                     │
│  ──────────────────────────────────────────  │
│                                              │
│  Today (25 Jun 2025):                        │
│  ┌────────────────────────────────────────┐  │
│  │ Total Visitors: 15                     │  │
│  │ Currently Inside: 5                    │  │
│  │                                        │  │
│  │ Category Breakdown:                    │  │
│  │ Parents: 10 | Vendors: 3 | Others: 2  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Export Report]                             │
└──────────────────────────────────────────────┘
```

---

## API Integration Points

| Screen | API Calls |
|--------|-----------|
| Visitor List | `GET /visitors/` |
| Check In | `POST /visitors/` |
| Check Out | `POST /visitors/{id}/checkout/` |
| Today's Visitors | `GET /visitors/today/` |
| Active Visitors | `GET /visitors/active/` |
| Visitor Pass | `POST /visitor-passes/` |
| Revoke Pass | `POST /visitor-passes/{id}/revoke/` |
| Categories | `GET /visitor-categories/` |
| Daily Report | `GET /visitors/reports/daily/` |

---

## Key Components

| Component | Type | Description |
|-----------|------|-------------|
| `VisitorDesk` | Page | Check-in/out desk |
| `VisitorCheckInForm` | Form | New visitor entry |
| `ActiveVisitorsList` | Page | Currently inside |
| `VisitorBadge` | Printable | Badge template |
| `VisitorPass` | Printable | Pass template |
| `VisitorReport` | Page | Daily/category reports |
