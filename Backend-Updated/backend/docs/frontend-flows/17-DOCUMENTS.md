# Module 16: Document Management - UI/UX Flow

## Screens

### 1. Document Dashboard
```
┌──────────────────────────────────────────────┐
│  📁 Document Management                      │
│  ──────────────────────────────────────────  │
│                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│  │ 📄 Documents │ │ 📋 Templates│ │ 🎓 TCs │ │
│  │ 1,200 Total │ │ 8 Templates │ │ 45 Issued│ │
│  └─────────────┘ └─────────────┘ └────────┘ │
│                                              │
│  Recent Uploads:                             │
│  • Sports Day Photos (25 Jun)                │
│  • Annual Report 2024-25 (20 Jun)            │
│  • Class 10 Marksheets (15 Jun)              │
└──────────────────────────────────────────────┘
```

### 2. Document List
```
┌──────────────────────────────────────────────┐
│  Documents                 [+ Upload]        │
│  ──────────────────────────────────────────  │
│  [Search...] [Category ▼] [Type ▼]           │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ 📄 │ Title        │ Category │ Date    │ │
│  ├────────────────────────────────────────┤  │
│  │ 📄 │ Sports Photos│ Photos   │ 25 Jun  │ │
│  │ 📄 │ Annual Report│ Reports  │ 20 Jun  │ │
│  │ 📄 │ Class 10 MC  │ Marksheets│15 Jun  │ │
│  └────────────────────────────────────────┘  │
│  Showing 1-20 of 1200                        │
└──────────────────────────────────────────────┘
```

### 3. Upload Document
```
┌──────────────────────────────────────────────┐
│  Upload Document                             │
│  ──────────────────────────────────────────  │
│                                              │
│  Title:    [                        ]        │
│  Category: [Marksheets ▼]                    │
│  Type:     ○ Student  ○ Staff  ○ General     │
│  Student:  [Aarav Kumar ▼] (if student type) │
│  Academic Year: [2025-2026 ▼]                │
│  ──────────────────────────────────────────  │
│                                              │
│  📎 Drag & drop files here or [Browse]       │
│     Supports: PDF, JPG, PNG (Max 10MB)       │
│                                              │
│  Uploaded Files:                             │
│  • marks_10A.pdf (2.5 MB) ✅                 │
│                                              │
│  ☐ Make publicly available                   │
│  Tags: [exam] [result] [class-10]            │
│                                              │
│  [  Upload  ]                                │
└──────────────────────────────────────────────┘
```

### 4. Transfer Certificate (TC)
```
┌──────────────────────────────────────────────┐
│  Transfer Certificates       [+ Issue TC]    │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ TC No    │ Student   │ Date    │ Status│  │
│  ├────────────────────────────────────────┤  │
│  │ TC-001   │ Sneha P.  │ 20 Jun  │ Issued│  │
│  │ TC-002   │ Rahul D.  │ 15 Jun  │ Issued│  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Issue TC Modal:                             │
│  ┌────────────────────────────────────────┐  │
│  │ Student: [Rahul Dev ▼]                 │  │
│  │ Issue Date: [25/06/2025]               │  │
│  │ Reason: [Higher Studies        ]       │  │
│  │ Conduct: [Good                ]        │  │
│  │ Class Studied: [10-A           ]        │  │
│  │ Last Exam Passed: [CBSE Board  ]       │  │
│  │ Remarks: [                   ]         │  │
│  │                                        │  │
│  │         [Cancel]  [Issue TC]           │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  TC Preview:                                 │
│  ┌────────────────────────────────────────┐  │
│  │         🏫 DPS Delhi                   │  │
│  │   TRANSFER CERTIFICATE                 │  │
│  │   TC No: TC-2025-002                   │  │
│  │                                        │  │
│  │   This is to certify that Rahul Dev   │  │
│  │   son of Mr. Dev Kumar was a student   │  │
│  │   of this school from 2020 to 2025...  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Download PDF 📥] [Print 🖨]                │
└──────────────────────────────────────────────┘
```

### 5. Document Templates
```
┌──────────────────────────────────────────────┐
│  Document Templates       [+ Add Template]   │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Template Name   │ Category  │ Placeholders│ │
│  ├────────────────────────────────────────┤  │
│  │ TC Template     │ TC        │ 8 fields    │ │
│  │ Marksheet       │ Results   │ 12 fields   │ │
│  │ ID Card         │ ID Card   │ 5 fields    │ │
│  │ Bonafide        │ Certif.   │ 6 fields    │ │
│  └────────────────────────────────────────┘  │
│                                              │
│  Template Editor:                            │
│  ┌────────────────────────────────────────┐  │
│  │ Upload template file: [📎 Browse]      │  │
│  │                                        │  │
│  │ Placeholders:                          │  │
│  │ {{student_name}}, {{class}}, {{roll}}  │  │
│  │ {{father_name}}, {{school_name}}       │  │
│  │                                        │  │
│  │ [Save Template]                        │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 6. Student Documents
```
┌──────────────────────────────────────────────┐
│  Aarav Kumar - Documents                     │
│  ──────────────────────────────────────────  │
│  [+ Upload] [Generate from Template]         │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ 📄 │ Title       │ Category │ Date     │ │
│  ├────────────────────────────────────────┤  │
│  │ 📄 │ ID Card     │ ID Card  │ 01 Apr   │ │
│  │ 📄 │ Report Card │ Results  │ 15 Mar   │ │
│  │ 📄 │ Birth Cert  │ Personal │ 01 Apr   │ │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Download All] [View] [Delete]              │
└──────────────────────────────────────────────┘
```

---

## API Integration Points

| Screen | API Calls |
|--------|-----------|
| Document List | `GET /documents/` |
| Upload | `POST /documents/upload/` |
| Download | `GET /documents/{id}/download/` |
| Student Docs | `GET /documents/student/{id}/` |
| Staff Docs | `GET /documents/staff/{id}/` |
| Templates | `GET/POST /document-templates/` |
| Generate from Template | `POST /document-templates/{id}/generate/` |
| TC List | `GET /transfer-certificates/` |
| Issue TC | `POST /transfer-certificates/` |
| Download TC | `GET /transfer-certificates/{id}/download/` |

---

## Key Components

| Component | Type | Description |
|-----------|------|-------------|
| `DocumentDashboard` | Page | Stats + recent uploads |
| `DocumentList` | Page | Searchable document list |
| `DocumentUpload` | Form | Drag & drop upload |
| `DocumentViewer` | Modal | PDF/image preview |
| `TCEditor` | Page | TC generation |
| `TemplateList` | Page | Template management |
| `TemplateEditor` | Page | Template upload + placeholders |
| `StudentDocuments` | Page | Student-specific docs |
