# Module 4: Attendance - Actual API Flow

## Base: `/api/`

---

## Attendance Module Screen Flow

```
Attendance Dashboard
  │
  ├── Mark Attendance
  │   ├── Get Class Students → GET /api/admissions/?admission_class=X&section=A&is_active=true&year=2026-2027
  │   ├── Bulk Mark → POST /api/attendance/mark/
  │   └── Single Mark → POST /api/attendance/mark-single/
  │
  ├── View Attendance
  │   ├── Class Attendance → GET /api/attendance/class/<class_id>/<section_id>/?date=YYYY-MM-DD
  │   ├── Student History → GET /api/attendance/student/<student_id>/?start_date=&end_date=
  │   └── Student Summary → GET /api/attendance/student/<student_id>/summary/
  │
  ├── Leave Management
  │   ├── List → GET /api/leave-applications/
  │   ├── Apply → POST /api/leave-applications/
  │   ├── Approve → POST /api/leave-applications/<id>/approve/
  │   └── Reject → POST /api/leave-applications/<id>/reject/
  │
  └── Reports
      ├── Daily → GET /api/attendance/reports/daily/?date=
      ├── Monthly → GET /api/attendance/reports/monthly/?month=&year=
      ├── Class-wise → GET /api/attendance/reports/class-wise/?date=
      ├── Low Attendance → GET /api/attendance/reports/low-attendance/?threshold=75
      └── Bulk SMS → GET /api/attendance/reports/bulk-sms/?threshold=75
```

---

## Screen 1: Mark Attendance

```
┌──────────────────────────────────────────────┐
│  Mark Attendance                             │
│  ──────────────────────────────────────────  │
│  Date: [25/06/2026 📅]                       │
│  Class: [X       ▼]  Section: [A    ▼]       │
│  Period: [Full Day ▼] (optional)             │
│  ──────────────────────────────────────────  │
│  [✅ Mark All Present] [Invert Selection]    │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ ☑ │ Roll │ Name      │ Status  │ Rem. │  │
│  ├────────────────────────────────────────┤  │
│  │ ☑ │ 1    │ Aarav     │ Present │      │  │
│  │ ☑ │ 2    │ Priya     │ Present │      │  │
│  │ ☐ │ 3    │ Rahul     │ Absent  │ Sick │  │
│  │ ☑ │ 4    │ Sneha     │ Present │      │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Summary: 35 Present | 5 Absent              │
│                                              │
│  [  Save Attendance  ]                       │
└──────────────────────────────────────────────┘
```

**Step 1: Get students in the class**
```
GET /api/admissions/?admission_class=X&section=A&is_active=true&year=2026-2027&ordering=roll_number&limit=100
Response: {
  success: true,
  data: {
    admissions: [
      { id: "UUID-1", first_name: "Aarav", last_name: "Kumar", roll_number: 1 },
      { id: "UUID-2", first_name: "Priya", last_name: "Singh", roll_number: 2 },
      ...
    ]
  }
}
```

**Step 2: Check if attendance already marked today**
```
GET /api/attendance/class/<class_id>/<section_id>/?date=2026-06-25
Response: [
  { id: 1, student: "UUID-1", student_name: "Aarav Kumar", status: "present", date: "2026-06-25" },
  ...
]
```

**Step 3: Bulk mark attendance**
```
POST /api/attendance/mark/
Body: {
  class_id: 10,                    // AcademicClass ID (int)
  section_id: 5,                   // Section ID (int)
  date: "2026-06-25",
  period_id: null,                 // Optional: AttendancePeriod ID
  attendance: [
    { student_id: "UUID-1", status: "present", remarks: "" },
    { student_id: "UUID-2", status: "present", remarks: "" },
    { student_id: "UUID-3", status: "absent", remarks: "Sick" },
    { student_id: "UUID-4", status: "present", remarks: "" },
    ...
  ]
}
Response: {
  created_count: 38,
  updated_count: 2,
  created_ids: ["UUID", ...],
  updated_ids: ["UUID", ...]
}
```

**Status choices:** `"present"`, `"absent"`, `"late"`, `"half_day"`, `"excused"`

**Side Effects:** Auto-updates `ClassAttendanceDay` and `AttendanceSummary`

---

## Screen 2: Single Mark (Quick Toggle)

```
POST /api/attendance/mark-single/
Body: {
  student_id: "UUID-3",
  date: "2026-06-25",
  status: "absent",
  remarks: "Sick",
  source: "manual"          // "manual" | "biometric" | "face"
}
Response: { id: 1, status: "created" }  // or "updated"
```

---

## Screen 3: View Class Attendance

```
┌──────────────────────────────────────────────┐
│  Class X-A Attendance - 25/06/2026           │
│  ──────────────────────────────────────────  │
│  Total: 40 | Present: 35 | Absent: 5        │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Roll │ Name    │ Status  │ Marked By   │  │
│  ├────────────────────────────────────────┤  │
│  │ 1    │ Aarav   │ Present │ Admin       │  │
│  │ 2    │ Priya   │ Present │ Admin       │  │
│  │ 3    │ Rahul   │ Absent  │ Admin       │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**API Call:**
```
GET /api/attendance/class/<class_id>/<section_id>/?date=2026-06-25
Response: [
  { id: 1, student: "UUID", student_name: "Aarav Kumar", status: "present", marked_by_name: "Admin", remarks: "" },
  ...
]
```

---

## Screen 4: Student Attendance History

```
┌──────────────────────────────────────────────┐
│  Aarav Kumar - Attendance History            │
│  ──────────────────────────────────────────  │
│  Overall: 92% (184/200 days)                 │
│  ████████████████████████░░░░  92%           │
│                                              │
│  This Month:                                 │
│  ✅ Present: 18  |  ❌ Absent: 1  |  ⏰ Late: 1│
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Date     │ Status  │ Period │ Remarks  │  │
│  ├────────────────────────────────────────┤  │
│  │ 25/06    │ Present │ Full   │          │  │
│  │ 24/06    │ Present │ Full   │          │  │
│  │ 23/06    │ Absent  │ Full   │ Sick     │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
# History
GET /api/attendance/student/<student_id>/?start_date=2026-06-01&end_date=2026-06-30
Response: [
  { id: 1, student: "UUID", date: "2026-06-25", status: "present", period_name: null, remarks: "" },
  ...
]

# Summary
GET /api/attendance/student/<student_id>/summary/?academic_year_id=1
Response: {
  id: 1,
  student_name: "Aarav Kumar",
  academic_year_name: "2026-2027",
  total_days: 200,
  present_days: 184,
  absent_days: 12,
  late_days: 3,
  half_days: 1,
  excused_days: 0,
  attendance_pct: 92.00
}
```

---

## Screen 5: Leave Applications

```
┌──────────────────────────────────────────────┐
│  Leave Applications        [+ Apply Leave]   │
│  ──────────────────────────────────────────  │
│  [Status ▼] [Class ▼]                        │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Student   │ Dates          │ Status    │  │
│  ├────────────────────────────────────────┤  │
│  │ Rahul Dev │ 26-28 Jun     │ Pending   │  │
│  │ Sneha P.  │ 25 Jun        │ Approved  │  │
│  │ Vikram R. │ 20-22 Jun     │ Rejected  │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
# List
GET /api/leave-applications/?status=pending
Response: [
  { id: 1, student: "UUID", student_name: "Rahul Dev", start_date: "2026-06-26", end_date: "2026-06-28", reason: "Family function", status: "pending", total_days: 3 }
]

# Apply
POST /api/leave-applications/
Body: {
  student: "UUID",
  start_date: "2026-06-26",
  end_date: "2026-06-28",
  reason: "Family function",
  attachment: File  // optional
}

# Approve
POST /api/leave-applications/<id>/approve/
Body: { remarks: "Approved" }
Response: { status: "approved" }
// Side effect: Creates AttendanceRecord with status "excused" for each day

# Reject
POST /api/leave-applications/<id>/reject/
Body: { remarks: "Insufficient reason" }
Response: { status: "rejected" }
```

---

## Screen 6: Attendance Reports

```
┌──────────────────────────────────────────────┐
│  Attendance Reports                          │
│  ──────────────────────────────────────────  │
│                                              │
│  Daily Report (25/06/2026):                  │
│  Total: 500 | Present: 450 | Absent: 50     │
│  Attendance: 90%                             │
│                                              │
│  Class-wise Breakdown:                       │
│  ┌────────────────────────────────────────┐  │
│  │ Class │ Total │ Present │ %            │  │
│  ├────────────────────────────────────────┤  │
│  │ X-A   │ 40    │ 35      │ 87.5%       │  │
│  │ X-B   │ 38    │ 36      │ 94.7%       │  │
│  │ IX-A  │ 32    │ 30      │ 93.8%       │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Low Attendance (<75%):                      │
│  ┌────────────────────────────────────────┐  │
│  │ Student    │ Class │ %    │ Phone      │  │
│  ├────────────────────────────────────────┤  │
│  │ Rahul Dev  │ IX-B  │ 65%  │ +91-987.. │  │
│  │ Sneha Patil│ VIII-A│ 70%  │ +91-987.. │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Export] [Send Bulk SMS]                    │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
# Daily Report
GET /api/attendance/reports/daily/?date=2026-06-25
Response: {
  date: "2026-06-25",
  total_students: 500,
  present: 450,
  absent: 50,
  late: 10,
  half_day: 5,
  excused: 3,
  attendance_pct: 90.0
}

# Monthly Report
GET /api/attendance/reports/monthly/?month=6&year=2026&class_id=10
Response: [
  { date: "2026-06-01", total: 40, present: 38, absent: 2, late: 0 },
  { date: "2026-06-02", total: 40, present: 36, absent: 4, late: 1 },
  ...
]

# Class-wise Report
GET /api/attendance/reports/class-wise/?date=2026-06-25
Response: [
  { class_id: 10, class_name: "X", section_id: 5, section_name: "A", total_students: 40, present: 35, attendance_pct: 87.5 }
]

# Low Attendance
GET /api/attendance/reports/low-attendance/?threshold=75
Response: [
  { student_id: "UUID", student_name: "Rahul Dev", admission_no: "ADM-2026-0003", class: "IX", section: "B", total_days: 200, present_days: 130, attendance_pct: 65.0 }
]

# Bulk SMS (for sending alerts)
GET /api/attendance/reports/bulk-sms/?threshold=75
Response: [
  { student_id: "UUID", student_name: "Rahul Dev", phone: "+919876543210", attendance_pct: 65.0, parent_phone: "+919876543211" }
]
```

---

## Screen 7: Attendance Periods Management

```
┌──────────────────────────────────────────────┐
│  Attendance Periods         [+ Add Period]   │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Name      │ Start  │ End    │ Order    │  │
│  ├────────────────────────────────────────┤  │
│  │ Period 1  │ 8:00   │ 8:45   │ 1        │  │
│  │ Period 2  │ 8:45   │ 9:30   │ 2        │  │
│  │ Break     │ 9:30   │ 9:45   │ 3        │  │
│  │ Period 3  │ 9:45   │ 10:30  │ 4        │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
GET    /api/attendance-periods/
POST   /api/attendance-periods/  → { name: "Period 1", start_time: "08:00", end_time: "08:45", period_order: 1 }
PUT    /api/attendance-periods/<id>/
DELETE /api/attendance-periods/<id>/
```

---

## Class Attendance Day Summary

When attendance is marked, `ClassAttendanceDay` is auto-updated:

```
GET /api/attendance/class/<class_id>/summary/?date=2026-06-25
Response: {
  id: 1,
  class_name: "X",
  section_name: "A",
  date: "2026-06-25",
  total_students: 40,
  present: 35,
  absent: 3,
  late: 2,
  is_finalized: false,
  finalized_by_name: null
}
```

---

## Complete Attendance Flow

```
1. Teacher selects Class + Section + Date
   → GET /api/admissions/?admission_class=X&section=A&is_active=true

2. System loads existing attendance (if any)
   → GET /api/attendance/class/<class_id>/<section_id>/?date=YYYY-MM-DD

3. Teacher marks attendance for each student
   → POST /api/attendance/mark/ (bulk)
   → POST /api/attendance/mark-single/ (individual)

4. System auto-updates:
   - AttendanceRecord (per student)
   - ClassAttendanceDay (class summary)
   - AttendanceSummary (yearly summary)

5. Reports available via:
   → /api/attendance/reports/daily/
   → /api/attendance/reports/monthly/
   → /api/attendance/reports/class-wise/
   → /api/attendance/reports/low-attendance/
```
