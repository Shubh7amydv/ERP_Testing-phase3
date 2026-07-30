# Module 2: Students - Actual API Flow

## Base: `/api/`
## Pagination: `?page=1&limit=10` (custom, NOT DRF built-in)
## Response: `{ success: true, data: { admissions: [...], pagination: { page, limit, total } } }`

---

## Screen 1: Student List Page

```
┌──────────────────────────────────────────────┐
│  Students                  [+ New Admission] │
│  ──────────────────────────────────────────  │
│  [Search name/roll/admission no...]          │
│  [Class ▼] [Section ▼] [Status ▼] [House ▼] │
│  ──────────────────────────────────────────  │
│  ☐ │ Name      │ Class │ Roll │ Gender │Status│
│  ☐ │ Aarav     │ X-A   │ 15   │ Male   │ ✅   │
│  ☐ │ Priya     │ X-A   │ 16   │ Female │ ✅   │
│  ☐ │ Rahul     │ IX-B  │ 22   │ Male   │ ✅   │
│  ☐ │ Sneha     │ VIII-A│ 8    │ Female │ ❌   │
│  ──────────────────────────────────────────  │
│  ☐ Select All    [Bulk Update] [More ⋮]     │
│  Showing 1-10 of 500     ‹ 1 2 3 ... 50 ›  │
└──────────────────────────────────────────────┘
```

**API Calls:**
```
GET /api/admissions/?page=1&limit=10&search=aarav&admission_class=X&section=A&is_active=true&year=2026-2027

Query Params:
  page: number (default 1)
  limit: number (default 10)
  search: string (searches first_name, last_name, admission_no, father_name, phone, house, bus_route, medium, caste)
  admission_class: string (NUR/LKG/UKG/PLAY/I...XII)
  section: string (A-Z)
  house: string
  gender: "Male" | "Female"
  is_active: boolean
  inactive: boolean
  blocked: boolean
  dropout: boolean
  tc: boolean
  is_bpl: boolean
  year: string ("2026-2027")
  ordering: "roll_number" | "-created_at"

Response: {
  success: true,
  data: {
    admissions: [ { id: UUID, admission_no, first_name, last_name, gender, roll_number, ... } ],
    pagination: { page: 1, limit: 10, total: 500 }
  }
}
```

**Bulk Actions:**
```
PATCH /api/admissions/bulk-update/
Body: [
  { "id": "UUID", "is_active": false },
  { "id": "UUID", "dropout": true }
]
Response: { success: true, updated: [...], errors: [...] }
```

---

## Screen 2: Filter by Groups (Class-Section Tree)

```
┌──────────────────────────────────────────────┐
│  Filter by Class/Section:                    │
│  ☑ Class X                                   │
│  │  ☑ Section A                              │
│  │  ☐ Section B                              │
│  ☑ Class IX                                  │
│  │  ☑ Section A                              │
│  │  ☑ Section B                              │
│  ☐ Class VIII                                │
│  [Apply Filter]                              │
└──────────────────────────────────────────────┘
```

**API Call:**
```
GET /api/admissions/filter-by-groups/
Query: {
  groups: [{"class":"X","section":"A"},{"class":"IX","section":"A"},{"class":"IX","section":"B"}],
  year: "2026-2027",
  ordering: "house",  // or "new" or default roll_number
  page: 1,
  limit: 10
}
```

---

## Screen 3: Class-Wise Summary

```
┌──────────────────────────────────────────────┐
│  Class-Wise Student Count (2026-2027)        │
│  ──────────────────────────────────────────  │
│  Class │ Section │ Boys │ Girls │ Total │New │
│  ──────┼─────────┼──────┼───────┼───────┼────│
│  I     │ A       │ 15   │ 12    │ 27    │ 3  │
│  I     │ B       │ 18   │ 14    │ 32    │ 5  │
│  II    │ A       │ 20   │ 16    │ 36    │ 2  │
│  ...                                           │
│  TOTAL │         │ 200  │ 180   │ 380   │ 45 │
└──────────────────────────────────────────────┘
```

**API Call:**
```
GET /api/admissions/class-wise-total-students/?year=2026-2027

Response: {
  success: true,
  data: [
    {
      class: "I",
      year: "2026-2027",
      sections: [
        { section: "A", boys: 15, girls: 12, total_students: 27, dropout: 1, tc: 0, new_students: 3 }
      ],
      class_total: { boys: 15, girls: 12, total_students: 27, dropout: 1, tc: 0, new_students: 3 }
    }
  ]
}
```

---

## Screen 4: New Admission Form (Single Page)

```
┌──────────────────────────────────────────────┐
│  New Admission                               │
│  ──────────────────────────────────────────  │
│                                              │
│  Personal Info:                              │
│  First Name:    [                ]           │
│  Last Name:     [                ]           │
│  DOB:           [DD/MM/YYYY      ]           │
│  Gender:        ○ Male  ○ Female             │
│  Blood Group:   [A+  ▼]                      │
│  Phone:         [                ]           │
│  Email:         [                ]           │
│  Address:       [                ]           │
│  📷 Upload Photo                              │
│  ──────────────────────────────────────────  │
│  Academic Info:                              │
│  Admission No:  [Auto: ADM-2026-0001]        │
│  Admission Date:[DD/MM/YYYY     ]            │
│  Class:         [X           ▼]              │
│  Section:       [A           ▼]              │
│  Roll Number:   [                ]           │
│  House:         [House A    ▼]               │
│  Medium:        [English    ▼]               │
│  ──────────────────────────────────────────  │
│  Parent Info:                                │
│  Father Name:   [                ]           │
│  Mother Name:   [                ]           │
│  ──────────────────────────────────────────  │
│  Documents:                                  │
│  📎 TC Document    [Upload]                  │
│  📎 Aadhaar        [Upload]                  │
│  ──────────────────────────────────────────  │
│  [  Submit Admission  ]                      │
└──────────────────────────────────────────────┘
```

**API Call:**
```
POST /api/admissions/
Body (FormData for file uploads):
{
  first_name: "Aarav",
  last_name: "Kumar",
  date_of_birth: "2010-06-15",
  gender: "Male",
  blood_group: "A+",
  phone: "+919876543210",
  email: "aarav@email.com",
  address: "123 MG Road, Delhi",
  admission_class: "X",        // String choice: NUR/LKG/UKG/PLAY/I...XII
  section: "A",                // Single letter A-Z
  roll_number: 15,
  house: "House A",            // Auto-creates if not exists
  medium: "English",
  father_name: "Rajesh Kumar",
  mother_name: "Sunita Kumar",
  date_of_admission: "2026-06-25",
  // Optional: photo, tc_document, aadhaar_document (File)
}

Response: {
  success: true,
  data: { id: UUID, admission_no: "ADM-2026-0001", first_name: "Aarav", ... }
}
```

**Important Write Behavior:**
- `admission_class`, `section`, `caste`, `house`, `category` accept **name/code strings** → auto-creates via `get_or_create`
- If `admission_class` set but `section` not → defaults to `"A"`
- If `section` set but `admission_class` not → defaults to `"I"`
- `academic_year` derived from `date_of_admission` or current year
- `admission_no` auto-generates as `ADM-YYYY-NNNN`

---

## Screen 5: Student Profile Page

```
┌──────────────────────────────────────────────┐
│ ← Students          [Edit] [Print] [More ⋮] │
│  ──────────────────────────────────────────  │
│  ┌──────┐                                   │
│  │ 📷   │  Aarav Kumar (ADM-2026-0001)      │
│  │ Photo│  Class X-A | Roll 15              │
│  └──────┘  Father: Rajesh Kumar             │
│            Status: Active ✅                 │
│  ──────────────────────────────────────────  │
│  Personal: DOB: 15/06/2010 | Gender: Male    │
│  Phone: +919876543210 | Medium: English      │
│  Address: 123 MG Road, Delhi                │
│  House: House A | Bus Route: Route 1         │
└──────────────────────────────────────────────┘
```

**API Call:**
```
GET /api/admissions/<uuid>/

Response: {
  id: UUID,
  admission_no: "ADM-2026-0001",
  first_name: "Aarav",
  last_name: "Kumar",
  date_of_birth: "2010-06-15",
  gender: "Male",
  blood_group: "A+",
  phone: "+919876543210",
  email: "aarav@email.com",
  address: "123 MG Road, Delhi",
  admission_class: "X",
  section: "A",
  roll_number: 15,
  house_name: "House A",
  house_color: "#FF0000",
  father_name: "Rajesh Kumar",
  mother_name: "Sunita Kumar",
  caste_name: "General",
  is_active: true,
  dropout: false,
  tc: false,
  status: "Active",
  photo: "/media/...",
  created_at: "2026-04-01T..."
}
```

---

## Screen 6: Edit Student

```
PUT /api/admissions/<uuid>/
Body: { first_name: "Aarav", last_name: "Kumar Updated", ... }
Response: { success: true, data: { ...updated fields... } }
```

---

## Screen 7: Delete Student (Soft Delete)

```
DELETE /api/admissions/<uuid>/
Response: { success: true }  // Sets is_active=False
```

---

## Classes/Sections/Houses Management

**API Calls:**
```
# Classes
GET    /api/classes/?year=2026-2027&page=1&limit=10
POST   /api/classes/        → { admission_class: "X", academic_year: 1 }
PUT    /api/classes/<id>/   → { admission_class: "X" }
DELETE /api/classes/<id>/

# Sections
GET    /api/sections/?year=2026-2027&page=1&limit=10
POST   /api/sections/       → { section: "A", academic_year: 1 }
DELETE /api/sections/<id>/

# Houses
GET    /api/houses/?search=house&page=1&limit=10
POST   /api/houses/         → { house_name: "House A", color_code: "#FF0000" }
DELETE /api/houses/<id>/

# Castes
GET    /api/castes/?year=2026-2027&page=1&limit=10
POST   /api/castes/         → { caste_name: "General", academic_year: 1 }
DELETE /api/castes/<id>/

# Categories
GET    /api/categories/?year=2026-2027&page=1&limit=10
POST   /api/categories/     → { name: "General", academic_year: 1 }
DELETE /api/categories/<id>/
```

---

## Sibling Groups

```
GET /api/sibling-groups/?year=2026-2027
Response: {
  sibling_groups: [
    {
      sibling_group_name: "Kumar Family",
      admissions: [ { ...student1, is_primary: true }, { ...student2, is_primary: false } ]
    }
  ]
}

POST /api/sibling-groups/add-to-sibling-group/
Body: {
  sibling_group_name: "Kumar Family",
  admission_ids: ["UUID1", "UUID2"],
  primary_sibling: "UUID1"  // optional
}
```

---

## Complete Data Flow

```
Student List Page
  │
  ├── GET /api/admissions/?page=1&limit=10&search=&admission_class=&section=&is_active=true
  │     └── Render table with pagination
  │
  ├── GET /api/admissions/filter-by-groups/?groups=[...]&year=2026-2027
  │     └── Filter by class/section tree
  │
  ├── GET /api/admissions/class-wise-total-students/?year=2026-2027
  │     └── Show class-wise summary
  │
  ├── [+ New Admission] → POST /api/admissions/
  │     └── Redirect to student profile
  │
  ├── [Edit] → PUT /api/admissions/<uuid>/
  │
  ├── [Delete] → DELETE /api/admissions/<uuid>/
  │
  └── [Bulk Update] → PATCH /api/admissions/bulk-update/
        Body: [{ id: UUID, is_active: false }, ...]
```
