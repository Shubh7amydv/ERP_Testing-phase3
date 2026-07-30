# Frontend Flow Files - Index

> **Last Updated:** 25 June 2026  
> **Based on:** Actual backend APIs (verified from views.py, serializers.py, urls.py)

---

## Implemented Modules (Backend Ready)

| # | Module | File | APIs Verified |
|---|--------|------|:---:|
| 0 | **Auth** | [01-AUTH.md](./01-AUTH.md) | ✅ |
| 1 | **School** | [02-SCHOOL.md](./02-SCHOOL.md) | ✅ |
| 2 | **Students** | [03-STUDENTS.md](./03-STUDENTS.md) | ✅ |
| 3 | **Fees** | [04-FEES.md](./04-FEES.md) | ✅ |
| 4 | **Attendance** | [05-ATTENDANCE.md](./05-ATTENDANCE.md) | ✅ |

## Planned Modules (Not Yet Implemented)

| # | Module | File | APIs Verified |
|---|--------|------|:---:|
| 5 | Exams | [06-EXAMINATIONS.md](./06-EXAMINATIONS.md) | ❌ |
| 6 | Timetable | [07-TIMETABLE.md](./07-TIMETABLE.md) | ❌ |
| 7 | Library | [08-LIBRARY.md](./08-LIBRARY.md) | ❌ |
| 8 | HR | [09-HR.md](./09-HR.md) | ❌ |
| 9 | Communication | [10-COMMUNICATION.md](./10-COMMUNICATION.md) | ❌ |
| 10 | Inventory | [11-INVENTORY.md](./11-INVENTORY.md) | ❌ |
| 11 | Hostel | [12-HOSTEL.md](./12-HOSTEL.md) | ❌ |
| 12 | Events | [13-EVENTS.md](./13-EVENTS.md) | ❌ |
| 13 | Visitors | [14-VISITORS.md](./14-VISITORS.md) | ❌ |
| 14 | Parents | [15-PARENTS.md](./15-PARENTS.md) | ❌ |
| 15 | Reports | [16-REPORTS.md](./16-REPORTS.md) | ❌ |
| 16 | Documents | [17-DOCUMENTS.md](./17-DOCUMENTS.md) | ❌ |

## Overview

| File | Description |
|------|-------------|
| [00-OVERVIEW.md](./00-OVERVIEW.md) | Global structure, navigation, shared patterns |

---

## What Each Verified File Contains

### 01-AUTH.md
- Login flow with exact request/response shapes
- Password reset flow (token-based)
- Profile management (GET/PUT /api/auth/me/)
- Session management (list/revoke)
- Role & Permission CRUD
- Token management code (axios interceptor)
- Permission check helper

### 02-SCHOOL.md
- School CRUD (Super Admin only)
- Academic Year management (set-current flow)
- School Settings (get_or_create pattern)
- Holiday CRUD
- Notification Template CRUD

### 03-STUDENTS.md
- **Custom pagination** (`?page=1&limit=10`)
- Student list with **15+ filter params**
- Filter by class/section groups (`/filter-by-groups/`)
- Class-wise statistics (`/class-wise-total-students/`)
- Admission form with exact field mappings
- Write behavior: auto-creates class, section, house, caste, category
- Bulk update (`/bulk-update/`)
- Sibling group management
- Classes, Sections, Houses, Castes, Categories CRUD

### 04-FEES.md
- **Fee setup chain:** Category → Head → Structure
- **Bulk create** fee structures (`/bulk_create/`)
- **Fee assignment:** Single + Bulk (`/bulk_assign/`)
- **Payment flow:** Search student → View dues → Collect → Verify
- **Receipt:** Download PDF, resend via email/SMS
- **Installment tracker** (table view)
- **Fines:** Add + Waive
- **Due reminders:** Generate + Send
- **5 report types:** daily, monthly, class-wise, collection, pending

### 05-ATTENDANCE.md
- **Bulk mark** (`/mark/`) with transaction safety
- **Single mark** (`/mark-single/`)
- Class attendance by date (`/class/<id>/<id>/`)
- Student history + summary
- Leave apply → approve/reject flow
- Auto-updates: ClassAttendanceDay + AttendanceSummary
- **5 report types:** daily, monthly, class-wise, low-attendance, bulk-sms

---

## API Base URL

All endpoints are prefixed with `/api/`

```
/api/auth/...          → Authentication
/api/schools/...       → School management
/api/admissions/...    → Students
/api/classes/...       → Academic classes
/api/sections/...      → Sections
/api/houses/...        → Houses
/api/castes/...        → Castes
/api/categories/...    → Categories
/api/sibling-groups/...→ Sibling groups
/api/fee-categories/...→ Fee categories
/api/fee-heads/...     → Fee heads
/api/fee-structures/...→ Fee structures
/api/student-fee-assignments/... → Fee assignments
/api/fee-payments/...  → Payments
/api/fee-receipts/...  → Receipts
/api/fines/...         → Fines
/api/fee-due-reminders/... → Reminders
/api/student-fee-installments-paid/... → Installments
/api/attendance/...    → Attendance records
/api/attendance-periods/... → Periods
/api/holidays/...      → Holidays
/api/leave-applications/... → Leave
/api/roles/...         → Roles
/api/permissions/...   → Permissions
```

---

## Pagination Notes

| Module | Pagination Style |
|--------|-----------------|
| Students | Custom: `?page=1&limit=10` → `{ data: { admissions: [], pagination: { page, limit, total } } }` |
| Classes/Sections/etc | Custom: `?page=1&limit=10` → `{ page, limit, total, results: [] }` |
| Fees | **No pagination** (returns all results) |
| Attendance | **No pagination** (returns all results) |
| Auth/Schools | **No pagination** (returns all results) |
