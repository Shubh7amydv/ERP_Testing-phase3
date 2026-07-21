# Frontend Flow Overview - School ERP

> **Framework:** React (Vite) + TypeScript  
> **UI Library:** shadcn/ui + Tailwind CSS  
> **State:** Zustand / React Query  
> **Router:** React Router v6  
> **API:** Axios + React Query  

---

## Global App Structure

```
/src
├── /components          # Shared UI components
│   ├── /ui              # shadcn components
│   ├── /layout          # Sidebar, Header, Footer
│   └── /shared          # Reusable components (DataTable, Modal, etc.)
├── /features            # Module-wise feature folders
│   ├── /auth
│   ├── /school
│   ├── /students
│   ├── /fees
│   ├── /attendance
│   ├── /examinations
│   ├── /timetable
│   ├── /library
│   ├── /hr
│   ├── /communication
│   ├── /inventory
│   ├── /hostel
│   ├── /events
│   ├── /visitors
│   ├── /parents
│   ├── /reports
│   └── /documents
├── /hooks               # Custom hooks
├── /lib                 # Utilities, API client, types
├── /store               # Zustand stores
└── /pages               # Route-level components
```

---

## Navigation Sidebar Structure

```
┌─────────────────────────────┐
│  🏫 School ERP             │
│  ─────────────────────────  │
│  🏠 Dashboard              │
│  ─────────────────────────  │
│  👥 Students               │
│  💰 Fees                   │
│  📋 Attendance             │
│  📝 Examinations           │
│  ⏰ Timetable              │
│  📚 Library                │
│  ─────────────────────────  │
│  👨‍💼 HR & Staff            │
│  💳 Payroll                │
│  ─────────────────────────  │
│  💬 Communication          │
│  📅 Events & Calendar      │
│  📦 Inventory              │
│  🏠 Hostel                 │
│  🚪 Visitors               │
│  ─────────────────────────  │
│  👨‍👩‍👧 Parent Portal         │
│  📊 Reports                │
│  📁 Documents              │
│  ─────────────────────────  │
│  ⚙️ Settings               │
│  👤 Profile                │
└─────────────────────────────┘
```

---

## Role-Based Visibility

| Role | Visible Modules |
|------|----------------|
| Super Admin | All modules |
| School Admin | All modules (scoped to school) |
| Principal | Students, Attendance, Exams, Timetable, Reports, Communication |
| Accountant | Fees, Reports, HR/Payroll |
| Teacher | Students (own class), Attendance, Exams (own subjects), Timetable |
| Librarian | Library only |
| Parent | Parent Portal only |
| Office Staff | Students, Fees (collection), Visitors |

---

## Shared UI Patterns

### 1. List Page Pattern
```
┌──────────────────────────────────────────┐
│ [Search...] [Filter ▼] [Sort ▼]  [+ Add]│
├──────────────────────────────────────────┤
│ □  Name      Class    Status    Actions  │
│ □  Student1  10-A     Active    ⋮       │
│ □  Student2  10-B     Active    ⋮       │
│ □  Student3  9-A      Inactive  ⋮       │
├──────────────────────────────────────────┤
│ Showing 1-20 of 150     ‹ 1 2 3 ... 8 › │
└──────────────────────────────────────────┘
```

### 2. Detail Page Pattern
```
┌──────────────────────────────────────────┐
│ ← Back          [Edit] [Delete] [Print]  │
├──────────────────────────────────────────┤
│ Student Name: John Doe                   │
│ Class: 10-A    Roll: 15                  │
│ ──────────────────────────────────────── │
│ [Overview] [Fees] [Attendance] [Exams]   │
│ ──────────────────────────────────────── │
│ Tab Content...                           │
└──────────────────────────────────────────┘
```

### 3. Form Modal Pattern
```
┌──────────────────────────────────────┐
│  Create Fee Structure         [×]   │
│  ──────────────────────────────────  │
│  Class:     [10-A     ▼]            │
│  Fee Head:  [Tuition  ▼]            │
│  Amount:    [₹ 5000         ]       │
│  Due Date:  [2025-03-15      ]       │
│  Late Fee:  [₹ 100/day      ]       │
│  ──────────────────────────────────  │
│           [Cancel]  [Save]           │
└──────────────────────────────────────┘
```

### 4. Report Page Pattern
```
┌──────────────────────────────────────────┐
│  Fee Collection Report                   │
│  ─────────────────────────────────────── │
│  [Date Range ▼] [Class ▼] [Export 📥]   │
│  ─────────────────────────────────────── │
│  ┌─────────────────────────────────┐     │
│  │  📊 Charts / Summary Cards      │     │
│  └─────────────────────────────────┘     │
│  ┌─────────────────────────────────┐     │
│  │  📋 Detailed Table              │     │
│  └─────────────────────────────────┘     │
│  ─────────────────────────────────────── │
│  [Print] [Download PDF] [Download Excel] │
└──────────────────────────────────────────┘
```

---

## Module Flow Summary

| # | Module | Key Screens | Status |
|---|--------|------------|--------|
| 0 | Auth | Login, Forgot Password, Profile | ✅ |
| 1 | School | School List, Settings, Academic Years, Holidays | ✅ |
| 2 | Students | Admission List, Student Profile, Class Management | ✅ |
| 3 | Fees | Fee Structure, Collection, Receipts, Dues | ✅ |
| 4 | Attendance | Mark, View, Reports, Leave | ✅ |
| 5 | Exams | Exam List, Schedule, Result Entry, Report Cards | 🔜 |
| 6 | Timetable | Grid View, Teacher View, Substitute | 🔜 |
| 7 | Library | Book Catalog, Issue/Return, Members | 🔜 |
| 8 | HR & Staff | Staff Directory, Attendance, Leave, Payroll | 🔜 |
| 9 | Communication | Notifications, SMS, Email, Circulars | 🔜 |
| 10 | Inventory | Items, Stock, Suppliers, Purchase Orders | 🔜 |
| 11 | Hostel | Rooms, Allocation, Attendance, Mess Menu | 🔜 |
| 12 | Events | Calendar, Events, Reminders | 🔜 |
| 13 | Visitors | Check-in/out, Passes, Reports | 🔜 |
| 14 | Parents | Dashboard, Child View, Feedback | 🔜 |
| 15 | Reports | Cross-module Reports, Dashboard | 🔜 |
| 16 | Documents | Upload, Templates, TC Generation | 🔜 |
