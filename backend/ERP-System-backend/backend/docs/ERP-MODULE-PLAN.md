# School ERP - Complete Module Plan

> **Date:** 2025-01  
> **Status:** Planning  
> **Tech Stack:** Django 6 + DRF + PostgreSQL

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Module Roadmap](#2-module-roadmap)
3. [Module 0: Authentication & Authorization](#3-module-0-authentication--authorization)
4. [Module 1: School (Multi-Tenancy)](#4-module-1-school-multi-tenancy)
5. [Module 2: Fee Collection & Payments](#5-module-2-fee-collection--payments)
6. [Module 3: Attendance](#6-module-3-attendance)
7. [Module 4: Examinations & Results](#7-module-4-examinations--results)
8. [Module 5: Timetable & Scheduling](#8-module-5-timetable--scheduling)
9. [Module 6: Library](#9-module-6-library)
10. [Module 7: HR & Payroll](#10-module-7-hr--payroll)
11. [Module 8: Communication & Notifications](#11-module-8-communication--notifications)
12. [Module 9: Inventory & Store](#12-module-9-inventory--store)
13. [Module 10: Hostel Management](#13-module-10-hostel-management)
14. [Module 11: Events & Calendar](#14-module-11-events--calendar)
15. [Module 12: Visitors Management](#15-module-12-visitors-management)
16. [Module 13: Staff Management](#16-module-13-staff-management)
17. [Module 14: Parents Portal](#17-module-14-parents-portal)
18. [Module 15: Reports & Analytics](#18-module-15-reports--analytics)
19. [Module 16: Document Management](#19-module-16-document-management)
20. [Database Schema Summary](#20-database-schema-summary)
21. [Implementation Priority](#21-implementation-priority)

---

## 1. Current State Analysis

### What Exists

| App | Models | APIs | Status |
|-----|--------|------|--------|
| `accounts` | User (1) | None | Model only, no auth, no login endpoint |
| `students` | Admission, AcademicClass, Section, Year, Fees, Teacher, House, Caste, Category, SiblingGroup, OtherFees (11) | 38+ endpoints | Functional, no auth |
| `transport` | BusRoute, BusRouteFee, AdmissionBusDetail (3) | 0 (URLs not wired) | Models only |

### What's Missing

- No authentication/authorization (all endpoints open)
- No School model (multi-tenancy stubbed with raw UUIDs)
- No fee collection/payments (only fee structure exists)
- No attendance tracking
- no exam/grade system
- No timetable/scheduling
- No library module
- No HR/payroll
- No communication/notification system
- No inventory/store
- No hostel management
- No events/calendar
- No visitor management
- No parent portal
- No reports/analytics dashboard
- No document management system

### Existing Issues to Fix First

1. `Admission.password` stores plaintext password (security risk)
2. `transport.urls` not included in root `urls.py`
3. `User` model not registered in admin
4. No `.env` file or environment template
5. `school_id` is raw UUID everywhere — needs proper School model
6. No authentication on any endpoint

---

## 2. Module Roadmap

```
Phase 1 (Foundation):  Auth + School Model + Fix Existing Issues
Phase 2 (Core):        Fee Collection + Attendance + Exams
Phase 3 (Operations):  Timetable + Library + HR/Payroll
Phase 4 (Communication): Notifications + Events + Visitors
Phase 5 (Advanced):    Hostel + Inventory + Reports + Documents
```

---

## 3. Module 0: Authentication & Authorization

### Django App: `authentication`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ Role                                            │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ name          CharField(50)  unique              │
│ description   TextField  blank                   │
│ permissions   JSONField  default={}              │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Permission                                      │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ codename      CharField(100)  unique             │
│               e.g. "admissions.view"             │
│ module        CharField(50)                       │
│               e.g. "admissions"                   │
│ action        CharField(20)                       │
│               choices: view/add/change/delete     │
│ description   TextField  blank                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ RolePermission  (M2M through table)             │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ role          FK -> Role                         │
│ permission    FK -> Permission                   │
│ unique_together: (role, permission)              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ UserSession                                     │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ user          FK -> User                         │
│ token         CharField(255)  unique             │
│ ip_address    GenericIPAddressField  nullable     │
│ user_agent    TextField  blank                   │
│ expires_at    DateTimeField                       │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ PasswordResetToken                              │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ user          FK -> User                         │
│ token         CharField(255)  unique             │
│ expires_at    DateTimeField                       │
│ is_used       BooleanField  default=False         │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘
```

### Changes to Existing `accounts.User`

```python
# Add to accounts.User model:
school      FK -> School (nullable, for multi-tenancy)
role        FK -> Role (nullable)
first_name  CharField(100)  blank
last_name   CharField(100)  blank
phone       CharField(15)  blank
avatar      ImageField  blank
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login/` | Email + password login → returns JWT token |
| POST | `/auth/logout/` | Invalidate current session token |
| POST | `/auth/refresh/` | Refresh access token |
| POST | `/auth/register/` | Register new user (admin only) |
| POST | `/auth/password-reset/` | Send password reset email |
| POST | `/auth/password-reset/confirm/` | Confirm reset with token |
| GET | `/auth/me/` | Get current user profile |
| PUT | `/auth/me/` | Update current user profile |
| PUT | `/auth/change-password/` | Change password (old + new) |
| GET | `/auth/sessions/` | List active sessions |
| DELETE | `/auth/sessions/{id}/` | Revoke specific session |
| GET | `/roles/` | List all roles |
| POST | `/roles/` | Create role |
| GET | `/roles/{id}/` | Role detail with permissions |
| PUT | `/roles/{id}/` | Update role |
| DELETE | `/roles/{id}/` | Delete role |
| GET | `/permissions/` | List all permissions |
| POST | `/roles/{id}/assign-permissions/` | Assign permissions to role |
| POST | `/roles/{id}/remove-permissions/` | Remove permissions from role |

### Permission Codenames (Pre-defined)

```python
PERMISSIONS = [
    # Admissions
    ("admissions.view", "View Admissions"),
    ("admissions.add", "Add Admission"),
    ("admissions.change", "Change Admission"),
    ("admissions.delete", "Delete Admission"),
    
    # Fees
    ("fees.view", "View Fees"),
    ("fees.add", "Add Fee"),
    ("fees.change", "Change Fee"),
    ("fees.delete", "Delete Fee"),
    ("fees.collect", "Collect Fee Payment"),
    
    # Attendance
    ("attendance.view", "View Attendance"),
    ("attendance.mark", "Mark Attendance"),
    ("attendance.change", "Change Attendance"),
    
    # Exams
    ("exams.view", "View Exams"),
    ("exams.add", "Add Exam"),
    ("exams.change", "Change Exam"),
    ("exams.delete", "Delete Exam"),
    
    # Library
    ("library.view", "View Library"),
    ("library.add", "Add Book"),
    ("library.issue", "Issue Book"),
    ("library.return", "Return Book"),
    
    # HR
    ("hr.view", "View HR"),
    ("hr.add", "Add Employee"),
    ("hr.change", "Change Employee"),
    ("hr.delete", "Delete Employee"),
    ("hr.payroll", "Manage Payroll"),
    
    # Transport
    ("transport.view", "View Transport"),
    ("transport.add", "Add Route"),
    ("transport.change", "Change Route"),
    ("transport.delete", "Delete Route"),
    
    # Reports
    ("reports.view", "View Reports"),
    ("reports.export", "Export Reports"),
    
    # Settings
    ("settings.view", "View Settings"),
    ("settings.change", "Change Settings"),
]

PREDEFINED_ROLES = [
    "Super Admin",
    "School Admin", 
    "Principal",
    "Vice Principal",
    "Accountant",
    "Librarian",
    "Teacher",
    "Transport Manager",
    "Office Staff",
    "Parent",
]
```

### JWT Configuration

```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### Packages Required

```
djangorestframework-simplejwt==5.3.1
```

---

## 4. Module 1: School (Multi-Tenancy)

### Django App: `schools`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ School                                          │
├─────────────────────────────────────────────────┤
│ id            UUIDField (PK)                    │
│ name          CharField(200)                     │
│ code          CharField(20)  unique              │
│               e.g. "DPS001"                      │
│ address       TextField                          │
│ city          CharField(100)                     │
│ state         CharField(100)                     │
│ pincode       CharField(10)                      │
│ phone         CharField(15)                      │
│ email         EmailField                         │
│ website       URLField  blank                    │
│ logo          ImageField  blank                   │
│ established   DateField  nullable                 │
│ affiliation   CharField(100)  blank               │
│               e.g. "CBSE", "ICSE", "State Board" │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ AcademicYear                                    │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ year          CharField(9)  e.g. "2025-2026"    │
│ start_date    DateField                           │
│ end_date      DateField                           │
│ is_current    BooleanField  default=False         │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, year)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ SchoolSettings                                  │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School  unique               │
│ timezone      CharField(50)  default="Asia/Kolkata"│
│ currency      CharField(3)  default="INR"        │
│ currency_symbol CharField(5)  default="₹"       │
│ academic_start_month PositiveIntegerField  default=4│
│               (1=Jan, 4=Apr, 7=Jul)              │
│ attendance Passing percentage                    │
│ passing_percentage PositiveIntegerField  default=33│
│ max_students_per_section PositiveIntegerField  default=40│
│ enable_biometric BooleanField  default=False      │
│ sms_enabled   BooleanField  default=False         │
│ email_enabled BooleanField  default=False         │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ SchoolHoliday                                   │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(200)                     │
│ date          DateField                           │
│ holiday_type  CharField(20)                       │
│               choices: national/religious/school  │
│ description   TextField  blank                   │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, date)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ SchoolNotificationTemplate                      │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ template_type CharField(30)                       │
│               choices: fee_receipt/welcome/       │
│               attendance_alert/exam_result/       │
│               general                            │
│ subject       CharField(200)                     │
│ body          TextField                          │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/schools/` | List all schools (super admin) |
| POST | `/schools/` | Create school (super admin) |
| GET | `/schools/{id}/` | School detail |
| PUT | `/schools/{id}/` | Update school |
| DELETE | `/schools/{id}/` | Soft delete school |
| GET | `/schools/{id}/settings/` | Get school settings |
| PUT | `/schools/{id}/settings/` | Update school settings |
| GET | `/schools/{id}/academic-years/` | List academic years |
| POST | `/schools/{id}/academic-years/` | Create academic year |
| PUT | `/schools/{id}/academic-years/{id}/` | Update academic year |
| POST | `/schools/{id}/academic-years/{id}/set-current/` | Set as current year |
| GET | `/schools/{id}/holidays/` | List holidays |
| POST | `/schools/{id}/holidays/` | Add holiday |
| PUT | `/schools/{id}/holidays/{id}/` | Update holiday |
| DELETE | `/schools/{id}/holidays/{id}/` | Delete holiday |
| GET | `/schools/{id}/templates/` | List notification templates |
| POST | `/schools/{id}/templates/` | Create template |
| PUT | `/schools/{id}/templates/{id}/` | Update template |

---

## 5. Module 2: Fee Collection & Payments

### Django App: `fees`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ FeeCategory                                     │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(100)                     │
│               e.g. "Tuition", "Bus", "Hostel"   │
│ description   TextField  blank                   │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ FeeHead                                         │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ category      FK -> FeeCategory                  │
│ name          CharField(100)                     │
│               e.g. "Tuition Fee", "Lab Fee"     │
│ description   TextField  blank                   │
│ is_recurring  BooleanField  default=False         │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ FeeStructure                                    │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ academic_year FK -> AcademicYear                  │
│ class         FK -> AcademicClass                 │
│ fee_head      FK -> FeeHead                       │
│ amount        DecimalField(10,2)                  │
│ due_date      DateField  nullable                 │
│ late_fee      DecimalField(10,2)  default=0       │
│ late_fee_per_day DecimalField(10,2)  default=0    │
│ installment_allowed BooleanField  default=False    │
│ max_installments PositiveIntegerField  default=1   │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, academic_year, class, fee_head)│
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ StudentFeeAssignment                            │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ student       FK -> Admission                     │
│ fee_structure FK -> FeeStructure                  │
│ discount      DecimalField(10,2)  default=0       │
│ discount_reason TextField  blank                  │
│ override_amount DecimalField(10,2)  nullable      │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (student, fee_structure)         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ FeePayment                                      │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ receipt_no    CharField(20)  unique               │
│               e.g. "REC-2025-000001"             │
│ student       FK -> Admission                     │
│ fee_structure FK -> FeeStructure                  │
│ amount_paid   DecimalField(10,2)                  │
│ payment_date  DateField                           │
│ payment_mode  CharField(20)                       │
│               choices: cash/online/card/cheque/   │
│               upi/neft/rtgs                       │
│ transaction_id CharField(100)  blank              │
│ cheque_no     CharField(20)  blank                │
│ bank_name     CharField(100)  blank               │
│ remarks       TextField  blank                   │
│ received_by   FK -> User (staff who collected)    │
│ is_verified   BooleanField  default=False         │
│ verified_by   FK -> User  nullable                │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ FeeReceipt                                      │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ receipt_no    CharField(20)  unique               │
│ payment       FK -> FeePayment                    │
│ generated_by  FK -> User                          │
│ pdf_file      FileField  blank                    │
│ sent_via_email BooleanField  default=False        │
│ sent_via_sms  BooleanField  default=False         │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Fine                                            │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ student       FK -> Admission                     │
│ fee_payment   FK -> FeePayment  nullable          │
│ reason        CharField(200)                     │
│ amount        DecimalField(10,2)                  │
│ fine_date     DateField                           │
│ is_waived     BooleanField  default=False         │
│ waived_by     FK -> User  nullable                │
│ waived_reason TextField  blank                   │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ FeeDueReminder                                  │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ student       FK -> Admission                     │
│ fee_structure FK -> FeeStructure                  │
│ amount_due    DecimalField(10,2)                  │
│ due_date      DateField                           │
│ reminder_sent BooleanField  default=False         │
│ reminder_date DateTimeField  nullable              │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Fee Categories** | | |
| GET | `/fee-categories/` | List fee categories |
| POST | `/fee-categories/` | Create fee category |
| PUT | `/fee-categories/{id}/` | Update fee category |
| DELETE | `/fee-categories/{id}/` | Delete fee category |
| **Fee Heads** | | |
| GET | `/fee-heads/` | List fee heads |
| POST | `/fee-heads/` | Create fee head |
| PUT | `/fee-heads/{id}/` | Update fee head |
| DELETE | `/fee-heads/{id}/` | Delete fee head |
| **Fee Structure** | | |
| GET | `/fee-structures/` | List (filter by year, class) |
| POST | `/fee-structures/` | Create fee structure |
| POST | `/fee-structures/bulk-create/` | Bulk create for all classes |
| PUT | `/fee-structures/{id}/` | Update fee structure |
| DELETE | `/fee-structures/{id}/` | Delete fee structure |
| GET | `/fee-structures/by-class/{class_id}/` | Fee structure for a class |
| **Student Fee Assignment** | | |
| GET | `/student-fee-assignments/` | List assignments |
| POST | `/student-fee-assignments/` | Assign fee to student |
| POST | `/student-fee-assignments/bulk-assign/` | Bulk assign to class |
| PUT | `/student-fee-assignments/{id}/` | Update assignment |
| DELETE | `/student-fee-assignments/{id}/` | Remove assignment |
| **Payments** | | |
| GET | `/fee-payments/` | List payments |
| POST | `/fee-payments/` | Record payment |
| GET | `/fee-payments/{id}/` | Payment detail |
| GET | `/fee-payments/by-student/{student_id}/` | Student payment history |
| POST | `/fee-payments/{id}/verify/` | Verify payment |
| GET | `/fee-payments/pending/` | All pending dues |
| GET | `/fee-payments/today/` | Today's collections |
| **Receipts** | | |
| GET | `/fee-receipts/` | List receipts |
| GET | `/fee-receipts/{id}/` | Receipt detail |
| GET | `/fee-receipts/{id}/download/` | Download receipt PDF |
| POST | `/fee-receipts/{id}/resend/` | Resend via email/SMS |
| **Fines** | | |
| GET | `/fines/` | List fines |
| POST | `/fines/` | Add fine |
| PUT | `/fines/{id}/` | Update fine |
| POST | `/fines/{id}/waive/` | Waive fine |
| **Due Reminders** | | |
| GET | `/fee-due-reminders/` | List due reminders |
| POST | `/fee-due-reminders/generate/` | Generate all dues |
| POST | `/fee-due-reminders/send/` | Send reminders |
| **Reports** | | |
| GET | `/fees/reports/collection/` | Fee collection report |
| GET | `/fees/reports/pending/` | Pending dues report |
| GET | `/fees/reports/class-wise/` | Class-wise collection |
| GET | `/fees/reports/monthly/` | Monthly collection summary |
| GET | `/fees/reports/daily/` | Daily collection summary |

---

## 6. Module 3: Attendance

### Django App: `attendance`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ AttendancePeriod                                │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(50)  e.g. "Period 1"    │
│ start_time    TimeField                           │
│ end_time      TimeField                           │
│ period_order  PositiveIntegerField                │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ AttendanceRecord                                │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ student       FK -> Admission                     │
│ date          DateField                           │
│ status        CharField(10)                       │
│               choices: present/absent/late/half_day/excused│
│ period        FK -> AttendancePeriod  nullable    │
│               (null = full day attendance)        │
│ marked_by     FK -> User                          │
│ remarks       TextField  blank                   │
│ source        CharField(10)                       │
│               choices: manual/biometric/face      │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
│ unique_together: (student, date, period)          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ AttendanceSummary                               │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ student       FK -> Admission                     │
│ academic_year FK -> AcademicYear                  │
│ total_days    PositiveIntegerField  default=0     │
│ present_days  PositiveIntegerField  default=0     │
│ absent_days   PositiveIntegerField  default=0     │
│ late_days     PositiveIntegerField  default=0     │
│ half_days     PositiveIntegerField  default=0     │
│ excused_days  PositiveIntegerField  default=0     │
│ attendance_pct DecimalField(5,2)  default=0       │
│ updated_at    DateTimeField  auto_now             │
│ unique_together: (student, academic_year)         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Holiday                                         │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(200)                     │
│ date          DateField                           │
│ description   TextField  blank                   │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, date)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ LeaveApplication                                │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ student       FK -> Admission                     │
│ start_date    DateField                           │
│ end_date      DateField                           │
│ reason        TextField                          │
│ status        CharField(15)                       │
│               choices: pending/approved/rejected  │
│ approved_by   FK -> User  nullable                │
│ remarks       TextField  blank                   │
│ attachment    FileField  blank                    │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ClassAttendanceDay                              │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ class         FK -> AcademicClass                 │
│ section       FK -> Section                       │
│ date          DateField                           │
│ total_students PositiveIntegerField              │
│ present       PositiveIntegerField  default=0     │
│ absent        PositiveIntegerField  default=0     │
│ late          PositiveIntegerField  default=0     │
│ is_finalized  BooleanField  default=False         │
│ finalized_by  FK -> User  nullable                │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (class, section, date)           │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Mark Attendance** | | |
| POST | `/attendance/mark/` | Mark attendance for class (bulk) |
| POST | `/attendance/mark-single/` | Mark single student attendance |
| GET | `/attendance/class/{class_id}/{section_id}/` | Get class attendance for date |
| **View** | | |
| GET | `/attendance/` | List attendance records (filtered) |
| GET | `/attendance/student/{student_id}/` | Student attendance history |
| GET | `/attendance/student/{student_id}/summary/` | Student attendance summary |
| GET | `/attendance/class/{class_id}/summary/` | Class attendance summary |
| **Leave** | | |
| GET | `/leave-applications/` | List leave applications |
| POST | `/leave-applications/` | Apply for leave |
| PUT | `/leave-applications/{id}/` | Update application |
| POST | `/leave-applications/{id}/approve/` | Approve leave |
| POST | `/leave-applications/{id}/reject/` | Reject leave |
| **Periods** | | |
| GET | `/attendance-periods/` | List periods |
| POST | `/attendance-periods/` | Create period |
| PUT | `/attendance-periods/{id}/` | Update period |
| DELETE | `/attendance-periods/{id}/` | Delete period |
| **Reports** | | |
| GET | `/attendance/reports/daily/` | Daily attendance report |
| GET | `/attendance/reports/monthly/` | Monthly report |
| GET | `/attendance/reports/class-wise/` | Class-wise comparison |
| GET | `/attendance/reports/low-attendance/` | Students with <75% |
| GET | `/attendance/reports/bulk-sms/` | Students to notify |

---

## 7. Module 4: Examinations & Results

### Django App: `examinations`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ ExamType                                        │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(100)                     │
│               e.g. "Unit Test", "Mid Term",      │
│               "Final", "Pre-Board"               │
│ description   TextField  blank                   │
│ weightage    PositiveIntegerField  default=100    │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Subject                                         │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(100)                     │
│ code          CharField(10)  unique per school    │
│ type          CharField(15)                       │
│               choices: theory/practical/both      │
│ max_marks     PositiveIntegerField  default=100   │
│ passing_marks PositiveIntegerField  default=33    │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, code)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ClassSubject                                    │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ class         FK -> AcademicClass                 │
│ subject       FK -> Subject                       │
│ teacher       FK -> Teacher  nullable             │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, class, subject)         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Exam                                            │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ exam_type     FK -> ExamType                      │
│ name          CharField(200)                     │
│ academic_year FK -> AcademicYear                  │
│ start_date    DateField                           │
│ end_date      DateField                           │
│ result_date   DateField  nullable                 │
│ is_published  BooleanField  default=False         │
│ published_by  FK -> User  nullable                │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ExamSchedule                                    │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ exam          FK -> Exam                          │
│ subject       FK -> Subject                       │
│ class         FK -> AcademicClass                 │
│ date          DateField                           │
│ start_time    TimeField                           │
│ end_time      TimeField                           │
│ max_marks     PositiveIntegerField                │
│ passing_marks PositiveIntegerField                │
│ room_no       CharField(20)  blank                │
│ instructions  TextField  blank                   │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (exam, subject, class)           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ExamResult                                      │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ exam          FK -> Exam                          │
│ student       FK -> Admission                     │
│ schedule      FK -> ExamSchedule                  │
│ marks_obtained DecimalField(5,2)  nullable        │
│               (null = absent)                     │
│ grade         CharField(2)  blank                 │
│ remarks       CharField(200)  blank               │
│ is_absent     BooleanField  default=False         │
│ graded_by     FK -> User  nullable                │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
│ unique_together: (exam, student, schedule)        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ GradingSystem                                   │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(100)                     │
│               e.g. "CBSE Grading", "Percentage"  │
│ grades        JSONField                           │
│               e.g. [{"grade":"A1","min":91,"max":100}, ...]│
│ is_default    BooleanField  default=False         │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ReportCard                                      │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ exam          FK -> Exam                          │
│ student       FK -> Admission                     │
│ total_marks   DecimalField(6,2)                   │
│ marks_obtained DecimalField(6,2)                  │
│ percentage    DecimalField(5,2)                   │
│ grade         CharField(2)  blank                 │
│ rank          PositiveIntegerField  nullable      │
│ status        CharField(10)                       │
│               choices: pass/fail/compartment      │
│ remarks       TextField  blank                   │
│ generated_at  DateTimeField  auto_now_add         │
│ unique_together: (exam, student)                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ClassResultSummary                              │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ exam          FK -> Exam                          │
│ class         FK -> AcademicClass                 │
│ section       FK -> Section                       │
│ subject       FK -> Subject                       │
│ total_students PositiveIntegerField              │
│ appeared      PositiveIntegerField              │
│ passed        PositiveIntegerField              │
│ failed        PositiveIntegerField              │
│ pass_pct      DecimalField(5,2)                   │
│ highest       DecimalField(5,2)                   │
│ lowest        DecimalField(5,2)                   │
│ average       DecimalField(5,2)                   │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (exam, class, section, subject)  │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Exam Types** | | |
| GET | `/exam-types/` | List exam types |
| POST | `/exam-types/` | Create exam type |
| PUT | `/exam-types/{id}/` | Update exam type |
| DELETE | `/exam-types/{id}/` | Delete exam type |
| **Subjects** | | |
| GET | `/subjects/` | List subjects |
| POST | `/subjects/` | Create subject |
| PUT | `/subjects/{id}/` | Update subject |
| DELETE | `/subjects/{id}/` | Delete subject |
| GET | `/class-subjects/` | List class-subject mappings |
| POST | `/class-subjects/` | Assign subject to class |
| POST | `/class-subjects/bulk-assign/` | Bulk assign subjects |
| DELETE | `/class-subjects/{id}/` | Remove class-subject |
| **Exams** | | |
| GET | `/exams/` | List exams |
| POST | `/exams/` | Create exam |
| GET | `/exams/{id}/` | Exam detail |
| PUT | `/exams/{id}/` | Update exam |
| POST | `/exams/{id}/publish/` | Publish results |
| **Exam Schedule** | | |
| GET | `/exam-schedules/` | List schedules (filter by exam, class) |
| POST | `/exam-schedules/` | Create schedule |
| POST | `/exam-schedules/bulk-create/` | Bulk create schedules |
| PUT | `/exam-schedules/{id}/` | Update schedule |
| DELETE | `/exam-schedules/{id}/` | Delete schedule |
| **Results** | | |
| GET | `/exam-results/` | List results (filter by exam, class) |
| POST | `/exam-results/` | Enter single result |
| POST | `/exam-results/bulk-enter/` | Bulk enter results for class |
| PUT | `/exam-results/{id}/` | Update result |
| POST | `/exam-results/import/` | Import results from Excel/CSV |
| GET | `/exam-results/student/{student_id}/` | Student results |
| GET | `/exam-results/class/{class_id}/` | Class results |
| **Report Cards** | | |
| GET | `/report-cards/` | List report cards |
| POST | `/report-cards/generate/` | Generate report cards for exam |
| GET | `/report-cards/{id}/` | Report card detail |
| GET | `/report-cards/{id}/download/` | Download report card PDF |
| **Grading** | | |
| GET | `/grading-systems/` | List grading systems |
| POST | `/grading-systems/` | Create grading system |
| PUT | `/grading-systems/{id}/` | Update grading system |
| POST | `/grading-systems/{id}/set-default/` | Set as default |
| **Reports** | | |
| GET | `/exams/reports/class-performance/` | Class performance analysis |
| GET | `/exams/reports/subject-analysis/` | Subject-wise analysis |
| GET | `/exams/reports/toppers/` | Top students |
| GET | `/exams/reports/fail-students/` | Failed students |
| GET | `/exams/reports/comparison/` | Compare across exams |

---

## 8. Module 5: Timetable & Scheduling

### Django App: `timetable`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ TimeSlot                                        │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(50)  e.g. "Period 1"    │
│ start_time    TimeField                           │
│ end_time      TimeField                           │
│ slot_order    PositiveIntegerField                │
│ is_break      BooleanField  default=False         │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Timetable                                       │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ academic_year FK -> AcademicYear                  │
│ class         FK -> AcademicClass                 │
│ section       FK -> Section                       │
│ name          CharField(100)                     │
│ effective_from DateField                          │
│ effective_to  DateField  nullable                 │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, class, section, effective_from)│
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ TimetableEntry                                  │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ timetable     FK -> Timetable                     │
│ day_of_week   CharField(10)                       │
│               choices: monday/tuesday/wednesday/  │
│               thursday/friday/saturday            │
│ time_slot     FK -> TimeSlot                      │
│ subject       FK -> Subject                       │
│ teacher       FK -> Teacher  nullable             │
│ room_no       CharField(20)  blank                │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (timetable, day_of_week, time_slot)│
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ TeacherTimetable                                │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ teacher       FK -> Teacher                       │
│ day_of_week   CharField(10)                       │
│ time_slot     FK -> TimeSlot                      │
│ class         FK -> AcademicClass                 │
│ section       FK -> Section                       │
│ subject       FK -> Subject                       │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (teacher, day_of_week, time_slot)│
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ SubstituteTeacher                               │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ date          DateField                           │
│ original_teacher FK -> Teacher                    │
│ substitute_teacher FK -> Teacher                  │
│ timetable_entry FK -> TimetableEntry              │
│ reason        CharField(200)  blank               │
│ approved_by   FK -> User  nullable                │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (date, timetable_entry)          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Room                                            │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ room_no       CharField(20)                       │
│ building      CharField(100)  blank               │
│ capacity      PositiveIntegerField  default=40    │
│ room_type     CharField(20)                       │
│               choices: classroom/lab/office/hall  │
│ facilities    JSONField  default=[]               │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, room_no)                │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Time Slots** | | |
| GET | `/time-slots/` | List time slots |
| POST | `/time-slots/` | Create time slot |
| PUT | `/time-slots/{id}/` | Update time slot |
| DELETE | `/time-slots/{id}/` | Delete time slot |
| **Rooms** | | |
| GET | `/rooms/` | List rooms |
| POST | `/rooms/` | Create room |
| PUT | `/rooms/{id}/` | Update room |
| DELETE | `/rooms/{id}/` | Delete room |
| **Timetable** | | |
| GET | `/timetables/` | List timetables |
| POST | `/timetables/` | Create timetable |
| GET | `/timetables/{id}/` | Timetable detail |
| PUT | `/timetables/{id}/` | Update timetable |
| GET | `/timetables/{id}/entries/` | Get all entries |
| POST | `/timetables/{id}/entries/` | Add entry |
| POST | `/timetables/{id}/entries/bulk/` | Bulk add entries |
| PUT | `/timetable-entries/{id}/` | Update entry |
| DELETE | `/timetable-entries/{id}/` | Delete entry |
| GET | `/timetables/by-day/{day}/` | Entries for a day |
| **Teacher View** | | |
| GET | `/teacher-timetable/{teacher_id}/` | Teacher's weekly schedule |
| GET | `/teacher-timetable/free-slots/{teacher_id}/` | Free slots for teacher |
| **Substitutes** | | |
| GET | `/substitutes/` | List substitutes |
| POST | `/substitutes/` | Assign substitute |
| PUT | `/substitutes/{id}/` | Update substitute |
| DELETE | `/substitutes/{id}/` | Remove substitute |
| **Reports** | | |
| GET | `/timetable/reports/teacher-load/` | Teacher workload |
| GET | `/timetable/reports/room-utilization/` | Room usage |
| GET | `/timetable/reports/conflicts/` | Schedule conflicts |

---

## 9. Module 6: Library

### Django App: `library`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ BookCategory                                    │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(100)                     │
│ description   TextField  blank                   │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Book                                            │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ title         CharField(200)                     │
│ author        CharField(200)                     │
│ isbn          CharField(13)  unique               │
│ publisher     CharField(200)  blank               │
│ category      FK -> BookCategory                  │
│ edition       CharField(50)  blank                │
│ year_published PositiveIntegerField  nullable      │
│ language      CharField(30)  default="English"    │
│ pages         PositiveIntegerField  nullable      │
│ description   TextField  blank                   │
│ cover_image   ImageField  blank                   │
│ total_copies  PositiveIntegerField  default=1      │
│ available_copies PositiveIntegerField  default=1   │
│ location      CharField(50)  blank                │
│               e.g. "Shelf A-3"                    │
│ price         DecimalField(10,2)  default=0        │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ BookIssue                                       │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ book          FK -> Book                          │
│ issued_to_type CharField(10)                      │
│               choices: student/teacher/staff      │
│ issued_to_id  PositiveIntegerField                │
│ issued_by     FK -> User (librarian)              │
│ issue_date    DateField                           │
│ due_date      DateField                           │
│ return_date   DateField  nullable                 │
│ status        CharField(15)                       │
│               choices: issued/returned/overdue/lost│
│ fine          DecimalField(10,2)  default=0        │
│ fine_paid     BooleanField  default=False         │
│ remarks       TextField  blank                   │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ BookReservation                                 │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ book          FK -> Book                          │
│ reserved_by_type CharField(10)                    │
│               choices: student/teacher/staff      │
│ reserved_by_id PositiveIntegerField              │
│ reservation_date DateField                        │
│ expiry_date   DateField                           │
│ status        CharField(15)                       │
│               choices: active/fulfilled/cancelled  │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ LibraryMember                                   │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ member_type   CharField(10)                       │
│               choices: student/teacher/staff      │
│ member_id     PositiveIntegerField                │
│ max_books     PositiveIntegerField  default=3      │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Categories** | | |
| GET | `/book-categories/` | List categories |
| POST | `/book-categories/` | Create category |
| PUT | `/book-categories/{id}/` | Update category |
| DELETE | `/book-categories/{id}/` | Delete category |
| **Books** | | |
| GET | `/books/` | List books (search by title, author, ISBN) |
| POST | `/books/` | Add book |
| GET | `/books/{id}/` | Book detail |
| PUT | `/books/{id}/` | Update book |
| DELETE | `/books/{id}/` | Delete book |
| GET | `/books/available/` | Available books only |
| GET | `/books/overdue/` | Overdue books |
| **Issues** | | |
| GET | `/book-issues/` | List all issues |
| POST | `/book-issues/` | Issue book |
| POST | `/book-issues/{id}/return/` | Return book |
| GET | `/book-issues/active/` | Active issues |
| GET | `/book-issues/overdue/` | Overdue issues |
| GET | `/book-issues/by-member/{type}/{id}/` | Member's issues |
| **Reservations** | | |
| GET | `/book-reservations/` | List reservations |
| POST | `/book-reservations/` | Reserve book |
| PUT | `/book-reservations/{id}/` | Update reservation |
| POST | `/book-reservations/{id}/fulfill/` | Fulfill reservation |
| POST | `/book-reservations/{id}/cancel/` | Cancel reservation |
| **Members** | | |
| GET | `/library-members/` | List members |
| POST | `/library-members/` | Add member |
| PUT | `/library-members/{id}/` | Update member |
| DELETE | `/library-members/{id}/` | Remove member |
| GET | `/library-members/{id}/history/` | Member's issue history |
| **Reports** | | |
| GET | `/library/reports/popular-books/` | Most issued books |
| GET | `/library/reports/member-activity/` | Member activity |
| GET | `/library/reports/overdue-summary/` | Overdue summary |
| GET | `/library/reports/inventory/` | Book inventory |

---

## 10. Module 7: HR & Payroll

### Django App: `hr`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ Department                                      │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(100)                     │
│               e.g. "Academic", "Admin", "Transport"│
│ head          FK -> Staff  nullable                │
│ description   TextField  blank                   │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Designation                                     │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(100)                     │
│               e.g. "Teacher", "Accountant", "Peon"│
│ level         PositiveIntegerField  default=1      │
│               (1=entry, 5=management)             │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Staff                                           │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ user          FK -> User  nullable                │
│ employee_id   CharField(20)  unique per school    │
│               e.g. "EMP-2025-0001"               │
│ first_name    CharField(100)                     │
│ last_name     CharField(100)                     │
│ date_of_birth DateField                           │
│ gender        CharField(10)                       │
│ marital_status CharField(15)  blank               │
│ blood_group   CharField(5)  blank                 │
│ phone         CharField(15)                       │
│ email         EmailField  blank                   │
│ address       TextField                          │
│ city          CharField(100)  blank               │
│ state         CharField(100)  blank               │
│ pincode       CharField(10)  blank                │
│ aadhaar_no    CharField(12)  blank                │
│ pan_no        CharField(10)  blank                │
│ department    FK -> Department                    │
│ designation   FK -> Designation                   │
│ date_of_joining DateField                         │
│ date_of_leaving DateField  nullable               │
│ employment_type CharField(15)                     │
│               choices: permanent/contract/part_time│
│ qualification CharField(100)  blank               │
│ experience    CharField(50)  blank                │
│               e.g. "5 years"                     │
│ photo         ImageField  blank                   │
│ resume        FileField  blank                    │
│ bank_name     CharField(100)  blank               │
│ bank_account  CharField(20)  blank                │
│ ifsc_code     CharField(11)  blank                │
│ basic_salary  DecimalField(10,2)  default=0        │
│ status        CharField(15)                       │
│               choices: active/on_leave/terminated/retired│
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ AttendanceRecord  (same as students but for staff)│
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ staff         FK -> Staff                         │
│ date          DateField                           │
│ check_in      TimeField  nullable                 │
│ check_out     TimeField  nullable                 │
│ status        CharField(10)                       │
│               choices: present/absent/late/half_day/leave│
│ overtime_hours DecimalField(4,2)  default=0        │
│ remarks       TextField  blank                   │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
│ unique_together: (staff, date)                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ LeaveType                                       │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(50)                       │
│               e.g. "Casual", "Sick", "Earned"   │
│ days_per_year PositiveIntegerField                │
│ is_carry_forward BooleanField  default=False      │
│ max_carry_forward PositiveIntegerField  default=0  │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ StaffLeave                                      │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ staff         FK -> Staff                         │
│ leave_type    FK -> LeaveType                     │
│ start_date    DateField                           │
│ end_date      DateField                           │
│ total_days    DecimalField(4,2)                   │
│ reason        TextField                          │
│ status        CharField(15)                       │
│               choices: pending/approved/rejected  │
│ approved_by   FK -> User  nullable                │
│ remarks       TextField  blank                   │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ PayrollMonth                                    │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ month         PositiveIntegerField                │
│ year          PositiveIntegerField                │
│ status        CharField(15)                       │
│               choices: draft/processing/paid/closed│
│ processed_by  FK -> User  nullable                │
│ processed_at  DateTimeField  nullable              │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, month, year)             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ SalarySlip                                      │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ staff         FK -> Staff                         │
│ payroll_month FK -> PayrollMonth                   │
│ basic_salary  DecimalField(10,2)                  │
│ hra           DecimalField(10,2)  default=0        │
│ da            DecimalField(10,2)  default=0        │
│ conveyance    DecimalField(10,2)  default=0        │
│ medical       DecimalField(10,2)  default=0        │
│ other_allowances DecimalField(10,2)  default=0     │
│ gross_salary  DecimalField(10,2)                  │
│ pf            DecimalField(10,2)  default=0        │
│ esi           DecimalField(10,2)  default=0        │
│ tds           DecimalField(10,2)  default=0        │
│ professional_tax DecimalField(10,2)  default=0     │
│ other_deductions DecimalField(10,2)  default=0     │
│ total_deductions DecimalField(10,2)               │
│ net_salary    DecimalField(10,2)                  │
│ payment_status CharField(15)                       │
│               choices: pending/paid/cancelled      │
│ payment_date  DateField  nullable                  │
│ payment_mode  CharField(15)  blank                 │
│ transaction_id CharField(100)  blank               │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ SalaryComponent                                 │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(50)                       │
│ type          CharField(10)                       │
│               choices: earning/deduction          │
│ calculation   CharField(15)                       │
│               choices: fixed/percentage/basic_pct │
│ value         DecimalField(10,2)  default=0        │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Departments** | | |
| GET | `/departments/` | List departments |
| POST | `/departments/` | Create department |
| PUT | `/departments/{id}/` | Update department |
| DELETE | `/departments/{id}/` | Delete department |
| **Designations** | | |
| GET | `/designations/` | List designations |
| POST | `/designations/` | Create designation |
| PUT | `/designations/{id}/` | Update designation |
| DELETE | `/designations/{id}/` | Delete designation |
| **Staff** | | |
| GET | `/staff/` | List staff |
| POST | `/staff/` | Add staff member |
| GET | `/staff/{id}/` | Staff detail |
| PUT | `/staff/{id}/` | Update staff |
| DELETE | `/staff/{id}/` | Soft delete staff |
| GET | `/staff/{id}/attendance/` | Staff attendance |
| GET | `/staff/{id}/leaves/` | Staff leaves |
| GET | `/staff/{id}/salary-history/` | Salary history |
| **Leave Types** | | |
| GET | `/leave-types/` | List leave types |
| POST | `/leave-types/` | Create leave type |
| PUT | `/leave-types/{id}/` | Update leave type |
| DELETE | `/leave-types/{id}/` | Delete leave type |
| **Staff Leave** | | |
| GET | `/staff-leaves/` | List leave applications |
| POST | `/staff-leaves/` | Apply for leave |
| PUT | `/staff-leaves/{id}/` | Update application |
| POST | `/staff-leaves/{id}/approve/` | Approve leave |
| POST | `/staff-leaves/{id}/reject/` | Reject leave |
| GET | `/staff-leaves/balance/{staff_id}/` | Leave balance |
| **Payroll** | | |
| GET | `/payroll-months/` | List payroll months |
| POST | `/payroll-months/` | Create payroll month |
| PUT | `/payroll-months/{id}/` | Update payroll month |
| POST | `/payroll-months/{id}/process/` | Process payroll |
| POST | `/payroll-months/{id}/close/` | Close payroll |
| GET | `/salary-slips/` | List salary slips |
| POST | `/salary-slips/generate/` | Generate salary slips |
| GET | `/salary-slips/{id}/` | Salary slip detail |
| GET | `/salary-slips/{id}/download/` | Download salary slip PDF |
| GET | `/salary-slips/by-staff/{staff_id}/` | Staff salary history |
| **Salary Components** | | |
| GET | `/salary-components/` | List components |
| POST | `/salary-components/` | Create component |
| PUT | `/salary-components/{id}/` | Update component |
| DELETE | `/salary-components/{id}/` | Delete component |
| **Reports** | | |
| GET | `/hr/reports/staff-list/` | Complete staff list |
| GET | `/hr/reports/payroll-summary/` | Payroll summary |
| GET | `/hr/reports/attendance-summary/` | Attendance summary |
| GET | `/hr/reports/leave-summary/` | Leave summary |
| GET | `/hr/reports/pf-report/` | PF report |
| GET | `/hr/reports/esi-report/` | ESI report |

---

## 11. Module 8: Communication & Notifications

### Django App: `communication`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ Notification                                    │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ title         CharField(200)                     │
│ message       TextField                          │
│ notification_type CharField(20)                   │
│               choices: info/warning/urgent/event  │
│ target_audience CharField(20)                     │
│               choices: all/teachers/parents/students/staff│
│ target_ids    JSONField  default=[]               │
│               (specific user/student IDs)         │
│ sent_by       FK -> User                          │
│ is_read       BooleanField  default=False         │
│ read_at       DateTimeField  nullable              │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ SMSLog                                           │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ phone_number  CharField(15)                       │
│ message       TextField                          │
│ status        CharField(10)                       │
│               choices: pending/sent/failed/delivered│
│ gateway_response JSONField  default={}            │
│ sent_by       FK -> User  nullable                │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ EmailLog                                         │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ to_email      EmailField                         │
│ subject       CharField(200)                     │
│ body          TextField                          │
│ html_body     TextField  blank                   │
│ status        CharField(10)                       │
│               choices: pending/sent/failed        │
│ attachment    FileField  blank                    │
│ sent_by       FK -> User  nullable                │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Circular                                         │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ title         CharField(200)                     │
│ content       TextField                          │
│ target_audience CharField(20)                     │
│ published     BooleanField  default=False         │
│ published_at  DateTimeField  nullable              │
│ attachment    FileField  blank                    │
│ created_by    FK -> User                          │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ EventReminder                                   │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ title         CharField(200)                     │
│ event_date    DateField                           │
│ reminder_days PositiveIntegerField  default=1      │
│ sent          BooleanField  default=False         │
│ sent_at       DateTimeField  nullable              │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ParentCommunication                             │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ student       FK -> Admission                     │
│ subject       CharField(200)                     │
│ message       TextField                          │
│ communication_type CharField(15)                   │
│               choices: sms/email/both/app         │
│ sent_by       FK -> User                          │
│ sent_at       DateTimeField  auto_now_add         │
│ read_at       DateTimeField  nullable              │
│ response      TextField  blank                   │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Notifications** | | |
| GET | `/notifications/` | List notifications (for current user) |
| POST | `/notifications/` | Send notification |
| PUT | `/notifications/{id}/read/` | Mark as read |
| PUT | `/notifications/read-all/` | Mark all as read |
| GET | `/notifications/unread-count/` | Count unread |
| **SMS** | | |
| GET | `/sms-logs/` | List SMS logs |
| POST | `/sms/send/` | Send SMS |
| POST | `/sms/bulk-send/` | Bulk send SMS |
| **Email** | | |
| GET | `/email-logs/` | List email logs |
| POST | `/email/send/` | Send email |
| POST | `/email/bulk-send/` | Bulk send email |
| **Circulars** | | |
| GET | `/circulars/` | List circulars |
| POST | `/circulars/` | Create circular |
| GET | `/circulars/{id}/` | Circular detail |
| PUT | `/circulars/{id}/` | Update circular |
| POST | `/circulars/{id}/publish/` | Publish circular |
| DELETE | `/circulars/{id}/` | Delete circular |
| **Parent Communication** | | |
| GET | `/parent-comm/` | List communications |
| POST | `/parent-comm/` | Send to parent |
| GET | `/parent-comm/student/{student_id}/` | Student's communication history |
| **Reminders** | | |
| GET | `/event-reminders/` | List reminders |
| POST | `/event-reminders/` | Create reminder |
| PUT | `/event-reminders/{id}/` | Update reminder |
| DELETE | `/event-reminders/{id}/` | Delete reminder |

---

## 12. Module 9: Inventory & Store

### Django App: `inventory`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ InventoryCategory                               │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(100)                     │
│               e.g. "Stationery", "Lab Equipment" │
│ description   TextField  blank                   │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Item                                            │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(200)                     │
│ category      FK -> InventoryCategory             │
│ item_code     CharField(20)  unique per school    │
│ unit          CharField(20)                       │
│               choices: piece/kg/litre/meter/pack  │
│ min_stock     PositiveIntegerField  default=10    │
│ current_stock PositiveIntegerField  default=0     │
│ unit_price    DecimalField(10,2)  default=0        │
│ description   TextField  blank                   │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ StockEntry                                      │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ item          FK -> Item                          │
│ entry_type    CharField(10)                       │
│               choices: purchase/issue/adjustment/return│
│ quantity      DecimalField(10,2)                  │
│ unit_price    DecimalField(10,2)                  │
│ total_price   DecimalField(10,2)                  │
│ supplier      CharField(200)  blank               │
│ invoice_no    CharField(50)  blank                │
│ issued_to     CharField(200)  blank               │
│ issued_to_type CharField(15)  blank               │
│               choices: student/teacher/staff/department│
│ remarks       TextField  blank                   │
│ entry_by      FK -> User                          │
│ entry_date    DateField                           │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Supplier                                        │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(200)                     │
│ contact_person CharField(100)  blank              │
│ phone         CharField(15)                       │
│ email         EmailField  blank                   │
│ address       TextField  blank                   │
│ gst_no        CharField(15)  blank                │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ PurchaseOrder                                   │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ order_no      CharField(20)  unique               │
│ supplier      FK -> Supplier                      │
│ order_date    DateField                           │
│ expected_date DateField  nullable                 │
│ status        CharField(15)                       │
│               choices: draft/pending/approved/    │
│               received/cancelled                  │
│ total_amount  DecimalField(10,2)  default=0        │
│ remarks       TextField  blank                   │
│ created_by    FK -> User                          │
│ approved_by   FK -> User  nullable                │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ PurchaseOrderItem                               │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ purchase_order FK -> PurchaseOrder                │
│ item          FK -> Item                          │
│ quantity      DecimalField(10,2)                  │
│ unit_price    DecimalField(10,2)                  │
│ total_price   DecimalField(10,2)                  │
│ received_qty  DecimalField(10,2)  default=0        │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Categories** | | |
| GET | `/inventory-categories/` | List categories |
| POST | `/inventory-categories/` | Create category |
| PUT | `/inventory-categories/{id}/` | Update category |
| DELETE | `/inventory-categories/{id}/` | Delete category |
| **Items** | | |
| GET | `/items/` | List items |
| POST | `/items/` | Add item |
| GET | `/items/{id}/` | Item detail |
| PUT | `/items/{id}/` | Update item |
| DELETE | `/items/{id}/` | Delete item |
| GET | `/items/low-stock/` | Low stock items |
| **Stock** | | |
| GET | `/stock-entries/` | List stock entries |
| POST | `/stock-entries/purchase/` | Record purchase |
| POST | `/stock-entries/issue/` | Issue item |
| POST | `/stock-entries/adjust/` | Adjust stock |
| GET | `/stock-entries/item/{item_id}/` | Item stock history |
| **Suppliers** | | |
| GET | `/suppliers/` | List suppliers |
| POST | `/suppliers/` | Add supplier |
| PUT | `/suppliers/{id}/` | Update supplier |
| DELETE | `/suppliers/{id}/` | Delete supplier |
| **Purchase Orders** | | |
| GET | `/purchase-orders/` | List POs |
| POST | `/purchase-orders/` | Create PO |
| GET | `/purchase-orders/{id}/` | PO detail |
| PUT | `/purchase-orders/{id}/` | Update PO |
| POST | `/purchase-orders/{id}/approve/` | Approve PO |
| POST | `/purchase-orders/{id}/receive/` | Mark received |
| POST | `/purchase-orders/{id}/cancel/` | Cancel PO |
| **Reports** | | |
| GET | `/inventory/reports/stock-summary/` | Stock summary |
| GET | `/inventory/reports/issue-history/` | Issue history |
| GET | `/inventory/reports/purchase-history/` | Purchase history |

---

## 13. Module 10: Hostel Management

### Django App: `hostel`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ Hostel                                          │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(100)                     │
│ type          CharField(10)                       │
│               choices: boys/girls/staff           │
│ address       TextField  blank                   │
│ warden        CharField(100)  blank               │
│ contact       CharField(15)  blank                │
│ total_rooms   PositiveIntegerField                │
│ capacity      PositiveIntegerField                │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ HostelRoom                                      │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ hostel        FK -> Hostel                        │
│ room_number   CharField(10)                       │
│ floor         PositiveIntegerField  default=1     │
│ room_type     CharField(15)                       │
│               choices: single/double/triple/dorm  │
│ capacity      PositiveIntegerField                │
│ occupied      PositiveIntegerField  default=0     │
│ monthly_fee   DecimalField(10,2)  default=0        │
│ facilities    JSONField  default=[]               │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (hostel, room_number)             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ HostelAllocation                                │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ hostel        FK -> Hostel                        │
│ room          FK -> HostelRoom                    │
│ student       FK -> Admission                     │
│ academic_year FK -> AcademicYear                  │
│ allocated_from DateField                          │
│ allocated_to  DateField  nullable                 │
│ status        CharField(15)                       │
│               choices: active/vacated/transferred  │
│ remarks       TextField  blank                   │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
│ unique_together: (student, academic_year)          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ HostelFee                                       │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ hostel        FK -> Hostel                        │
│ academic_year FK -> AcademicYear                  │
│ room_type     CharField(15)                       │
│ monthly_fee   DecimalField(10,2)                  │
│ security_deposit DecimalField(10,2)  default=0     │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (hostel, academic_year, room_type)│
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ HostelAttendance                                │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ hostel        FK -> Hostel                        │
│ student       FK -> Admission                     │
│ date          DateField                           │
│ check_in_time TimeField  nullable                 │
│ check_out_time TimeField  nullable                │
│ status        CharField(10)                       │
│               choices: present/absent/out         │
│ remarks       TextField  blank                   │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (student, date)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ HostelVisitor                                   │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ hostel        FK -> Hostel                        │
│ student       FK -> Admission                     │
│ visitor_name  CharField(100)                     │
│ visitor_phone CharField(15)                       │
│ relation      CharField(50)                       │
│ id_proof      CharField(50)                       │
│ visit_date    DateField                           │
│ check_in      TimeField                           │
│ check_out     TimeField  nullable                 │
│ purpose       TextField  blank                   │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ HostelMessMenu                                  │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ hostel        FK -> Hostel                        │
│ day_of_week   CharField(10)                       │
│ meal_type     CharField(10)                       │
│               choices: breakfast/lunch/dinner     │
│ menu_items    TextField                          │
│ date          DateField                           │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (hostel, date, meal_type)        │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Hostels** | | |
| GET | `/hostels/` | List hostels |
| POST | `/hostels/` | Create hostel |
| GET | `/hostels/{id}/` | Hostel detail |
| PUT | `/hostels/{id}/` | Update hostel |
| DELETE | `/hostels/{id}/` | Delete hostel |
| **Rooms** | | |
| GET | `/hostel-rooms/` | List rooms (filter by hostel) |
| POST | `/hostel-rooms/` | Create room |
| PUT | `/hostel-rooms/{id}/` | Update room |
| DELETE | `/hostel-rooms/{id}/` | Delete room |
| GET | `/hostel-rooms/available/` | Available rooms |
| **Allocations** | | |
| GET | `/hostel-allocations/` | List allocations |
| POST | `/hostel-allocations/` | Allocate room |
| PUT | `/hostel-allocations/{id}/` | Update allocation |
| POST | `/hostel-allocations/{id}/vacate/` | Vacate room |
| POST | `/hostel-allocations/{id}/transfer/` | Transfer room |
| **Fees** | | |
| GET | `/hostel-fees/` | List hostel fees |
| POST | `/hostel-fees/` | Set hostel fee |
| PUT | `/hostel-fees/{id}/` | Update fee |
| **Attendance** | | |
| GET | `/hostel-attendance/` | List attendance |
| POST | `/hostel-attendance/mark/` | Mark attendance |
| GET | `/hostel-attendance/student/{student_id}/` | Student attendance |
| **Visitors** | | |
| GET | `/hostel-visitors/` | List visitors |
| POST | `/hostel-visitors/` | Log visitor |
| **Mess Menu** | | |
| GET | `/hostel-mess-menu/` | List menu |
| POST | `/hostel-mess-menu/` | Add menu item |
| PUT | `/hostel-mess-menu/{id}/` | Update menu |
| DELETE | `/hostel-mess-menu/{id}/` | Delete menu |
| **Reports** | | |
| GET | `/hostel/reports/occupancy/` | Room occupancy |
| GET | `/hostel/reports/fee-collection/` | Fee collection |

---

## 14. Module 11: Events & Calendar

### Django App: `events`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ EventType                                       │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(100)                     │
│ color         CharField(7)  default="#3B82F6"    │
│               (hex color for calendar)            │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Event                                           │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ event_type    FK -> EventType                     │
│ title         CharField(200)                     │
│ description   TextField  blank                   │
│ start_date    DateTimeField                       │
│ end_date      DateTimeField                       │
│ location      CharField(200)  blank               │
│ is_holiday    BooleanField  default=False         │
│ target_audience CharField(20)                     │
│               choices: all/teachers/students/parents│
│ created_by    FK -> User                          │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ExamEvent                                       │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ event         FK -> Event                         │
│ exam          FK -> Exam  nullable                 │
│ classes       JSONField  default=[]               │
│               (list of class IDs)                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ SchoolCalendar                                  │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ academic_year FK -> AcademicYear                  │
│ name          CharField(100)                     │
│ year          PositiveIntegerField                │
│ is_published  BooleanField  default=False         │
│ published_at  DateTimeField  nullable              │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Event Types** | | |
| GET | `/event-types/` | List event types |
| POST | `/event-types/` | Create event type |
| PUT | `/event-types/{id}/` | Update event type |
| DELETE | `/event-types/{id}/` | Delete event type |
| **Events** | | |
| GET | `/events/` | List events (filter by date range, type) |
| POST | `/events/` | Create event |
| GET | `/events/{id}/` | Event detail |
| PUT | `/events/{id}/` | Update event |
| DELETE | `/events/{id}/` | Delete event |
| GET | `/events/today/` | Today's events |
| GET | `/events/this-week/` | This week's events |
| GET | `/events/this-month/` | This month's events |
| **Calendar** | | |
| GET | `/school-calendars/` | List calendars |
| POST | `/school-calendars/` | Create calendar |
| PUT | `/school-calendars/{id}/` | Update calendar |
| POST | `/school-calendars/{id}/publish/` | Publish calendar |
| GET | `/school-calendars/{id}/download/` | Download calendar PDF |

---

## 15. Module 12: Visitors Management

### Django App: `visitors`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ VisitorCategory                                 │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(100)                     │
│               e.g. "Parent", "Vendor", "Guest"  │
│ badge_color   CharField(7)  default="#3B82F6"    │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Visitor                                         │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(200)                     │
│ phone         CharField(15)                       │
│ category      FK -> VisitorCategory               │
│ id_type       CharField(20)                       │
│               choices: aadhaar/pan/driving/other  │
│ id_number     CharField(30)  blank                │
│ photo         ImageField  blank                   │
│ purpose       TextField                          │
│ meeting_with  CharField(200)  blank               │
│ meeting_with_type CharField(15)  blank            │
│               choices: teacher/student/staff/admin│
│ badge_no      CharField(10)  blank                │
│ check_in      DateTimeField                       │
│ check_out     DateTimeField  nullable              │
│ vehicle_no    CharField(15)  blank                │
│ items_carrying TextField  blank                   │
│ remarks       TextField  blank                   │
│ approved_by   FK -> User  nullable                │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ VisitorPass                                     │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ visitor       FK -> Visitor                       │
│ pass_no       CharField(20)  unique               │
│ valid_from    DateTimeField                       │
│ valid_to      DateTimeField                       │
│ purpose       CharField(200)                     │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Visitor Categories** | | |
| GET | `/visitor-categories/` | List categories |
| POST | `/visitor-categories/` | Create category |
| PUT | `/visitor-categories/{id}/` | Update category |
| DELETE | `/visitor-categories/{id}/` | Delete category |
| **Visitors** | | |
| GET | `/visitors/` | List visitors |
| POST | `/visitors/` | Register visitor |
| GET | `/visitors/{id}/` | Visitor detail |
| PUT | `/visitors/{id}/` | Update visitor |
| POST | `/visitors/{id}/checkout/` | Checkout visitor |
| GET | `/visitors/today/` | Today's visitors |
| GET | `/visitors/active/` | Currently inside |
| **Visitor Passes** | | |
| GET | `/visitor-passes/` | List passes |
| POST | `/visitor-passes/` | Create pass |
| PUT | `/visitor-passes/{id}/` | Update pass |
| POST | `/visitor-passes/{id}/revoke/` | Revoke pass |
| **Reports** | | |
| GET | `/visitors/reports/daily/` | Daily visitor report |
| GET | `/visitors/reports/category-wise/` | Category-wise report |

---

## 16. Module 13: Staff Management

> (Separate from Teachers — covers admin staff, support staff, etc.)

### Django App: `staff` (extends `hr.Staff`)

This module is covered under **Module 7: HR & Payroll**. The `hr.Staff` model serves as the central staff model. Additional staff-specific features:

### Additional API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/staff/directory/` | Staff directory (searchable) |
| GET | `/staff/birthday/` | Staff birthdays |
| GET | `/staff/work-anniversary/` | Work anniversaries |
| GET | `/staff/organogram/` | Organization chart |
| POST | `/staff/{id}/documents/` | Upload staff documents |
| GET | `/staff/{id}/documents/` | List staff documents |

---

## 17. Module 14: Parents Portal

### Django App: `parents`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ ParentProfile                                   │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ user          FK -> User  unique                  │
│ school        FK -> School                       │
│ first_name    CharField(100)                     │
│ last_name     CharField(100)                     │
│ phone         CharField(15)                       │
│ email         EmailField  blank                   │
│ occupation    CharField(100)  blank               │
│ relationship  CharField(20)                       │
│               choices: father/mother/guardian     │
│ is_primary    BooleanField  default=False         │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ParentStudentLink                               │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ parent        FK -> ParentProfile                 │
│ student       FK -> Admission                     │
│ is_primary    BooleanField  default=False         │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (parent, student)                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ParentFeedback                                  │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ parent        FK -> ParentProfile                 │
│ student       FK -> Admission  nullable           │
│ subject       CharField(200)                     │
│ message       TextField                          │
│ feedback_type CharField(15)                       │
│               choices: suggestion/complaint/praise │
│ status        CharField(15)                       │
│               choices: pending/in_progress/resolved│
│ response      TextField  blank                   │
│ responded_by  FK -> User  nullable                │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Parent Profile** | | |
| GET | `/parents/` | List parents |
| POST | `/parents/` | Create parent profile |
| GET | `/parents/{id}/` | Parent detail |
| PUT | `/parents/{id}/` | Update parent |
| GET | `/parents/{id}/children/` | Parent's children |
| **Linking** | | |
| POST | `/parent-student-links/` | Link parent to student |
| DELETE | `/parent-student-links/{id}/` | Unlink |
| **Parent Portal (Child View)** | | |
| GET | `/parent/dashboard/` | Parent dashboard (child summary) |
| GET | `/parent/attendance/` | Child's attendance |
| GET | `/parent/fees/` | Child's fee status |
| GET | `/parent/exams/` | Child's exam results |
| GET | `/parent/timetable/` | Child's timetable |
| GET | `/parent/notifications/` | Notifications for parent |
| **Feedback** | | |
| GET | `/parent-feedback/` | List feedback |
| POST | `/parent-feedback/` | Submit feedback |
| PUT | `/parent-feedback/{id}/` | Update feedback |
| POST | `/parent-feedback/{id}/respond/` | Respond to feedback |
| PUT | `/parent-feedback/{id}/resolve/` | Mark resolved |

---

## 18. Module 15: Reports & Analytics

### Django App: `reports`

> This module generates aggregated reports across all modules.

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ SavedReport                                     │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(200)                     │
│ report_type   CharField(30)                       │
│               choices: student/fee/attendance/    │
│               exam/hr/transport/library/custom   │
│ parameters    JSONField  default={}               │
│ created_by    FK -> User                          │
│ is_public     BooleanField  default=False         │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ReportSchedule                                  │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ saved_report  FK -> SavedReport                   │
│ frequency     CharField(15)                       │
│               choices: daily/weekly/monthly/yearly│
│ day_of_week   PositiveIntegerField  nullable      │
│ day_of_month  PositiveIntegerField  nullable      │
│ recipients    JSONField  default=[]               │
│               (list of user IDs/emails)           │
│ is_active     BooleanField  default=True          │
│ last_sent     DateTimeField  nullable              │
│ next_send     DateTimeField  nullable              │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘
```

### API Endpoints (Report Types)

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Student Reports** | | |
| GET | `/reports/students/list/` | Complete student list |
| GET | `/reports/students/class-wise/` | Class-wise student count |
| GET | `/reports/students/gender-wise/` | Gender distribution |
| GET | `/reports/students/admission-trend/` | Admission trend over years |
| GET | `/reports/students/dropout/` | Dropout report |
| GET | `/reports/students/new-admissions/` | New admissions report |
| GET | `/reports/students/category-wise/` | Category distribution |
| **Fee Reports** | | |
| GET | `/reports/fees/collection-summary/` | Fee collection summary |
| GET | `/reports/fees/pending-dues/` | Pending dues report |
| GET | `/reports/fees/class-wise/` | Class-wise collection |
| GET | `/reports/fees/monthly-trend/` | Monthly collection trend |
| GET | `/reports/fees/payment-mode-wise/` | Payment mode analysis |
| GET | `/reports/fees/discount-report/` | Discount report |
| **Attendance Reports** | | |
| GET | `/reports/attendance/daily/` | Daily attendance summary |
| GET | `/reports/attendance/monthly/` | Monthly report |
| GET | `/reports/attendance/class-wise/` | Class-wise attendance |
| GET | `/reports/attendance/low-attendance/` | Low attendance students |
| GET | `/reports/attendance/trend/` | Attendance trend |
| **Exam Reports** | | |
| GET | `/reports/exams/class-performance/` | Class performance |
| GET | `/reports/exams/subject-analysis/` | Subject analysis |
| GET | `/reports/exams/toppers/` | Top performers |
| GET | `/reports/exams/pass-fail/` | Pass/fail ratio |
| GET | `/reports/exams/grade-distribution/` | Grade distribution |
| **HR Reports** | | |
| `/reports/hr/staff-list/` | Complete staff list |
| `/reports/hr/department-wise/` | Department-wise |
| `/reports/hr/payroll-summary/` | Payroll summary |
| `/reports/hr/attendance-summary/` | Staff attendance |
| **Transport Reports** | | |
| `/reports/transport/route-wise/` | Route-wise students |
| `/reports/transport/collection/` | Transport fee collection |
| **Dashboard** | | |
| GET | `/dashboard/overview/` | Overall stats |
| GET | `/dashboard/recent-activity/` | Recent activity feed |
| GET | `/dashboard/announcements/` | Latest announcements |
| **Saved Reports** | | |
| GET | `/saved-reports/` | List saved reports |
| POST | `/saved-reports/` | Save report config |
| PUT | `/saved-reports/{id}/` | Update saved report |
| DELETE | `/saved-reports/{id}/` | Delete saved report |
| POST | `/saved-reports/{id}/generate/` | Generate saved report |
| **Scheduling** | | |
| GET | `/report-schedules/` | List schedules |
| POST | `/report-schedules/` | Create schedule |
| PUT | `/report-schedules/{id}/` | Update schedule |
| DELETE | `/report-schedules/{id}/` | Delete schedule |

---

## 19. Module 16: Document Management

### Django App: `documents`

### DB Schema

```
┌─────────────────────────────────────────────────┐
│ DocumentCategory                                │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ name          CharField(100)                     │
│               e.g. "TC", "Marksheet", "ID Card" │
│ description   TextField  blank                   │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ unique_together: (school, name)                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Document                                        │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ category      FK -> DocumentCategory              │
│ title         CharField(200)                     │
│ description   TextField  blank                   │
│ file          FileField                          │
│ file_size     PositiveIntegerField  default=0     │
│ uploaded_by   FK -> User                          │
│ target_type   CharField(15)                       │
│               choices: student/staff/general      │
│ target_id     PositiveIntegerField  nullable      │
│ academic_year FK -> AcademicYear  nullable         │
│ is_public     BooleanField  default=False         │
│ tags          JSONField  default=[]               │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ DocumentTemplate                                │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ category      FK -> DocumentCategory              │
│ name          CharField(200)                     │
│ template_file FileField                          │
│ placeholders  JSONField  default=[]               │
│               e.g. ["student_name", "class", ...] │
│ is_active     BooleanField  default=True          │
│ created_at    DateTimeField  auto_now_add         │
│ updated_at    DateTimeField  auto_now             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ TransferCertificate                             │
├─────────────────────────────────────────────────┤
│ id            AutoField (PK)                    │
│ school        FK -> School                       │
│ student       FK -> Admission                     │
│ tc_number     CharField(20)  unique               │
│ issue_date    DateField                           │
│ reason        TextField                          │
│ conduct       CharField(100)  blank               │
│ class_studied CharField(50)  blank                │
│ last_exam_passed CharField(100)  blank            │
│ remarks       TextField  blank                   │
│ issued_by     FK -> User                          │
│ document      FK -> Document  nullable            │
│ created_at    DateTimeField  auto_now_add         │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Categories** | | |
| GET | `/document-categories/` | List categories |
| POST | `/document-categories/` | Create category |
| PUT | `/document-categories/{id}/` | Update category |
| DELETE | `/document-categories/{id}/` | Delete category |
| **Documents** | | |
| GET | `/documents/` | List documents (filter by category, target) |
| POST | `/documents/upload/` | Upload document |
| GET | `/documents/{id}/` | Document detail |
| PUT | `/documents/{id}/` | Update document metadata |
| DELETE | `/documents/{id}/` | Delete document |
| GET | `/documents/{id}/download/` | Download document |
| GET | `/documents/student/{student_id}/` | Student's documents |
| GET | `/documents/staff/{staff_id}/` | Staff's documents |
| **Templates** | | |
| GET | `/document-templates/` | List templates |
| POST | `/document-templates/` | Create template |
| PUT | `/document-templates/{id}/` | Update template |
| DELETE | `/document-templates/{id}/` | Delete template |
| POST | `/document-templates/{id}/generate/` | Generate document from template |
| **Transfer Certificates** | | |
| GET | `/transfer-certificates/` | List TCs |
| POST | `/transfer-certificates/` | Issue TC |
| GET | `/transfer-certificates/{id}/` | TC detail |
| GET | `/transfer-certificates/{id}/download/` | Download TC |
| GET | `/transfer-certificates/student/{student_id}/` | Student's TC |

---

## 20. Database Schema Summary

### Total Models Across All Modules

| Module | App Name | Models | Tables |
|--------|----------|--------|--------|
| **Foundation** | `accounts` | User | 1 |
| **Foundation** | `schools` | School, AcademicYear, SchoolSettings, SchoolHoliday, SchoolNotificationTemplate | 5 |
| **Foundation** | `authentication` | Role, Permission, RolePermission, UserSession, PasswordResetToken | 5 |
| **Students** | `students` | Admission, AcademicClass, Section, Year, Fees, Teacher, House, Caste, Category, SiblingGroup, OtherFees | 11 |
| **Fees** | `fees` | FeeCategory, FeeHead, FeeStructure, StudentFeeAssignment, FeePayment, FeeReceipt, Fine, FeeDueReminder | 8 |
| **Attendance** | `attendance` | AttendancePeriod, AttendanceRecord, AttendanceSummary, Holiday, LeaveApplication, ClassAttendanceDay | 6 |
| **Exams** | `examinations` | ExamType, Subject, ClassSubject, Exam, ExamSchedule, ExamResult, GradingSystem, ReportCard, ClassResultSummary | 9 |
| **Timetable** | `timetable` | TimeSlot, Timetable, TimetableEntry, TeacherTimetable, SubstituteTeacher, Room | 6 |
| **Library** | `library` | BookCategory, Book, BookIssue, BookReservation, LibraryMember | 5 |
| **HR** | `hr` | Department, Designation, Staff, StaffAttendance, LeaveType, StaffLeave, PayrollMonth, SalarySlip, SalaryComponent | 9 |
| **Communication** | `communication` | Notification, SMSLog, EmailLog, Circular, EventReminder, ParentCommunication | 6 |
| **Inventory** | `inventory` | InventoryCategory, Item, StockEntry, Supplier, PurchaseOrder, PurchaseOrderItem | 6 |
| **Hostel** | `hostel` | Hostel, HostelRoom, HostelAllocation, HostelFee, HostelAttendance, HostelVisitor, HostelMessMenu | 7 |
| **Events** | `events` | EventType, Event, ExamEvent, SchoolCalendar | 4 |
| **Visitors** | `visitors` | VisitorCategory, Visitor, VisitorPass | 3 |
| **Parents** | `parents` | ParentProfile, ParentStudentLink, ParentFeedback | 3 |
| **Reports** | `reports` | SavedReport, ReportSchedule | 2 |
| **Documents** | `documents` | DocumentCategory, Document, DocumentTemplate, TransferCertificate | 4 |
| **Transport** | `transport` | BusRoute, BusRouteFee, AdmissionBusDetail | 3 |
| | | **TOTAL** | **~103 tables** |

---

## 21. Implementation Priority

### Phase 1: Foundation (Week 1-2)
```
□ Fix existing issues (transport URLs, User admin, .env)
□ Install djangorestframework-simplejwt
□ Build authentication module (login, JWT, roles)
□ Build School model (multi-tenancy foundation)
□ Add school_id FK to all existing models
□ Add role-based permissions to all existing endpoints
```

### Phase 2: Core Academic (Week 3-5)
```
□ Build Fee Collection & Payments module
□ Build Attendance module
□ Build Examinations & Results module
```

### Phase 3: Operations (Week 6-8)
```
□ Build Timetable & Scheduling module
□ Build Library module
□ Build HR & Payroll module
```

### Phase 4: Communication (Week 9-10)
```
□ Build Communication & Notifications module
□ Build Events & Calendar module
□ Build Visitors Management module
```

### Phase 5: Advanced (Week 11-14)
```
□ Build Hostel Management module
□ Build Inventory & Store module
□ Build Parents Portal module
□ Build Reports & Analytics module
□ Build Document Management module
```

### Phase 6: Polish (Week 15-16)
```
□ API documentation (Swagger/OpenAPI)
□ Complete test coverage
□ Performance optimization (caching, select_related)
□ Security audit
□ Deployment preparation
```

---

## Appendix: Packages Required

```
# Authentication
djangorestframework-simplejwt==5.3.1

# PDF Generation
reportlab==4.0
weasyprint==59.0

# Excel/CSV Import/Export
openpyxl==3.1.2
xlrd==2.0.1

# SMS Gateway (optional)
twilio==8.0.0

# Email
django-email-backend==1.1.0

# Caching
django-redis==5.4.0

# Image processing (already have Pillow)

# API Documentation
drf-spectacular==0.26.0

# Task Queue (for async tasks like reminders)
django-q2==1.6.0

# File handling
django-storages==1.13.2
```

---

*This document serves as the complete blueprint for the School ERP system. Each module should be implemented as a separate Django app following the existing patterns in the codebase.*
