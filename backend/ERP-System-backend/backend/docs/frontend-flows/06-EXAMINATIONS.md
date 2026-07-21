# Module 5: Examinations & Results - UI/UX Flow

## Screens

### 1. Exam Dashboard
```
┌──────────────────────────────────────────────┐
│  Examination Dashboard                       │
│  ──────────────────────────────────────────  │
│                                              │
│  Current Exam: Mid Term 2025                 │
│  Status: In Progress | 3/7 papers completed  │
│                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│  │ 📝 Exams    │ │ 📊 Results  │ │ 🏆 Top │ │
│  │ 3 Active    │ │ 2 Published │ │ Aarav  │ │
│  └─────────────┘ └─────────────┘ └────────┘ │
│                                              │
│  Upcoming Exams:                             │
│  ──────────────────────────────────────────  │
│  • Science - 26 Jun (Tomorrow)               │
│  • Mathematics - 28 Jun                       │
│  • English - 30 Jun                           │
│                                              │
│  Recent Results:                             │
│  ──────────────────────────────────────────  │
│  • Hindi - Published (Class 10)              │
│  • Social Science - Draft                    │
└──────────────────────────────────────────────┘
```

### 2. Exam List Page
```
┌──────────────────────────────────────────────┐
│  Exams                       [+ Create Exam] │
│  ──────────────────────────────────────────  │
│  [Academic Year ▼] [Exam Type ▼] [Status ▼]  │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Name           │ Type    │ Dates │Status│ │
│  ├────────────────────────────────────────┤  │
│  │ Mid Term 2025  │ Mid Term│Jun 15 │InProg│ │
│  │ Unit Test 1    │ Unit    │May 10 │Done  │ │
│  │ Final 2025     │ Final   │Dec 1  │Draft │ │
│  └────────────────────────────────────────┘  │
│                                              │
│  [View Schedule] [Enter Results] [Publish]   │
└──────────────────────────────────────────────┘
```

### 3. Exam Schedule (Timetable)
```
┌──────────────────────────────────────────────┐
│  Mid Term 2025 - Exam Schedule               │
│  ──────────────────────────────────────────  │
│  [+ Add Paper] [Bulk Create]                 │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Date     │ Time     │ Subject │ Class │  │
│  ├────────────────────────────────────────┤  │
│  │ 15 Jun   │ 9-12     │ Hindi   │ 10-A  │  │
│  │ 17 Jun   │ 9-12     │ Science │ 10-A  │  │
│  │ 19 Jun   │ 9-12     │ Math    │ 10-A  │  │
│  │ 21 Jun   │ 9-12     │ English │ 10-A  │  │
│  │ 23 Jun   │ 9-12     │ SST     │ 10-A  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Add Paper Modal:                            │
│  ┌────────────────────────────────────────┐  │
│  │ Subject:    [Science        ▼]         │  │
│  │ Class:      [10-A           ▼]         │  │
│  │ Date:       [17/06/2025     ]          │  │
│  │ Time:       [09:00]-[12:00  ]          │  │
│  │ Max Marks:  [100            ]          │  │
│  │ Pass Marks: [33             ]          │  │
│  │ Room:       [Room 101       ]          │  │
│  │ Instructions:[              ]          │  │
│  │                                        │  │
│  │         [Cancel]  [Save]               │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 4. Result Entry Page
```
┌──────────────────────────────────────────────┐
│  Result Entry - Hindi (Mid Term 2025)        │
│  ──────────────────────────────────────────  │
│  Class: 10-A  |  Max Marks: 100  |  Pass: 33│
│  ──────────────────────────────────────────  │
│  [+ Single Entry] [Import Excel 📥] [Save]   │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Roll │ Name    │ Marks │ Grade │Absent │  │
│  ├────────────────────────────────────────┤  │
│  │ 1    │ Aarav   │ [85]  │ A     │ ☐    │  │
│  │ 2    │ Priya   │ [92]  │ A+    │ ☐    │  │
│  │ 3    │ Rahul   │ [45]  │ C     │ ☐    │  │
│  │ 4    │ Sneha   │ [78]  │ B+    │ ☐    │  │
│  │ 5    │ Vikram  │ [   ] │       │ ☑    │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Auto-grade based on marks (configurable)    │
│                                              │
│  [  Save Results  ]  [Save as Draft]         │
└──────────────────────────────────────────────┘
```

### 5. Report Card Generation
```
┌──────────────────────────────────────────────┐
│  Report Cards                                │
│  ──────────────────────────────────────────  │
│  Exam: [Mid Term 2025 ▼]                     │
│  Class: [10-A        ▼]                      │
│  ──────────────────────────────────────────  │
│                                              │
│  [Generate All Report Cards]                 │
│  Progress: 35/40 generated                   │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Student   │ Status    │ Actions        │  │
│  ├────────────────────────────────────────┤  │
│  │ Aarav     │ Generated │ [View] [PDF]   │  │
│  │ Priya     │ Generated │ [View] [PDF]   │  │
│  │ Rahul     │ Generated │ [View] [PDF]   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Report Card Preview:                        │
│  ┌────────────────────────────────────────┐  │
│  │         🏫 DPS Delhi                   │  │
│  │      REPORT CARD                       │  │
│  │                                        │  │
│  │  Student: Aarav Kumar                  │  │
│  │  Class: 10-A  |  Roll: 15              │  │
│  │  Exam: Mid Term 2025                   │  │
│  │                                        │  │
│  │  ─────────────────────────────────     │  │
│  │  Subject │ Marks │ Grade │ Remarks     │  │
│  │  Hindi   │ 85    │ A     │ Excellent   │  │
│  │  Science │ 78    │ B+    │ Good        │  │
│  │  Math    │ 92    │ A+    │ Outstanding │  │
│  │  English │ 88    │ A     │ Excellent   │  │
│  │  SST     │ 75    │ B+    │ Good        │  │
│  │  ─────────────────────────────────     │  │
│  │  Total: 418/500 | 83.6% | Grade: A    │  │
│  │  Rank: 5/40                            │  │
│  │  Status: PASS                           │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Download PDF 📥] [Print 🖨] [Send to Parent]│
└──────────────────────────────────────────────┘
```

### 6. Grading System Management
```
┌──────────────────────────────────────────────┐
│  Grading Systems           [+ Add System]    │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ System Name    │ Grades │ Default      │  │
│  ├────────────────────────────────────────┤  │
│  │ CBSE Grading   │ 10     │ ☑ Yes        │  │
│  │ Percentage     │ 5      │ ☐            │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  CBSE Grading:                               │
│  ┌────────────────────────────────────────┐  │
│  │ Grade │ Min % │ Max %                  │  │
│  ├────────────────────────────────────────┤  │
│  │ A1    │ 91    │ 100                    │  │
│  │ A2    │ 81    │ 90                     │  │
│  │ B1    │ 71    │ 80                     │  │
│  │ B2    │ 61    │ 70                     │  │
│  │ C1    │ 51    │ 60                     │  │
│  │ C2    │ 41    │ 50                     │  │
│  │ D     │ 33    │ 40                     │  │
│  │ E     │ 0     │ 32 (Fail)              │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

---

## API Integration Points

| Screen | API Calls |
|--------|-----------|
| Exam List | `GET /exams/` |
| Create Exam | `POST /exams/` |
| Exam Schedule | `GET /exam-schedules/`, `POST /exam-schedules/` |
| Bulk Schedule | `POST /exam-schedules/bulk-create/` |
| Enter Results | `POST /exam-results/` |
| Bulk Enter | `POST /exam-results/bulk-enter/` |
| Import Results | `POST /exam-results/import/` |
| Student Results | `GET /exam-results/student/{id}/` |
| Generate Report Cards | `POST /report-cards/generate/` |
| Download Report Card | `GET /report-cards/{id}/download/` |
| Publish Results | `POST /exams/{id}/publish/` |
| Grading Systems | `GET/POST /grading-systems/` |

---

## Key Components

| Component | Type | Description |
|-----------|------|-------------|
| `ExamDashboard` | Page | Exam overview + upcoming |
| `ExamList` | Page | List all exams |
| `ExamForm` | Modal | Create/Edit exam |
| `ExamScheduleGrid` | Grid | Date-wise schedule |
| `ScheduleForm` | Modal | Add/Edit paper |
| `ResultEntryTable` | Table | Marks entry with auto-grade |
| `ExcelImport` | Upload | Import results from Excel |
| `ReportCardPreview` | Modal | Report card preview |
| `GradingSystemEditor` | Page | Manage grading systems |
| `ExamAnalytics` | Page | Class performance charts |
