# Module 15: Reports & Analytics - UI/UX Flow

## Screens

### 1. Reports Hub
```
┌──────────────────────────────────────────────┐
│  📊 Reports & Analytics                      │
│  ──────────────────────────────────────────  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ 📈 Students  │ 📈 Fees    │ 📈 Attendance│ │
│  │ 12 Reports  │ 8 Reports │ 6 Reports   │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │ 📈 Exams    │ 📈 HR      │ 📈 Transport│  │
│  │ 5 Reports  │ 6 Reports │ 2 Reports   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [+ Create Custom Report]                    │
│  [Saved Reports (5)]                         │
└──────────────────────────────────────────────┘
```

### 2. Student Reports
```
┌──────────────────────────────────────────────┐
│  Student Reports                             │
│  ──────────────────────────────────────────  │
│                                              │
│  Available Reports:                          │
│  ┌────────────────────────────────────────┐  │
│  │ 📋 Student List                        │  │
│  │ 📊 Class-wise Student Count            │  │
│  │ 📊 Gender Distribution                 │  │
│  │ 📈 Admission Trend                     │  │
│  │ 📉 Dropout Report                      │  │
│  │ 📋 New Admissions                      │  │
│  │ 📊 Category-wise Distribution          │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Student List Report:                        │
│  [Class ▼] [Section ▼] [Status ▼]           │
│  [Export Excel] [Download PDF]               │
└──────────────────────────────────────────────┘
```

### 3. Fee Reports
```
┌──────────────────────────────────────────────┐
│  Fee Collection Report                       │
│  ──────────────────────────────────────────  │
│  [Date Range 📅] [Class ▼]                   │
│  ──────────────────────────────────────────  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Summary Cards:                         │  │
│  │ Collected: ₹12,50,000                  │  │
│  │ Pending: ₹3,20,000                     │  │
│  │ This Month: ₹4,50,000                  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  📊 Monthly Trend (Line Chart)               │
│  ┌────────────────────────────────────────┐  │
│  │  ₹L                                   │  │
│  │  5 ┤        ●───●                      │  │
│  │  4 ┤   ●───●      ●                   │  │
│  │  3 ┤●──●                              │  │
│  │  2 ┤                                  │  │
│  │    └───┬───┬───┬───┬───┬───           │  │
│  │       Apr May Jun Jul Aug Sep         │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Class-wise Breakdown:                       │
│  ┌────────────────────────────────────────┐  │
│  │ Class │ Collected │ Pending │ %        │  │
│  ├────────────────────────────────────────┤  │
│  │ 10    │ ₹3,50,000│ ₹50,000 │ 87.5%   │  │
│  │ 9     │ ₹3,00,000│ ₹80,000 │ 78.9%   │  │
│  │ 8     │ ₹2,80,000│ ₹60,000 │ 82.4%   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Export Excel] [Download PDF] [Print]       │
└──────────────────────────────────────────────┘
```

### 4. Attendance Reports
```
┌──────────────────────────────────────────────┐
│  Attendance Reports                          │
│  ──────────────────────────────────────────  │
│  [Daily] [Monthly] [Class-wise] [Low <75%]   │
│  ──────────────────────────────────────────  │
│                                              │
│  Low Attendance Report:                      │
│  Students with attendance below 75%:         │
│  ┌────────────────────────────────────────┐  │
│  │ Student    │ Class │ %    │ Status     │  │
│  ├────────────────────────────────────────┤  │
│  │ Rahul Dev  │ 9-B   │ 65% │ ⚠️ Warning │  │
│  │ Sneha Patil│ 8-A   │ 70% │ ⚠️ Warning │  │
│  │ Anita K.   │ 7-A   │ 72% │ ⚠️ Warning │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Send SMS to Parents] [Export]              │
└──────────────────────────────────────────────┘
```

### 5. Exam Reports
```
┌──────────────────────────────────────────────┐
│  Exam Analytics                              │
│  ──────────────────────────────────────────  │
│  Exam: [Mid Term 2025 ▼] Class: [10 ▼]       │
│  ──────────────────────────────────────────  │
│                                              │
│  📊 Class Performance (Bar Chart)            │
│  ┌────────────────────────────────────────┐  │
│  │ 100┤                                  │  │
│  │  80┤     ████  ████  ████            │  │
│  │  60┤████ ████  ████  ████  ████      │  │
│  │  40┤████ ████  ████  ████  ████      │  │
│  │  20┤████ ████  ████  ████  ████      │  │
│  │    └────┬─────┬─────┬─────┬─────     │  │
│  │       Hindi Science Math Eng SST     │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  🏆 Top 5 Students:                          │
│  1. Priya Singh - 92% (A+)                   │
│  2. Aarav Kumar - 83.6% (A)                  │
│  3. Vikram Raj - 81% (A)                     │
│  4. Sneha Patil - 78% (B+)                   │
│  5. Rahul Dev - 75% (B+)                     │
│                                              │
│  ⚠️ Failed: 0 students                        │
└──────────────────────────────────────────────┘
```

### 6. Dashboard Overview
```
┌──────────────────────────────────────────────┐
│  🏫 School Dashboard                         │
│  ──────────────────────────────────────────  │
│                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ 👥      │ │ 💰      │ │ 📋      │       │
│  │ 500     │ │ ₹12.5L  │ │ 85%     │       │
│  │Students │ │Collected│ │Present  │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ 👨‍💼      │ │ 📚      │ │ 🏠      │       │
│  │ 85      │ │ 2,500   │ │ 170     │       │
│  │Staff    │ │Books    │ │Hostel   │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                              │
│  📊 Collection Trend (6 months)              │
│  📊 Attendance Trend (30 days)               │
│                                              │
│  📰 Latest Announcements:                    │
│  • Sports Day on 15 Jul                      │
│  • Holiday on 26 Jun                         │
│                                              │
│  📋 Recent Activity:                         │
│  • 3 new admissions today                    │
│  • Fee ₹45,000 collected today               │
│  • 2 leave applications pending              │
└──────────────────────────────────────────────┘
```

---

## API Integration Points

| Screen | API Calls |
|--------|-----------|
| Dashboard | `GET /dashboard/overview/` |
| Recent Activity | `GET /dashboard/recent-activity/` |
| Announcements | `GET /dashboard/announcements/` |
| Student Reports | `GET /reports/students/*` |
| Fee Reports | `GET /reports/fees/*` |
| Attendance Reports | `GET /reports/attendance/*` |
| Exam Reports | `GET /reports/exams/*` |
| HR Reports | `GET /reports/hr/*` |
| Saved Reports | `GET/POST /saved-reports/` |
| Report Schedules | `GET/POST /report-schedules/` |

---

## Key Components

| Component | Type | Description |
|-----------|------|-------------|
| `ReportsHub` | Page | Report categories |
| `StudentReports` | Page | Student-specific reports |
| `FeeReports` | Page | Fee collection analytics |
| `AttendanceReports` | Page | Attendance analytics |
| `ExamReports` | Page | Exam performance |
| `SchoolDashboard` | Page | Overall school overview |
| `Chart组件` | Component | Bar/Line/Pie charts |
| `ReportExporter` | Utility | PDF/Excel export |
| `SavedReportList` | Page | Saved report configs |
