# Module 1: School (Multi-Tenancy) - Actual API Flow

## Base: `/api/`

---

## Screen 1: School List (Super Admin)

```
┌──────────────────────────────────────────────┐
│  Schools                      [+ Add School] │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ 🏫 DPS Delhi       │ Delhi    │ ✅     │  │
│  │ 🏫 DPS Mumbai      │ Mumbai   │ ✅     │  │
│  │ 🏫 DPS Kolkata     │ Kolkata  │ ❌     │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
GET /api/schools/
Response: [
  { id: "UUID", name: "DPS Delhi", code: "DPS001", city: "Delhi", state: "Delhi", is_active: true }
]
```

---

## Screen 2: Create School

```
POST /api/schools/create/
Body: {
  name: "DPS Delhi",
  code: "DPS001",
  address: "123 Mathura Road",
  city: "Delhi",
  state: "Delhi",
  pincode: "110001",
  phone: "+91-11-12345678",
  email: "info@dpsdelhi.com",
  website: "https://dpsdelhi.com",
  established: "2010-04-01",
  affiliation: "CBSE"       // CBSE | ICSE | STATE | IB | CIE
}
Response: {
  id: "UUID", name: "DPS Delhi", code: "DPS001", ...
  academic_years_count: 0,
  students_count: 0
}
// Side effect: Auto-creates SchoolSettings
```

---

## Screen 3: School Detail + Tabs

```
┌──────────────────────────────────────────────┐
│ ← Schools        [Edit] [Deactivate]         │
│  ──────────────────────────────────────────  │
│  🏫 DPS Delhi - CBSE                         │
│  Code: DPS001 | Students: 500 | Years: 3    │
│  ──────────────────────────────────────────  │
│  [Info] [Academic Years] [Holidays] [Settings]│
│  ──────────────────────────────────────────  │
│  Tab Content...                               │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
GET    /api/schools/<uuid>/           → SchoolSerializer (with academic_years_count, students_count)
PUT    /api/schools/<uuid>/update/    → Update school
DELETE /api/schools/<uuid>/delete/    → Soft delete (sets is_active=false)
```

---

## Screen 4: Academic Years Tab

```
┌──────────────────────────────────────────────┐
│  Academic Years              [+ Add Year]    │
│  ──────────────────────────────────────────  │
│  │ Year         │ Start     │ End      │Status│
│  │ 2026-2027   │ 2026-04-01│ 2027-03-31│Current│
│  │ 2025-2026   │ 2025-04-01│ 2026-03-31│Closed│
│                                              │
│  [Set as Current] [Edit]                     │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
GET    /api/schools/<uuid>/academic-years/
POST   /api/schools/<uuid>/academic-years/create/
       Body: { year: "2026-2027", start_date: "2026-04-01", end_date: "2027-03-31" }
PUT    /api/schools/<uuid>/academic-years/<id>/
POST   /api/schools/<uuid>/academic-years/<id>/set-current/
       Response: { message: "2026-2027 set as current academic year" }
```

---

## Screen 5: School Settings

```
┌──────────────────────────────────────────────┐
│  School Settings                             │
│  ──────────────────────────────────────────  │
│  Timezone:    [Asia/Kolkata          ▼]      │
│  Currency:    [INR ₹                 ▼]      │
│  Academic Start: [April               ▼]     │
│  Passing %:   [33                ]           │
│  Max Students/Section: [40          ]        │
│  ☐ Enable Biometric                         │
│  ☑ Enable SMS                               │
│  ☑ Enable Email                             │
│  [  Save  ]                                  │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
GET /api/schools/<uuid>/settings/
Response: {
  id: 1,
  timezone: "Asia/Kolkata",
  currency: "INR",
  currency_symbol: "₹",
  academic_start_month: 4,
  passing_percentage: 33,
  max_students_per_section: 40,
  enable_biometric: false,
  sms_enabled: true,
  email_enabled: true
}

PUT /api/schools/<uuid>/settings/
Body: { passing_percentage: 35, sms_enabled: false }
```

---

## Screen 6: Holidays

```
┌──────────────────────────────────────────────┐
│  Holidays                     [+ Add Holiday]│
│  ──────────────────────────────────────────  │
│  │ Date        │ Name              │ Type    │
│  │ 2026-01-26  │ Republic Day      │ National│
│  │ 2026-03-14  │ Holi              │ Religious│
│  │ 2026-08-15  │ Independence Day  │ National│
│  [Edit] [Delete]                             │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
GET    /api/schools/<uuid>/holidays/
POST   /api/schools/<uuid>/holidays/create/
       Body: { name: "Republic Day", date: "2026-01-26", holiday_type: "national", description: "..." }
PUT    /api/schools/<uuid>/holidays/<id>/
DELETE /api/schools/<uuid>/holidays/<id>/
```

---

## Screen 7: Notification Templates

```
┌──────────────────────────────────────────────┐
│  Notification Templates      [+ Add Template]│
│  ──────────────────────────────────────────  │
│  │ Type            │ Subject      │ Active   │
│  │ fee_receipt     │ Fee Receipt  │ ✅       │
│  │ attendance_alert│ Attendance   │ ✅       │
│  │ exam_result     │ Exam Result  │ ✅       │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
GET    /api/schools/<uuid>/templates/
POST   /api/schools/<uuid>/templates/create/
       Body: { template_type: "fee_receipt", subject: "Fee Payment Receipt", body: "..." }
PUT    /api/schools/<uuid>/templates/<id>/
```

---

## Complete School Flow

```
Super Admin
  │
  ├── School List → GET /api/schools/
  │
  ├── Create School → POST /api/schools/create/
  │     └── Auto-creates SchoolSettings
  │
  ├── School Detail → GET /api/schools/<uuid>/
  │     │
  │     ├── Academic Years Tab
  │     │   ├── List → GET /api/schools/<uuid>/academic-years/
  │     │   ├── Create → POST /api/schools/<uuid>/academic-years/create/
  │     │   └── Set Current → POST /api/schools/<uuid>/academic-years/<id>/set-current/
  │     │
  │     ├── Holidays Tab
  │     │   ├── List → GET /api/schools/<uuid>/holidays/
  │     │   ├── Create → POST /api/schools/<uuid>/holidays/create/
  │     │   └── CRUD → PUT/DELETE /api/schools/<uuid>/holidays/<id>/
  │     │
  │     ├── Settings Tab
  │     │   ├── Get → GET /api/schools/<uuid>/settings/
  │     │   └── Update → PUT /api/schools/<uuid>/settings/
  │     │
  │     └── Templates Tab
  │         ├── List → GET /api/schools/<uuid>/templates/
  │         └── CRUD → POST/PUT /api/schools/<uuid>/templates/
  │
  └── Edit/Deactivate → PUT/DELETE /api/schools/<uuid>/
```
