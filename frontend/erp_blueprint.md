# Dettroin School ERP - Detailed Multi-Role System Blueprint

This document details the complete operational layout, page routing, database structures, UI requirements, and backend API contracts for the entire Dettroin School ERP system.

---

## 🔑 Role & Permission Architecture

The system supports 6 primary roles:
1. **SuperAdmin (Admin)**: Full control over schools, configurations, staff directory, and permission matrix.
2. **Teacher**: Access to marks, homework assignments, class attendance, and student reports.
3. **Librarian**: Manage book catalog, issue/return logs, and fines.
4. **Hostel Warden**: Manage hostel rooms, hostelers, and mess logs.
5. **Transport Manager**: Manage routes, vehicles, driver assignments, and pick-up list.
6. **Student / Parent**: View profile, check attendance, view results, and pay fees online.

---

## 🏛️ MODULE 1: Administrator Control & Permission Center

This module is restricted to the **Admin** role.

### Page 1.1: Role Permission Matrix Console (`/admin/permissions`)
* **UI Data Shown**: A matrix grid of roles (Columns) vs permissions (Rows: Student View, Student Add, Book Edit, Hostel Allocate, etc.) with interactive checkboxes.
* **Get API**: `GET /api/auth/permissions/`
  * *Response*:
    ```json
    {
      "roles": ["Teacher", "Librarian", "HostelWarden", "TransportManager"],
      "permissions": [
        { "code": "student_view", "name": "View Students", "grants": ["Teacher", "Librarian"] }
      ]
    }
    }
    ```
* **Send API**: `POST /api/auth/permissions/update/`
  * *Payload*:
    ```json
    {
      "role": "Teacher",
      "permissions": ["student_view", "attendance_mark", "gradebook_edit"]
    }
    ```

### Page 1.2: School Profile Configurator (`/admin/profile`)
* **UI Data Shown**: Form fields for school name, registration code, CBSE/ICSE affiliation detail, contact information, and logo.
* **Send API**: `PUT /api/schools/{{school_id}}/update/`
  * *Payload*:
    ```json
    {
      "name": "Dettroin Global School",
      "affiliation": "CBSE",
      "pincode": "110001",
      "phone": "9876543210"
    }
    ```

### Page 1.3: Academic Session Manager (`/admin/sessions`)
* **UI Data Shown**: Table of academic years (e.g. `2025-26`, `2026-27`) showing start date, end date, and an "Active" badge.
* **Send API**: `POST /api/schools/{{school_id}}/academic-years/create/`
  * *Payload*:
    ```json
    {
      "year": "2026-2027",
      "start_date": "2026-04-01",
      "end_date": "2027-03-31",
      "is_current": true
    }
    ```

---

## 🧑‍🎓 MODULE 2: Admissions & Student Directory

Accessible by: **Admin** (Full CRUD), **Teacher** (Read-Only/View).

### Page 2.1: Student Directory (`/students/list`)
* **UI Data Shown**: Searchable table showing Name, ID, Class, Section, Sibling status, and Profile Photo.
* **Get API**: `GET /api/admissions/?page=1&limit=10&search=Rahul`
  * *Response*:
    ```json
    {
      "results": [
        { "id": "adm_001", "name": "Rahul Sharma", "admission_class": "Class 5", "section": "A" }
      ]
    }
    ```

### Page 2.2: Admission Form (`/students/admission-form`)
* **UI Data Shown**: Multi-step forms (Step 1: Student Details, Step 2: Parent/Guardian Details, Step 3: Documents Upload).
* **Send API**: `POST /api/admissions/` (via `multipart/form-data`)
  * *Payload*:
    ```
    first_name: Rahul
    last_name: Sharma
    phone: 9876543210
    admission_class: V
    photo: [Binary File]
    ```

### Page 2.3: Student ID Card Generator (`/students/id-card/:id`)
* **UI Data Shown**: Live CSS render of student badge with photo, emergency details, blood group, barcode, and print button.
* **Get API**: `GET /api/admissions/{{student_id}}/`

---

## 👩‍🏫 MODULE 3: Teacher & LMS

Accessible by: **Teacher** (CRUD), **Admin** (View).

### Page 3.1: Daily Attendance Register (`/teacher/attendance`)
* **UI Data Shown**: Dropdowns for Class/Section, followed by a list of students with Present/Absent/Late toggle buttons.
* **Send API**: `POST /api/academics/attendance/mark/`
  * *Payload*:
    ```json
    {
      "date": "2026-07-04",
      "class_id": "cls_5_a",
      "records": [
        { "student_id": "adm_001", "status": "Present" },
        { "student_id": "adm_002", "status": "Absent" }
      ]
    }
    ```

### Page 3.2: Report Card & Gradebook (`/teacher/grades`)
* **UI Data Shown**: Grade sheet spreadsheet view inputting test names, max marks, and marks obtained.
* **Send API**: `POST /api/academics/grades/bulk-update/`
  * *Payload*:
    ```json
    {
      "exam_name": "Mid-Term",
      "subject": "Mathematics",
      "grades": [
        { "student_id": "adm_001", "marks_obtained": 85 }
      ]
    }
    ```

---

## 📚 MODULE 4: Library Management

Accessible by: **Librarian** (CRUD), **Admin** (CRUD), **Students/Teachers** (Read-Only).

### Page 4.1: Book Catalog (`/library/books`)
* **UI Data Shown**: Searchable card/list view showing Book Title, ISBN, Author, Category, and Available stock.
* **Send API**: `POST /api/library/books/`
  * *Payload*:
    ```json
    {
      "title": "Introduction to Algorithms",
      "isbn": "9780262033848",
      "author": "Cormen",
      "quantity": 5
    }
    ```

### Page 4.2: Issue / Return Registry (`/library/transactions`)
* **UI Data Shown**: Form to scan barcode, input Student ID, issue date, return date, and active overdue transaction list.
* **Send API**: `POST /api/library/issue/`
  * *Payload*:
    ```json
    {
      "student_id": "adm_001",
      "book_id": "bk_alg_102",
      "due_date": "2026-07-18"
    }
    ```

---

## 🏢 MODULE 5: Hostel Management

Accessible by: **Hostel Warden** (CRUD), **Admin** (View).

### Page 5.1: Room Allocation Console (`/hostel/rooms`)
* **UI Data Shown**: Visual layout of hostel blocks (e.g. Block A, Block B), showing room capacities (e.g. 4-seater) and vacant slots.
* **Send API**: `POST /api/hostel/allocate/`
  * *Payload*:
    ```json
    {
      "student_id": "adm_001",
      "block": "Block A",
      "room_number": "104",
      "allotted_date": "2026-07-01"
    }
    ```

### Page 5.2: Mess Attendance & Menu (`/hostel/mess`)
* **UI Data Shown**: Dynamic calendar schedule of meals (Breakfast, Lunch, Dinner) and barcode scan verification logs for students dining.
* **Send API**: `POST /api/hostel/mess-attendance/`
  * *Payload*:
    ```json
    {
      "student_id": "adm_001",
      "meal_type": "Lunch",
      "date": "2026-07-04"
    }
    ```

---

## 🚌 MODULE 6: Transport & Fleet Management

Accessible by: **Transport Manager** (CRUD), **Admin** (View).

### Page 6.1: Routes & Stop Mapping (`/transport/routes`)
* **UI Data Shown**: Table of routes (e.g. Route 12 - South Delhi) with list of stops, assigned vehicle number, and driver contact.
* **Send API**: `POST /api/transport/routes/`
  * *Payload*:
    ```json
    {
      "route_name": "Route 12",
      "stops": ["Stop A", "Stop B", "School"],
      "vehicle_id": "DL-1C-A109",
      "driver_name": "Satish Kumar"
    }
    ```

---

## 💰 MODULE 7: Financial Accounts & Fees Ledger

Accessible by: **Accountant** (CRUD), **Admin** (CRUD), **Parent** (Read-Only/Online Pay).

### Page 7.1: Fee Collections Console (`/accounts/fees`)
* **UI Data Shown**: Multi-month checkout table displaying Paid/Overdue months, total due, and a "Collect Cash/UPI" register.
* **Send API**: `POST /api/accounts/collect-fee/`
  * *Payload*:
    ```json
    {
      "student_id": "adm_001",
      "amount": 3000,
      "payment_method": "UPI",
      "month": "July"
    }
    ```
