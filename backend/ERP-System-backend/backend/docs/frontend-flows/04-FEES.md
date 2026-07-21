# Module 3: Fee Collection & Payments - Actual API Flow

## Base: `/api/`
## Pagination: None by default (returns all results)
## All endpoints auto-filter by `request.user.school`

---

## Fee Module Screen Flow

```
Fee Dashboard
  ├── Fee Setup
  │   ├── Fee Categories CRUD → /api/fee-categories/
  │   ├── Fee Heads CRUD → /api/fee-heads/
  │   └── Fee Structures CRUD → /api/fee-structures/
  │       └── Bulk Create → POST /api/fee-structures/bulk_create/
  │
  ├── Fee Assignment
  │   ├── Single Assign → POST /api/student-fee-assignments/
  │   └── Bulk Assign (class-wise) → POST /api/student-fee-assignments/bulk_assign/
  │
  ├── Fee Collection
  │   ├── Search Student → GET /api/admissions/?search=...
  │   ├── View Dues → GET /api/fee-payments/by_student/?student_id=UUID
  │   ├── Collect Payment → POST /api/fee-payments/
  │   ├── Verify → POST /api/fee-payments/<id>/verify/
  │   └── View Receipt → GET /api/fee-receipts/<id>/download/
  │
  ├── Installments
  │   ├── Installment Table → GET /api/fees/installment-data/?year=&class=&section=&installment_number=
  │   ├── All Installments → GET /api/fees/table-installments/?year=&class=&section=
  │   └── Bulk Update → PATCH /api/student-fee-installments-paid/bulk_update/
  │
  └── Reports
      ├── Collection → GET /api/fees/reports/collection/?academic_year=&start_date=&end_date=
      ├── Pending → GET /api/fees/reports/pending/?academic_year=
      ├── Class-wise → GET /api/fees/reports/class-wise/?academic_year=
      ├── Monthly → GET /api/fees/reports/monthly/?year=
      └── Daily → GET /api/fees/reports/daily/?date=
```

---

## Screen 1: Fee Dashboard

```
┌──────────────────────────────────────────────┐
│  Fee Dashboard                               │
│  ──────────────────────────────────────────  │
│  Today: 25/06/2026                           │
│  ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│  │ 💰 Today     │ │ ⏳ Pending  │ │ 📊 Month│ │
│  │ ₹15,000     │ │ ₹3,20,000   │ │₹4,50,00│ │
│  └─────────────┘ └─────────────┘ └────────┘ │
│                                              │
│  Recent Payments:                            │
│  • Aarav Kumar │ ₹5,000 │ Cash │ 2 min ago   │
│  • Priya Singh │ ₹10,000│ UPI  │ 15 min ago  │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
GET /api/fees/reports/daily/?date=2026-06-25
Response: { date, total_collected, total_payments, by_payment_mode: [{payment_mode, total, count}] }

GET /api/fees/reports/pending/?academic_year=1
Response: { total_outstanding, students_with_dues }

GET /api/fees/reports/monthly/?year=2026
Response: [{ month: 1, total_collected }, ...]

GET /api/fee-payments/today/
Response: { date, total_collected, payments: [...] }
```

---

## Screen 2: Fee Setup - Categories & Heads

```
┌──────────────────────────────────────────────┐
│  Fee Setup                [+ Add Category]   │
│  ──────────────────────────────────────────  │
│  Categories:                                 │
│  ┌────────────────────────────────────────┐  │
│  │ Tuition Fee     │ Active │ [Edit][Del] │  │
│  │ Bus Fee         │ Active │ [Edit][Del] │  │
│  │ Hostel Fee      │ Active │ [Edit][Del] │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Fee Heads (under Tuition Fee):              │
│  ┌────────────────────────────────────────┐  │
│  │ Tuition Fee    │ Recurring │ ₹5,000   │  │
│  │ Lab Fee        │ Yearly    │ ₹1,000   │  │
│  │ Library Fee    │ Yearly    │ ₹500     │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
# Categories
GET    /api/fee-categories/                  → FeeCategory[]
POST   /api/fee-categories/                  → { name, description }
PUT    /api/fee-categories/<id>/             → Update
DELETE /api/fee-categories/<id>/             → Delete

# Fee Heads
GET    /api/fee-heads/?category=1            → FeeHead[]
POST   /api/fee-heads/                       → { category: 1, name, is_recurring }
PUT    /api/fee-heads/<id>/                  → Update
DELETE /api/fee-heads/<id>/                  → Delete
```

---

## Screen 3: Fee Structure Management

```
┌──────────────────────────────────────────────┐
│  Fee Structures        [+ Create] [Bulk 📦] │
│  ──────────────────────────────────────────  │
│  Academic Year: [2026-2027 ▼]                │
│  ──────────────────────────────────────────  │
│  Class X:                                      │
│  ┌────────────────────────────────────────┐  │
│  │ Fee Head      │ Amount │ Due     │ Late│  │
│  ├────────────────────────────────────────┤  │
│  │ Tuition Fee   │₹5,000 │ Monthly │₹100 │  │
│  │ Lab Fee       │₹1,000 │ Yearly  │₹100 │  │
│  │ Library Fee   │₹500   │ Yearly  │₹50  │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
# Single Create
POST /api/fee-structures/
Body: {
  academic_year: 1,
  class_obj: 10,        // AcademicClass ID
  fee_head: 1,          // FeeHead ID
  amount: 5000,
  due_date: "2026-07-15",
  late_fee: 100,
  late_fee_per_day: 10,
  installment_allowed: true,
  max_installments: 3
}

# Bulk Create (create same fee for multiple classes)
POST /api/fee-structures/bulk_create/
Body: {
  academic_year: 1,
  fee_head: 1,
  amount: 5000,
  class_ids: [10, 11, 12]  // Create for Class X, XI, XII
}
Response: { created_count: 3, created_ids: [1, 2, 3] }

# Get by class
GET /api/fee-structures/by-class/<class_id>/
Response: [ { id, fee_head_name, amount, due_date, late_fee, ... } ]

# List all
GET /api/fee-structures/?academic_year=1&class_obj=10
```

---

## Screen 4: Fee Assignment (How Students Get Assigned Fees)

```
┌──────────────────────────────────────────────┐
│  Fee Assignment                              │
│  ──────────────────────────────────────────  │
│                                              │
│  Option 1: Single Student                    │
│  Student: [Aarav Kumar (ADM-2026-0001) ▼]    │
│  Fee Structure: [Tuition Fee - Class X ▼]    │
│  Discount: [₹0]                              │
│  Discount Reason: [                ]          │
│  [Assign Fee]                                │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  Option 2: Bulk Assign (Entire Class)        │
│  Class: [X ▼]                                │
│  Fee Structure: [Tuition Fee - Class X ▼]    │
│  [Bulk Assign to All Students in Class]      │
│                                              │
│  Result: ✅ Assigned to 40 students          │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
# Single Assignment
POST /api/student-fee-assignments/
Body: {
  student: "UUID-of-student",        // Admission UUID
  fee_structure: 1,                   // FeeStructure ID
  discount: 0,
  discount_reason: ""
}
Response: {
  id: 1,
  student_name: "Aarav Kumar",
  fee_head_name: "Tuition Fee",
  final_amount: 5000
}

# Bulk Assign (to entire class)
POST /api/student-fee-assignments/bulk_assign/
Body: {
  class_id: 10,              // AcademicClass ID
  fee_structure_id: 1        // FeeStructure ID
}
Response: { created_count: 40, created_ids: [1, 2, 3, ...] }
```

---

## Screen 5: Fee Collection (Payment)

```
┌──────────────────────────────────────────────┐
│  Fee Collection                              │
│  ──────────────────────────────────────────  │
│  Student: [Search by name/admission no...]   │
│  ──────────────────────────────────────────  │
│  ┌──────┐                                   │
│  │ 📷   │  Aarav Kumar (ADM-2026-0001)      │
│  └──────┘  Class X-A | Roll 15              │
│                                              │
│  Fee Dues:                                   │
│  ┌────────────────────────────────────────┐  │
│  │ ☑ Tuition Fee (Jun 2026)     ₹5,000  │  │
│  │ ☑ Tuition Fee (Jul 2026)     ₹5,000  │  │
│  │ ☐ Lab Fee (Annual)           ₹1,000  │  │
│  │ ☐ Library Fee (Annual)       ₹500    │  │
│  │                                    │  │  │
│  │ Selected: ₹10,000                   │  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Payment Details:                            │
│  Amount:       [₹ 10,000          ]          │
│  Payment Date: [DD/MM/YYYY         ]          │
│  Payment Mode: ○ Cash  ○ UPI  ○ Card         │
│                ○ Cheque  ○ NEFT/RTGS          │
│  Transaction ID: [               ]            │
│  Remarks:       [               ]            │
│                                              │
│  [  Collect Payment  ]                       │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
# Step 1: Search student
GET /api/admissions/?search=aarav&is_active=true

# Step 2: Get student's dues
GET /api/fee-payments/by_student/?student_id=UUID-of-aarav
Response: [
  { fee_structure_id: 1, fee_head: "Tuition Fee", total_amount: 5000, total_paid: 0, outstanding: 5000 },
  { fee_structure_id: 2, fee_head: "Lab Fee", total_amount: 1000, total_paid: 0, outstanding: 1000 }
]

# Step 3: Record payment
POST /api/fee-payments/
Body: {
  student: "UUID-of-aarav",
  fee_structure: 1,                    // FeeStructure ID
  amount_paid: 5000,
  payment_date: "2026-06-25",
  payment_mode: "cash",
  remarks: "June tuition fee"
}
Response: {
  id: 1,
  receipt_no: "REC-2026-000001",      // Auto-generated
  student_name: "Aarav Kumar",
  amount_paid: 5000,
  is_verified: false
}

# Step 4: Verify payment (admin/accountant)
POST /api/fee-payments/<id>/verify/
Response: { status: "verified" }
```

---

## Screen 6: Receipt

```
┌──────────────────────────────────────────────┐
│  📄 Fee Receipt REC-2026-000001              │
│  ──────────────────────────────────────────  │
│  🏫 DPS Delhi                                │
│  Student: Aarav Kumar                        │
│  Class: X-A | Roll: 15                       │
│  ──────────────────────────────────────────  │
│  Tuition Fee (Jun 2026)    ₹5,000           │
│  ──────────────────────────────────────────  │
│  Total Paid: ₹5,000                          │
│  Mode: Cash | Date: 25/06/2026              │
│  Received By: Admin                          │
│  ──────────────────────────────────────────  │
│  [Download PDF] [Send Email] [Send SMS]      │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
# Get receipts
GET /api/fee-receipts/?payment=1

# Download PDF
GET /api/fee-receipts/<id>/download/
Response: { pdf_url: "/media/receipts/REC-2026-000001.pdf" }

# Resend
POST /api/fee-receipts/<id>/resend/
Body: { via: "email" }  // or "sms"
```

---

## Screen 7: Pending Dues

```
┌──────────────────────────────────────────────┐
│  Pending Dues                                │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Student    │ Fee Head   │ Outstanding  │  │
│  ├────────────────────────────────────────┤  │
│  │ Aarav K.   │ Lab Fee    │ ₹1,000      │  │
│  │ Priya S.   │ Tuition    │ ₹15,000     │  │
│  │ Rahul D.   │ Tuition    │ ₹25,000     │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Send Reminders] [Export]                    │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
GET /api/fee-payments/pending/
Response: [
  { student_id: "UUID", student_name: "Aarav", fee_structure_id: 1, fee_head: "Lab Fee", total_amount: 1000, total_paid: 0, outstanding: 1000 }
]

# Generate & Send Reminders
POST /api/fee-due-reminders/generate/
Body: { academic_year: 1 }
Response: { created_count: 25 }

POST /api/fee-due-reminders/send/
Response: { sent_count: 25 }
```

---

## Screen 8: Installment Table

```
┌──────────────────────────────────────────────┐
│  Installment Tracker                         │
│  ──────────────────────────────────────────  │
│  Class: [X ▼]  Section: [A ▼]               │
│  Installment: [1 ▼]                          │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Roll │ Name    │ Installment │ Amount  │  │
│  ├────────────────────────────────────────┤  │
│  │ 1    │ Aarav   │ Inst 1      │ ₹5,000 │  │
│  │ 2    │ Priya   │ Inst 1      │ ₹5,000 │  │
│  │ 3    │ Rahul   │ Inst 1      │ ₹0 ❌  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Bulk Update Installments]                  │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
# Get installment data for specific installment
GET /api/fees/installment-data/?year=2026-2027&class=X&section=A&installment_number=1
Response: {
  success: true,
  installment_number: 1,
  total: 40,
  data: [
    { id: "UUID", first_name: "Aarav", installment: { installment_number: 1, amount_paid: "5000.00" } }
  ]
}

# Get all installments for class
GET /api/fees/table-installments/?year=2026-2027&class=X&section=A
Response: [
  { admission_id: "UUID", student_name: "Aarav Kumar", installments: [{ installment_number: 1, amount_paid: 5000 }] }
]

# Bulk update
PATCH /api/student-fee-installments-paid/bulk_update/
Body: [
  { student: "UUID", installment_number: 1, amount_paid: 5000, s_code: "TXN001" }
]
Response: { success: true, updated: [...], errors: [...] }
```

---

## Screen 9: Fines

```
┌──────────────────────────────────────────────┐
│  Fines                        [+ Add Fine]   │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Student    │ Reason      │ Amount │Status│ │
│  ├────────────────────────────────────────┤  │
│  │ Aarav K.   │ Late Fee    │ ₹500  │Active│  │
│  │ Priya S.   │ Library     │ ₹200  │Waived│  │
│  └────────────────────────────────────────┘  │
│  [Waive Fine]                                │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
GET    /api/fines/
POST   /api/fines/          → { student: "UUID", reason, amount, fine_date }
POST   /api/fines/<id>/waive/ → { reason: "Forgiven" }
```

---

## Complete Fee Flow

```
1. Setup Phase (Admin)
   Fee Category → Fee Head → Fee Structure → Bulk Create

2. Assignment Phase (Admin)
   Bulk Assign (class-wise) OR Single Assign (student-wise)
   POST /api/student-fee-assignments/bulk_assign/

3. Collection Phase (Accountant)
   Search Student → View Dues → Collect Payment → Generate Receipt
   POST /api/fee-payments/

4. Verification Phase (Admin)
   Verify Payment
   POST /api/fee-payments/<id>/verify/

5. Reporting Phase
   Daily / Monthly / Class-wise / Pending Reports
```
